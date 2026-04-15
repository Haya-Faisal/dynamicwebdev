const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const TOTAL_TILES = 84;
const TILE_SIZE = 200;
const COLS = 12;
const ROWS = 7;
const TILES_DIR = path.join(__dirname, "public", "tiles"); // Where images are saved

app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));

// Create tiles directory if it doesn't exist
function ensureTilesDirectory() {
  if (!fs.existsSync(TILES_DIR)) {
    fs.mkdirSync(TILES_DIR, { recursive: true });
    console.log(`Created tiles directory: ${TILES_DIR}`);
  }
}

// Get all existing tile images
async function getExistingTiles() {
  const { blobs } = await list();

  const tiles = [];

  // Build tiles from blobs
  blobs.forEach((blob) => {
    const match = blob.pathname.match(/^tile-(\d+)\.jpg$/);
    if (match) {
      const tileId = parseInt(match[1]);
      const row = Math.floor((tileId - 1) / COLS);
      const col = (tileId - 1) % COLS;
      tiles.push({
        id: tileId,
        image: blob.pathname,
        url: blob.url,
        position: { row, col },
        colors: ["#660033"],
        symmetry: 6,
        lastModified: blob.uploadedAt,
      });
    }
  });

  // Add empty slots for missing tiles
  for (let i = 1; i <= TOTAL_TILES; i++) {
    if (!tiles.find((t) => t.id === i)) {
      const row = Math.floor((i - 1) / COLS);
      const col = (i - 1) % COLS;
      tiles.push({
        id: i,
        image: null,
        url: null,
        position: { row, col },
        colors: ["#660033"],
        symmetry: 6,
        lastModified: null,
      });
    }
  }

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
const { put, list } = require("@vercel/blob");

async function saveTileImage(tileId, base64Image) {
  const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const blob = await put(`tile-${tileId}.jpg`, buffer, {
    access: "public",
    contentType: "image/jpeg",
  });

  return { success: true, url: blob.url, filename: `tile-${tileId}.jpg` };
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
app.get("/api/tiles", async (req, res) => {
  try {
    const tiles = await getExistingTiles();
    res.json({
      tiles,
      gridConfig: {
        totalTiles: TOTAL_TILES,
        cols: COLS,
        rows: ROWS,
        tileSize: TILE_SIZE,
      },
    });
  } catch (error) {
    console.error("Error fetching tiles:", error);
    res.status(500).json({ error: "Failed to load tiles" });
  }
});

// GET specific tile
app.get("/api/tiles/:id", (req, res) => {
  const tileId = parseInt(req.params.id);
  const tiles = getExistingTiles();
  const tile = tiles.find((t) => t.id === tileId);

  if (tile) {
    res.json(tile);
  } else {
    res.status(404).json({ error: "Tile not found" });
  }
});

// POST - Save tile as image file
app.post("/api/tiles/:id", async (req, res) => {
  const tileId = parseInt(req.params.id);
  const { image, colors, symmetry } = req.body;

  console.log(` Saving tile #${tileId} as image file...`);

  if (!image) {
    return res.status(400).json({ error: "No image data provided" });
  }

  try {
    const result = await saveTileImage(tileId, image);
    res.json({
      success: true,
      message: "Tile saved as image file",
      tileId: tileId,
      url: result.url,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Error saving tile:", error);
    res
      .status(500)
      .json({ error: "Failed to save image", details: error.message });
  }
});

// DELETE
app.delete("/api/tiles/:id", (req, res) => {
  const tileId = parseInt(req.params.id);

  const deleted = deleteTileImage(tileId);

  if (deleted) {
    res.json({ success: true, message: `Tile ${tileId} image deleted` });
  } else {
    res.status(404).json({ error: `Tile ${tileId} image not found` });
  }
});

// Serve tile images
app.use("/tiles", express.static(TILES_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});

// Add this line - it was missing!
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});

app.get("/tile/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tile.html"));
});

ensureTilesDirectory();

// listen on port 8080
app.listen(3000);
