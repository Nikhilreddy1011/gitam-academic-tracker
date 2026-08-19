const mongoose = require("mongoose");

// Retry with backoff instead of killing the process on a failed connect.
// A hard process.exit(1) here used to take the whole (already-listening)
// HTTP server down on any transient DNS/network hiccup — on a host like
// Render's free tier, that turns a momentary blip on cold boot into an
// endless crash-restart loop, which looks like the app never comes up.
const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error, retrying in", RETRY_DELAY_MS / 1000, "s:", err.message);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected — attempting to reconnect...");
});

module.exports = connectDB;