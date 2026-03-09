import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    tagNo: {
      type: Number,
      required: true,
    },
    locationName: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    stage: {
      type: String,
      enum: [
        "Raw",
        "Fettled",
        "FG",
        "Waiting for Machining",
        "WIP",
        "Rejection",
        "Hold",
        "Waiting for Inspection",
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    tons: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
