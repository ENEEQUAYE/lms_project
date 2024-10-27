// roleMiddleware.js
function roleAuthorization(roles) {
    return (req, res, next) => {
        const userRole = req.body.role; // Assumes user role is passed in the request body for simplicity

        if (roles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
    };
}

module.exports = roleAuthorization;
