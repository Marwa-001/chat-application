const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: String,
    type: { type: String, enum: ["image", "file"] },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    contentType: { type: String, enum: ["text", "image", "file"], default: "text" },
    attachments: [attachmentSchema],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    parentMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    threadReplyCount: { type: Number, default: 0 },
    threadLastReplyAt: { type: Date, default: null },
    repliedToThreadId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    alsoSentToMainId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    reactions: [reactionSchema],
    pinned: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ parentMessageId: 1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ content: "text" });

module.exports = mongoose.model("Message", messageSchema);