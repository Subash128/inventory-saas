import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";






dotenv.config();
connectDB();

const app = express();

// Middleware

app.use(express.json());
//app.use(cors());
app.use(
  cors({
    origin: [
      
      "https://inventory-saas-eight.vercel.app/"
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/export", exportRoutes);


// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Inventory Enterprise API Running 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});