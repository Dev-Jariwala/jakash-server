const Product = require("../models/productSchema");
const WholeSaleBill = require("../models/wholesalebillSchema");

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
  } = req.body;

  try {
    const filteredProducts = products.filter((product) => product.quantity > 0);
    // Creating a new retail bill
    const newWholeSaleBill = new WholeSaleBill({
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

    await newWholeSaleBill.save();
    res.status(200).json({ message: "WholeSale Bill Created Successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating WholeSale Bill" });
  }
};

// Fetch All Retail Bill
exports.fetchAllWholeSaleBill = async (req, res) => {
  try {
    const wholeSaleBills = await WholeSaleBill.find({});
    res.status(200).json({ wholeSaleBills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching wholeSaleBills" });
  }
};

exports.updateWholeSaleBill = async (req, res) => {
  const { wholeSaleBillId } = req.params;
  const updatedBillData = req.body;
  // console.log(wholeSaleBillId);
  try {
    const existingWholeSaleBill = await WholeSaleBill.findById(
      String(wholeSaleBillId)
    );

    if (!existingWholeSaleBill) {
      return res.status(404).json({ message: "WholeSale Bill not found" });
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
      wholeSaleBillId,
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
