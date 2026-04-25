const mongoose = require('mongoose');

let cached = global.__mongooseCache;
if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
      cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m.connection);
    }

    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected: ${cached.conn.host}`);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

module.exports = connectDB;
