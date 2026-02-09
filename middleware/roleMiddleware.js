const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const provider = (req, res, next) => {
    if (req.user && (req.user.role === 'provider' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a provider' });
    }
};

module.exports = { admin, provider };
