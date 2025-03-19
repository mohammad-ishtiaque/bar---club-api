import React, { useState } from 'react';
import EventImage from './EventImage';

const EventForm = ({ initialEvent, onSubmit }) => {
  const [formData, setFormData] = useState({
    eventName: initialEvent?.eventName || '',
    bar: initialEvent?.bar || '',
    location: initialEvent?.location || '',
    coverCharge: initialEvent?.coverCharge || '',
    description: initialEvent?.description || '',
    mapReference: initialEvent?.mapReference || ''
  });
  const [selectedImages, setSelectedImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Append images
    selectedImages.forEach(image => {
      formDataToSend.append('images', image);
    });

    await onSubmit(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-group">
        <label htmlFor="eventName">Event Name</label>
        <input
          type="text"
          id="eventName"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="bar">Bar</label>
        <input
          type="text"
          id="bar"
          name="bar"
          value={formData.bar}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="coverCharge">Cover Charge</label>
        <input
          type="text"
          id="coverCharge"
          name="coverCharge"
          value={formData.coverCharge}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="mapReference">Map Reference</label>
        <input
          type="text"
          id="mapReference"
          name="mapReference"
          value={formData.mapReference}
          onChange={handleChange}
        />
      </div>

      <EventImage 
        images={initialEvent?.images} 
        onImagesChange={files => setSelectedImages(files)} 
      />

      <button type="submit" className="submit-button">
        {initialEvent ? 'Update Event' : 'Create Event'}
      </button>

      <style jsx>{`
        .event-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        input, textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        textarea {
          min-height: 100px;
        }

        .submit-button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .submit-button:hover {
          background-color: #0051cc;
        }
      `}</style>
    </form>
  );
};

export default EventForm; 