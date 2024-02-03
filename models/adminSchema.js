const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminName: {
    type: String,
  },
  adminPassword: String,
  address: String,
  pnlPassword: String,
  brandName: String,
  brandSlogan: String,
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
