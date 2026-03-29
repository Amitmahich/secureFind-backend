const JWT = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Token missing",
      });
    }

    // verify token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // fetch fresh user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }
    // attach full user
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authMiddleware };
