const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


const TOTAL_TILES = 84;
const TILE_SIZE = 200;
const COLS = 12;
const ROWS = 7;
const TILES_DIR = path.join(__dirname, 'public', 'tiles'); // Where images are saved


app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));



// Create tiles directory if it doesn't exist
function ensureTilesDirectory() {
    if (!fs.existsSync(TILES_DIR)) {
        fs.mkdirSync(TILES_DIR, { recursive: true });
        console.log(`Created tiles directory: ${TILES_DIR}`);
    }
}

// Get all existing tile images
function getExistingTiles() {
    ensureTilesDirectory();
    
    const tiles = [];
    const files = fs.readdirSync(TILES_DIR);
    
    // Create tile objects for existing images
    files.forEach(filename => {
        if (filename.match(/^tile-(\d+)\.(jpg|jpeg|png)$/)) {
            const tileId = parseInt(filename.match(/^tile-(\d+)\./)[1]);
            
            // Calculate grid position
            const row = Math.floor((tileId - 1) / COLS);
            const col = (tileId - 1) % COLS;
            
            tiles.push({
                id: tileId,
                image: filename,  // Just the filename, not full path
                url: `/tiles/${filename}`,
                position: { row, col },
                colors: ['#660033'],  // Default
                symmetry: 6,           // Default
                lastModified: getFileModifiedTime(tileId)
            });
        }
    });
    
    // Add empty slots for missing tiles
    for (let i = 1; i <= TOTAL_TILES; i++) {
        if (!tiles.find(t => t.id === i)) {
            const row = Math.floor((i - 1) / COLS);
            const col = (i - 1) % COLS;
            
            tiles.push({
                id: i,
                image: null,  // No image file yet
                url: null,
                position: { row, col },
                colors: ['#660033'],
                symmetry: 6,
                lastModified: null
            });
        }
    }
    
    // Sort by tile ID
    tiles.sort((a, b) => a.id - b.id);
    
    return tiles;
}

// Get file modification time
function getFileModifiedTime(tileId) {
    const filename = `tile-${tileId}.jpg`;
    const filepath = path.join(TILES_DIR, filename);
    
    if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        return stats.mtime.toISOString();
    }
    return null;
}

// Save tile as image file
function saveTileImage(tileId, base64Image) {
    ensureTilesDirectory();
    
    // Extract base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, '');
    
    // Create filename
    const filename = `tile-${tileId}.jpg`;
    const filepath = path.join(TILES_DIR, filename);
    
    try {
        // Save as JPEG file
        fs.writeFileSync(filepath, base64Data, 'base64');
        console.log(` Saved tile ${tileId} as: ${filename}`);
        
        return {
            success: true,
            filename: filename,
            url: `/tiles/${filename}`,
            tileId: tileId
        };
    } catch (error) {
        console.error(` Error saving tile ${tileId}:`, error);
        return { success: false, error: error.message };
    }
}

// Delete tile image
function deleteTileImage(tileId) {
    const filename = `tile-${tileId}.jpg`;
    const filepath = path.join(TILES_DIR, filename);
    
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(` Deleted tile ${tileId} image`);
        return true;
    }
    return false;
}

// API ROUTES

// GET all tiles
app.get('/api/tiles', (req, res) => {
    const tiles = getExistingTiles();
    
    res.json({
        tiles: tiles,
        gridConfig: {
            totalTiles: TOTAL_TILES,
            cols: COLS,
            rows: ROWS,
            tileSize: TILE_SIZE
        }
    });
});

// GET specific tile
app.get('/api/tiles/:id', (req, res) => {
    const tileId = parseInt(req.params.id);
    const tiles = getExistingTiles();
    const tile = tiles.find(t => t.id === tileId);
    
    if (tile) {
        res.json(tile);
    } else {
        res.status(404).json({ error: 'Tile not found' });
    }
});

// POST - Save tile as image file
app.post('/api/tiles/:id', (req, res) => {
    const tileId = parseInt(req.params.id);
    const { image, colors, symmetry } = req.body;
    
    console.log(` Saving tile #${tileId} as image file...`);
    
    if (!image) {
        return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Save the image file
    const result = saveTileImage(tileId, image);
    
    if (result.success) {
        res.json({
            success: true,
            message: 'Tile saved as image file',
            tileId: tileId,
            url: result.url,
            filename: result.filename
        });
    } else {
        res.status(500).json({ error: 'Failed to save image', details: result.error });
    }
});

// DELETE 
app.delete('/api/tiles/:id', (req, res) => {
    const tileId = parseInt(req.params.id);
    
    const deleted = deleteTileImage(tileId);
    
    if (deleted) {
        res.json({ success: true, message: `Tile ${tileId} image deleted` });
    } else {
        res.status(404).json({ error: `Tile ${tileId} image not found` });
    }
});

// Serve tile images
app.use('/tiles', express.static(TILES_DIR));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Add this line - it was missing!
app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/tile/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tile.html'));
});


ensureTilesDirectory();

// listen on port 8080
app.listen(3000);