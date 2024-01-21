const CollectionModel = require("../models/collectionSchema");
const Product = require("../models/productSchema");
const Stock = require("../models/stockSchema");
const RetailBill = require("../models/retailbillSchema");
const WholeSaleBill = require("../models/wholesalebillSchema");
// Create a new collection with empty arrays
exports.createCollection = async (req, res) => {
  const { collectionName } = req.body;

  try {
    const newCollection = new CollectionModel({
      collectionName,
      products: [],
      stocks: [],
      retailBills: [],
      wholeSaleBills: [],
    });

    await newCollection.save();
    res.status(201).json({ message: "Collection created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating collection." });
  }
};

// Set a collection as active
exports.setActiveCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const currentActiveCollection = await CollectionModel.findOne({
      active: true,
    });
    const newActiveCollection = await CollectionModel.findById(collectionId);

    if (newActiveCollection) {
      if (currentActiveCollection) {
        currentActiveCollection.active = false;
        await currentActiveCollection.save();
      }

      newActiveCollection.active = true;
      await newActiveCollection.save();

      res
        .status(200)
        .json({ message: "Collection set as active successfully." });
    } else {
      res.status(404).json({ message: "Collection not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error setting active collection." });
  }
};

// Get the details of the active collection
exports.getActiveCollection = async (req, res) => {
  try {
    const activeCollection = await CollectionModel.findOne({ active: true });

    if (activeCollection) {
      res.status(200).json({ activeCollection });
    } else {
      res.status(404).json({ message: "No active collection found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching active collection." });
  }
};

// Get details of a specific collection by ID
exports.getCollectionDetails = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const collectionDetails = await CollectionModel.findById(collectionId);

    if (collectionDetails) {
      res.status(200).json({ collectionDetails });
    } else {
      res.status(404).json({ message: "Collection not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching collection." });
  }
};

// Get all collections with sanitized data
exports.getAllCollections = async (req, res) => {
  try {
    const allCollections = await CollectionModel.find();
    const sanitizedCollections = allCollections.map((coll) => ({
      _id: coll._id,
      collectionName: coll.collectionName,
      active: coll.active,
    }));

    if (sanitizedCollections.length > 0) {
      res.status(200).json({ sanitizedCollections });
    } else {
      res.status(404).json({ message: "No collections found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching collections." });
  }
};

// Delete a collection and associated products and stocks
exports.collectionDelete = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const existingCollection = await CollectionModel.findById(collectionId);

    if (!existingCollection) {
      res.status(404).json({ message: "Collection not found." });
    } else if (existingCollection.active) {
      res.status(400).json({ message: "Active collection cannot be deleted." });
    } else {
      // Delete associated products and stocks
      await Product.deleteMany({ collectionId });
      await Stock.deleteMany({ collectionId });
      await RetailBill.deleteMany({ collectionId });
      await WholeSaleBill.deleteMany({ collectionId });

      // Delete the collection
      await CollectionModel.findByIdAndDelete(collectionId);

      res.status(200).json({ message: "Collection deleted successfully." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting collection." });
  }
};

// Update collection details by ID
exports.collectionUpdate = async (req, res) => {
  const { collectionId } = req.params;
  const { collectionName } = req.body;

  try {
    const existingCollection = await CollectionModel.findById(collectionId);

    if (!existingCollection) {
      res.status(404).json({ message: "Collection not found." });
    } else {
      // Use $set for updating specific fields
      const updatedCollection = await CollectionModel.findByIdAndUpdate(
        collectionId,
        {
          $set: { collectionName },
        },
        { new: true }
      );

      res.status(200).json({ message: "Collection updated successfully." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating collection." });
  }
};
