import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL);
  console.log('Connected to database successfully!');
}

export default connectDB;