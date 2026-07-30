const User = require("../../models/User");

module.exports = function registerPresenceHandlers(io, socket) {
  User.findByIdAndUpdate(socket.userId, { status: "online" }).exec();
  io.emit("presence:update", { userId: socket.userId, status: "online" });

  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(socket.userId, { status: "offline", lastSeen: new Date() });
    io.emit("presence:update", { userId: socket.userId, status: "offline" });
  });
};