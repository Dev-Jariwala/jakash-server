const express = require("express");
const {
  purchaseCreate,
  fetchAllPurchases,
  purchaseUpdate,
  purchaseDelete,
} = require("../controllers/purchaseController");

const router = express.Router();

// Create Course Route with a single image
router.post("/", purchaseCreate);

// Fetch All courses Route
router.get("/", fetchAllPurchases);

// // Update course Route
router.put("/:purchaseId", purchaseUpdate);
// router.put("/mute/:productId", productMute);

// // Delete course Route
router.delete("/:purchaseId", purchaseDelete);

// // fetch course details route
// router.get("/:productId", fetchProductDetails);

module.exports = router;
