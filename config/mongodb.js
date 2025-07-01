import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Successfully..."))
    .catch((err) => {
      console.log("Connection Failed to MongoDB:", err);
      process.exit(1);
    });
};

export default connectDB;
