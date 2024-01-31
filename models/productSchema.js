const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
  },
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
  muted: {
    type: Boolean,
    default: false,
  },
  isLabour: {
    type: Boolean,
    default: false,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
