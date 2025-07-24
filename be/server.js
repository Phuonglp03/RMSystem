const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { json, urlencoded } = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { corsOptions } = require('./config/corsOption');
const app = express();
const Admin = require('./models/Admin');
const User = require('./models/User');
const Blog = require('./models/Blog');
const Certification = require('./models/Certification');
const Chef = require('./models/Chef');
const Combo = require('./models/Combo');

const Coupon = require('./models/Coupon');
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
const foodRoutes = require('./routes/food.routes');
const foodCategoryRoutes = require('./routes/foodCategory.routes');
const comboRoutes = require('./routes/combo.routes');

const tableOrderRoutes = require('./routes/tableOrder.routes');
const couponRoutes = require('./routes/coupon.routes');

const inventoryRoutes = require('./routes/inventory.routes');
const categoryRoutes = require('./routes/inventoryCategory.routes');
const ingredientRoutes = require('./routes/ingredient.routes');
const reportRoutes = require("./routes/reports");

const dotenv = require('dotenv');
dotenv.config(); // Load biến từ .env vào process.env

// Connect Database
connectDB();
//cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use((req, res, next) => {
    // console.log('req.cookies: ', req.cookies);
    next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api/foods', foodRoutes);
app.use('/api/food-categories', foodCategoryRoutes);
app.use('/api/combos', comboRoutes);

app.use('/api/table-orders', tableOrderRoutes);
app.use('/api/coupons', couponRoutes);


/* servant reservation */
app.use('/api/reservations', require('./routes/reservation.routes'));
app.use('/api/tables', require('./routes/table.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/notification', require('./routes/notification.routes'))
app.use('/api/payos-reservation', require('./routes/payosReservation.routes'));
app.use('/api/servant', require('./routes/servant.routes'));


app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use("/api/reports", reportRoutes);





const PORT = process.env.PORT || 9999;

app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));