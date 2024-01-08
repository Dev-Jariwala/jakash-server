const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: String,
  retailPrice: Number,
  wholesalePrice: Number,
  stock: {
    type: Number,
    default: 0,
  },
  totalStock: {
    type: Number,
    default: 0,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
