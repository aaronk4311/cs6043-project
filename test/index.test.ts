import { Grid, Point } from '../src';

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
  })
});