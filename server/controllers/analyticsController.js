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
          totalTons: { $sum: "$tons" },
          count: { $sum: 1 },
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
          locationName: { $first: "$locationName" },
          totalQuantity: { $sum: "$quantity" },
          totalTons: { $sum: "$tons" },
          count: { $sum: 1 },
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
          totalTons: { $sum: "$tons" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Monthly Stock Report
export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get all inventory entries created in the specified month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const data = await Inventory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            tagNo: "$tagNo",
            locationName: "$locationName",
            itemName: "$itemName",
            stage: "$stage",
          },
          totalQuantity: { $sum: "$quantity" },
          totalTons: { $sum: "$tons" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.tagNo": 1,
          "_id.itemName": 1,
          "_id.stage": 1,
        },
      },
    ]);

    // Also get overall totals for the month
    const totals = await Inventory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalTons: { $sum: "$tons" },
          totalItems: { $sum: 1 },
        },
      },
    ]);

    res.json({
      month: targetMonth,
      year: targetYear,
      data: data.map((d) => ({
        tagNo: d._id.tagNo,
        locationName: d._id.locationName,
        itemName: d._id.itemName,
        stage: d._id.stage,
        totalQuantity: d.totalQuantity,
        totalTons: d.totalTons,
        count: d.count,
      })),
      summary: totals[0] || { totalQuantity: 0, totalTons: 0, totalItems: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
