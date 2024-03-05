import mongoose from 'mongoose';

async function connectDB(URL: string): Promise<void> {
  try {
    await mongoose.connect(URL);
    console.log('MongoDB Connected');
  } catch (error:any) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
}

export default connectDB;
