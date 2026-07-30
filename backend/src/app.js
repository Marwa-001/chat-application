const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const channelRoutes = require("./routes/channel.routes");
const messageRoutes = require("./routes/message.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorMiddleware);

module.exports = app;