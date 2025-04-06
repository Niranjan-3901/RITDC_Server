// import mongoose from 'mongoose';

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI_DEV);
//     console.log('MongoDB connected');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  // const dbURI = process.env.MONGODB_URI_PROD;
  const dbURI =
    process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI_DEV;

  await mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 50,
  });
  return {
    connection: mongoose.connection,
    db: mongoose.connection.db,
    useDb: (dbName) => mongoose.connection.useDb(dbName),
  };
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

export default connectDB;
