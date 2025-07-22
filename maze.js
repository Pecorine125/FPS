const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 25;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);

const mazeGrid = [];
let stack = [];

class Cell {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.walls = { top:true, right:true, bottom:true, left:true };
    this.visited = false;
  }
  draw() {
    const x = this.col * cellSize;
    const y = this.row * cellSize;
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;

    if(this.walls.top) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if(this.walls.right) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if(this.walls.bottom) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y + cellSize);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
    if(this.walls.left) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}

function index(col,row) {
  if(col < 0 || row < 0 || col >= cols || row >= rows) return -1;
  return col + row * cols;
}

function getNeighbors(cell) {
  const neighbors = [];
  let top = mazeGrid[index(cell.col, cell.row-1)];
  if(top && !top.visited) neighbors.push(top);
  let right = mazeGrid[index(cell.col+1, cell.row)];
  if(right && !right.visited) neighbors.push(right);
  let bottom = mazeGrid[index(cell.col, cell.row+1)];
  if(bottom && !bottom.visited) neighbors.push(bottom);
  let left = mazeGrid[index(cell.col-1, cell.row)];
  if(left && !left.visited) neighbors.push(left);
  return neighbors;
}

function removeWalls(a,b) {
  const x = a.col - b.col;
  if(x === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if(x === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }
  const y = a.row - b.row;
  if(y === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if(y === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
}

function setupMaze() {
  for(let r=0; r<rows; r++) {
    for(let c=0; c<cols; c++) {
      mazeGrid.push(new Cell(c,r));
    }
  }
}

function generateMaze() {
  let current = mazeGrid[0];
  current.visited = true;
  stack.push(current);

  while(stack.length > 0) {
    current = stack[stack.length-1];
    let neighbors = getNeighbors(current);
    if(neighbors.length > 0) {
      let next = neighbors[Math.floor(Math.random()*neighbors.length)];
      next.visited = true;
      removeWalls(current,next);
      stack.push(next);
    } else {
      stack.pop();
    }
  }
}

function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  mazeGrid.forEach(cell => cell.draw());
}

// Exportar para global (gameplay.js usa isso)
window.mazeGrid = mazeGrid;
window.cellSize = cellSize;
window.cols = cols;
window.rows = rows;
window.drawMaze = drawMaze;
window.setupMaze = setupMaze;
window.generateMaze = generateMaze;
