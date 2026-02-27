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
const allowedOrigins = [
  "http://localhost:5173",
  "https://jhi-inventory.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "CORS policy does not allow this origin.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
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