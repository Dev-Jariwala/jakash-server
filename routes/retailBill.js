const express = require("express");

const {
  retailBIllCreate,
  fetchAllRetailBIll,
  updateRetailBill,
} = require("../controllers/retailBillController");
const router = express.Router();

// Create Retail Bill
router.post("/", retailBIllCreate);

// Fetch All Retail BIll
router.get("/", fetchAllRetailBIll);

// Update Retail BIll
router.put("/:retailBillId", updateRetailBill);

module.exports = router;
