const express = require("express");
const {
  productCreate,
  fetchAllProducts,
  productUpdate,
  productDelete,
  fetchProductDetails,
} = require("../controllers/productControllers");
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

// Delete Retail Bill
router.delete("/delete-retailbill/:retailbillId", productDelete);

// fetch Retail Bill Details
router.get("/fetch-productDetails/:productId", fetchProductDetails);

module.exports = router;
