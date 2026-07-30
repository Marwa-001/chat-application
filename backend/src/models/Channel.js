const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const channelSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["dm", "group"], required: true },
    name: { type: String, trim: true }, // ignored for dm on the frontend
    description: { type: String, default: "" },
    members: { type: [memberSchema], validate: (v) => v.length > 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

channelSchema.index({ "members.userId": 1 });
channelSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Channel", channelSchema);