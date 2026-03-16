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

// Connect Database
connectDB();

const app = express();

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowedOrigins = [
      "https://jhi-inventory.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    const corsHeaders = allowedOrigins.includes(origin)
      ? {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        }
      : {};

    // ✅ Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Forward to your Express server
    const response = await fetch(request);

    // ✅ Inject CORS headers into the actual response too
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([key, val]) =>
      newResponse.headers.set(key, val)
    );

    return newResponse;
  },
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/export", exportRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    message: "JHI Inventory Management API Running 🚀",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
