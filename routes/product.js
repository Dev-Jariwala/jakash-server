const express = require("express");
const {
  productCreate,
  fetchAllProducts,
  productUpdate,
  productDelete,
  fetchProductDetails,
} = require("../controllers/productControllers");
const router = express.Router();

// Create Course Route with a single image
router.post("/", productCreate);

// Fetch All courses Route
router.get("/", fetchAllProducts);

// Update course Route
router.put("/:productId", productUpdate);

// Delete course Route
router.delete("/:productId", productDelete);

// fetch course details route
router.get("/:productId", fetchProductDetails);

module.exports = router;
