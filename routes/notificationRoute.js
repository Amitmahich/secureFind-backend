const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getMyNotifications,
  getUnreadCount,
  markNotificationsRead,
} = require("../controllers/notificationController");
const router = express.Router();

//get my notifications
router.get("/get-notifications", authMiddleware, getMyNotifications);
//mark notifications read
router.patch("/mark-read", authMiddleware, markNotificationsRead);
//get unread count
router.get("/get-unread-count", authMiddleware, getUnreadCount);
module.exports = router;
