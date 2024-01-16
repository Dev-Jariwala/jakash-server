const CollectionModel = require("../models/collectionSchema");
const Product = require("../models/productSchema");
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
exports.productCreate = async (req, res) => {
  const { productName, retailPrice, wholesalePrice } = req.body;

  try {
    // Fetch the active collection
    const activeCollection = await getActiveCollection();
    if (!activeCollection) {
      res.status(400).json({ message: "no active collection" });
    }
    // Creating a new product
    const newProduct = new Product({
      productName,
      retailPrice,
      wholesalePrice,
      stock: 0,
      totalStock: 0,
    });

    // Add the new product to the active collection's products array
    activeCollection.products.push(newProduct);

    // Save the active collection
    await activeCollection.save();
    res.status(200).json({ message: "Product Created Successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Product" });
  }
};

// Fetch All products
exports.fetchAllProducts = async (req, res) => {
  try {
    // Fetch the active collection
    const activeCollection = await getActiveCollection();
    if (!activeCollection) {
      res.status(400).json({ message: "no active collection" });
    }
    res.status(200).json({ products: activeCollection.products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
};
// Update product
exports.productUpdate = async (req, res) => {
  const { productId } = req.params;
  const { productName, retailPrice, wholesalePrice } = req.body;

  try {
    const activeCollection = await getActiveCollection();

    // Find the product within the active collection
    const productIndex = activeCollection.products.findIndex(
      (product) => product._id.toString() === productId
    );

    if (productIndex !== -1) {
      // Update the product within the active collection using findByIdAndUpdate
      await CollectionModel.findByIdAndUpdate(
        activeCollection._id,
        {
          $set: {
            [`products.${productIndex}.productName`]: productName,
            [`products.${productIndex}.retailPrice`]: retailPrice,
            [`products.${productIndex}.wholesalePrice`]: wholesalePrice,
          },
        },
        { new: true }
      );

      res.json({ message: "Product updated successfully." });
    } else {
      res
        .status(404)
        .json({ message: "Product not found in the active collection." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// Delete product
exports.productDelete = async (req, res) => {
  const { productId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    // Remove the product from the active collection's products array
    activeCollection.products = activeCollection.products.filter(
      (product) => product._id.toString() !== productId
    );

    await activeCollection.save();

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

// Fetch Product-Details
exports.fetchProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    // Find the product within the active collection
    const productDetails = activeCollection.products.find(
      (product) => product._id.toString() === productId
    );

    if (productDetails) {
      res.status(200).json({ productDetails });
    } else {
      res
        .status(404)
        .json({ message: "Product not found in the active collection." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product details" });
  }
};
