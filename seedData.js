const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Listing = require('./models/Listing');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban-services-db';
    if (!process.env.MONGO_URI) console.log('Using fallback URI:', connStr);

    await mongoose.connect(connStr);
    console.log('MongoDB Connected');

    try {
        // 1. Create Users
        const users = [
            { name: 'Admin User', email: 'admin@gmail.com', password: 'admin', role: 'admin' },
            { name: 'John Provider', email: 'provider@gmail.com', password: 'provider', role: 'provider' },
            { name: 'Jane User', email: 'user@gmail.com', password: 'user', role: 'user' }
        ];

        let providerId = null;

        for (const u of users) {
            let user = await User.findOne({ email: u.email });

            if (!user) {
                user = await User.create(u);
                console.log(`Created user: ${u.email}`);
            } else {
                // Force update password to ensure known credentials work
                // This is crucial for fixing "Invalid Password" issues
                if (u.password) {
                    user.password = u.password;
                    await user.save(); // Triggers pre-save hash
                    console.log(`Reset password for: ${u.email}`);
                }
            }

            if (u.role === 'provider') providerId = user._id;
        }

        // 2. Create Listings (only if provider exists)
        if (providerId) {
            const listings = [
                {
                    title: 'Professional Plumbing',
                    description: 'Fixing leaks, pipes, and clogged drains with expert care.',
                    category: 'Plumbing',
                    price: 500,
                    inspectionPrice: 200,
                    location: 'Chennai',
                    image: '/assets/images/plumbing.png'
                },
                {
                    title: 'Expert Electrical Work',
                    description: 'Switchboard repair, wiring, and fan installation.',
                    category: 'Electrical',
                    price: 400,
                    inspectionPrice: 150,
                    location: 'Chennai',
                    image: '/assets/images/electrical.png'
                },
                {
                    title: 'Home Deep Cleaning',
                    description: 'Complete home cleaning including floor, windows, and furniture.',
                    category: 'Cleaning',
                    price: 1200,
                    inspectionPrice: 0,
                    location: 'Chennai',
                    image: '/assets/images/cleaning.png'
                },
                {
                    title: 'Home Painting Services',
                    description: 'Interior and exterior wall painting with premium texture finishes.',
                    category: 'Painting',
                    price: 2000,
                    inspectionPrice: 300,
                    location: 'Chennai',
                    image: '/assets/images/painting.png'
                },
                {
                    title: 'Carpentry & Woodwork',
                    description: 'Custom furniture, repairs, and polishing services.',
                    category: 'Carpenter',
                    price: 800,
                    inspectionPrice: 250,
                    location: 'Chennai',
                    image: '/assets/images/carpenter.png'
                },
                {
                    title: 'AC & Appliance Repair',
                    description: 'Servicing and repair for all major brands of AC and Washing Machines.',
                    category: 'Appliances',
                    price: 600,
                    inspectionPrice: 200,
                    location: 'Chennai',
                    image: '/assets/images/appliances.png'
                },
                // Kanchipuram Providers
                {
                    title: 'Orikkai Plumbing Solutions',
                    description: 'Emergency plumbing services in Orikkai and Kanchipuram area.',
                    category: 'Plumbing',
                    price: 450,
                    inspectionPrice: 100,
                    location: 'Orikkai, Kanchipuram',
                    image: 'https://images.unsplash.com/photo-1505798577917-a651a5d60bb5?w=600&h=400&fit=crop'
                },
                {
                    title: 'Kanchi Electricals',
                    description: 'Professional electrician services for home and industry.',
                    category: 'Electrical',
                    price: 350,
                    inspectionPrice: 100,
                    location: 'Kanchipuram',
                    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop'
                }
            ];

            // Clear existing listings to avoid duplicates or enforce fresh state
            await Listing.deleteMany({ providerId });
            console.log('Cleared existing listings for provider.');

            const listingsWithProvider = listings.map(l => ({ ...l, providerId }));
            await Listing.insertMany(listingsWithProvider);
            console.log(`Created ${listings.length} listings for provider.`);
        }

        console.log('Data Seeding Completed!');
        // Do not exit process when running from server.js
        // process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        // Do not exit process, just log error so server keeps running
        // process.exit(1);
    }
};

seedData();
