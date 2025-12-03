import express from "express";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import routes from "./routes/index.js";


dotenv.config();

await connectDB();

const PORT = process.env.PORT || 3000;

const app = express()

process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down server...");
    await disconnectDB();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\n🛑 Server terminated...");
    await disconnectDB();
    process.exit(0);
});




app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});