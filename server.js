const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL connection - Optimized for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'booking.purelight@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Create contacts table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Contacts table ready');
  }
});

// API endpoint to handle contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Save to database
    const insertQuery = `
      INSERT INTO contacts (name, email, message) 
      VALUES ($1, $2, $3) 
      RETURNING id, created_at
    `;
    
    const dbResult = await pool.query(insertQuery, [name, email, message]);
    const contactId = dbResult.rows[0].id;

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER || 'booking.purelight@gmail.com',
      to: 'booking.purelight@gmail.com',
      subject: `New Contact Form Submission - ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
        <p><small>Contact ID: ${contactId}</small></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      contactId: contactId
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// API endpoint to get all contacts (for admin purposes)
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ 
      success: true, 
      contacts: result.rows 
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
