const express = require("express");

const {
  wholeSaleBillCreate,
  fetchAllWholeSaleBills,
  updateWholeSaleBill,
  updateTotalDue,
} = require("../controllers/wholeSaleBIllController");
const router = express.Router();

// Create WholeSale Bill
router.post("/", wholeSaleBillCreate);

// Fetch All WholeSale BIll
router.get("/", fetchAllWholeSaleBills);

// Update WholeSale BIll
router.put("/:wholeSaleId", updateWholeSaleBill);
router.put("/paid/:wholeSaleId", updateTotalDue);

module.exports = router;
