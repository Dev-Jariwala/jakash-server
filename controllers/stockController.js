const Product = require("../models/productSchema");
const Stock = require("../models/stockSchema");
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

// Add Stock
exports.addStock = async (req, res) => {
  const { productId } = req.params;
  const { productName, addStock, date } = req.body;

  try {
    const product = await Product.findById(productId);

    // Fetch the active collection
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (product) {
      const currentStock = product.stock || 0;
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

      // Add new stock entry
      const addNewStock = new Stock({
        collectionId: activeCollection._id,
        productId,
        productName,
        addStock,
        date,
      });

      await addNewStock.save();

      // Store only the stockId in the stocks array of the active collection
      activeCollection.stocks.push(addNewStock._id);
      await activeCollection.save();

      res
        .status(200)
        .json({ message: "Stock added successfully.", updatedProduct });
    } else {
      res.status(401).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding stock" });
  }
};

// Fetch all stock entries
exports.fetchAllStock = async (req, res) => {
  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    // Populate the stock details using the Stock model
    const populatedStocks = await Stock.find({
      _id: { $in: activeCollection.stocks },
    });

    res.status(200).json({ stocks: populatedStocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stocks" });
  }
};

// Fetch details of a stock entry by ID
exports.fetchStockDetails = async (req, res) => {
  const { stockId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (activeCollection.stocks.includes(stockId)) {
      // Fetch complete stock details using the Stock model
      const stockDetails = await Stock.findById(stockId);

      if (stockDetails) {
        res.status(200).json({ stockDetails });
      } else {
        res.status(404).json({ message: "Stock not found." });
      }
    } else {
      res
        .status(404)
        .json({ message: "Stock not found in the active collection." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stock details" });
  }
};

// Update stock entry by ID
exports.updateStock = async (req, res) => {
  const { stockId } = req.params;
  const { addStock, date } = req.body;

  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (activeCollection.stocks.includes(stockId)) {
      const existingStock = await Stock.findById(stockId);

      if (existingStock) {
        const productId = existingStock.productId;
        const existingProduct = await Product.findById(productId);

        if (existingProduct) {
          // Use $inc to increment the stock values
          const updatedProduct = await Product.findByIdAndUpdate(productId, {
            $inc: {
              stock: addStock - existingStock.addStock,
              totalStock: addStock - existingStock.addStock,
            },
          });

          // Update the stock entry
          const updateStock = await Stock.findByIdAndUpdate(
            stockId,
            {
              $set: {
                addStock,
                date,
              },
            },
            { new: true }
          );

          res.json({
            message: "Stock updated successfully.",
            updateStock,
          });
        } else {
          res.status(401).json({ message: "Product not found" });
        }
      } else {
        res.status(401).json({ message: "Stock not found" });
      }
    } else {
      res
        .status(404)
        .json({ message: "Stock not found in the active collection." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating stock" });
  }
};

// Delete stock entry by ID
exports.stockDelete = async (req, res) => {
  const { stockId } = req.params;

  try {
    const activeCollection = await getActiveCollection();

    if (!activeCollection) {
      return res.status(400).json({ message: "No active collection" });
    }

    if (activeCollection.stocks.includes(stockId)) {
      const stock = await Stock.findById(stockId);

      if (stock) {
        const product = await Product.findById(stock.productId);

        if (product) {
          // Update the active collection
          activeCollection.stocks = activeCollection.stocks.filter(
            (stock) => stock.toString() !== stockId
          );

          await activeCollection.save();

          // Update the associated product's stock values
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

          // Delete the stock entry
          await Stock.findByIdAndDelete(stockId);

          res.status(200).json({ message: "Stock deleted successfully." });
        } else {
          // Delete the stock entry
          await Stock.findByIdAndDelete(stockId);
          res.status(401).json({ message: "Product not found" });
        }
      } else {
        res.status(400).json({ message: "Stock not found" });
      }
    } else {
      res
        .status(404)
        .json({ message: "Stock not found in the active collection." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting stock" });
  }
};
