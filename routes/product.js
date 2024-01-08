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
router.post("/create-product", productCreate);

// Fetch All courses Route
router.get("/fetch-allProducts", fetchAllProducts);

// Update course Route
router.put("/update-product/:productId", productUpdate);

// Delete course Route
router.delete("/delete-product/:productId", productDelete);

// fetch course details route
router.get("/fetch-productDetails/:productId", fetchProductDetails);

module.exports = router;
