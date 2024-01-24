const express = require("express");
const {
  productCreate,
  fetchAllProducts,
  productUpdate,
  productDelete,
  fetchProductDetails,
  productMute,
} = require("../controllers/productControllers");
const router = express.Router();

// Create Course Route with a single image
router.post("/", productCreate);

// Fetch All courses Route
router.get("/", fetchAllProducts);

// Update course Route
router.put("/:productId", productUpdate);
router.put("/mute/:productId", productMute);

// Delete course Route
router.delete("/:productId", productDelete);

// fetch course details route
router.get("/:productId", fetchProductDetails);

module.exports = router;
