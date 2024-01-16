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
  products: [Object],
  retailBills: [Object],
  stocks: [Object],
  wholeSaleBills: [Object],
});

const CollectionModel = mongoose.model("Collection", collectionSchema);

module.exports = CollectionModel;
