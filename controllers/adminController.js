const itemModel = require("../models/itemModel");
const reportModel = require("../models/reportModel");
const userModel = require("../models/userModel");
const { getIO } = require("../sockets/socket");

// for admin dashboard
const getAdminStats = async (req, res) => {
  try {
    const lostItems = await itemModel.countDocuments({ itemType: "LOST" });
    const foundItems = await itemModel.countDocuments({ itemType: "FOUND" });
    const users = await userModel.countDocuments();
    const blockedUsers = await userModel.countDocuments({ isBlocked: true });
    const reports = await reportModel.countDocuments();
    const handledReports = await reportModel.countDocuments({
      isHandled: true,
    });
    /////////////////////////////////////////////SOCKET PART START///////////////////////////////////////////////
    const io = getIO();

    io.to("admin").emit("adminStatsUpdated");

    /////////////////////////////////////////////SOCKET PART END///////////////////////////////////////////////

    res.status(200).send({
      success: true,
      stats: {
        lostItems,
        foundItems,
        users,
        blockedUsers,
        reports,
        handledReports,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get Admin stats",
    });
  }
};
module.exports = getAdminStats;
