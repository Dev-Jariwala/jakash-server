const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  collectionName: {
    type: String,
    unique: true,
    required: true,
  },
  mobileNumber: {
    type: Number,
    unique: true,
  },
  name: String,
  address: String,
  retailBills: [{ type: mongoose.Schema.Types.ObjectId, ref: "RetailBill" }],
  wholeSaleBills: [
    { type: mongoose.Schema.Types.ObjectId, ref: "WholeSaleBill" },
  ],
});

const Client = mongoose.model("Collection", clientSchema);

module.exports = Client;
