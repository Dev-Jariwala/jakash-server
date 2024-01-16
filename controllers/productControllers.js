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
      collectionId: activeCollection._id,
      productName,
      retailPrice,
      wholesalePrice,
      stock: 0,
      totalStock: 0,
    });

    await newProduct.save();
    // Store only the productId in the products array of the active collection
    activeCollection.products.push(newProduct._id);
    await activeCollection.save();
    res.status(200).json({ message: "Product Created Successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Product" });
  }
};

exports.fetchAllProducts = async (req, res) => {
  try {
    const activeCollection = await getActiveCollection();
    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Populate the product details using the Product model
    const populatedProducts = await Product.find({
      _id: { $in: activeCollection.products },
    });

    res.status(200).json({ products: populatedProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

exports.productUpdate = async (req, res) => {
  const { productId } = req.params;
  const { productName, retailPrice, wholesalePrice } = req.body;

  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (activeCollection.products.includes(productId)) {
      // Use $set for updating specific fields
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            productName,
            retailPrice,
            wholesalePrice,
          },
        },
        { new: true }
      ).lean(); // Use lean for a plain JavaScript object instead of Mongoose document

      res.json({ message: "Product updated successfully.", updatedProduct });
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

exports.productDelete = async (req, res) => {
  const { productId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    // Check if the active collection exists
    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Check if the product exists in the active collection
    if (activeCollection.products.includes(productId)) {
      // Remove the product from the active collection's products array
      activeCollection.products = activeCollection.products.filter(
        (product) => product.toString() !== productId
      );

      await activeCollection.save();

      // Delete the actual product document from the Product model
      await Product.findByIdAndDelete(productId);

      res.status(200).json({ message: "Product deleted successfully." });
    } else {
      res
        .status(404)
        .json({ message: "Product not found in the active collection." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

exports.fetchProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    // Check if the active collection exists
    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Check if the product exists in the active collection
    if (activeCollection.products.includes(productId)) {
      // Fetch complete product details using the Product model
      const productDetails = await Product.findById(productId);

      if (productDetails) {
        res.status(200).json({ productDetails });
      } else {
        res.status(404).json({ message: "Product not found." });
      }
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
