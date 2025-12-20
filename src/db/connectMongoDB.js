import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  const { MONGO_URL } = process.env;

  if (!MONGO_URL) {
    console.error('❌ MONGO_URL is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB', error);
    process.exit(1);
  }
};
