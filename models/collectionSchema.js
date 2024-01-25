const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  collectionName: {
    type: String,
    unique: true,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  retailBills: [{ type: mongoose.Schema.Types.ObjectId, ref: "RetailBill" }],
  stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock" }],
  wholeSaleBills: [
    { type: mongoose.Schema.Types.ObjectId, ref: "WholeSaleBill" },
  ],
  purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchase" }],
});

const CollectionModel = mongoose.model("Collection", collectionSchema);

module.exports = CollectionModel;
