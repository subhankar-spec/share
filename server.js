const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'shares.json');

// Middleware
app.use(cors());
app.use(express.json());

// Load/initialize data
let shares = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    shares = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.log('No existing data file, starting fresh.');
  }
}

// Save data to file
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(shares, null, 2));
}

// API Routes
// POST /api/share - Create a new shareable text
app.post('/api/share', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required.' });
  }

  const id = uuidv4().slice(0, 8); // Short ID
  shares[id] = {
    text,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  };
  saveData();
  res.json({ id, message: 'Text shared successfully.' });
});

// GET /api/share/:id - Retrieve shareable text
app.get('/api/share/:id', (req, res) => {
  const { id } = req.params;
  const share = shares[id];

  if (!share) {
    return res.status(404).json({ error: 'Text not found or has expired.' });
  }

  // Check expiration
  if (new Date(share.expiresAt) < new Date()) {
    delete shares[id];
    saveData();
    return res.status(404).json({ error: 'Text has expired.' });
  }

  res.json({ text: share.text, createdAt: share.createdAt });
});

// DELETE /api/share/:id - Delete a shared text
app.delete('/api/share/:id', (req, res) => {
  const { id } = req.params;
  if (shares[id]) {
    delete shares[id];
    saveData();
    res.json({ message: 'Text deleted.' });
  } else {
    res.status(404).json({ error: 'Text not found.' });
  }
});

// Serve static HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'share-portal.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Text Share Portal running at http://localhost:${PORT}`);
  console.log('📝 Open http://localhost:3000 in your browser to get started.');
});
