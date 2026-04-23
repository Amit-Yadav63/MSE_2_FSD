require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Root route (ADD THIS)
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

// Routes
app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lost-and-found';

const connectDB = async () => {
  try {
    mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
      .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
        });
      })
      .catch(async () => {
        console.log('Failed to connect. Using in-memory DB...');
        const mongoServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoServer.getUri();
        await mongoose.connect(inMemoryUri);
        console.log('Connected to In-Memory MongoDB');
        app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
        });
      });
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

connectDB();