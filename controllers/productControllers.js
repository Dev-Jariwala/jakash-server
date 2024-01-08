const Product = require("../models/productSchema");

// Create product
exports.productCreate = async (req, res) => {
  const { productName, retailPrice, wholesalePrice } = req.body;

  try {
    // Creating a new product
    const newProduct = new Product({
      productName,
      retailPrice,
      wholesalePrice,
      stock: 0,
      totalStock: 0,
    });

    await newProduct.save();
    res.status(200).json({ message: "Product Created Successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Product" });
  }
};

// Fetch All products
exports.fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// Update product
exports.productUpdate = async (req, res) => {
  const { productId } = req.params;
  // console.log(productId);
  const { productName, retailPrice, wholesalePrice } = req.body;
  // console.log(req.body);

  try {
    const product = Product.findById(productId);
    if (product) {
      const updateProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            productName,
            retailPrice,
            wholesalePrice,
          },
        },
        { new: true }
      );
      res.json(updateProduct);
    } else {
      res.status(401).json({ message: "Product Not Found" });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// Delete product
exports.productDelete = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (product) {
      // Delete the product
      await Product.findByIdAndDelete(productId);

      res.status(200).json({ message: "Product Deleted" });
    } else {
      res.status(400).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

// Fetch Product-Details
exports.fetchProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    const productDetails = await Product.findById(productId);
    res.status(200).json({ productDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product details" });
  }
};
