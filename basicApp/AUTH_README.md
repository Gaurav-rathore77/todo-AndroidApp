# Authentication System - Expo React Native + Node.js

Complete authentication system with JWT tokens, form validation, and MongoDB backend.

## Project Structure

```
basicApp/
├── app/
│   ├── (app)/              # Protected routes group
│   │   ├── _layout.tsx     # App stack layout
│   │   └── index.tsx       # Home screen (protected)
│   ├── _layout.tsx         # Root layout with auth provider
│   ├── index.tsx           # Default redirect screen
│   ├── login.tsx           # Login screen
│   └── signup.tsx          # Signup screen
├── backend/                # Node.js API
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js         # JWT verification
│   ├── models/
│   │   └── User.js         # User schema
│   ├── routes/
│   │   └── auth.js         # Auth routes
│   ├── .env                # Environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Entry point
├── context/
│   └── AuthContext.tsx     # React auth context
├── services/
│   └── api.ts              # Axios API client
└── package.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI

### 2. Backend Setup

```bash
cd basicApp/backend
npm install
```

Create `.env` file (copy from `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth_app
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
```

Start MongoDB locally, then run:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd basicApp
npm install
```

Update API URL in `services/api.ts` if needed:
```typescript
const API_URL = 'http://localhost:5000/api';
// For Android emulator: 'http://10.0.2.2:5000/api'
// For iOS simulator: 'http://localhost:5000/api'
```

Start the app:
```bash
npx expo start
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new account | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/health` | Health check | No |

## Request/Response Examples

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## Features Explained

### Form Validation
- **Frontend**: Real-time validation in login/signup screens
- **Backend**: express-validator for API validation
- Checks: Required fields, email format, password length

### JWT Token Flow
1. User logs in → Server returns JWT token
2. Token stored in AsyncStorage
3. Axios interceptor adds token to all requests
4. Protected routes verify token
5. On logout → token removed from storage

### Protected Routes
- `/(app)` group requires authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users skip auth screens

### Security
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- CORS enabled for API
- Input validation on both frontend and backend

## Running on Device

### Android Emulator
Update API URL to: `http://10.0.2.2:5000/api`

### iOS Simulator
Use: `http://localhost:5000/api`

### Physical Device
Use your computer's local IP: `http://192.168.x.x:5000/api`

## Testing

1. Start backend: `npm run dev`
2. Start frontend: `npx expo start`
3. Open app in simulator or scan QR with Expo Go
4. Test signup → login → protected home screen
5. Test logout → should redirect to login
