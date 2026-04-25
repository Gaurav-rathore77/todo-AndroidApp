const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        const user = jwt.verify(token, "secret");
        req.user = user;
        next();
    } else {
        res.send("Unauthorized");
    }
};

module.exports = auth;