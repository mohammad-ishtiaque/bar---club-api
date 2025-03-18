require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // Increased limit for base64 images
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Database Connection
connectDB();

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', eventRoutes);  // Added event routes
app.use('/api/admin', adminRoutes);  // Added admin routes
app.use('/api/profile', profileRoutes);  // Added profile routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log('POST /api/auth/upload-profile-picture');
    console.log('POST /api/auth/login');
    console.log('POST /api/auth/signup');
    console.log('POST /api/add-new-events');
    console.log('GET /api/events');
    console.log('GET /api/admin/all-events');
    console.log('GET /api/vendor/my-events');
    console.log('GET /api/admin/users');
    console.log('GET /api/admin/pending-verifications');
    console.log('GET /api/admin/user-verification/:userId');
    console.log('PUT /api/admin/verify-user/:userId');
    console.log('GET /api/admin/feedback');
    console.log('GET /api/admin/feedback/count');
    console.log('GET /api/profile');
    console.log('PUT /api/profile');
    console.log('PUT /api/profile/change-password');
    console.log('DELETE /api/profile/delete-account');
    console.log('POST /api/profile/feedback');
});




