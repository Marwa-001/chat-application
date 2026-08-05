const Message = require("../models/Message");
const Channel = require("../models/Channel");
const parseMentions = require("../utils/parseMentions");
const fetchLinkPreview = require("../utils/fetchLinkPreview");

async function sendMessage(req, res, next) {
  try {
    const { channelId, content, parentMessageId, attachments, repliedToThreadId, replyTo } = req.body;
    const senderId = req.userId;

    const mentions = await parseMentions(content);
    const linkPreview = await fetchLinkPreview(content);

    const message = await Message.create({
      channelId, senderId, content,
      contentType: attachments?.some(a => a.type === "image") ? "image" : attachments?.length ? "file" : "text",
      attachments, mentions, linkPreview,
      parentMessageId: parentMessageId || null,
      repliedToThreadId: repliedToThreadId || null,
      replyTo: replyTo || null,
    });

    if (repliedToThreadId) {
      await Message.findByIdAndUpdate(repliedToThreadId, {
        alsoSentToMainId: message._id,
      });
      req.app.get("io").to(channelId).emit("message:link-updated", {
        messageId: repliedToThreadId,
        alsoSentToMainId: message._id,
      });
    }

    await Channel.findByIdAndUpdate(channelId, {
      lastMessageAt: new Date(),
      lastMessage: {
        content: attachments?.length ? "📎 Attachment" : content,
        senderId,
      },
    });

    if (parentMessageId) {
      await Message.findByIdAndUpdate(parentMessageId, {
        $inc: { threadReplyCount: 1 },
        threadLastReplyAt: new Date(),
      });
    }

    const populated = await message.populate("senderId", "username avatarUrl")
      .then((m) => m.populate({ path: "repliedToThreadId", select: "content senderId", populate: { path: "senderId", select: "username" } }))
      .then((m) => m.populate({ path: "replyTo", select: "content senderId deletedAt", populate: { path: "senderId", select: "username" } }));

    req.app.get("io").to(channelId).emit("message:new", populated);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

// cursor-based pagination: pass ?before=<messageId> to load older messages
async function getMessages(req, res, next) {
  try {
    const { channelId } = req.params;
    const { before, limit = 30, parentMessageId = null, around } = req.query;

    if (around) {
      const target = await Message.findOne({ _id: around, channelId }).lean();
      if (!target) return res.status(404).json({ message: "Message not found" });

      const half = Math.floor(Number(limit) / 2);

      const olderMessages = await Message.find({
        channelId, parentMessageId: target.parentMessageId, deletedAt: null,
        _id: { $lte: around },
      }).sort({ _id: -1 }).limit(half + 1)
        .populate("senderId", "username avatarUrl")
        .populate({ path: "replyTo", select: "content senderId deletedAt", populate: { path: "senderId", select: "username" } });

      const newerMessages = await Message.find({
        channelId, parentMessageId: target.parentMessageId, deletedAt: null,
        _id: { $gt: around },
      }).sort({ _id: 1 }).limit(half)
        .populate("senderId", "username avatarUrl")
        .populate({ path: "replyTo", select: "content senderId deletedAt", populate: { path: "senderId", select: "username" } });

      return res.json([...olderMessages.reverse(), ...newerMessages]);
    }

    const query = { channelId, parentMessageId: parentMessageId || null, deletedAt: null };
    if (before) query._id = { $lt: before };

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate("senderId", "username avatarUrl")
      .populate({ path: "replyTo", select: "content senderId deletedAt", populate: { path: "senderId", select: "username" } });

    res.json(messages.reverse());
  } catch (err) {
    next(err);
  }
}

async function editMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, senderId: req.userId },
      { content, editedAt: new Date() },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found" });

    req.app.get("io").to(message.channelId.toString()).emit("message:updated", message);
    res.json(message);
  } catch (err) {
    next(err);
  }
}

async function togglePin(req, res, next) {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.pinned = !message.pinned;
    await message.save();

    req.app.get("io").to(message.channelId.toString()).emit("message:pinned", {
      messageId, pinned: message.pinned,
    });
    res.json(message);
  } catch (err) {
    next(err);
  }
}

async function addReaction(req, res, next) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.userId;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { reactions: { emoji, userId } } },
      { new: true }
    );

    req.app.get("io").to(message.channelId.toString()).emit("reaction:updated", {
      messageId, reactions: message.reactions,
    });
    res.json(message);
  } catch (err) {
    next(err);
  }
}

async function removeReaction(req, res, next) {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.userId;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { emoji, userId } } },
      { new: true }
    );

    req.app.get("io").to(message.channelId.toString()).emit("reaction:updated", {
      messageId, reactions: message.reactions,
    });
    res.json(message);
  } catch (err) {
    next(err);
  }
}

// GET /api/messages/mentions/me -> messages where I'm mentioned
async function getMyMentions(req, res, next) {
  try {
    const userId = req.userId;
    const { before, limit = 30 } = req.query;

    const query = { mentions: userId, deletedAt: null };
    if (before) query._id = { $lt: before };

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate("senderId", "username avatarUrl")
      .populate("channelId", "name type");

    res.json(messages.reverse());
  } catch (err) {
    next(err);
  }
}

// GET /api/messages/search?q=hello&channelId=<optional>
async function searchMessages(req, res, next) {
  try {
    const { q, channelId } = req.query;
    const userId = req.userId;

    if (!q || !q.trim()) return res.json([]);

    const query = { $text: { $search: q }, deletedAt: null };
    if (channelId) {
      query.channelId = channelId;
    } else {
      // scope to channels the user is a member of
      const myChannels = await Channel.find({ "members.userId": userId }).select("_id");
      query.channelId = { $in: myChannels.map((c) => c._id) };
    }

    const messages = await Message.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(30)
      .populate("senderId", "username avatarUrl")
      .populate("channelId", "name type");

    res.json(messages);
  } catch (err) {
    next(err);
  }
}

async function deleteMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: messageId, senderId: req.userId },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found" });

    // NEW: recompute channel preview from the latest non-deleted message
    const latest = await Message.findOne({ channelId: message.channelId, deletedAt: null })
      .sort({ _id: -1 })
      .select("content attachments senderId");
    await Channel.findByIdAndUpdate(message.channelId, {
      lastMessage: latest
        ? { content: latest.attachments?.length ? "📎 Attachment" : latest.content, senderId: latest.senderId }
        : { content: "", senderId: null },
    });

    req.app.get("io").to(message.channelId.toString()).emit("message:deleted", { messageId });
    req.app.get("io").to(message.channelId.toString()).emit("channel:updated", { channelId: message.channelId });
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = {
  sendMessage, getMessages, editMessage, deleteMessage,
  togglePin, addReaction, removeReaction, getMyMentions, searchMessages,
};