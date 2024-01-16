const CollectionModel = require("../models/collectionSchema");

exports.createCollection = async (req, res) => {
  const { collectionName } = req.body;

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

exports.getAllCollections = async (req, res) => {
  try {
    const allCollections = await CollectionModel.find();

    if (allCollections.length > 0) {
      res.status(200).json({ allCollections });
    } else {
      res.status(404).json({ message: "No collections found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching collections." });
  }
};
