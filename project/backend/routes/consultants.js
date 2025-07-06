const express = require('express');
const pool = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all consultants
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM consultants WHERE is_active = true ORDER BY first_name, last_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get consultant by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM consultants WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultant not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching consultant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create consultant (admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      skills,
      experience_years,
      rate_per_hour,
      location,
      notes
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const result = await pool.query(
      `INSERT INTO consultants (first_name, last_name, email, phone, skills, experience_years, rate_per_hour, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [first_name, last_name, email, phone, skills, experience_years, rate_per_hour, location, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating consultant:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update consultant (admin only)
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      skills,
      experience_years,
      rate_per_hour,
      availability_status,
      location,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE consultants 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, skills = $5, 
           experience_years = $6, rate_per_hour = $7, availability_status = $8, 
           location = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND is_active = true
       RETURNING *`,
      [first_name, last_name, email, phone, skills, experience_years, rate_per_hour, 
       availability_status, location, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating consultant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete consultant (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE consultants SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultant not found' });
    }

    res.json({ message: 'Consultant deleted successfully' });
  } catch (error) {
    console.error('Error deleting consultant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;