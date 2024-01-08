const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  addStock: Number,
  date: {
    type: Date,
    default: Date.now, // Default value will be the current date/time
  },
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
