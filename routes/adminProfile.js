const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/User');
const { isAdmin, protect } = require('../utils/protect');
const { createUploadMiddleware, fileToBase64 } = require('../utils/uploadConfig');

// Create upload middleware for avatar with 1MB limit
const uploadAvatar = createUploadMiddleware('avatar', 1);

// Edit Profile
router.put('/edit-profile', protect, isAdmin, (req, res) => {
    uploadAvatar(req, res, async function(err) {
        try {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: 'File upload error: ' + err.message });
            } else if (err) {
                return res.status(500).json({ message: 'Unknown error occurred during upload' });
            }

            const { userName, email, contactNo, address } = req.body;
            const userId = req.user._id;

            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }

            // Prepare update object
            const updateData = {
                userName,
                email,
                contactNo,
                address
            };

            // If avatar was uploaded, add it to update data
            if (req.file) {
                updateData.avatar = fileToBase64(req.file);
            }

            // Update user profile
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            res.status(200).json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating profile',
                error: error.message
            });
        }
    });
});

// Change Password
router.put('/change-password', protect, isAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Validate new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
});

module.exports = router;
