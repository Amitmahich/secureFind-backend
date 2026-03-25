const itemModel = require("../models/itemModel");
const reportModel = require("../models/reportModel");
const { getIO } = require("../sockets/socket");
const sendEmail = require("../utils/sendEmail");
const getReportConfirmationTemplate = require("../utils/reportConfirmationEmailTemplate");

// report item
const reportItemController = async (req, res) => {
  try {
    const { id } = req.params; // itemId
    const { reason } = req.body || {};

    if (!reason) {
      return res.status(400).send({
        success: false,
        message: "Reason is required",
      });
    }
    const item = await itemModel.findById(id);
    if (!item) {
      return res.status(404).send({
        success: false,
        message: "Item not found",
      });
    }
    // user cannot report own item
    if (item.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report your own item",
      });
    }
    const alreadyReported = await reportModel.findOne({
      item: id,
      reportedBy: req.user._id,
    });
    if (alreadyReported) {
      return res.status(400).send({
        success: false,
        message: "You already reported this item",
      });
    }
    const report = await reportModel.create({
      item: id,
      reportedBy: req.user._id,
      reason,
    });
    /////////////////////////////// SEND MAIL PART START //////////////////////////////
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Report Submitted Successfully ",
        html: getReportConfirmationTemplate(
          req.user.firstName + " " + req.user.lastName,
          item.itemName,
          reason,
        ),
      });
    } catch (err) {
      console.log(err);
      console.log("Email failed but report saved");
    }
    /////////////////////////////// SEND MAIL PART END //////////////////////////////

    ////////////////////////////// SOCKET PART START //////////////////////////////////////
    const io = getIO();

    io.to("admin").emit("newReport", {
      message: "New report received",
      report,
      itemId: id,
      reportedBy: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      },
    });
    ////////////////////////////// SOCKET PART END //////////////////////////////////////

    res.status(200).send({
      success: true,
      message: "Item reported successfully",
      report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Report item API",
    });
  }
};
// get report for a item
const getItemReportsController = async (req, res) => {
  try {
    const reports = await reportModel
      .find({ item: req.params.id })
      .populate("reportedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get report API",
    });
  }
};
module.exports = { reportItemController ,getItemReportsController};
