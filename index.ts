// take the points that are coming in and find the one with the min y coord.

function chan(grid: Grid){
  const {points} = grid;
  const p0 = new Point(-Infinity, 0);
  const p1 = getP1(grid.points);
  const n = points.length;
  
  for (let i = 1; i <= Math.log2(Math.log2(n)); i++) {
    const m = Math.pow(Math.pow(i, 2), 2);
    const hullPoints = [p1];
    const k = Math.ceil(n / m);
    const splitPointsArray = splitPoints(grid.points, m);
    for (let i = 0; i < splitPointsArray.length; i++) {
      // compute the hull for each set using graham scan
    }
  }
}

function splitPoints(points: Point[], m: number): Point[][] {
  const result: Point[][] = [];
  for (let i = 0; i < points.length; ) {
    const temp: Point[] = [];
    const start = i;
    for ( ; i < m + start; i++) {
      temp.push(points[i]);
    }
    result.push(temp);
  }
  return result;
}

// O(n) runtime
function getP1(points: Point[]): Point {
  let lowestYPoint = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < lowestYPoint.y) {
      lowestYPoint = points[i];
    } else if (points[i].y === lowestYPoint.y) {
      if (points[i].x < lowestYPoint.x) {
        lowestYPoint = points[i];
      }
    }
  }
  return lowestYPoint;
}


class Grid {
  public points: Point[];
  
  constructor() {
    this.points = [];
  }

  addPoint(x: number, y: number) {
    const point = new Point(x, y);
    this.points.push(point);
    return this;
  }
  
  clear() {
    this.points = [];
    return this;
  }
}

class Point {
  public readonly x: number;
  public readonly y: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}