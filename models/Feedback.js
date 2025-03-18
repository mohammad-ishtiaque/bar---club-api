const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema); 