function main() {
  
}

class Grid {
  constructor(){
    this.points = [];
  }

  addPoint(point) {
    this.points.push(point);
    return this;
  }
  
  clear() {
    this.points = [];
    return this;
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}