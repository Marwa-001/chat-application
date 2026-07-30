require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const initSockets = require("./src/sockets");

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();

  const server = http.createServer(app);
  const io = initSockets(server);
  app.set("io", io); 

  server.listen(PORT, () => console.log(`Server running on :${PORT}`));
}

start();