const express = require("express");
const {
  productCreate,
  fetchAllProducts,
  productUpdate,
  productDelete,
  fetchProductDetails,
} = require("../controllers/productControllers");
const {
  getAllCollections,
  createCollection,
  setActiveCollection,
  getActiveCollection,
} = require("../controllers/collectionController");
const router = express.Router();

// Create Course Route with a single image
router.post("/", createCollection);

// Fetch All courses Route
router.get("/", getAllCollections);

// Update course Route
router.put("/:collectionId", setActiveCollection);

// fetch course details route
router.get("/active", getActiveCollection);

module.exports = router;
