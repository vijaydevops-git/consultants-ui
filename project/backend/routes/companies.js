const express = require('express');
const pool = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all companies
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create company (admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      industry,
      location,
      website,
      contact_email,
      contact_phone,
      notes
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const result = await pool.query(
      `INSERT INTO companies (name, industry, location, website, contact_email, contact_phone, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, industry, location, website, contact_email, contact_phone, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update company (admin only)
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      industry,
      location,
      website,
      contact_email,
      contact_phone,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE companies 
       SET name = $1, industry = $2, location = $3, website = $4, 
           contact_email = $5, contact_phone = $6, notes = $7, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND is_active = true
       RETURNING *`,
      [name, industry, location, website, contact_email, contact_phone, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete company (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE companies SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;