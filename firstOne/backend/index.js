const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const userRoutes = require("./routes/user");
const cors = require("cors");
const dbConnect = require("./config/db");
const productRoutes = require("./routes/product");

dbConnect();

// Configure CORS for web
app.use(cors({
  origin: ['http://localhost:8081', 'http://127.0.0.1:8081'],
  credentials: true
}));
app.use(express.json());
app.use("/user", userRoutes);
app.use("/product", productRoutes);

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