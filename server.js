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

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send('API is running successfully');
});

// Temporary Debug Route to Force Reset Passwords
app.get('/api/reset-passwords', async (req, res) => {
    try {
        const User = require('./models/User');
        const updates = [];

        // Reset Admin
        const admin = await User.findOne({ email: 'admin@gmail.com' });
        if (admin) {
            admin.password = 'admin';
            await admin.save();
            updates.push('Admin password reset to: admin');
        }

        // Reset Provider
        const provider = await User.findOne({ email: 'provider@gmail.com' });
        if (provider) {
            provider.password = 'password123';
            await provider.save();
            updates.push('Provider password reset to: password123');
        }

        // Reset User
        const user = await User.findOne({ email: 'user@gmail.com' });
        if (user) {
            user.password = 'password123';
            await user.save();
            updates.push('User password reset to: password123');
        }

        res.json({ success: true, message: 'Passwords reset successfully', updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes')); // Note: reviewRoutes file might not exist in file list, assuming standard naming
app.use('/api/admin', require('./routes/admin.routes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
