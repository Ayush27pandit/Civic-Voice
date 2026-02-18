import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB connected: ${mongoose.connection.db?.databaseName}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

// Mongoose configuration
mongoose.set("strictQuery", false);

if (process.env.NODE_ENV === "development") {
    mongoose.set("debug", true);
}

// Connection event listeners
mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Closing MongoDB connection...`);
    await mongoose.connection.close();
    process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default connectDB;
