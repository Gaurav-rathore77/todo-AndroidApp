const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const userRoutes = require("./routes/user");
const cors = require("cors");
const dbConnect = require("./config/db");
const productRoutes = require("./routes/product");

dbConnect();

app.use(cors());
app.use(express.json());
app.use("/user", userRoutes);
app.use("/product", productRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});