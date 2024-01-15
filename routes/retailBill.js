const express = require("express");

const {
  retailBIllCreate,
  fetchAllRetailBIll,
  updateRetailBill,
} = require("../controllers/retailBillController");
const router = express.Router();

// Create Retail Bill
router.post("/create-retailbill", retailBIllCreate);

// Fetch All Retail BIll
router.get("/fetch-allRetailbills", fetchAllRetailBIll);

// Update Retail BIll
router.put("/update-retailbill/:retailBillId", updateRetailBill);

module.exports = router;
