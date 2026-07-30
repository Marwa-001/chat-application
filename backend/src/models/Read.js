const mongoose = require("mongoose");

const readSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    lastReadMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    lastReadAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

readSchema.index({ userId: 1, channelId: 1 }, { unique: true });

module.exports = mongoose.model("Read", readSchema);