type pointInfo = { distance: number; point: Point; };

function chan(grid: Grid) {
  const { points } = grid;
  const p0 = new Point(-Infinity, 0);
  const p1 = getP1(grid.points);
  const n = points.length;

  for (let i = 1; i <= Math.log2(Math.log2(n)); i++) {
    const m = Math.pow(Math.pow(i, 2), 2);
    const hullPoints = [p0, p1];
    const k = Math.ceil(n / m);
    const splitPointsArray = splitPoints(grid.points, m);
    const grahamHulls = [];
    for (let i = 0; i < splitPointsArray.length; i++) {
      const grahamHull = grahamScan(splitPointsArray[i]);
      grahamHulls.push(grahamHull);
    }
    jarvisMarch(grahamHulls, hullPoints, m);
    // get rid of the fake point at the start.
    hullPoints.shift();
    if (arePointsEqual(hullPoints[0], hullPoints[hullPoints.length - 1])) {
      return hullPoints;
    }
  }
}

function arePointsEqual(p1: Point, p2: Point): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

function jarvisMarch(pointsArray: Point[][], hullPoints: Point[], m: number) {
  for (let i = 0; i < m; i++) {
    let currentBest: {angle: number; point: Point} = null;
    for (let k = 0; k < pointsArray.length; k++) {
      const bestOfGroup = jarvisBinary(pointsArray[k], 
        getNextToTopOfStack(hullPoints), getTopOfStack(hullPoints));
        if (!currentBest) {
          currentBest = bestOfGroup;
          continue;
        }
        if (currentBest.angle < bestOfGroup.angle) {
          currentBest = bestOfGroup;
        }
    }
    hullPoints.push(currentBest.point);
  }
}

function jarvisBinary(points: Point[], p1: Point, p2: Point) {
  // TODO check that we are not testing against one of the current angles
  let left = 0;
  let right = points.length - 1;
  while (true) {
    const idx = Math.ceil((right + left) / 2);
    const point = points[idx];
    const angle = getAngleBetween3Points(p1, p2, point);
    if (left === right) {
      return { point, angle };
    }
    const leftNeighborAngle = getAngleBetween3Points(p1, p2, points[idx - 1]);
    const rightNeighborAngle = getAngleBetween3Points(p1, p2, points[idx + 1]);
    if (angle >= leftNeighborAngle && angle >= rightNeighborAngle) {
      return { point: points[idx], angle };
    }
    if (leftNeighborAngle > angle) {
      right = idx - 1;
    } else {
      left = idx + 1;
    }
  }
}

function getAngleBetween3Points(p1: Point, p2: Point, p3: Point): number {
  return getAngle(p2, p2) - getAngle(p2, p1);
}

/**
 * Run Graham Scan to find the convex hull of a set of points.
 * O(nlog(n))
 * @param points Array of {@link Point}s
 * @returns Array of {@link Point}s representing the convex hall
 */
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
 * Find the cross product of 3 {@link Point}s
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

/**
 * Find the {@link Point}, p1, according to {@link getP1} and sort the angles in ascending order
 * by the angle each {@link Point} makes with {@link p1}
 * @param points {@link Point[]}s
 * @returns sorted {@link Point[]}s
 */
function sortInOrderOfAngleWithP1(points: Point[]): Point[] {
  const p1 = getP1(points);
  const pointsCache = points.reduce((pointsCache: { [key: number]: pointInfo }, point: Point) => {
    const angle = getAngle(p1, point);
    const distance = getDistanceBetweenPoints(p1, point);
    const pointInfo = { point, distance };
    if (!pointsCache[angle]) {
      pointsCache[angle] = pointInfo;
    } else if (pointsCache[angle].distance < distance) {
      pointsCache[angle] = pointInfo;
    }
    return pointsCache;
  }, {});
  return Object.values(pointsCache).sort(({ point: p2 }, { point: p3 }) => {
    return getAngle(p1, p2) - getAngle(p1, p3);
  })
    .map(a => a.point);
}

/**
 * Find the distance between two {@link Point}s
 * @param p1 {@link Point} 1
 * @param p2 {@link Point} 2
 * @returns {@link number} distance between {@param p1} and {@param p2}
 */
function getDistanceBetweenPoints(p1: Point, p2: Point): number {
  const deltaXSquared = Math.pow(p1.x - p2.x, 2);
  const deltaYSquared = Math.pow(p1.y - p2.y, 2);
  return Math.sqrt(deltaXSquared + deltaYSquared);
}

/**
 * Find the angle that two points make with the x axis
 * @param point1 {@link Point}
 * @param point2 {@link Point}
 * @returns {@link number} angle
 */
function getAngle(point1: Point, point2: Point): number {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x)
}

/**
 * Split a set of points in groups of size m.
 * O(n) runtime
 * @param points {@link Point[]}
 * @param m Group size
 * @returns Array of arrays with size m
 */
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

/**
 * Finds the {@link Point} with the minimum y coordinate.
 * If two {@link Point}s share the same y coordinate, choose the one with the smaller x coordinate.
 * O(n) runtime.
 * @param points array of {@link Point[]}
 * @returns {@link Point} with the minimum y coordinate.
 */
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