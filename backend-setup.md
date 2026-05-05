# Enhanced Backend API Setup for Biometric Authentication

## Node.js + Express Backend Implementation

### 1. Install Dependencies
```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install -D @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors typescript ts-node nodemon
```

### 2. Database Schema (User Model)

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: null
  },
  biometricEnabled: {
    type: Boolean,
    default: false
  },
  deviceTokens: [{
    deviceToken: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT tokens
userSchema.methods.generateTokens = function() {
  const accessToken = jwt.sign(
    { userId: this._id, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // Store refresh token
  this.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  return { accessToken, refreshToken };
};

module.exports = mongoose.model('User', userSchema);
```

### 3. Authentication Controller

```javascript
// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, profileImage, enableBiometric } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          error: 'Email already registered' 
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          error: 'Username already taken' 
        });
      }
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profileImage,
      biometricEnabled: enableBiometric || false
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = user.generateTokens();
    await user.save();

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      biometricEnabled: user.biometricEnabled
    };

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
};

// Login with credentials
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = user.generateTokens();
    await user.save();

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      biometricEnabled: user.biometricEnabled
    };

    res.json({
      token: accessToken,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
};

// Setup biometric authentication
const setupBiometric = async (req, res) => {
  try {
    const { userId, deviceToken } = req.body;
    const authenticatedUserId = req.user.userId;

    // Verify the user is setting up biometric for themselves
    if (userId !== authenticatedUserId) {
      return res.status(403).json({ 
        error: 'Unauthorized' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Add device token (remove old ones for same device if needed)
    user.deviceTokens = user.deviceTokens.filter(
      token => token.deviceToken !== deviceToken
    );
    user.deviceTokens.push({
      deviceToken,
      createdAt: new Date(),
      lastUsed: new Date()
    });

    user.biometricEnabled = true;
    await user.save();

    res.json({ 
      message: 'Biometric authentication setup successful' 
    });

  } catch (error) {
    console.error('Biometric setup error:', error);
    res.status(500).json({ 
      error: 'Biometric setup failed' 
    });
  }
};

// Login with biometric
const biometricLogin = async (req, res) => {
  try {
    const { userId, deviceToken } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (!user.biometricEnabled) {
      return res.status(400).json({ 
        error: 'Biometric authentication not enabled' 
      });
    }

    // Check if device token exists
    const deviceTokenEntry = user.deviceTokens.find(
      token => token.deviceToken === deviceToken
    );

    if (!deviceTokenEntry) {
      return res.status(401).json({ 
        error: 'Device not recognized' 
      });
    }

    // Update last used
    deviceTokenEntry.lastUsed = new Date();
    await user.save();

    // Generate new tokens
    const { accessToken, refreshToken } = user.generateTokens();
    await user.save();

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      biometricEnabled: user.biometricEnabled
    };

    res.json({
      token: accessToken,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Biometric login error:', error);
    res.status(500).json({ 
      error: 'Biometric login failed' 
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check if refresh token exists and is not expired
    const tokenEntry = user.refreshTokens.find(
      token => token.token === refreshToken && token.expiresAt > new Date()
    );

    if (!tokenEntry) {
      return res.status(401).json({ 
        error: 'Invalid or expired refresh token' 
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = user.generateTokens();
    
    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(
      token => token.token !== refreshToken
    );
    
    await user.save();

    res.json({ token: accessToken });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      error: 'Invalid refresh token' 
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshTokens -deviceTokens');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      biometricEnabled: user.biometricEnabled
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user information' 
    });
  }
};

module.exports = {
  register,
  login,
  setupBiometric,
  biometricLogin,
  refreshToken,
  getCurrentUser
};
```

### 4. Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token' 
      });
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

### 5. Routes

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  setupBiometric,
  biometricLogin,
  refreshToken,
  getCurrentUser
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/setup-biometric', authenticateToken, setupBiometric);
router.post('/biometric-login', biometricLogin);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
```

### 6. Server Setup

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/user', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 7. Environment Variables (.env)

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/auth-app

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_different

# Server
PORT=3000
NODE_ENV=development
```

### 8. Package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "tsc",
    "serve": "node dist/server.js"
  }
}
```

## Key Features Implemented:

### ✅ Security
- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days expiry)
- Device token validation for biometric login
- No raw biometric data stored

### ✅ Error Handling
- Proper HTTP status codes (404, 401, 400, 500)
- Meaningful error messages
- User not found vs wrong password distinction

### ✅ Biometric Support
- Device token management
- Biometric enable/disable flags
- Secure device validation
- Token refresh mechanism

### ✅ API Endpoints
- POST /user/register - User registration
- POST /user/login - Credential login
- POST /user/setup-biometric - Enable biometric
- POST /user/biometric-login - Biometric login
- POST /user/refresh-token - Token refresh
- GET /user/me - Get current user

This backend addresses all your requirements and fixes the "User not found" issue with proper error handling and user lookup logic.
