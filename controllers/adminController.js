const Client = require("../models/clientSchema");
const RetailBill = require("../models/retailbillSchema");
const WholeSaleBill = require("../models/wholesalebillSchema");
const Admin = require("../models/adminSchema");

exports.fetchAdmin = async (req, res) => {
  const { adminName, adminPassword } = req.body;
  try {
    const admin = await Admin.findById("65bd3f52eb0cafe4170de54c");
    if (
      adminName !== admin.adminName ||
      adminPassword !== admin.adminPassword
    ) {
      res.json({ message: "Invalid" });
    } else {
      res.json({ admin });
    }
  } catch (error) {
    res.status(400).json({ message: "Error fetching admin details" });
  }
};
