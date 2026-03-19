const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getMyNotifications } = require("../controllers/notificationController");
const router = express.Router();

//get my notifications
router.get("/get-notifications", authMiddleware, getMyNotifications);
module.exports = router;
