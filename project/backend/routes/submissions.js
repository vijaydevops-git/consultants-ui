const express = require('express');
const pool = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get submissions with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { consultant_id, company_id, status, start_date, end_date } = req.query;
    
    let query = `
      SELECT s.*, 
             c.first_name as consultant_first_name, 
             c.last_name as consultant_last_name,
             comp.name as company_name,
             u.first_name as recruiter_first_name,
             u.last_name as recruiter_last_name
      FROM submissions s
      JOIN consultants c ON s.consultant_id = c.id
      JOIN companies comp ON s.company_id = comp.id
      JOIN users u ON s.recruiter_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Role-based filtering
    if (req.user.role === 'recruiter') {
      query += ` AND s.recruiter_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }
    
    if (consultant_id) {
      query += ` AND s.consultant_id = $${paramCount}`;
      params.push(consultant_id);
      paramCount++;
    }
    
    if (company_id) {
      query += ` AND s.company_id = $${paramCount}`;
      params.push(company_id);
      paramCount++;
    }
    
    if (status) {
      query += ` AND s.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (start_date) {
      query += ` AND s.submission_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }
    
    if (end_date) {
      query += ` AND s.submission_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }
    
    query += ' ORDER BY s.submission_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create submission
router.post('/', auth, async (req, res) => {
  try {
    const {
      consultant_id,
      company_id,
      position_title,
      submission_date,
      rate_submitted,
      notes
    } = req.body;

    if (!consultant_id || !company_id || !position_title || !submission_date) {
      return res.status(400).json({ 
        error: 'Consultant, company, position title, and submission date are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO submissions (consultant_id, company_id, recruiter_id, position_title, submission_date, rate_submitted, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [consultant_id, company_id, req.user.id, position_title, submission_date, rate_submitted, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update submission
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      consultant_id,
      company_id,
      position_title,
      submission_date,
      status,
      rate_submitted,
      notes,
      interview_date,
      feedback
    } = req.body;

    // Check if user can edit this submission
    if (req.user.role === 'recruiter') {
      const checkResult = await pool.query(
        'SELECT recruiter_id FROM submissions WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      if (checkResult.rows[0].recruiter_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query(
      `UPDATE submissions 
       SET consultant_id = $1, company_id = $2, position_title = $3, 
           submission_date = $4, status = $5, rate_submitted = $6, 
           notes = $7, interview_date = $8, feedback = $9, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [consultant_id, company_id, position_title, submission_date, status, 
       rate_submitted, notes, interview_date, feedback, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete submission
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can delete this submission
    if (req.user.role === 'recruiter') {
      const checkResult = await pool.query(
        'SELECT recruiter_id FROM submissions WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      if (checkResult.rows[0].recruiter_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query(
      'DELETE FROM submissions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get submission statistics
router.get('/stats', auth, async (req, res) => {
  try {
    let statsQuery = `
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
        COUNT(CASE WHEN status = 'interviewing' THEN 1 END) as interviewing_count,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
        AVG(rate_submitted) as average_rate
      FROM submissions s
    `;
    
    const params = [];
    if (req.user.role === 'recruiter') {
      statsQuery += ' WHERE s.recruiter_id = $1';
      params.push(req.user.id);
    }
    
    const result = await pool.query(statsQuery, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;