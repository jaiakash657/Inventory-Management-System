require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3550;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}).promise();


// Fetch all inventory items
app.get('/inventory', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM inventory');
    res.json(results);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Update item quantity
app.put('/updateItem', async (req, res) => {
  const { itemName, newQuantity } = req.body;

  if (!itemName || newQuantity == null) {
    return res.status(400).json({ error: 'Item name and new quantity are required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE inventory SET quantity = ? WHERE item = ?',
      [newQuantity, itemName]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item quantity updated successfully' });
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch end-of-day items
app.get('/endofday', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory WHERE quantity <= threshold');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching end-of-day items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Expiration alert for items
app.get('/expiration', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [results] = await pool.query(
      'SELECT * FROM inventory WHERE expirationDate <= ?',
      [today]
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching expiration data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recipes
app.get('/recipes', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM recipe');
    const formattedResults = results.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients.split(',').map(ingredient => ingredient.trim())
    }));
    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Shelf life alert for items
app.get('/shelflife', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT * FROM inventory WHERE shelfLife <= ?',
      [3]
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching shelf life data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove item
app.delete('/removeitem', async (req, res) => {
  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({ error: 'Item name is required.' });
  }

  try {
    const [results] = await pool.query('DELETE FROM inventory WHERE item = ?', [itemName]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    res.status(200).json({ message: 'Item removed successfully.' });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: error.message });
  }
});

//supplier
app.get('/suppliers', async (req, res) => {
  try {
    const [suppliers] = await pool.query(`
      SELECT s.id AS supplier_id, s.name, i.item, i.quantity
      FROM suppliers s
      LEFT JOIN inventory i ON s.id = i.supplier_id;
    `);

    const supplierMap = {};
    for (const row of suppliers) {
      const { supplier_id, name, item, quantity } = row;
      if (!supplierMap[supplier_id]) {
        supplierMap[supplier_id] = { name, items: [] };
      }
      supplierMap[supplier_id].items.push({ item, quantity });
    }

    const formattedData = Object.values(supplierMap);
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new item to inventory
app.post('/additem', async (req, res) => {
  const { itemName, quantity, shelfLife, supplier, expirationDate } = req.body;

  if (!itemName || quantity == null || shelfLife == null || !supplier) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [results] = await pool.query(
      'INSERT INTO inventory (item, quantity, shelfLife, supplier, expirationDate) VALUES (?, ?, ?, ?, ?)',
      [itemName, quantity, shelfLife, supplier, expirationDate]
    );
    res.status(201).json({ message: 'Item added successfully', itemId: results.insertId });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: error.message });
  }
});


//image
app.get('/graph', (req, res) => {
  const graphPath = path.join(__dirname, '../Figure_1.png'); 
  res.sendFile(graphPath, (err) => {
      if (err) {
          console.error('Error serving image:', err);
          res.status(500).send('Error loading image');
      }
  });
});

//threshold
const thresholdData = [
  { category: 'Fruits and Vegetables', sales: '2,820,060' },
  { category: 'Snack Foods', sales: '2,732,786' },
  { category: 'Household', sales: '2,055,494' },
  { category: 'Frozen Foods', sales: '1,825,735' },
  { category: 'Dairy', sales: '1,522,594' },
  { category: 'Canned', sales: '1,444,151' },
  { category: 'Baking Goods', sales: '1,265,525' },
  { category: 'Health and Hygiene', sales: '1,045,200' },
  { category: 'Meat', sales: '917,565' },
  { category: 'Soft Drinks', sales: '892,897' },
];

app.get('/thresholds', (req, res) => {
  res.json(thresholdData);
});

app.use((err, req, res, next) => {
  console.error('Error in the server:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
