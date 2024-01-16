const express = require("express");

const {
  addStock,
  fetchAllStock,
  stockDelete,
  findAverageCost,
  updateStock,
  fetchStockDetails,
} = require("../controllers/stockController");
const router = express.Router();

// Create Course Route with a single image
router.post("/:productId", addStock);

router.get("/", fetchAllStock);
router.get("/:stockId", fetchStockDetails);
router.put("/:stockId", updateStock);

router.delete("/:stockId", stockDelete);

// router.get("/avgcost", findAverageCost);

module.exports = router;
