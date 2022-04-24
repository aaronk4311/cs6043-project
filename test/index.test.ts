import { getAngle, getDistanceBetweenPoints, getP1, Grid, Point, splitPoints } from '../src';

beforeEach(() => {

});

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
        for (let i = 0; i < results.length -1; i++) {
          expect(results[i].length).toBe(1);
        }
        expect(results[results.length - 1].length).toBe(1);
      });
      test('Split into groups of 2', () => {
        const results = splitPoints(grid.points, 2);
        expect(results.length).toBe(2);
        for (let i = 0; i < results.length -1; i++) {
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
      expect(angle).toBe(-135);
    });
    test('Calculate horizonotal line', () => {
      const point1 = new Point(0, 0);
      const point2 = new Point(1, 0);
      const angle = getAngle(point1, point2);
      expect(angle).toBe(0);
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
  });
});