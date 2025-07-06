const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mridulcsk123', // your password here
  database: 'solar_project'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Free Quote API
app.post('/api/quote', (req, res) => {
  const { name, email, mobile, service, note } = req.body;
  const sql = `INSERT INTO free_quote_submissions (name, email, mobile, service, note) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [name, email, mobile, service, note], (err) => {
    if (err) return res.status(500).send('Database error');
    res.send('Quote saved!');
  });
});

// Solar Calculator API
app.post('/api/calculator', (req, res) => {
    const { name, email, phone, country, address, area, estimatedPower, estimatedCost } = req.body;
  
    const sql = `INSERT INTO solar_calculations (name, email, phone, country, address, area, estimated_power_kw, estimated_cost_inr)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(sql, [name, email, phone, country, address, area, estimatedPower, estimatedCost], (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).send('Database error');
      }
      res.send('Solar calculation saved successfully');
    });
  });
  

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Save selected plan
app.post('/api/select-plan', (req, res) => {
  const { planName, price, units, warranty } = req.body;

  const sql = `INSERT INTO selected_plans (plan_name, price, units, warranty) VALUES (?, ?, ?, ?)`;
  db.query(sql, [planName, price, units, warranty], (err) => {
    if (err) return res.status(500).send('Error saving plan');
    res.send('Plan selected successfully');
  });
});


// Final Quote API (from custom quote page)
app.post('/api/final-quote', (req, res) => {
  const { name, email, phone, message } = req.body;

  const sql = `INSERT INTO final_quotes (name, email, phone, message) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, email, phone, message], (err) => {
    if (err) return res.status(500).send('Error saving final quote');
    res.send('Final quote submitted successfully');
  });
});
