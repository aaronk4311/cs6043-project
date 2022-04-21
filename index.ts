// take the points that are coming in and find the one with the min y coord.

function chan(grid: Grid) {
  const { points } = grid;
  const p0 = new Point(-Infinity, 0);
  const p1 = getP1(grid.points);
  const n = points.length;

  for (let i = 1; i <= Math.log2(Math.log2(n)); i++) {
    const m = Math.pow(Math.pow(i, 2), 2);
    const hullPoints = [p1];
    const k = Math.ceil(n / m);
    const splitPointsArray = splitPoints(grid.points, m);
    const grahamHulls = [];
    for (let i = 0; i < splitPointsArray.length; i++) {
      const grahamHull = grahamScan(splitPointsArray[i]);
      grahamHulls.push(grahamHull);
    }
  }
}

function grahamScan(points: Point[]): Point[] {
  const sortedPoints = sortInOrderOfAngleWithP1(points);
  const hullStack = [];
  for (let i = 0; i < sortedPoints.length; i++) {
    const p3 = sortedPoints[i];
    while (hullStack.length >= 2 &&
      crossProduct(getNextToTopOfStack(hullStack), getTopOfStack(hullStack), p3) <= 0
    ) {
      hullStack.pop();
    }
    hullStack.push(p3);
  }
  return hullStack;
}

function getTopOfStack(stack: Point[]): Point {
  return stack[stack.length - 1];
}
function getNextToTopOfStack(stack: Point[]): Point {
  return stack[stack.length - 2];
}

/**
 * If the result is 0, the points are collinear.
 * If it is positive, the three points constitute a "left turn" or counter-clockwise orientation.
 * Otherwise a "right turn" or clockwise orientation (for counter-clockwise numbered points). 
 * @param p1 {@link Point} point1
 * @param p2 {@link Point} point2
 * @param p3 {@link Point} point3
 * @returns {@link number} Cross product of vectors P1P2 and P1P3
 */
function crossProduct(p1: Point, p2: Point, p3: Point): number {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

// TODO update sorting to deal with colinear
function sortInOrderOfAngleWithP1(points: Point[]): Point[] {
  const p1 = getP1(points);
  points.sort((a: Point, b: Point): number => {
    return getSlope(p1, a) - getSlope(p1, b);
  });
  return points;
}

function getSlope(point1: Point, point2: Point): number {
  return (point2.y - point1.y) / (point2.x - point1.x);
}

function splitPoints(points: Point[], m: number): Point[][] {
  const result: Point[][] = [];
  for (let i = 0; i < points.length;) {
    const temp: Point[] = [];
    const start = i;
    for (; i < m + start; i++) {
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