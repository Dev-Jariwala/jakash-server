const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
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

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
