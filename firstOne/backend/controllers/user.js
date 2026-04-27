const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.json({ message: "User registered" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign({ username }, "secret", { expiresIn: "1h" });
            res.json({ token });
        } else {
            res.status(401).json({ error: "Invalid password" });
        }
    } else {
        res.status(404).json({ error: "User not found" });
    }
};

module.exports = {
    register,
    login
};