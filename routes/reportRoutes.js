const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const {
  reportItemController,
  getItemReportsController,
  markReportHandledController,
  getAllReportsController,
} = require("../controllers/reportItemController");
const router = express.Router();
//report-item
router.post("/report-item/:id", authMiddleware, reportItemController);
//get reports for an item
router.get(
  "/item-reports/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getItemReportsController,
);
router.get(
  "/all-reports",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllReportsController,
);

router.patch(
  "/mark-handled/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  markReportHandledController,
);

module.exports = router;
