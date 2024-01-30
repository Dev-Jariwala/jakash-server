const express = require("express");

const {
  retailBIllCreate,
  fetchAllRetailBIll,
  updateRetailBill,
  updateTotalDue,
} = require("../controllers/retailBillController");
const router = express.Router();

// Create Retail Bill
router.post("/", retailBIllCreate);

// Fetch All Retail BIll
router.get("/", fetchAllRetailBIll);

// Update Retail BIll
router.put("/:retailBillId", updateRetailBill);
router.put("/paid/:retailBillId", updateTotalDue);

module.exports = router;
