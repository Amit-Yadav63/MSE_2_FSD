const express = require('express');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/items/search?name=xyz
// Ensure this route comes before /:id otherwise 'search' will be treated as an ID
router.get('/search', async (req, res) => {
  try {
    const query = {};
    if (req.query.name) {
      query.itemName = { $regex: req.query.name, $options: 'i' };
    }
    const items = await Item.find(query).populate('user', 'name email');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/items -> Add item
router.post('/', auth, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;
    
    if (!itemName || !description || !type || !location || !date || !contactInfo)
        return res.status(400).json({ message: 'All fields are required.' });

    const newItem = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      user: req.user
    });

    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items -> View all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/:id -> View item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/items/:id -> Update item
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Only allow the user who created it to update
    if (item.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/items/:id -> Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Only allow the user who created it to delete
    if (item.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
