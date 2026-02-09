const User = require('./models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                name: 'ADMIN',
                email: adminEmail,
                password: 'admin', // Will be hashed by pre-save hook
                role: 'admin'
            });
            console.log('Admin account created: admin@gmail.com / admin');
        } else {
            console.log('Admin account already exists.');
        }

        // Seed Provider
        const providerEmail = 'provider@gmail.com';
        const providerExists = await User.findOne({ email: providerEmail });
        if (!providerExists) {
            await User.create({
                name: 'Test Provider',
                email: providerEmail,
                password: 'password123',
                role: 'provider'
            });
            console.log('Provider account created: provider@gmail.com / password123');
        }

        // Seed User
        const userEmail = 'user@gmail.com';
        const userExists = await User.findOne({ email: userEmail });
        if (!userExists) {
            await User.create({
                name: 'Test User',
                email: userEmail,
                password: 'password123',
                role: 'user'
            });
            console.log('User account created: user@gmail.com / password123');
        }

    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

module.exports = seedAdmin;
