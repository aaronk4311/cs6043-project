import {
  crossProduct,
  getAngle,
  getDistanceBetweenPoints,
  getNextToTopOfStack,
  getP1,
  getTopOfStack,
  grahamScan,
  Grid,
  jarvisBinary,
  Point,
  sortInOrderOfAngleWithP1,
  splitPoints,
} from '../src';

describe('index', () => {
  describe('Point', () => {
    test('Point created as expected', () => {
      const point = new Point(1, 2);
      expect(point.x).toBe(1);
      expect(point.y).toBe(2);
    });
  });

  describe('Grid', () => {
    test('Add points to grid', () => {
      const grid = new Grid();
      grid.addPoint(1, 2).addPoint(3, 4);
      expect(grid.points.length).toBe(2);
      grid.points.forEach(point => {
        expect(point).toBeInstanceOf(Point);
      })
    });
    test('Clear points', () => {
      const grid = new Grid().addPoint(1, 2);
      expect(grid.points.length).toBe(1);
      grid.clear();
      expect(grid.points.length).toBe(0);
    });
  });

  describe('getP1', () => {
    test('Get the lowest point', () => {
      const grid = new Grid()
        .addPoint(2, 4)
        .addPoint(3, 3)
        .addPoint(1, 2);
      const p1 = getP1(grid.points);
      expect(p1.x).toBe(1);
      expect(p1.y).toBe(2);
    });
    test('Get the lowest point and farthest left', () => {
      const grid = new Grid()
        .addPoint(2, 4)
        .addPoint(1, 3)
        .addPoint(2, 3);
      const p1 = getP1(grid.points);
      expect(p1.x).toBe(1);
      expect(p1.y).toBe(3);
    });
  });

  describe('splitPoints', () => {
    const grid = new Grid()
      .addPoint(1, 2)
      .addPoint(2, 3)
      .addPoint(4, 5)
    test('split into groups of 1', () => {
      const results = splitPoints(grid.points, 1);
      expect(results.length).toBe(3);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].length).toBe(1);
      }
      expect(results[results.length - 1].length).toBe(1);
    });
    test('Split into groups of 2', () => {
      const results = splitPoints(grid.points, 2);
      expect(results.length).toBe(2);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].length).toBe(2);
      }
      expect(results[results.length - 1].length).toBe(1);
    });
    test('Split into groups of 3', () => {
      const results = splitPoints(grid.points, 3);
      expect(results.length).toBe(1);
      expect(results[results.length - 1].length).toBe(3);
    });
  });
  describe('getAngle', () => {
    test('Calculate right angle', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 1);
      const angle = getAngle(point1, point2);
      expect(angle).toBe(45);
    });
    test('Calculate vertical line', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(0, 1);
      const angle = getAngle(point1, point2);
      expect(angle).toBe(90);
    });
    test('Calculate backwards line', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(-1, -1);
      const angle = getAngle(point1, point2);
      expect(angle).toBe(135);
    });
    test('Calculate horizonotal line', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 0);
      const angle = getAngle(point1, point2);
      expect(angle).toBe(0);
    });
    test('Greater than 45', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 2);
      const angle = getAngle(point1, point2);
      expect(angle).toBe(63.43494882292201);
    });
    test('Greater than 135', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(-1, -2);
      const angle = getAngle(point1, point2);
      expect(angle).toBe(116.56505117707799);
    });
  });

  describe('getDistanceBetweenPoints', () => {
    test('straight line', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 0);
      const distance = getDistanceBetweenPoints(point1, point2);
      expect(distance).toBe(1);
    });
    test('right angle', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 1);
      const distance = getDistanceBetweenPoints(point1, point2);
      expect(distance).toBe(Math.sqrt(2));
    });
    test('Backwards right angle', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(-1, -1);
      const distance = getDistanceBetweenPoints(point1, point2);
      expect(distance).toBe(Math.sqrt(2));
    });
  });
  describe('sortInOrderOfAngleWithP1', () => {
    test('Sort as expected', () => {
      const grid = new Grid()
        .addPoint(0, 1)
        .addPoint(1, 1)
        .addPoint(-1, 1)
        .addPoint(0, 0)
        .addPoint(1, 0)
        .addPoint(-1, 0.01);
      const results = sortInOrderOfAngleWithP1(grid.points);
      expect(results.length).toBe(6);
      expect(results[0]).toStrictEqual(new Point(0, 0));
      expect(results[1]).toStrictEqual(new Point(1, 0));
      expect(results[2]).toStrictEqual(new Point(1, 1));
      expect(results[3]).toStrictEqual(new Point(0, 1));
      expect(results[4]).toStrictEqual(new Point(-1, 1));
      expect(results[5]).toStrictEqual(new Point(-1, 0.01));
    });
  });

  describe('crossProduct', () => {
    test('colinear', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 0);
      const point3 = new Point(2, 0);
      const result = crossProduct(point1, point2, point3);
      expect(result).toBe(0);
    });
    test('left turn', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 0);
      const point3 = new Point(2, 2);
      const result = crossProduct(point1, point2, point3);
      expect(result).toBe(2);
    });
    test('right turn', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 0);
      const point3 = new Point(-2, -2);
      const result = crossProduct(point1, point2, point3);
      expect(result).toBe(-2);
    });
  });
  describe('stack', () => {
    const stack = [1, 2];
    test('getNextToTopOfStack', () => {
      const result = getNextToTopOfStack(stack as any);
      expect(result).toBe(1);
    });
    test('getTopOfStack', () => {
      const result = getTopOfStack(stack as any);
      expect(result).toBe(2);
    });
  });
  describe('grahamScan', () => {
    test('construct hull', () => {
      const grid = new Grid()
        .addPoint(1, 1)
        .addPoint(1.5, 1)
        .addPoint(1.9, 1.3)
        .addPoint(0, 2)
        .addPoint(2, 2)
        .addPoint(0, 0)
        .addPoint(2, 0);
      const results = grahamScan(grid.points);
      expect(results.length).toBe(4);
      expect(results[0]).toStrictEqual(new Point(0, 0));
      expect(results[1]).toStrictEqual(new Point(2, 0));
      expect(results[2]).toStrictEqual(new Point(2, 2));
      expect(results[3]).toStrictEqual(new Point(0, 2));
    });
  });
  describe('jarvisBinary', () => {
    test('test even', () => {
      const grid = new Grid()
        .addPoint(0, 0)
        .addPoint(2, 0)
        .addPoint(2, 2)
        .addPoint(0, 2);
      const p1 = new Point(0, 0);
      const p0 = new Point(p1.x - 1, p1.y);
      const result = jarvisBinary(grid.points, p0, p1);
      expect(result.point).toStrictEqual(new Point(2, 0));
    });
    test('test odd', () => {
      const grid = new Grid()
        .addPoint(0, 0)
        .addPoint(4, 1)
        .addPoint(4, 2)
        .addPoint(3, 3)
        .addPoint(0, 4);
      const p1 = new Point(0, 0);
      const p0 = new Point(p1.x - 1, p1.y);
      const result = jarvisBinary(grid.points, p0, p1);
      expect(result.point).toStrictEqual(new Point(4, 1));
    });
    test('3', () => {
      const grid = new Grid()
        .addPoint(0, 0)
        .addPoint(4, 1)
        .addPoint(4, 2)
        .addPoint(3, 3)
        .addPoint(0, 4);
        const p0 = new Point(0, 0);
        const p1 = new Point(4, 1);
      const result = jarvisBinary(grid.points, p0, p1);
      expect(result.point).toStrictEqual(new Point(4, 2));
    });

    test('4', () => {
      const grid = new Grid()
        .addPoint(0, 0)
        .addPoint(4, 1)
        .addPoint(4, 2)
        .addPoint(3, 3)
        .addPoint(0, 4);
        const p0 = new Point(4, 1);
        const p1 = new Point(4, 2);
      const result = jarvisBinary(grid.points, p0, p1);
      expect(result.point).toStrictEqual(new Point(3, 3));
    });
    test('5', () => {
      const grid = new Grid()
        .addPoint(0, 0)
        .addPoint(4, 1)
        .addPoint(4, 2)
        .addPoint(3, 3)
        .addPoint(0, 4);
        const p0 = new Point(4, 2);
        const p1 = new Point(3, 3);
      const result = jarvisBinary(grid.points, p0, p1);
      expect(result.point).toStrictEqual(new Point(0, 4));
    });
    test('6', () => {
      const grid = new Grid()
        .addPoint(0, 0)
        .addPoint(4, 1)
        .addPoint(4, 2)
        .addPoint(3, 3)
        .addPoint(0, 4);
        const p0 = new Point(3, 3);
        const p1 = new Point(0, 4);
      const result = jarvisBinary(grid.points, p0, p1);
      expect(result.point).toStrictEqual(new Point(0, 0));
    });
  });
});