const Client = require("../models/clientSchema");
const RetailBill = require("../models/retailbillSchema");
// Helper function to get the active collection
const getActiveCollection = async () => {
  try {
    const activeCollection = await CollectionModel.findOne({ active: true });
    return activeCollection;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching active collection");
  }
};

exports.fetchAllClients = async (req, res) => {
  try {
    // Populate the client details using the Client model
    const clients = await Client.find();

    // Function to calculate totalDebt for each client
    const calcRetailDebt = async (client) => {
      const populatedRetailBills = await RetailBill.find({
        _id: { $in: client.retailBills },
      });

      const retailDebt = populatedRetailBills.reduce((acc, curr) => {
        return acc + curr.totalDue;
      }, 0);

      return { ...client.toObject(), retailDebt };
    };

    // Use Promise.all to wait for all promises to resolve
    const calculatedClients = await Promise.all(
      clients.map((client) => calcRetailDebt(client))
    );

    res.status(200).json({ clients: calculatedClients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching clients" });
  }
};
