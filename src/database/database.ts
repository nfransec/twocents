import mongoose from "mongoose";

let isConnected = false; // Track the connection status

export async function connectToDatabase() {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URL!);

    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error: ' + err);
      process.exit(1);
    });
  } catch (error) {
    console.error('DB connection failed');
    console.error(error);
    process.exit(1);
  }
}
