const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Common file filter for images
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// Create configurable upload middleware
const createUploadMiddleware = (fieldName = 'image', maxSize = 1) => {
    return multer({
        storage: storage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: maxSize * 1024 * 1024 // Convert MB to bytes
        }
    }).single(fieldName);
};

// Create configurable multiple upload middleware
const createMultipleUploadMiddleware = (fields, maxSize = 1) => {
    return multer({
        storage: storage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: maxSize * 1024 * 1024 // Convert MB to bytes
        }
    }).fields(fields);
};

// Helper function to convert file to base64
const fileToBase64 = (file) => {
    if (!file) return null;
    return file.buffer.toString('base64');
};

module.exports = {
    createUploadMiddleware,
    createMultipleUploadMiddleware,
    fileToBase64
}; 