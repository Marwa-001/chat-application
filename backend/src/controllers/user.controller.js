const User = require("../models/User");

// GET /api/users?search=al  -> for DM dropdown + @mention autocomplete
async function searchUsers(req, res, next) {
  try {
    const { search = "" } = req.query;
    const userId = req.userId;

    const query = {
      _id: { $ne: userId }, // exclude self
    };
    if (search.trim()) {
      query.username = { $regex: search.trim(), $options: "i" };
    }

    const users = await User.find(query)
      .select("username avatarUrl status")
      .limit(20);

    res.json(users);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:userId -> profile lookup (e.g. opening a DM from a mention)
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.userId).select("username avatarUrl status lastSeen");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { searchUsers, getUserById };