const express = require("express");

const {
  registerController,
  verifyEmail,
  loginController,
  forgetPasswordController,
  resetPasswordController,
  logoutUserController,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Auth Routes
router.post("/register", registerController);
router.get("/verify-email", verifyEmail);
router.post("/login", loginController);
router.post("/forget-password", forgetPasswordController);
router.put("/reset-password", resetPasswordController);
router.post("/logout", authMiddleware, logoutUserController);

module.exports = router;
