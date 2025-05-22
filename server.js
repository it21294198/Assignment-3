const express = require('express');
const app = express();
const path = require('path');
const ip = require('ip');

// Serve static files from the root (this allows index.html, index.js, 3D_Objects, etc.)
app.use(express.static(__dirname));

// Optional: body parsing (not necessary unless you're sending form data or JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route: Serve index.html on /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://${ip.address()}:${PORT}/`);
  console.log(`✅ Or access it via http://localhost:${PORT}/`);
});