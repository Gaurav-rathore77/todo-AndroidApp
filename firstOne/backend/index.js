const express = require("express");
const path = require("path");
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
const mediaRoutes = require("./routes/media-simple");

dbConnect();

// Configure CORS for web and mobile
app.use(cors({
  origin: [
    'http://localhost:8081', 
    'http://192.168.1.3:8081'
  ],
  credentials: true
}));
app.use(express.json());
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/profile", profileRoutes);
app.use("/proxy", proxyRoutes);
app.use("/media", mediaRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("Backend is running! ✅");    
});

app.get("/test", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Backend connection test successful",
    timestamp: new Date().toISOString()
  });    
});

app.get("/test-uploads", (req, res) => {
  try {
    const fs = require('fs');
    const uploadsPath = path.join(__dirname, 'uploads');
    const files = fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath) : [];
    
    res.json({ 
      status: "OK", 
      message: "Uploads directory test",
      uploadsPath: uploadsPath,
      files: files,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Uploads test failed",
      details: error.message 
    });
  }
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