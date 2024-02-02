const Product = require("../models/productSchema");
const CollectionModel = require("../models/collectionSchema");
const Client = require("../models/clientSchema");
const WholeSaleBill = require("../models/wholesalebillSchema");
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
exports.wholeSaleBillCreate = async (req, res) => {
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
    // Creating a new retail bill
    const newWholeSaleBill = new WholeSaleBill({
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

    // Update product stock based on wholesale bill
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

    await newWholeSaleBill.save();
    // Store only the productId in the products array of the active collection
    activeCollection.wholeSaleBills.push(newWholeSaleBill._id);
    await activeCollection.save();
    // Add newWholeSaleBill._id to the wholeSaleBills array of the corresponding client
    client.wholeSaleBills.push(newWholeSaleBill._id);
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
    res.status(200).json({ message: "WholeSaleBill created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating WholeSale Bill" });
  }
};

// Fetch All Retail Bill
exports.fetchAllWholeSaleBills = async (req, res) => {
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }
    // Populate the product details using the Product model
    const populatedWholeSaleBills = await WholeSaleBill.find({
      _id: { $in: activeCollection.wholeSaleBills },
    });

    res.status(200).json({ wholeSaleBills: populatedWholeSaleBills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching wholeSaleBills" });
  }
};

exports.updateWholeSaleBill = async (req, res) => {
  const { wholeSaleId } = req.params;
  const updatedBillData = req.body;
  // console.log(wholeSaleId);
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (!activeCollection.wholeSaleBills.includes(wholeSaleId)) {
      return res.status(404).json({
        message: "WholeSale Bill not found in the active collection.",
      });
    }
    const existingWholeSaleBill = await WholeSaleBill.findById(
      String(wholeSaleId)
    );

    if (!existingWholeSaleBill) {
      return res.status(404).json({ message: "WholeSale Bill not found" });
    }
    if (existingWholeSaleBill.mobileNumber !== updatedBillData.mobileNumber) {
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
      // Add newRetailBill._id to the wholeSaleBills array of the corresponding client
      client.wholeSaleBills.push(wholeSaleId);
      await client.save();
      updatedBillData.clientId = client._id;

      // Check if a client with the given mobile number already exists
      let wrongClient = await Client.findOne({
        mobileNumber: existingWholeSaleBill.mobileNumber,
      });
      if (wrongClient) {
        // Remove retailBill id from the wrong client's retailBills array
        wrongClient.wholeSaleBills = wrongClient.wholeSaleBills.filter(
          (billId) => billId.toString() !== wholeSaleId
        );
        await wrongClient.save();
      }
    }
    const prevProducts = existingWholeSaleBill.products;
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
          !existingWholeSaleBill.products.some((p) => p.productId === productId)
        ) {
          // Product is new in the updated bill
          product.stock -= quantity;
        } else {
          // Product exists in the old bill; adjust stock based on the quantity difference
          const prevQuantity = existingWholeSaleBill.products.find(
            (p) => p.productId === productId
          ).quantity;
          product.stock += prevQuantity - quantity;
        }
        await product.save();
      }
    }

    // Update the retail bill with new data
    const updatedWholeSaleBill = await WholeSaleBill.findByIdAndUpdate(
      wholeSaleId,
      updatedBillData,
      { new: true }
    );

    res.status(200).json({
      message: "WholeSale Bill updated successfully",
      updatedWholeSaleBill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating WholeSale Bill" });
  }
};
exports.updateTotalDue = async (req, res) => {
  const { wholeSaleId } = req.params;
  // console.log(wholeSaleId);
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (!activeCollection.wholeSaleBills.includes(wholeSaleId)) {
      return res.status(404).json({
        message: "Wholesale Bill not found in the active collection.",
      });
    }
    const existingWholeSaleBill = await WholeSaleBill.findById(
      String(wholeSaleId)
    );

    if (!existingWholeSaleBill) {
      return res.status(404).json({ message: "WholeSale Bill not found" });
    }

    // Update the retail bill with new data
    const updatedWholeSaleBill = await WholeSaleBill.findByIdAndUpdate(
      wholeSaleId,
      {
        $set: {
          paid: existingWholeSaleBill.paid + existingWholeSaleBill.totalDue,
          totalDue: 0,
        },
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Bill Paid successfully", updatedWholeSaleBill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Paying Bill" });
  }
};
