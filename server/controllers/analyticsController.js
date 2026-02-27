import Inventory from "../models/Inventory.js";


// 📊 Dashboard Summary
export const getDashboardSummary = async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();

    const totals = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalTons: { $sum: "$tons" },
        },
      },
    ]);

    const rejectionCount = await Inventory.countDocuments({
      stage: "Rejection",
    });

    res.json({
      totalItems,
      totalQuantity: totals[0]?.totalQuantity || 0,
      totalTons: totals[0]?.totalTons || 0,
      rejectionCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 🥧 Stage Distribution (Pie Chart)
export const getStageDistribution = async (req, res) => {
  try {
    const data = await Inventory.aggregate([
      {
        $group: {
          _id: "$stage",
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📊 Tag-wise Stock (Bar Chart)
export const getTagWiseStock = async (req, res) => {
  try {
    const data = await Inventory.aggregate([
      {
        $group: {
          _id: "$tagNo",
          totalQuantity: { $sum: "$quantity" },
          totalTons: { $sum: "$tons" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📈 Monthly Growth (Line Chart)
export const getMonthlyGrowth = async (req, res) => {
  try {
    const data = await Inventory.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};