const mongoose = require("mongoose");

const wholeSaleBillSchema = new mongoose.Schema({
  BillNo: {
    type: Number,
    unique: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  name: String,
  address: String,
  mobileNumber: Number,
  deliveryDate: Date,
  products: [
    {
      productId: String,
      productName: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalFirki: {
    type: Number,
    default: 0,
  },
  subTotal: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  advance: {
    type: Number,
    default: 0,
  },
  totalDue: {
    type: Number,
    default: function () {
      return this.subTotal - this.discount - this.advance;
    },
  },
});

const WholeSaleBill = mongoose.model("WholeSaleBill", wholeSaleBillSchema);

module.exports = WholeSaleBill;