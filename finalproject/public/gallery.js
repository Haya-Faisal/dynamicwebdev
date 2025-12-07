// gallery.js
class TileGallery {
    constructor() {
        this.tileSize = 200;
        this.cols = 12;
        this.rows = 7;
        this.totalTiles = 84;
        this.container = null;
        
        this.init();
    }
    
    async init() {
        console.log(' Loading gallery...');
        
        this.container = document.getElementById('tile-grid');
        if (!this.container) {
            console.error(' #tile-grid not found');
            return;
        }
        
        this.setupGrid();
        await this.loadTilesFromAPI();  
        
        window.addEventListener('resize', () => this.adjustView());
    }
    
    setupGrid() {
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, ${this.tileSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.rows}, ${this.tileSize}px)`;
        this.container.style.gap = '0';
        this.container.style.width = `${this.cols * this.tileSize}px`;
        this.container.style.height = `${this.rows * this.tileSize}px`;
        
        this.adjustView();
    }
    
    
    async loadTilesFromAPI() {
        try {
            const response = await fetch('/api/tiles');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(' Received tile data:', data);
            
            this.displayTiles(data.tiles);
            
        } catch (error) {
            console.error(' Error loading tiles from API:', error);
            this.showError('Failed to load tiles. Server may be down.');
        }
    }
    
    displayTiles(tiles) {
        
        this.container.innerHTML = '';
        
        // Create tiles
        tiles.forEach(tile => {
            const tileElement = this.createTileElement(tile);
            this.container.appendChild(tileElement);
        });
        
        console.log(`Displayed ${tiles.length} tiles`);
    }
    
    createTileElement(tile) {
        const element = document.createElement('div');
        element.className = 'tile';
        element.dataset.tileId = tile.id;
        
        if (tile.url) {
            // Has saved image
            element.innerHTML = `
                <img src="${tile.url}" 
                     alt="Tile ${tile.id}" 
                     class="tile-image"
                     onerror="this.style.display='none'; this.parentElement.classList.add('broken-image')">
                
            `;
            element.classList.add('has-image');
        } else {
            // Empty tile
            
            element.classList.add('empty');
        }
        
        // Click to go to drawing page
        element.addEventListener('click', () => {
            window.location.href = `/tile/${tile.id}`;
        });
        
        return element;
    }
    
    adjustView() {
        const viewportWidth = window.innerWidth;
        const gridWidth = this.cols * this.tileSize;
        
        if (gridWidth > viewportWidth) {
            this.container.style.overflowX = 'auto';
        } else {
            this.container.style.overflowX = 'hidden';
            this.container.style.margin = '0 auto';
        }
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Start gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TileGallery();
});