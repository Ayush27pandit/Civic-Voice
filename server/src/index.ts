import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/database";
import apiRoutes from "./routes";
import uploadRoutes from "./routes/upload";
import errorHandler from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Request logging in development
if (process.env.NODE_ENV === "development") {
    app.use((req, _res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// ── Routes ─────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiRoutes);
app.use("/api/upload", uploadRoutes);

// ── 404 Handler ────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// ── Error Handler ──────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
