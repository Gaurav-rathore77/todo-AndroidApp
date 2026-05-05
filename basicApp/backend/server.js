require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const ragRoutes = require('./routes/rag');
const simpleChatRoutes = require('./routes/simpleChat');

const app = express();

connectDB();

app.use(cors({
  origin: ['http://localhost:8081', 'exp://192.168.1.5:8081', '*'],
  credentials: true
}));

// Increase timeout and add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  res.setTimeout(30000); // 30 second timeout
  next();
});

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/chat', simpleChatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
