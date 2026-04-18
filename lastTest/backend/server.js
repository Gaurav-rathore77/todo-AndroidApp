const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { auth } = require('./middleware.js');
const { registerUser, loginUser, getCurrentUser } = require('./controller.js');
const { Todo } = require('./model.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==================== AUTH ROUTES (Public) ====================

// Register - POST /api/auth/register
app.post('/api/auth/register', registerUser);

// Login - POST /api/auth/login
app.post('/api/auth/login', loginUser);

// Get current user (Protected)
app.get('/api/auth/me', auth, getCurrentUser);

// ==================== TODO ROUTES (Protected) ====================

// GET all todos for logged-in user
app.get('/api/todos', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new todo (requires authentication)
app.post('/api/todos', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const todo = new Todo({ 
      text,
      userId: req.user.id  // Associate with logged-in user
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update todo (only owner can update)
app.put('/api/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, text } = req.body;
    
    // Find todo and check ownership
    const todo = await Todo.findOne({ _id: id, userId: req.user.id });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or unauthorized' });
    }
    
    // Update fields
    if (completed !== undefined) todo.completed = completed;
    if (text) todo.text = text;
    await todo.save();
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE todo (only owner can delete)
app.delete('/api/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete only if owned by user
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or unauthorized' });
    }
    
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Auth routes: POST /api/auth/register, POST /api/auth/login');
});
