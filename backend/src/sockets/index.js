const { Server } = require("socket.io");
const socketAuth = require("./socketAuth");
const Channel = require("../models/Channel");
const registerMessageHandlers = require("./handlers/message.handler");
const registerTypingHandlers = require("./handlers/typing.handler");
const registerPresenceHandlers = require("./handlers/presence.handler");

function initSockets(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    // personal room, always reachable regardless of which channel rooms are joined
    socket.join(socket.userId);

    const channels = await Channel.find({ "members.userId": socket.userId }).select("_id");
    channels.forEach((c) => socket.join(c._id.toString()));

    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerPresenceHandlers(io, socket);

    socket.on("disconnect", () => {
      // handled in presence handler
    });
  });

  return io;
}

module.exports = initSockets;