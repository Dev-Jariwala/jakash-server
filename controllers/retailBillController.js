const Product = require("../models/productSchema");
const RetailBill = require("../models/retailbillSchema");
const CollectionModel = require("../models/collectionSchema");
const Client = require("../models/clientSchema");
const twilio = require("twilio");
const accountSid = process.env.TWILIOSID;
const authToken = process.env.TWILIOTOKEN;
const twilioClient = twilio(accountSid, authToken);

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
// Create Retail Bill
exports.retailBIllCreate = async (req, res) => {
  const {
    BillNo,
    orderDate,
    name,
    address,
    mobileNumber,
    deliveryDate,
    products,
    totalFirki,
    subTotal,
    discount,
    advance,
    totalDue,
    notes,
  } = req.body;

  try {
    // Fetch the active collection
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }
    // Check if a client with the given mobile number already exists
    let client = await Client.findOne({ mobileNumber });
    // If client not found, create a new one
    if (!client) {
      client = new Client({
        collectionId: activeCollection._id, // Set your desired value
        mobileNumber,
        name,
        address,
      });

      await client.save();
    }
    const filteredProducts = products.filter((product) => product.quantity > 0);
    console.log(filteredProducts);
    // Creating a new retail bill
    const newRetailBill = new RetailBill({
      collectionId: activeCollection._id,
      clientId: client._id,
      BillNo,
      orderDate,
      name,
      address,
      mobileNumber,
      deliveryDate,
      products: filteredProducts,
      totalFirki,
      subTotal,
      discount,
      advance,
      totalDue,
      notes,
    });

    // Update product stock based on retail bill
    for (const productItem of filteredProducts) {
      const { productId, quantity } = productItem;
      const product = await Product.findById(productId);

      if (product && !product.isLabour) {
        // Calculate new stock after retail bill creation
        const updatedStock = product.stock - quantity;

        // Update the stock of the product
        await Product.findByIdAndUpdate(productId, {
          $set: { stock: updatedStock },
        });
      }
    }

    await newRetailBill.save();
    // Store only the productId in the products array of the active collection
    activeCollection.retailBills.push(newRetailBill._id);
    await activeCollection.save();
    // Add newRetailBill._id to the retailBills array of the corresponding client
    client.retailBills.push(newRetailBill._id);
    await client.save();
    // Format bill details for SMS
    if (mobileNumber === "dev") {
      const message = `
      Hello ${name}, Payment of ${advance}rs for Bill No. ${BillNo} collected. Order ready on ${deliveryDate}. Thank you, Jakkash.`;
      await twilioClient.messages.create({
        body: message,
        to: `+91${mobileNumber}`, // Include the country code
        from: "+18159164533",
      });
    }
    res.status(200).json({ message: "RetailBill created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Retail Bill" });
  }
};

// Fetch All Retail Bill
exports.fetchAllRetailBIll = async (req, res) => {
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }
    // Populate the product details using the Product model
    const populatedRetailBills = await RetailBill.find({
      _id: { $in: activeCollection.retailBills },
    });

    res.status(200).json({ retailBills: populatedRetailBills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching retailBills" });
  }
};

exports.updateRetailBill = async (req, res) => {
  const { retailBillId } = req.params;
  const updatedBillData = req.body;
  // console.log(retailBillId);
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (!activeCollection.retailBills.includes(retailBillId)) {
      return res
        .status(404)
        .json({ message: "Retail Bill not found in the active collection." });
    }
    const existingRetailBill = await RetailBill.findById(String(retailBillId));

    if (!existingRetailBill) {
      return res.status(404).json({ message: "Retail Bill not found" });
    }
    if (existingRetailBill.mobileNumber !== updatedBillData.mobileNumber) {
      // Check if a client with the given mobile number already exists
      let client = await Client.findOne({
        mobileNumber: updatedBillData.mobileNumber,
      });

      if (!client) {
        client = new Client({
          collectionId: activeCollection._id, // Set your desired value
          mobileNumber: updatedBillData.mobileNumber,
          name: updatedBillData.name,
          address: updatedBillData.address,
        });

        await client.save();
      }
      // Add newRetailBill._id to the retailBills array of the corresponding client
      client.retailBills.push(retailBillId);
      await client.save();
      updatedBillData.clientId = client._id;

      // Check if a client with the given mobile number already exists
      let wrongClient = await Client.findOne({
        mobileNumber: existingRetailBill.mobileNumber,
      });
      if (wrongClient) {
        // Remove retailBill id from the wrong client's retailBills array
        wrongClient.retailBills = wrongClient.retailBills.filter(
          (billId) => billId.toString() !== retailBillId
        );
        await wrongClient.save();
      }
    }
    const prevProducts = existingRetailBill.products;
    const newProducts = updatedBillData.products;

    // Calculate products to be removed
    const productsToRemove = prevProducts.filter(
      (prevProduct) =>
        !newProducts.some(
          (newProduct) => newProduct.productId === prevProduct.productId
        )
    );

    // Calculate products to be added or updated
    const productsToUpdate = newProducts.filter((newProduct) => {
      const prevProduct = prevProducts.find(
        (prev) => prev.productId === newProduct.productId
      );
      return !prevProduct || prevProduct.quantity !== newProduct.quantity;
    });

    // Handle products to be removed: Increment stock for removed products
    for (const productToRemove of productsToRemove) {
      const product = await Product.findById(productToRemove.productId);
      if (product && !product.isLabour) {
        product.stock += productToRemove.quantity;
        await product.save();
      }
    }

    // Handle products to be added or updated: Adjust stock
    for (const productToUpdate of productsToUpdate) {
      const { productId, quantity } = productToUpdate;
      const product = await Product.findById(productId);

      if (product && !product.isLabour) {
        if (
          !existingRetailBill.products.some((p) => p.productId === productId)
        ) {
          // Product is new in the updated bill
          product.stock -= quantity;
        } else {
          // Product exists in the old bill; adjust stock based on the quantity difference
          const prevQuantity = existingRetailBill.products.find(
            (p) => p.productId === productId
          ).quantity;
          product.stock += prevQuantity - quantity;
        }
        await product.save();
      }
    }

    // Update the retail bill with new data
    const updatedRetailBill = await RetailBill.findByIdAndUpdate(
      retailBillId,
      updatedBillData,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Retail Bill updated successfully", updatedRetailBill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating Retail Bill" });
  }
};
exports.updateTotalDue = async (req, res) => {
  const { retailBillId } = req.params;
  // console.log(retailBillId);
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (!activeCollection.retailBills.includes(retailBillId)) {
      return res
        .status(404)
        .json({ message: "Retail Bill not found in the active collection." });
    }
    const existingRetailBill = await RetailBill.findById(String(retailBillId));

    if (!existingRetailBill) {
      return res.status(404).json({ message: "Retail Bill not found" });
    }

    // Update the retail bill with new data
    const updatedRetailBill = await RetailBill.findByIdAndUpdate(
      retailBillId,
      {
        $set: {
          paid: existingRetailBill.paid + existingRetailBill.totalDue,
          totalDue: 0,
        },
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Bill Paid successfully", updatedRetailBill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Paying Bill" });
  }
};
