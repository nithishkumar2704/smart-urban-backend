const User = require('./models/User');

const seedAdmin = async () => {
    try {
        console.log('Starting Credential Verification...');

        // 1. Admin
        let admin = await User.findOne({ email: 'admin@gmail.com' });
        if (!admin) {
            admin = new User({
                name: 'ADMIN',
                email: 'admin@gmail.com',
                role: 'admin'
            });
            console.log('Creating Admin account...');
        } else {
            console.log('Updating Admin account...');
        }
        admin.password = 'admin'; // Force set password
        await admin.save();
        console.log('SUCCESS: Admin credentials set to: admin@gmail.com / admin');

        // 2. Provider
        let provider = await User.findOne({ email: 'provider@gmail.com' });
        if (!provider) {
            provider = new User({
                name: 'Test Provider',
                email: 'provider@gmail.com',
                role: 'provider'
            });
            console.log('Creating Provider account...');
        } else {
            console.log('Updating Provider account...');
        }
        provider.password = 'password123'; // Force set password
        await provider.save();
        console.log('SUCCESS: Provider credentials set to: provider@gmail.com / password123');

        // 3. User
        let user = await User.findOne({ email: 'user@gmail.com' });
        if (!user) {
            user = new User({
                name: 'Test User',
                email: 'user@gmail.com',
                role: 'user'
            });
            console.log('Creating User account...');
        } else {
            console.log('Updating User account...');
        }
        user.password = 'password123'; // Force set password
        await user.save();
        console.log('SUCCESS: User credentials set to: user@gmail.com / password123');

    } catch (error) {
        console.error('Error in seedAdmin:', error);
    }
};

module.exports = seedAdmin;
