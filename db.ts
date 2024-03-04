import mongoose from 'mongoose';

async function connect(URL: string): Promise<void> {
  try {
    await mongoose.connect(URL);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
}

export default connect;
