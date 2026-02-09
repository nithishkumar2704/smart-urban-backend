const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Use configured secret or fallback for development/testing
    const secret = process.env.JWT_SECRET || 'smart_urban_fallback_secret_2024';

    return jwt.sign({ id }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

module.exports = generateToken;
