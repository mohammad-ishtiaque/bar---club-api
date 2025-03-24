require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/message');
const adminProfileRoutes = require('./routes/adminProfile');

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
app.use('/api/admin', adminProfileRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




