const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
            const user = jwt.verify(token, "secret");
            req.user = user;
            next();
        } catch (err) {
            res.status(401).json({ error: "Invalid token" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = auth;