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
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

module.exports = seedAdmin;
