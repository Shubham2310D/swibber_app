import mongoose from 'mongoose';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI!;
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected successfully');

    mongoose.connection.on('error', (err) => console.error('[MongoDB] Error:', err));
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB] Disconnected — will reconnect automatically');
    });
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    process.exit(1);
  }
};
