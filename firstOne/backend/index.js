const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const userRoutes = require("./routes/user");
const cors = require("cors");
const dbConnect = require("./config/db");
const productRoutes = require("./routes/product");
const profileRoutes = require("./routes/profile");
const proxyRoutes = require("./routes/proxy");
const imagekit = require("./config/image");

dbConnect();

// Configure CORS for web and mobile
app.use(cors({
  origin: [
    'http://localhost:8081', 
    'http://127.0.0.1:8081',
    'http://192.168.1.4:8081',
    'http://192.168.1.6:8081',
    'http://localhost:19006',
    'http://127.0.0.1:19006',
    'exp://localhost:19000',
    'exp://127.0.0.1:19000',
    'http://192.168.1.4:19000',
    'http://192.168.1.6:19000'
  ],
  credentials: true
}));
app.use(express.json());
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/profile", profileRoutes);
app.use("/proxy", proxyRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");    
});
app.get("/auth/imagekit", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running");
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });