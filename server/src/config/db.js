import mongoose from "mongoose";

let connected = false;

export function isDbConnected() {
  return connected && mongoose.connection.readyState === 1;
}

export async function connectDb(uri) {
  if (!uri) {
    console.log("No MONGO_URI set — running in memory mode (data resets on restart). Set MONGO_URI for persistence.");
    return false;
  }
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { autoIndex: true });
    connected = true;
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection failed — falling back to memory mode:", err.message);
    connected = false;
    return false;
  }
}
