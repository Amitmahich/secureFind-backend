const notificationModel = require("../models/notificationModel");

//get my notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({
        user: req.user._id,
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications, // ✅ important
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
//mark notifications read
const markNotificationsRead = async (req, res) => {
  try {
    console.log("Mark read API hit");
    await notificationModel.updateMany(
      { user: req.user._id.toString(), isRead: false },
      { $set: { isRead: true } },
    );

    res.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//get unread notifications
const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationModel.countDocuments({
      user: req.user._id.toString(),
      isRead: false,
    });
    console.log("Unread count:", count);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { getMyNotifications, markNotificationsRead, getUnreadCount };
