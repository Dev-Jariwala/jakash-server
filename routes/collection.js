const express = require("express");

const {
  getAllCollections,
  createCollection,
  setActiveCollection,
  getActiveCollection,
  getCollectionDetails,
  collectionDelete,
  collectionUpdate,
} = require("../controllers/collectionController");
const router = express.Router();

// Create Course Route with a single image
router.post("/", createCollection);

// Fetch All courses Route
router.get("/", getAllCollections);
router.get("/:collectionId", getCollectionDetails);
router.get("/active", getActiveCollection);

// Update course Route
router.put("/:collectionId", setActiveCollection);
router.put("/update/:collectionId", collectionUpdate);

// fetch course details route

router.delete("/:collectionId", collectionDelete);

module.exports = router;
