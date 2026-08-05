const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const channelRoutes = require("./routes/channel.routes");
const messageRoutes = require("./routes/message.routes");
const uploadRoutes = require("./routes/upload.routes");
const errorMiddleware = require("./middleware/error.middleware");
const userRoutes = require("./routes/user.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(errorMiddleware);

module.exports = app;