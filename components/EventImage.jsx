import React, { useState } from 'react';

const EventImage = ({ images, onImagesChange }) => {
  const [previewImages, setPreviewImages] = useState([]);

  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert('You can only upload up to 3 images');
      return;
    }

    // Create preview URLs
    const newPreviewImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }));
    setPreviewImages(newPreviewImages);
    onImagesChange(files);
  };

  // Display base64 images from backend
  const renderStoredImages = () => {
    if (!images || images.length === 0) return null;
    
    return images.map((image, index) => (
      <div key={index} className="image-preview">
        <img 
          src={`data:${image.contentType};base64,${image.data}`}
          alt={`Event image ${index + 1}`}
          className="preview-img"
        />
      </div>
    ));
  };

  // Display preview of newly selected images
  const renderPreviewImages = () => {
    return previewImages.map((image, index) => (
      <div key={index} className="image-preview">
        <img 
          src={image.url}
          alt={`Preview ${index + 1}`}
          className="preview-img"
        />
      </div>
    ));
  };

  return (
    <div className="event-image-container">
      <div className="image-upload">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="image-input"
          max="3"
        />
        <p className="upload-info">Upload up to 3 images (max 5MB each)</p>
      </div>

      <div className="image-preview-container">
        {previewImages.length > 0 ? renderPreviewImages() : renderStoredImages()}
      </div>

      <style jsx>{`
        .event-image-container {
          margin: 20px 0;
        }

        .image-upload {
          border: 2px dashed #ccc;
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
          border-radius: 8px;
        }

        .image-preview-container {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .image-preview {
          width: 200px;
          height: 200px;
          position: relative;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-info {
          color: #666;
          margin-top: 10px;
          font-size: 0.9em;
        }

        .image-input {
          width: 100%;
          padding: 10px;
        }
      `}</style>
    </div>
  );
};

export default EventImage; 