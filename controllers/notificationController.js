const notificationModel = require("../models/notificationModel");

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
module.exports = { getMyNotifications };
