const {
  socketAuthMiddleware,
  socketAuthorizeRoles,
} = require("./socketMiddleware");

let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  const jwt = require("jsonwebtoken");

  io = new Server(server, {
    cors: { origin: "*" },
  });

  // Socket Auth Middleware
  io.use(socketAuthMiddleware);

  //  Connection
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // User room (personal)
    const userId = socket.user.id.toString();
    if (!userId) {
      return socket.disconnect();
    }
    socket.join(userId);

    // Admin room (group)
    if (socket.user.role === "ADMIN") {
      socket.join("admin");
      console.log("Admin joined:", socket.id);
    }

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });
};

// getter
const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };
