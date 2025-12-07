// tile.js - Drawing functionality for individual tiles
let symmetry = 6;
let angle;
let currentTileId = 1;
let currentColor = '#660033';
let currentBgColor = '#fae7c9'; 
let isDrawing = false;
let lastPreview = null;


const backgroundColors = [  // Changed variable name to plural
    '#f4dff4', '#fcadcd', '#dada94', '#dbf0a8ff', '#79a8d2', '#a8dcdc','#fae7c9'
];
// Available colors
const colors = [
    '#660033', '#1A3636', '#677D6A', '#48252F', '#204952',
    '#112250',  '#ffa726','#B6266C'
];

function setup() {
    // Get tile ID from URL (e.g., /tile/5)
    const pathParts = window.location.pathname.split('/');
    currentTileId = parseInt(pathParts[pathParts.length - 1]) || 1;
    
    // Update page title and info
    document.title = `Tile #${currentTileId} - Draw`;
    document.getElementById('tile-info').textContent = `Drawing on Tile #${currentTileId}`;
    
    // Create canvas
    canvas = createCanvas(750, 750);
    canvas.parent('canvas-container');
    canvas.mousePressed(startDrawing);
    canvas.mouseReleased(stopDrawing);
    
    // Set initial values
    angle = 360 / symmetry;
    background(hexToRgb(currentBgColor));
    
    // Setup UI controls
    setupColorPicker();
    setupBackgroundPicker();  
    setupSymmetryControls();
    setupActionButtons();
    setupKeyboardShortcuts();
    
    // Load existing tile if it exists
    loadExistingTile();
}

function draw() {
    translate(width / 2, height / 2);
    
    if (isDrawing) {
        let mx = mouseX - width / 2;
        let my = mouseY - height / 2;
        let pmx = pmouseX - width / 2;
        let pmy = pmouseY - height / 2;

        for (let i = 0; i < symmetry; i++) {
            rotate(radians(angle));
            strokeWeight(2);
            stroke(currentColor);
            line(mx, my, pmx, pmy);
            
            push();
            scale(1, -1);
            strokeWeight(2);
            stroke(currentColor);
            line(mx, my, pmx, pmy);
            pop();
        }
    }
}

function startDrawing() {
    isDrawing = true;
}

function stopDrawing() {
    isDrawing = false;
}


function setupColorPicker() {
    const colorPicker = document.getElementById('color-picker');
    const currentColorDisplay = document.getElementById('current-color');
    
    // Create color buttons
    colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn';
        colorBtn.style.backgroundColor = color;
        colorBtn.title = color;
        colorBtn.dataset.color = color;
        
        colorBtn.addEventListener('click', () => {
            currentColor = color;
            updateColorDisplay();
        });
        
        colorPicker.appendChild(colorBtn);
    });
    
    // Initial display
    updateColorDisplay();
}

function updateColorDisplay() {
    // Update current color display
    document.getElementById('current-color').style.backgroundColor = currentColor;
    
    // Update active state on color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.dataset.color === currentColor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function setupBackgroundPicker() {
    const bgPicker = document.getElementById('background-picker');
    const currentBgDisplay = document.getElementById('current-background');
    
    // Create background color buttons
    backgroundColors.forEach(bgHex => {  // bgHex instead of bgRgb
        const bgBtn = document.createElement('button');
        bgBtn.className = 'bg-color-btn';
        
        // Use hex directly for CSS
        bgBtn.style.backgroundColor = bgHex;
        bgBtn.title = bgHex;
        bgBtn.dataset.bghex = bgHex;  // Store hex, not RGB
        
        bgBtn.addEventListener('click', () => {
            currentBgColor = bgHex;
            updateBackgroundDisplay();
            // Update canvas background (convert hex to RGB)
            background(hexToRgb(currentBgColor));
        });
        
        bgPicker.appendChild(bgBtn);
    });
    
    // Initial display
    updateBackgroundDisplay();
}

function updateBackgroundDisplay() {
    // Update current background display using hex directly
    document.getElementById('current-background').style.backgroundColor = currentBgColor;
    
    // Update active state on background buttons
    document.querySelectorAll('.bg-color-btn').forEach(btn => {
        if (btn.dataset.bghex === currentBgColor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Helper function to convert hex to RGB array for p5.js
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return r || g || b ? [r, g, b] : [250, 231, 201]; // Default if conversion fails
}


function setupSymmetryControls() {
    const decreaseBtn = document.getElementById('symmetry-decrease');
    const increaseBtn = document.getElementById('symmetry-increase');
    const symmetryValue = document.getElementById('symmetry-value');
    
    decreaseBtn.addEventListener('click', () => {
        symmetry = Math.max(3, symmetry - 1);
        angle = 360 / symmetry;
        symmetryValue.textContent = symmetry;
    });
    
    increaseBtn.addEventListener('click', () => {
        symmetry = Math.min(12, symmetry + 1);
        angle = 360 / symmetry;
        symmetryValue.textContent = symmetry;
    });
    
    // Update initial display
    symmetryValue.textContent = symmetry;
}


function setupActionButtons() {
    // Save button
    document.getElementById('save-btn').addEventListener('click', saveTile);
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', clearCanvas);
}

// KEYBOARD SHORTCUTS
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        // C - Clear canvas
        if (key === 'c') {
            clearCanvas();
            e.preventDefault();
        }
        
        // S - Save tile
        if (key === 's') {
            saveTile();
            e.preventDefault();
        }
        
        // 1-9 - Set symmetry
        if (key >= '1' && key <= '9') {
            const num = parseInt(key);
            symmetry = Math.min(12, Math.max(3, num * 2)); // 1=2, 2=4, 3=6, etc.
            angle = 360 / symmetry;
            document.getElementById('symmetry-value').textContent = symmetry;
            e.preventDefault();
        }
        
        // Number keys 0-9 for direct symmetry
        if (e.code.startsWith('Digit')) {
            const num = parseInt(e.key);
            if (num >= 3 && num <= 12) {
                symmetry = num;
                angle = 360 / symmetry;
                document.getElementById('symmetry-value').textContent = symmetry;
                e.preventDefault();
            }
        }
    });
}

// CANVAS OPERATIONS
function clearCanvas() {
    background(hexToRgb(currentBgColor));
}

function saveTile() {
    console.log(`Saving tile #${currentTileId}...`);
    
    // Convert canvas to Base64 JPEG
    const imageBase64 = canvas.elt.toDataURL("image/jpeg", 1.0);
    console.log('Image converted to Base64');
    
    // Show loading state
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Send to server
    fetch(`/api/tiles/${currentTileId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: imageBase64,
            colors: [currentColor],
            symmetry: symmetry
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Save response:', data);
        
        if (data.success) {
            // Show success message
            saveBtn.textContent = ' Saved!';
            saveBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
            
            // Revert button after 2 seconds
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
                saveBtn.disabled = false;
            }, 2000);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('Error saving tile:', error);
        alert(' Failed to save tile: ' + error.message);
        saveBtn.textContent = ' Failed - Retry';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }, 2000);
    });
}

// LOAD EXISTING TILE

function loadExistingTile() {
    fetch(`/api/tiles/${currentTileId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(tile => {
            if (tile.url) {
                console.log(`Loading existing tile: ${tile.url}`);
                
                // Load image onto canvas
                const img = new Image();
                img.onload = function() {
                    const ctx = canvas.drawingContext;
                    ctx.drawImage(img, 0, 0, width, height);
                    console.log('Existing tile loaded onto canvas');
                };
                img.src = tile.url;
                
                // Restore saved settings
                if (tile.colors && tile.colors.length > 0) {
                    currentColor = tile.colors[0];
                    updateColorDisplay();
                }
                
                if (tile.symmetry) {
                    symmetry = tile.symmetry;
                    angle = 360 / symmetry;
                    document.getElementById('symmetry-value').textContent = symmetry;
                }
            } else {
                console.log('No existing tile found');
            }
        })
        .catch(error => {
            console.log('Error loading tile or no tile exists:', error.message);
        });
}

// =====================
// INITIALIZE
// =====================
// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // p5.js will call setup() automatically
    });
} else {
}