const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  invoiceNo: { type: String },
  supplierName: String,
  itemDescription: String,
  rate: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
