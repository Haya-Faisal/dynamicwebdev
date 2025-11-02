let cellSize = 40;
let frozenCells = [];
let angle = 0;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  noLoop();
  noCursor();
}

function draw() {
  background(250, 235, 215);

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0-15; x < width+20; x += cellSize) {
      let isMouseOver = mouseX > x && mouseX < x + cellSize && 
                       mouseY > y && mouseY < y + cellSize;
      
      let isFrozen = frozenCells.some(cell => 
        cell.x === x && cell.y === y
      );
      
      if (isFrozen) {
        let frozenCell = frozenCells.find(cell => 
          cell.x === x && cell.y === y
        );
        drawlungipattern(x, y, isMouseOver, frozenCell.pattern, frozenCell.frozenAngle);
      } else {
        let pattern = {
          sizes: [
            cellSize - random(1, 4),
            cellSize - 10,
            random(10, cellSize - 20),
            random(10, cellSize - 20)
          ]
        };
        drawlungipattern(x, y, isMouseOver, pattern, angle);
      }
    }
  }
  angle += 0.01;
}

function drawlungipattern(x, y, isBold, pattern, currentAngle) {
  if (isBold) {
    basecolor = color(0, 139, 139);
    strokewieghtvalue = 3;
  } else {
    r = map(x, 0, width, 0, 255);
    b = map(y, 0, height, 0, 255);
    basecolor = color(r, 0, b);
    strokewieghtvalue = 1;
  }

  push();
  translate(x + cellSize / 2, y + cellSize / 2);
  stroke(basecolor);
  strokeWeight(strokewieghtvalue);
  fill(250, 235, 215);
  
  for (let size of pattern.sizes) {
    drawDiamond(size, currentAngle);
  }
  pop();
}

function drawDiamond(size, currentAngle) {
  push();
  rotate(currentAngle);
  beginShape();
  vertex(0, -size / 2);
  vertex(size / 2, 0);
  vertex(0, size / 2);
  vertex(-size / 2, 0);
  endShape(CLOSE);
  pop();
}

function mousePressed() {
  let cellX = floor((mouseX + 15) / cellSize) * cellSize - 15;
  let cellY = floor(mouseY / cellSize) * cellSize;
  
  let frozenIndex = frozenCells.findIndex(cell => 
    cell.x === cellX && cell.y === cellY
  );
  
  if (frozenIndex !== -1) {
    frozenCells.splice(frozenIndex, 1);
  } else {
    let pattern = {
      sizes: [
        cellSize - random(1, 4),
        cellSize - 10,
        random(10, cellSize - 20),
        random(10, cellSize - 20)
      ]
    };
    frozenCells.push({
      x: cellX,
      y: cellY,
      pattern: pattern,
      frozenAngle: angle
    });
  }
  
  redraw();
}

function mouseMoved() {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    redraw();
  }
}