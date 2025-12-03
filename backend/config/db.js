import mongoose from "mongoose";

export async function connectDB() {

    const MAX_RETRIES = 5;
    let retries = 0;
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error("❌ MONGO_URI is missing in environment variables", process.env.MONGO_URI);
        process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");

    const connectWithRetry = async () => {
        try {
            await mongoose.connect(MONGO_URI);

            console.log("✅ MongoDB connected successfully");

        } catch (err) {
            retries += 1;
            console.error(`❌ MongoDB connection failed (${retries}/${MAX_RETRIES})`);
            console.error(err.message);

            if (retries >= MAX_RETRIES) {
                console.error("❌ Max retries reached. Exiting...");
                process.exit(1);
            }

            console.log("⏳ Retrying in 5 seconds...\n");
            setTimeout(connectWithRetry, 5000);
        }
    };

    await connectWithRetry();

    // Event listeners for monitoring
    mongoose.connection.on("connected", () => {
        console.log("🔌 MongoDB event: connected");
    });

    mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB event: disconnected");
    });

    mongoose.connection.on("reconnected", () => {
        console.log("🔁 MongoDB event: reconnected");
    });

    mongoose.connection.on("error", (err) => {
        console.log("❌ MongoDB event: error:", err);
    });
}

// Graceful shutdown for production
export async function disconnectDB() {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
}
