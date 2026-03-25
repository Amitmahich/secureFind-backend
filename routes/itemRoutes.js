const express = require("express");
const router = express.Router();
const {
  createItemController,
  getItemsController,
  getSingleItemController,
  getMyItems,
  deleteItemController,
  getItemReportsController,
} = require("../controllers/itemController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authorizeRoles");
const { reportItemController } = require("../controllers/reportItemController");

//create-item
router.post("/create-item", authMiddleware, createItemController);
// get-items
router.get("/get-items", authMiddleware, getItemsController);
//get-single-item
router.get("/get-item/:id", authMiddleware, getSingleItemController);
//get-my-items
router.get("/get-my-items", authMiddleware, getMyItems);
//delete-item
router.delete("/delete-item/:id", authMiddleware, deleteItemController);

module.exports = router;
