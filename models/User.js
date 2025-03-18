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
                    // Only required for users, not for admin or vendor
                    return this.role !== 'user' ? v === null : true;
                },
                message: 'Age verification is only required for user roles'
            }
        },
        ageVerificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'not_applicable'],
            default: function() {
                return this.role === 'user' ? 'pending' : 'not_applicable';
            }
        },
        verificationComment: {
            type: String,  // For admin feedback if rejected
            default: null,
            validate: {
                validator: function(v) {
                    // Only applicable for users, not for admin or vendor
                    return this.role !== 'user' ? v === null : true;
                },
                message: 'Verification comments are only applicable for user roles'
            }
        },
        verificationDate: {
            type: Date,  // When the verification was submitted
            default: null,
            validate: {
                validator: function(v) {
                    // Only applicable for users, not for admin or vendor
                    return this.role !== 'user' ? v === null : true;
                },
                message: 'Verification date is only applicable for user roles'
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