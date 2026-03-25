const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const {
  reportItemController,
  getItemReportsController,
} = require("../controllers/reportItemController");
const router = express.Router();
//report-item
router.post("/report-item/:id", authMiddleware, reportItemController);
//get reports for an item
router.get(
  "item-report/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getItemReportsController,
);

module.exports = router;
