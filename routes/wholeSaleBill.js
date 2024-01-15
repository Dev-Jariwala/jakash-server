const express = require("express");
const {
  wholeSaleBillCreate,
  fetchAllWholeSaleBill,
  updateWholeSaleBill,
} = require("../controllers/wholeSaleBIllController");

const router = express.Router();

// Create Retail Bill
router.post("/create-wholeSaleBill", wholeSaleBillCreate);

// Fetch All Retail BIll
router.get("/fetch-allWholeSaleBills", fetchAllWholeSaleBill);

// Update Retail BIll
router.put("/update-wholeSaleBill/:wholeSaleBillId", updateWholeSaleBill);

module.exports = router;
