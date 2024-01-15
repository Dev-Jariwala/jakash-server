// collectionModel.js
const mongoose = require("mongoose");
const Product = require("./productSchema");
const RetailBill = require("./retailbillSchema");
const Stock = require("./stockSchema");
const WholeSaleBill = require("./wholesalebillSchema");

const collectionSchema = new mongoose.Schema({
  collectionName: {
    type: String,
    unique: true, // Ensures the collectionName is unique
    required: true, // Ensures a collectionName is required
  },
  active: {
    type: Boolean,
    default: false, // Default value is false (not active)
  },
  product: Product,
  retailBill: RetailBill,
  stock: Stock,
  wholeSaleBill: WholeSaleBill,
});

const CollectionModel = mongoose.model("Collection", collectionSchema);

module.exports = CollectionModel;
