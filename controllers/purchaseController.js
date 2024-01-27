const CollectionModel = require("../models/collectionSchema");
const Product = require("../models/productSchema");
const Purchase = require("../models/purchaseSchema");
const Stock = require("../models/stockSchema");

// Helper function to get the active collection
const getActiveCollection = async () => {
  try {
    const activeCollection = await CollectionModel.findOne({ active: true });
    return activeCollection;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching active collection");
  }
};

// Create product
exports.purchaseCreate = async (req, res) => {
  const { date, invoiceNo, supplierName, itemDescription, quantity, rate } =
    req.body;

  try {
    // Fetch the active collection
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Creating a new purchase
    const newPurchase = new Purchase({
      collectionId: activeCollection._id,
      date,
      invoiceNo,
      supplierName,
      itemDescription,
      quantity,
      rate,
    });

    await newPurchase.save();

    // Store only the purchaseId in the purchases array of the active collection
    activeCollection.purchases.push(newPurchase._id);
    await activeCollection.save();

    res.status(201).json({ message: "Purchase created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating purchase." });
  }
};

// Fetch all purchases in the active collection
exports.fetchAllPurchases = async (req, res) => {
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Populate the product details using the Product model
    const populatedPurchases = await Purchase.find({
      _id: { $in: activeCollection.purchases },
    });

    res.status(200).json({ purchases: populatedPurchases.reverse() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching purchases" });
  }
};

// Update product details by ID
exports.purchaseUpdate = async (req, res) => {
  const { purchaseId } = req.params;
  const { date, invoiceNo, supplierName, itemDescription, rate, quantity } =
    req.body;

  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (!activeCollection.purchases.includes(purchaseId)) {
      return res
        .status(404)
        .json({ message: "Purchase not found in the active collection." });
    }

    // Use $set for updating specific fields
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      {
        $set: {
          date,
          invoiceNo,
          supplierName,
          itemDescription,
          rate,
          quantity,
        },
      },
      { new: true }
    ).lean(); // Use lean for a plain JavaScript object instead of Mongoose document

    res.json({ message: "Purchase updated successfully.", updatedPurchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating Purchase" });
  }
};

// Delete a product by ID
exports.purchaseDelete = async (req, res) => {
  const { purchaseId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    // Check if the active collection exists
    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Check if the product exists in the active collection
    if (!activeCollection.purchases.includes(purchaseId)) {
      return res
        .status(404)
        .json({ message: "Purchase not found in the active collection." });
    }

    // Remove the product from the active collection's products array
    activeCollection.purchases = activeCollection.purchases.filter(
      (purchase) => purchase.toString() !== purchaseId
    );

    await activeCollection.save();
    // Delete the actual product document from the Product model
    await Purchase.findByIdAndDelete(purchaseId);

    res.status(200).json({ message: "Purchase deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting purchase" });
  }
};

// Fetch details of a product by ID
exports.fetchProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    // Check if the active collection exists
    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Check if the product exists in the active collection
    if (!activeCollection.products.includes(productId)) {
      return res
        .status(404)
        .json({ message: "Product not found in the active collection." });
    }

    // Fetch complete product details using the Product model
    const productDetails = await Product.findById(productId);

    if (productDetails) {
      res.status(200).json({ productDetails });
    } else {
      res.status(404).json({ message: "Product not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product details" });
  }
};
