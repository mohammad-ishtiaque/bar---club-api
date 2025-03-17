const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'vendor'],
            default: 'user'
        },
        ageVerificationImage: {
            type: String,  // Will store base64 string of the verification document
            default: null
        },
        ageVerificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        verificationComment: {
            type: String,  // For admin feedback if rejected
            default: null
        },
        verificationDate: {
            type: Date,  // When the verification was submitted
            default: null
        }
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("User", userSchema);