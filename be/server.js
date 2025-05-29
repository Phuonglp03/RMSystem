import express from 'express';
import mongoose from 'mongoose';
import connectDB from './config/db.js'; 
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; 
import dotenv from 'dotenv';
dotenv.config(); 

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"]
  
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Route cơ bản
app.get('/', (req, res) => {
  res.send('Chào mừng đến với API!');
});

const PORT = process.env.PORT || 9999;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));