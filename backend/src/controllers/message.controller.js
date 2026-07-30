const Message = require("../models/Message");
const Channel = require("../models/Channel");
const parseMentions = require("../utils/parseMentions");
// const Message = require("../models/Message");
// const Channel = require("../models/Channel");
// const parseMentions = require("../utils/parseMentions");

// io instance passed in from route setup, or attach to app.locals
async function sendMessage(req, res, next) {
  try {
    const { channelId, content, parentMessageId, attachments } = req.body;
    const senderId = req.userId; // from auth middleware

    const mentions = await parseMentions(content); // returns array of userIds

    const message = await Message.create({
      channelId,
      senderId,
      content,
      contentType: attachments?.length ? "image" : "text",
      attachments,
      mentions,
      parentMessageId: parentMessageId || null,
    });

    await Channel.findByIdAndUpdate(channelId, { lastMessageAt: new Date() });

    if (parentMessageId) {
      await Message.findByIdAndUpdate(parentMessageId, {
        $inc: { threadReplyCount: 1 },
        threadLastReplyAt: new Date(),
      });
    }

    const populated = await message.populate("senderId", "username avatarUrl");

    // broadcast to everyone in the channel room
    req.app.get("io").to(channelId).emit("message:new", populated);

    res.status(201).json(populated);
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
      messageId,
      reactions: message.reactions,
    });

    res.json(message);
  } catch (err) {
    next(err);
  }
}


async function sendMessage(req, res, next) {
  try {
    const { channelId, content, parentMessageId, attachments } = req.body;
    const senderId = req.userId;

    const mentions = await parseMentions(content);

    const message = await Message.create({
      channelId, senderId, content,
      contentType: attachments?.length ? "image" : "text",
      attachments, mentions,
      parentMessageId: parentMessageId || null,
    });

    await Channel.findByIdAndUpdate(channelId, { lastMessageAt: new Date() });

    if (parentMessageId) {
      await Message.findByIdAndUpdate(parentMessageId, {
        $inc: { threadReplyCount: 1 },
        threadLastReplyAt: new Date(),
      });
    }

    const populated = await message.populate("senderId", "username avatarUrl");
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
    const { before, limit = 30, parentMessageId = null } = req.query;

    const query = { channelId, parentMessageId: parentMessageId || null, deletedAt: null };
    if (before) query._id = { $lt: before };

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate("senderId", "username avatarUrl");

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

async function deleteMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const message = await Message.findOneAndUpdate(
      { _id: messageId, senderId: req.userId },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found" });

    req.app.get("io").to(message.channelId.toString()).emit("message:deleted", { messageId });
    res.json({ success: true });
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

module.exports = {
  sendMessage, getMessages, editMessage, deleteMessage,
  togglePin, addReaction, removeReaction,
};