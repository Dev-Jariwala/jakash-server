const express = require("express");
const { fetchAdmin } = require("../controllers/adminController");
const router = express.Router();

// Fetch All courses Route
router.post("/", fetchAdmin);

module.exports = router;
