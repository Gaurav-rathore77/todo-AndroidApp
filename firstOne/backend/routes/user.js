const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/user");
const auth = require("../middleware/auth");

router.post("/register", register);
router.get("/profile", auth, (req, res) => {
    res.send("Profile");
});
router.post("/login", login);

module.exports = router;