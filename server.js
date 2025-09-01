// server.js
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool (using Supabase Session Pooler)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

// Initialize the database table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    restaurant TEXT NOT NULL,
    city TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    visit_date DATE NOT NULL,
    comments TEXT
  )
`)
  .then(() => console.log("✅ Reviews table ready"))
  .catch(err => console.error("Error creating table:", err));

// Express setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

// Homepage with review form
app.get('/', (req, res) => {
  res.render('index');
});

// Handle review submission
app.post('/submit', async (req, res) => {
  const { restaurant, city, rating, visit_date, comments } = req.body;

  // Convert rating to integer
  const ratingNum = parseInt(rating);
  if (!restaurant || !city || !visit_date || !ratingNum) {
    return res.send("All required fields must be filled in!");
  }

  try {
    await pool.query(
      'INSERT INTO reviews (restaurant, city, rating, visit_date, comments) VALUES ($1, $2, $3, $4, $5)',
      [restaurant, city, ratingNum, visit_date, comments || null]
    );
    res.redirect('/reviews');
  } catch (err) {
    console.error("Error inserting review:", err.message);
    res.send(`Something went wrong while saving your review: ${err.message}`);
  }
});

// Display all reviews
app.get('/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY visit_date DESC');
    res.render('reviews', { reviews: result.rows });
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    res.send(`Something went wrong while fetching reviews: ${err.message}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
