import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ItemForm = ({ item, onSuccess }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    date: '',
    contactInfo: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName,
        description: item.description,
        type: item.type,
        location: item.location,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        contactInfo: item.contactInfo
      });
    }
  }, [item]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (item) {
        // Update
        await axios.put(`http://localhost:5001/api/items/${item._id}`, formData, config);
      } else {
        // Create
        await axios.post('http://localhost:5001/api/items', formData, config);
      }
      
      setFormData({
        itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: ''
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving item');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Item Name</label>
          <input type="text" name="itemName" className="form-control" value={formData.itemName} onChange={handleChange} required />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Type</label>
          <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange} required></textarea>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Location</label>
          <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} required />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Date</label>
          <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Contact Info</label>
          <input type="text" name="contactInfo" className="form-control" value={formData.contactInfo} onChange={handleChange} required />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">{item ? 'Update Item' : 'Submit Report'}</button>
    </form>
  );
};

export default ItemForm;
