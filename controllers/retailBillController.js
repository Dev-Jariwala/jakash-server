const Product = require("../models/productSchema");
const RetailBill = require("../models/retailbillSchema");
const CollectionModel = require("../models/collectionSchema");
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
  } = req.body;

  try {
    console.log(BillNo);
    // Fetch the active collection
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }
    const filteredProducts = products.filter((product) => product.quantity > 0);
    // Creating a new retail bill
    const newRetailBill = new RetailBill({
      collectionId: activeCollection._id,
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
    });

    // Update product stock based on retail bill
    for (const productItem of filteredProducts) {
      const { productId, quantity } = productItem;
      const product = await Product.findById(productId);

      if (product) {
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
      if (product) {
        product.stock += productToRemove.quantity;
        await product.save();
      }
    }

    // Handle products to be added or updated: Adjust stock
    for (const productToUpdate of productsToUpdate) {
      const { productId, quantity } = productToUpdate;
      const product = await Product.findById(productId);

      if (product) {
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
