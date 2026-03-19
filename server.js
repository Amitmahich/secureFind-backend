const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const userRoutes = require("./routes/userRoutes");
const responseRoutes = require("./routes/responseRoutes");
const notificationRoutes = require("./routes/notificationRoute");

// socket import
const { initSocket } = require("./sockets/socket");

dotenv.config();

// DB connect
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/notifications", notificationRoutes);

// basic route
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// create server
const server = http.createServer(app);

// init socket
initSocket(server);

// start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
