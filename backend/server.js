// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import routes from "./routes/index.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { initSocketServer } from "./websocket/socketServer.js";


const PORT = process.env.PORT || 3000;

async function startServer() {
    // Connect DB first
    await connectDB();
    const app = express();

    // Middlewares
    app.use(helmet());
    app.use(compression());
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
        ? process.env.CORS_ALLOWED_ORIGINS.split(",")
        : [];

    app.use(
        cors({
            origin: function (origin, callback) {
                // allow if origin is in the allowed list OR the request is from server itself
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error(`CORS blocked: ${origin} not allowed`));
                }
            },
            credentials: true,
        })
    );
    app.use(express.json({ limit: "5mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

    // Health check
    app.get("/health", (req, res) => {
        const mongoState = (function () {
            try {
                return "ok";
            } catch {
                return "unknown";
            }
        })();

        res.json({
            status: "ok",
            uptime: process.uptime(),
            mongo: mongoState,
        });
    });

    // API routes
    app.use("/api", routes);

    // Global 404
    app.use((req, res, next) => {
        res.status(404).json({ message: "Not Found" });
    });

    // Global error handler
    /* eslint-disable no-unused-vars */
    app.use((err, req, res, next) => {
        console.error("Unhandled error:", err);
        const status = err.status || 500;
        res.status(status).json({
            message: err.message || "Internal Server Error",
        });
    });
    /* eslint-enable no-unused-vars */

    const server = app.listen(PORT, () => {
        console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });

    initSocketServer(server);

    // Graceful shutdown
    const shutdown = async (signal) => {
        try {
            console.log(`\n🛑 Received ${signal}. Shutting down...`);
            server.close(() => console.log("HTTP server closed"));
            await disconnectDB();
            // If you have other resources (Redis, queues), close them here.
            process.exit(0);
        } catch (err) {
            console.error("Error during shutdown", err);
            process.exit(1);
        }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

// start
startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});