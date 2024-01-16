const CollectionModel = require("../models/collectionSchema");
const Product = require("../models/productSchema");

exports.createCollection = async (req, res) => {
  const { collectionName, addProducts } = req.body;

  try {
    // Creating a new collection with empty arrays
    const newCollection = new CollectionModel({
      collectionName,
      products: [],
      stocks: [],
      retailBills: [],
      wholeSaleBills: [],
    });

    await newCollection.save();
    res.status(200).json({ message: "Collection Created Successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Collection" });
  }
};

exports.setActiveCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    // Find the current active collection (if any)
    const currentActiveCollection = await CollectionModel.findOne({
      active: true,
    });

    // Find the collection to be set as active
    const newActiveCollection = await CollectionModel.findById(collectionId);

    if (newActiveCollection) {
      // If there is a currently active collection, deactivate it
      if (currentActiveCollection) {
        currentActiveCollection.active = false;
        await currentActiveCollection.save();
      }

      // Set the new collection as active
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
exports.getCollectionDetails = async (req, res) => {
  const { collectionId } = req.params;
  try {
    const collectionDetails = await CollectionModel.findById(collectionId);

    if (collectionDetails) {
      res.status(200).json({ collectionDetails });
    } else {
      res.status(404).json({ message: "No collection found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching collection." });
  }
};

exports.getAllCollections = async (req, res) => {
  try {
    const allCollections = await CollectionModel.find();
    const senitizedCollections = allCollections.map((coll) => {
      return {
        _id: coll._id,
        collectionName: coll.collectionName,
        active: coll.active,
      };
    });

    if (senitizedCollections.length > 0) {
      res.status(200).json({ senitizedCollections });
    } else {
      res.status(404).json({ message: "No collections found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching collections." });
  }
};
exports.collectionDelete = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const existingCollection = await CollectionModel.findById(collectionId);
    if (!existingCollection)
      res.status(404).json({ message: "Collection Not Found." });
    console.log(existingCollection.active);
    if (existingCollection.active) {
      res.status(200).json({ message: "Active collection cannot be deleted." });
    } else {
      // Find and delete all products associated with this collection
      await Product.deleteMany({ collectionId });

      // Delete the collection
      await CollectionModel.findByIdAndDelete(collectionId);

      res.status(200).json({ message: "Collection deleted successfully." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting collection" });
  }
};
exports.collectionUpdate = async (req, res) => {
  const { collectionId } = req.params;
  const { collectionName } = req.body;
  try {
    const existingCollection = CollectionModel.findById(collectionId);
    if (!existingCollection)
      res.status(404).json({ message: "Collection Not Found." });

    // Use $set for updating specific fields
    const updatedCollection = await CollectionModel.findByIdAndUpdate(
      collectionId,
      {
        $set: {
          collectionName,
        },
      },
      { new: true }
    );
    res.status(200).json({ message: "Collection updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating collection" });
  }
};
