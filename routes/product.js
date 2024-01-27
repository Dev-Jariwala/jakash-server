const express = require("express");
const {
  productCreate,
  fetchAllProducts,
  productUpdate,
  productDelete,
  fetchProductDetails,
  productMute,
  getProductSales,
} = require("../controllers/productControllers");
const router = express.Router();

// Create Course Route with a single image
router.post("/", productCreate);

// Fetch All courses Route
router.get("/", fetchAllProducts);
router.get("/productSales", getProductSales);

// Update course Route
router.put("/:productId", productUpdate);
router.put("/mute/:productId", productMute);

// Delete course Route
router.delete("/:productId", productDelete);

// fetch course details route
router.get("/:productId", fetchProductDetails);

module.exports = router;
