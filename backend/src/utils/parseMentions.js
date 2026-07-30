const User = require("../models/User");

// finds @username patterns and resolves them to user IDs
module.exports = async function parseMentions(content = "") {
  const matches = [...content.matchAll(/@(\w+)/g)].map((m) => m[1]);
  if (!matches.length) return [];

  const users = await User.find({ username: { $in: matches } }).select("_id");
  return users.map((u) => u._id);
};