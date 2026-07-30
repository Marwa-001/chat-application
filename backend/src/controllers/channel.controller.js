const Channel = require("../models/Channel");
const Message = require("../models/Message");
const Read = require("../models/Read");

// fetch all channels for the logged-in user, with unread counts
async function getMyChannels(req, res, next) {
  try {
    const userId = req.userId;
    const channels = await Channel.find({ "members.userId": userId })
      .sort({ lastMessageAt: -1 })
      .populate("members.userId", "username avatarUrl status")
      .lean();

    const reads = await Read.find({ userId }).lean();
    const readMap = Object.fromEntries(reads.map((r) => [r.channelId.toString(), r.lastReadAt]));

    const withUnread = await Promise.all(
      channels.map(async (c) => {
        const lastReadAt = readMap[c._id.toString()] || new Date(0);
        const unreadCount = await Message.countDocuments({
          channelId: c._id,
          createdAt: { $gt: lastReadAt },
          senderId: { $ne: userId },
        });
        return { ...c, unreadCount };
      })
    );

    res.json(withUnread);
  } catch (err) {
    next(err);
  }
}

async function createDM(req, res, next) {
  try {
    const { otherUserId } = req.body;
    const userId = req.userId;

    // reuse existing dm if one already exists between these two users
    const existing = await Channel.findOne({
      type: "dm",
      "members.userId": { $all: [userId, otherUserId] },
      $expr: { $eq: [{ $size: "$members" }, 2] },
    });
    if (existing) return res.json(existing);

    const channel = await Channel.create({
      type: "dm",
      members: [{ userId }, { userId: otherUserId }],
      createdBy: userId,
    });
    res.status(201).json(channel);
  } catch (err) {
    next(err);
  }
}

async function createGroup(req, res, next) {
  try {
    const { name, memberIds } = req.body;
    const userId = req.userId;

    const members = [{ userId, role: "admin" }, ...memberIds.map((id) => ({ userId: id }))];
    const channel = await Channel.create({ type: "group", name, members, createdBy: userId });
    res.status(201).json(channel);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { channelId } = req.params;
    const { lastReadMessageId } = req.body;
    const userId = req.userId;

    await Read.findOneAndUpdate(
      { userId, channelId },
      { lastReadMessageId, lastReadAt: new Date() },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyChannels, createDM, createGroup, markAsRead };