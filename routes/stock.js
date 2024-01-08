const express = require("express");
const {
  productCreate,
  fetchAllProducts,
  productUpdate,
  productDelete,
  fetchProductDetails,
} = require("../controllers/productControllers");
const {
  addStock,
  fetchAllStock,
  stockDelete,
  findAverageCost,
  updateStock,
} = require("../controllers/stockController");
const router = express.Router();

// Create Course Route with a single image
router.post("/add-stock/:productId", addStock);

router.get("/fetch-allStocks", fetchAllStock);
router.put("/update-stock/:stockId", updateStock);

router.delete("/delete-stock/:stockId", stockDelete);

// router.get("/avgcost", findAverageCost);

module.exports = router;
