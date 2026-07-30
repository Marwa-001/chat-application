module.exports = function registerTypingHandlers(io, socket) {
  socket.on("typing:start", ({ channelId }) => {
    socket.to(channelId).emit("typing:update", { userId: socket.userId, channelId, isTyping: true });
  });

  socket.on("typing:stop", ({ channelId }) => {
    socket.to(channelId).emit("typing:update", { userId: socket.userId, channelId, isTyping: false });
  });
};