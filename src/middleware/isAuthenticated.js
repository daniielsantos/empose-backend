const jwt = require('jsonwebtoken')

async function isAuthenticated(req, res, next) {
    let token
    try {
        token = req.headers.authorization?.split(' ')[1]
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!token) {
        return res.status(401).json({
            message: 'Error: invalid token'
        });
    }

    try {
        const user = jwt.verify(token, process.env.SECRET);
        req.user = user;
        next();
    } catch (err) {
        
        return res.status(500).json({
            message: 'Error: Failed to authenticate token'
        });
    }
}

module.exports = {isAuthenticated}