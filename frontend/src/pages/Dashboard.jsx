import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Calendar, Phone, Edit, Trash2 } from 'lucide-react';
import ItemForm from '../components/ItemForm';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/items');
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5001/api/items/search?name=${searchQuery}`);
      setItems(res.data);
    } catch (err) {
      console.error('Error searching items:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchItems();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting item');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const onFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchItems();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <button 
          className="btn btn-success" 
          onClick={() => { setEditingItem(null); setShowForm(!showForm); }}
        >
          {showForm ? 'Cancel' : 'Report Item'}
        </button>
      </div>

      {showForm && (
        <div className="card card-custom p-4 mb-4">
          <h4>{editingItem ? 'Edit Item' : 'Report Lost/Found Item'}</h4>
          <ItemForm item={editingItem} onSuccess={onFormSuccess} />
        </div>
      )}

      <div className="card card-custom p-4 mb-4">
        <form onSubmit={handleSearch} className="d-flex">
          <input 
            type="text" 
            className="form-control me-2" 
            placeholder="Search by item name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-primary d-flex align-items-center">
            <Search size={18} className="me-1" /> Search
          </button>
          {searchQuery && (
            <button 
              type="button" 
              className="btn btn-outline-secondary ms-2"
              onClick={() => { setSearchQuery(''); fetchItems(); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="row">
        {items.length === 0 ? (
          <div className="col-12 text-center text-muted mt-4">
            No items reported yet.
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card card-custom h-100">
                <div className={`card-header text-white ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>
                  <strong>{item.type}</strong>: {item.itemName}
                </div>
                <div className="card-body">
                  <p className="card-text">{item.description}</p>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2"><MapPin size={16} className="me-2 text-muted" /> {item.location}</li>
                    <li className="mb-2"><Calendar size={16} className="me-2 text-muted" /> {new Date(item.date).toLocaleDateString()}</li>
                    <li className="mb-2"><Phone size={16} className="me-2 text-muted" /> {item.contactInfo}</li>
                  </ul>
                </div>
                <div className="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                  <small className="text-muted">Reported by: {item.user?.name || 'Unknown'}</small>
                  {currentUser && item.user?._id === currentUser.id && (
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(item)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
