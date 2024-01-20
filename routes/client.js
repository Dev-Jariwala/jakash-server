const express = require("express");
const { fetchAllClients } = require("../controllers/clientController");

const router = express.Router();

// Fetch All courses Route
router.get("/", fetchAllClients);

module.exports = router;
