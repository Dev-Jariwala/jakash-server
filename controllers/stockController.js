const Product = require("../models/productSchema");
const Stock = require("../models/stockSchema");

// Add Stock
exports.addStock = async (req, res) => {
  const { productId } = req.params;
  const { productName, addStock, date } = req.body;

  try {
    const product = await Product.findById(productId);
    if (product) {
      const currentStock = product.stock || 0; // Get current stock value or default to 0 if undefined
      const totalStock = product.totalStock + addStock || 0;
      const updatedStock = currentStock + addStock;

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            stock: updatedStock,
            totalStock: totalStock,
          },
        },
        { new: true }
      );
      // adding stock
      const addNewStock = new Stock({
        productId,
        productName,
        addStock,
        date,
      });

      await addNewStock.save();

      res
        .status(200)
        .json({ message: "Stock added Successfully.", updatedProduct });
    } else {
      res.status(401).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Adding Stock" });
  }
};

// Fetch All Stock added
exports.fetchAllStock = async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.status(200).json({ stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stocks" });
  }
};
// Delete added stock
exports.stockDelete = async (req, res) => {
  try {
    const { stockId } = req.params;
    const stock = await Stock.findById(stockId);
    if (stock) {
      const product = await Product.findById(stock.productId);
      if (product) {
        const newStockValue = product.totalStock - stock.addStock;

        const updatedProduct = await Product.findByIdAndUpdate(
          product._id,
          {
            $set: {
              stock: product.stock - stock.addStock,
              totalStock: newStockValue,
            },
          },
          { new: true }
        );
      }
      // Delete the added stock
      await Stock.findByIdAndDelete(stockId);

      res.status(200).json({ message: "Stock Deleted" });
    } else {
      res.status(400).json({ message: "Stock Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting stock" });
  }
};
