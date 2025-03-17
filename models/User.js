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
            default: null,
            validate: {
                validator: function(v) {
                    // Only allow non-null values for users and vendors
                    return this.role === 'admin' ? v === null : true;
                },
                message: 'Age verification is not required for admin roles'
            }
        },
        ageVerificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            validate: {
                validator: function(v) {
                    // Only allow non-pending status for users and vendors
                    return this.role === 'admin' ? v === 'pending' : true;
                },
                message: 'Age verification status is not applicable for admin roles'
            }
        },
        verificationComment: {
            type: String,  // For admin feedback if rejected
            default: null,
            validate: {
                validator: function(v) {
                    // Only allow comments for users and vendors
                    return this.role === 'admin' ? v === null : true;
                },
                message: 'Verification comments are not applicable for admin roles'
            }
        },
        verificationDate: {
            type: Date,  // When the verification was submitted
            default: null,
            validate: {
                validator: function(v) {
                    // Only allow dates for users and vendors
                    return this.role === 'admin' ? v === null : true;
                },
                message: 'Verification date is not applicable for admin roles'
            }
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