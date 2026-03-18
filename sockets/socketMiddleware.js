const jwt = require("jsonwebtoken");

// 🔐 Auth Middleware
const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Not authorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Token invalid"));
  }
};

// 🛡️ Role Middleware
const socketAuthorizeRoles = (...roles) => {
  return (socket, next) => {
    if (!roles.includes(socket.user.role)) {
      return next(new Error("Access denied"));
    }
    next();
  };
};

module.exports = { socketAuthMiddleware, socketAuthorizeRoles };
