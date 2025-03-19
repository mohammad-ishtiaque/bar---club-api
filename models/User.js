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
            required: [true, "Email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false
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
        },
        contactNo: {
            type: String,
            required: false,
            validate: {
                validator: function(v) {
                    return this.role === 'admin' ? v === null : true;
                },
                message: 'Contact number is only applicable for admin roles'
            }
        },
        address: {
            type: String,
            required: false,
            validate: {
                validator: function(v) {
                    return this.role === 'admin' ? v === null : true;
                },
                message: 'Address is only applicable for admin roles'
            }
        },
    },
    { 
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                if (ret.role === 'admin' || ret.role === 'vendor') {
                    // Remove user-specific verification fields for admin and vendor
                    delete ret.ageVerificationImage;
                    delete ret.ageVerificationStatus;
                    delete ret.verificationComment;
                    delete ret.verificationDate;
                } else if (ret.role === 'user' || ret.role === 'vendor') {
                    // Remove admin-specific fields for user
                    delete ret.contactNo;
                    delete ret.address;
                }
                return ret;
            }
        }
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("User", userSchema);