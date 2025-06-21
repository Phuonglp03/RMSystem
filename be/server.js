const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { json, urlencoded } = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Admin = require('./models/Admin');
const User = require('./models/User');
const Blog = require('./models/Blog');
const Certification = require('./models/Certification');
const Chef = require('./models/Chef');
const Combo = require('./models/Combo');
const ComboItem = require('./models/ComboItem');
const Customer = require('./models/Customer');
const Feedback = require('./models/Feedback');
const Food = require('./models/Food');
const FoodCategory = require('./models/FoodCategory');
const Ingredient = require('./models/Ingredient');
const IngredientCategory = require('./models/IngredientCategory');
const Inventory = require('./models/Inventory');
const Notification = require('./models/Notification');
const Reservation = require('./models/Reservation');
const RestockLog = require('./models/RestockLog');
const Servant = require('./models/Servant');
const Table = require('./models/Table');
const TableOrder = require('./models/TableOrder');



const  dotenv = require('dotenv');
dotenv.config(); // Load biến từ .env vào process.env

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"]
}));
app.use(express.json());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/reservations', require('./routes/reservation.routes'));
app.use('/api/tables', require('./routes/table.routes'));

const PORT = process.env.PORT || 9999;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));