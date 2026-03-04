import Inventory from "../models/Inventory.js";
import { uploadToCloudflare } from "../utils/cloudflare.js";
// ➤ Add Item (Admin Only)
export const createInventory = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToCloudflare(req.file);
    }

    const item = await Inventory.create({
      ...req.body,
      imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Add Item (Admin Only)
// ➤ Update Item (User & Admin)
export const updateInventory = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If image uploaded, update image URL
    if (req.file) {
      const imageUrl = await uploadToCloudflare(req.file);
      updateData.imageUrl = imageUrl;
    }

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 🔥 If using socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("inventoryUpdated");
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get All Items (Admin)
export const getInventories = async (req, res) => {
  try {
    const {
      search,
      stage,
      tag,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = "createdAt",
    } = req.query;

    let query = {};

    // Search by item name (case insensitive)
    if (search) {
      query.itemName = { $regex: search, $options: "i" };
    }

    // Filter by stage
    if (stage) {
      query.stage = stage;
    }

    // Filter by tag number
    if (tag) {
      query.tagNo = Number(tag);
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * limit;

    const inventories = await Inventory.find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Inventory.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: inventories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Delete Item (Admin Only)
export const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➤ Get User's Own Inventory Entries
export const getUserInventory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const items = await Inventory.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Inventory.countDocuments({ createdBy: req.user._id });

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: items,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};