# Bar & Club Event Management API - Secure Event Management Platform for Nightlife Venues

The Bar & Club Event Management API is a comprehensive Node.js-based platform that enables secure management of nightlife events, user verification, and venue information. It provides role-based access control with specific features for administrators, venue owners (vendors), and end users.

The platform offers robust age verification functionality, event management capabilities, and user feedback systems. It implements secure authentication using JWT tokens and includes features such as password reset, email notifications, and profile management. The API supports image uploads for age verification documents and event photos, with built-in validation and size restrictions.

## Repository Structure
```
├── config/
│   └── db.js                 # MongoDB connection configuration
├── models/
│   ├── Event.js             # Event data schema with status tracking
│   ├── Feedback.js          # User feedback schema
│   ├── PasswordReset.js     # Password reset token management
│   └── User.js              # User model with role-based access control
├── routes/
│   ├── admin.js            # Administrative endpoints for user verification
│   ├── auth.js             # Authentication and authorization routes
│   ├── event.js            # Event management endpoints
│   ├── profile.js          # User profile management
│   └── user.js             # User-specific operations
├── utils/
│   ├── protect.js          # JWT authentication middleware
│   └── sendEmail.js        # Email service for password reset
├── index.js                # Application entry point and route configuration
└── package.json           # Project dependencies and scripts
```

## Usage Instructions
### Prerequisites
- Node.js (v12 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Email service credentials for password reset functionality
- Environment variables:
  - MONGODB_URI
  - JWT_SECRET
  - PORT (optional, defaults to 3000)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bar-club-server

# Install dependencies
npm install

# Create .env file
touch .env

# Add required environment variables to .env
echo "MONGODB_URI=your_mongodb_connection_string" >> .env
echo "JWT_SECRET=your_jwt_secret" >> .env
```

### Quick Start
1. Start the server:
```bash
npm run dev
```

2. The API will be available at `http://localhost:3000`

3. Create an admin user:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Admin User","email":"admin@example.com","password":"password123","confirmPassword":"password123","age":25,"role":"admin"}'
```

### More Detailed Examples

1. User Authentication:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response will include JWT token:
{
  "token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

2. Create Event (Vendor):
```bash
curl -X POST http://localhost:3000/api/add-new-events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Summer Party",
    "bar": "Skybar",
    "location": "123 Main St",
    "coverCharge": 20,
    "description": "Annual summer celebration"
  }'
```

### Troubleshooting

1. MongoDB Connection Issues
- Error: "MongoDB connection failed"
  - Check if MongoDB is running: `sudo systemctl status mongodb`
  - Verify MONGODB_URI in .env file
  - Ensure network connectivity to MongoDB server

2. Authentication Issues
- Error: "Invalid token"
  - Token may be expired - try logging in again
  - Verify JWT_SECRET matches between login and verification
  - Check token format in Authorization header

3. File Upload Issues
- Error: "File too large"
  - Ensure images are under 5MB
  - Check if file is in supported format (image/*) 
  - Verify multipart/form-data content type

## Data Flow
The application follows a RESTful architecture with JWT-based authentication and role-based access control.

```ascii
Client -> Authentication -> JWT Token -> Protected Routes
  |                                          |
  |-> Public Routes                         |-> Admin Routes
  |   - Login                               |   - User Verification
  |   - Signup                              |   - Event Approval
  |   - Password Reset                      |
  |                                         |-> Vendor Routes
  |-> Protected Routes                      |   - Event Management
      - Profile Management                  |
      - Age Verification                    |-> User Routes
      - Event Viewing                           - Feedback
                                               - Profile
```

Key Component Interactions:
1. Authentication service validates credentials and issues JWT tokens
2. Protected routes verify JWT tokens before processing requests
3. Role-based middleware controls access to admin/vendor features
4. File uploads are processed through multer middleware
5. Password reset flow uses email service for verification
6. Event creation requires vendor/admin privileges
7. Age verification requires document upload and admin approval