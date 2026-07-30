module.exports = function registerMessageHandlers(io, socket) {
  socket.on("channel:join", ({ channelId }) => {
    socket.join(channelId);
  });
  socket.on("channel:leave", ({ channelId }) => {
    socket.leave(channelId);
  });
};