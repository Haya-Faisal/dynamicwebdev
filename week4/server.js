// const express = require('express');
// const path = require('path');
// const fs = require('fs').promises;

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(express.json());
// app.use(express.static('public'));

// // Store for drawing data
// let drawings = [];

// // Routes
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// // Save drawing data
// app.post('/api/drawings', async (req, res) => {
//   try {
//     const { name, data } = req.body;
//     const newDrawing = {
//       id: Date.now(),
//       name: name || `Drawing-${Date.now()}`,
//       data: data,
//       createdAt: new Date().toISOString()
//     };
    
//     drawings.push(newDrawing);
    
//     // Also save to file for persistence
//     await fs.writeFile('drawings.json', JSON.stringify(drawings, null, 2));
    
//     res.json({ success: true, drawing: newDrawing });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get all drawings
// app.get('/api/drawings', async (req, res) => {
//   try {
//     // Try to load from file first
//     try {
//       const data = await fs.readFile('drawings.json', 'utf8');
//       drawings = JSON.parse(data);
//     } catch (error) {
//       // File doesn't exist yet, use empty array
//       drawings = [];
//     }
    
//     res.json({ success: true, drawings });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Delete a drawing
// app.delete('/api/drawings/:id', async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     drawings = drawings.filter(drawing => drawing.id !== id);
    
//     await fs.writeFile('drawings.json', JSON.stringify(drawings, null, 2));
    
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});