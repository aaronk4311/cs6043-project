type tSteps = { steps: number; }

/**
 * Compute the convex hull of a set of points using a modified version of chan's algorithm
 * Modifications include:
 * 1. Cache the hull points found during previous iterations.
 * 2. Only consider points found using graham's algorithm during subsequent iterations
 * 3. Modify the value of m to be the min between 2 ^ (t ^ 2) and n.
 * @param grid 
 * @returns 
 */
export function chanWithHullCache(grid: Grid, stepsObj: tSteps): Point[] {
  let { points } = grid;
  const p1 = getP1(points, stepsObj);
  const p0 = new Point(p1.x - 1, p1.y);
  let n = points.length;
  const stop = Math.ceil(Math.log2(Math.log2(n)));
  const hullPoints = [p0, p1];
  let grahamHulls = [];

  for (let i = 1; i <= stop; i++) {
    stepsObj.steps++;
    if (grahamHulls.length) {
      points = grahamHulls.reduce((newPoints: Point[], hull: Point[]) => {
        stepsObj.steps++;
        newPoints.push(...hull);
        return newPoints;
      }, []);
    }
    n = points.length;
    const m = Math.min(
      Math.pow(2, Math.pow(i, 2)),
      n,
    );
    const splitPointsArray = splitPoints(points, m, stepsObj);
    grahamHulls = [];
    for (let i = 0; i < splitPointsArray.length; i++) {
      stepsObj.steps++;
      const grahamHull = grahamScan(splitPointsArray[i], stepsObj);
      grahamHulls.push(grahamHull);
    }
    jarvisMarch(grahamHulls, hullPoints, m, stepsObj);
    if (arePointsEqual(hullPoints[1], hullPoints[hullPoints.length - 1])) {
      // get rid of the fake point at the start for only the first iteration
      hullPoints.shift();
      return hullPoints;
    }
  }
}

/**
 * 
 * @param grid {@link Grid}
 * @returns 
 */
export function chan(grid: Grid, stepsObj: tSteps): Point[] {
  const { points } = grid;
  const p1 = getP1(grid.points, stepsObj);
  const p0 = new Point(p1.x - 1, p1.y);
  const n = points.length;
  const stop = Math.log2(Math.log2(n));

  for (let i = 1; i <= stop + 1; i++) {
    stepsObj.steps++;
    const m = Math.pow(2, Math.pow(2, i));
    const hullPoints = [p0, p1];
    const splitPointsArray = splitPoints(grid.points, m, stepsObj);
    const grahamHulls = [];
    for (let i = 0; i < splitPointsArray.length; i++) {
      stepsObj.steps++;
      const grahamHull = grahamScan(splitPointsArray[i], stepsObj);
      grahamHulls.push(grahamHull);
    }
    jarvisMarch(grahamHulls, hullPoints, m, stepsObj);
    // get rid of the fake point at the start.
    if (arePointsEqual(hullPoints[1], hullPoints[hullPoints.length - 1])) {
      hullPoints.shift();
      return hullPoints;
    }
  }
}

/**
 * Check if two points are equal
 * @param p1 point 1
 * @param p2 point 2
 * @returns {boolean} are points equal
 */
export function arePointsEqual(p1: Point, p2: Point): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

/**
 * 
 * @param grahamHulls 
 * @param hullPoints 
 * @param m 
 */
export function jarvisMarch(grahamHulls: Point[][], hullPoints: Point[], m: number, stepsObj: tSteps) {
  for (let i = 0; i < m; i++) {
    stepsObj.steps++;
    let currentBest: { angle: number; point: Point } = null;
    for (let k = 0; k < grahamHulls.length; k++) {
      stepsObj.steps++;
      const bestOfGroup = jarvisBinary(grahamHulls[k],
        getNextToTopOfStack(hullPoints), getTopOfStack(hullPoints), stepsObj);
      if (!currentBest) {
        currentBest = bestOfGroup;
        continue;
      }
      if (bestOfGroup.angle < currentBest.angle) {
        currentBest = bestOfGroup;
      }
    }
    hullPoints.push(currentBest.point);
    if (arePointsEqual(hullPoints[1], currentBest.point)) {
      return;
    }
  }
}

/**
 * is {@param p3} equal to {@param p1} or {@param p2}
 * @param p1 {@link Point} point 1
 * @param p2 {@link Point} point 2
 * @param p3 {@link Point} point 3
 * @returns {boolean} is p3 equal to p1 or p2
 */
export function isequalToP1OrP2(p1: Point, p2: Point, p3: Point): boolean {
  return arePointsEqual(p1, p3) || arePointsEqual(p2, p3);
}

/**
 * Perform binary search to find the p
 * @param points 
 * @param p1 
 * @param p2 
 * @returns 
 */
export function jarvisBinary(hull: Point[], p1: Point, p2: Point, stepsObj: tSteps) {
  let left = 0;
  let right = hull.length - 1;
  while (true) {
    stepsObj.steps++;
    const idx = Math.ceil((right + left) / 2);
    const point = hull[idx];
    if (isequalToP1OrP2(p1, p2, point)) {
      if (right <= left) {
        return { angle: Infinity, point: new Point(Infinity, Infinity) };
      }
      left = idx;
      continue;
    }
    const angle = getAngleBetween3Points(p1, p2, point);
    if (right <= left) {
      return { point, angle };
    }
    let leftNeighborAngle = null;
    let rightNeighborAngle = null;
    let leftIndex = idx - 1;
    let rightIndex = idx + 1;
    if (leftIndex >= left && !isequalToP1OrP2(p1, p2, hull[leftIndex])) {
      leftNeighborAngle = getAngleBetween3Points(p1, p2, hull[idx - 1]);
    }
    if (rightIndex <= right && !isequalToP1OrP2(p1, p2, hull[rightIndex])) {
      rightNeighborAngle = getAngleBetween3Points(p1, p2, hull[idx + 1]);
    }
    if (leftNeighborAngle !== null
      && leftNeighborAngle < angle) {
      right = idx - 1;
    } else if (rightNeighborAngle !== null
      && rightNeighborAngle < angle) {
      left = idx + 1;
    } else {
      return { point: hull[idx], angle };
    }
  }
}

/**
 * 
 * @param p1 
 * @param p2 
 * @param p3 
 * @returns 
 */
function getAngleBetween3Points(p1: Point, p2: Point, p3: Point): number {
  const x1x2 = Math.pow(p1.x - p2.x, 2);
  const y1y2 = Math.pow(p1.y - p2.y, 2);
  const x2x3 = Math.pow(p2.x - p3.x, 2);
  const y2y3 = Math.pow(p2.y - p3.y, 2);
  const x1x3 = Math.pow(p1.x - p3.x, 2);
  const y1y3 = Math.pow(p1.y - p3.y, 2);
  const num = x1x2 + y1y2 + (x2x3 + y2y3) - (x1x3 + y1y3);
  const denom = 2 * Math.sqrt(x1x2 + y1y2) * Math.sqrt(x2x3 + y2y3);
  return num / denom;
}

/**
 * Run Graham Scan to find the convex hull of a set of points.
 * O(nlog(n))
 * @param points Array of {@link Point}s
 * @returns Array of {@link Point}s representing the convex hall
 */
export function grahamScan(points: Point[], stepsObj: tSteps): Point[] {
  const sortedPoints = sortInOrderOfAngleWithP1(points, stepsObj);
  const hullStack = [];
  for (let i = 0; i < sortedPoints.length; i++) {
    stepsObj.steps++;
    const p3 = sortedPoints[i];
    while (hullStack.length >= 2 &&
      crossProduct(getNextToTopOfStack(hullStack), getTopOfStack(hullStack), p3) <= 0
    ) {
      stepsObj.steps++;
      hullStack.pop();
    }
    hullStack.push(p3);
  }
  return hullStack;
}

export function getTopOfStack(stack: Point[]): Point {
  return stack[stack.length - 1];
}
export function getNextToTopOfStack(stack: Point[]): Point {
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
export function crossProduct(p1: Point, p2: Point, p3: Point): number {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

/**
 * Find the {@link Point}, p1, according to {@link getP1} and sort the angles in ascending order
 * by the angle each {@link Point} makes with {@link p1}
 * @param points {@link Point[]}s
 * @returns sorted {@link Point[]}s
 * O(mlog(m)) runtime
 */
export function sortInOrderOfAngleWithP1(points: Point[], stepsObj: tSteps): Point[] {
  const p1 = getP1(points, stepsObj);
  return points.sort((p2, p3) => {
    stepsObj.steps++;
    const angle1 = getAngle(p1, p2);
    const angle2 = getAngle(p1, p3);
    if (angle1 !== angle2) {
      return angle1 - angle2;
    }
    const distance1 = getDistanceBetweenPoints(p1, p2);
    const distance2 = getDistanceBetweenPoints(p1, p3);
    return distance1 - distance2;
  });
}

/**
 * Find the distance between two {@link Point}s
 * @param p1 {@link Point} 1
 * @param p2 {@link Point} 2
 * @returns {@link number} distance between {@param p1} and {@param p2}
 */
export function getDistanceBetweenPoints(p1: Point, p2: Point): number {
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
export function getAngle(point1: Point, point2: Point): number {
  const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
  return Math.abs(angle);
}

/**
 * Split a set of points in groups of size m.
 * O(n) runtime
 * @param points {@link Point[]}
 * @param m Group size
 * @returns Array of arrays with size m
 */
export function splitPoints(points: Point[], m: number, stepsObj: tSteps): Point[][] {
  const result: Point[][] = [];
  for (let i = 0; i < points.length;) {
    stepsObj.steps++;
    const temp: Point[] = [];
    const start = i;
    for (; i < m + start; i++) {
      stepsObj.steps++;
      if (i === points.length) {
        break;
      }
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
export function getP1(points: Point[], stepsObj: tSteps): Point {
  let lowestYPoint = points[0];
  for (let i = 1; i < points.length; i++) {
    stepsObj.steps++;
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


export class Grid {
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

export class Point {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}