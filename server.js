const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
// Connect to database
const seedData = require('./seedData');

// Connect to database
connectDB().then(() => {
    // Run full data seed (Users + Listings)
    // In production, you might want to run this manually or conditionally
    seedData();
}).catch(err => {
    console.error('Database connection failure:', err);
});

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options(/.*/, cors()); // Enable pre-flight for all routes

// Routes
app.get('/', (req, res) => {
    res.send('API is running successfully');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/admin.routes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
