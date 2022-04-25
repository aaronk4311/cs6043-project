"use strict";
exports.__esModule = true;
var src_1 = require("../src/index2");
beforeEach(function () {
});
describe('index', function () {
    describe('Point', function () {
        test('Point created as expected', function () {
            var point = new src_1.Point(1, 2);
            expect(point.x).toBe(1);
            expect(point.y).toBe(2);
        });
    });
    describe('Grid', function () {
        test('Add points to grid', function () {
            var grid = new src_1.Grid();
            grid.addPoint(1, 2).addPoint(3, 4);
            expect(grid.points.length).toBe(2);
            grid.points.forEach(function (point) {
                expect(point).toBeInstanceOf(src_1.Point);
            });
        });
        test('Clear points', function () {
            var grid = new src_1.Grid().addPoint(1, 2);
            expect(grid.points.length).toBe(1);
            grid.clear();
            expect(grid.points.length).toBe(0);
        });
    });
    describe('getP1', function () {
        test('Get the lowest point', function () {
            var grid = new src_1.Grid()
                .addPoint(2, 4)
                .addPoint(3, 3)
                .addPoint(1, 2);
            var p1 = (0, src_1.getP1)(grid.points);
            expect(p1.x).toBe(1);
            expect(p1.y).toBe(2);
        });
        test('Get the lowest point and farthest left', function () {
            var grid = new src_1.Grid()
                .addPoint(2, 4)
                .addPoint(1, 3)
                .addPoint(2, 3);
            var p1 = (0, src_1.getP1)(grid.points);
            expect(p1.x).toBe(1);
            expect(p1.y).toBe(3);
        });
    });
    describe('splitPoints', function () {
        var grid = new src_1.Grid()
            .addPoint(1, 2)
            .addPoint(2, 3)
            .addPoint(4, 5);
        test('split into groups of 1', function () {
            var results = (0, src_1.splitPoints)(grid.points, 1);
            expect(results.length).toBe(3);
            for (var i = 0; i < results.length - 1; i++) {
                expect(results[i].length).toBe(1);
            }
            expect(results[results.length - 1].length).toBe(1);
        });
        test('Split into groups of 2', function () {
            var results = (0, src_1.splitPoints)(grid.points, 2);
            expect(results.length).toBe(2);
            for (var i = 0; i < results.length - 1; i++) {
                expect(results[i].length).toBe(2);
            }
            expect(results[results.length - 1].length).toBe(1);
        });
        test('Split into groups of 3', function () {
            var results = (0, src_1.splitPoints)(grid.points, 3);
            expect(results.length).toBe(1);
            expect(results[results.length - 1].length).toBe(3);
        });
    });
    describe('getAngle', function () {
        test('Calculate right angle', function () {
            var point1 = new src_1.Point(0, 0);
            var point2 = new src_1.Point(1, 1);
            var angle = (0, src_1.getAngle)(point1, point2);
            expect(angle).toBe(45);
        });
        test('Calculate vertical line', function () {
            var point1 = new src_1.Point(0, 0);
            var point2 = new src_1.Point(0, 1);
            var angle = (0, src_1.getAngle)(point1, point2);
            expect(angle).toBe(90);
        });
        test('Calculate backwards line', function () {
            var point1 = new src_1.Point(0, 0);
            var point2 = new src_1.Point(-1, -1);
            var angle = (0, src_1.getAngle)(point1, point2);
            expect(angle).toBe(-135);
        });
        test('Calculate horizonotal line', function () {
            var point1 = new src_1.Point(0, 0);
            var point2 = new src_1.Point(1, 0);
            var angle = (0, src_1.getAngle)(point1, point2);
            expect(angle).toBe(0);
        });
    });
    describe('getAngleBetween3Points', function () {
        test('Calculate 0 degrees', function () {
            var point1 = new src_1.Point(1, 0);
            var point2 = new src_1.Point(0, 0);
            var point3 = new src_1.Point(1, 0);
            var angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(0);

            point1 = new src_1.Point(1, 0);
            point2 = new src_1.Point(0, 0);
            point3 = new src_1.Point(0, 0);
            angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(0);

            point1 = new src_1.Point(0, 0);
            point2 = new src_1.Point(0, 0);
            point3 = new src_1.Point(1, 0);
            angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(0);

            point1 = new src_1.Point(0, 0);
            point2 = new src_1.Point(0, 0);
            point3 = new src_1.Point(0, 0);
            angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(0);
        });
        test('Calculate 45 degrees', function () {
            var point1 = new src_1.Point(1, 0);
            var point2 = new src_1.Point(0, 0);
            var point3 = new src_1.Point(1, 1);
            var angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(45);
        });
        test('Calculate 90 degrees', function () {
            var point1 = new src_1.Point(1, 0);
            var point2 = new src_1.Point(0, 0);
            var point3 = new src_1.Point(0, 1);
            var angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(90);

            point1 = new src_1.Point(0, 0);
            point2 = new src_1.Point(0, 1);
            point3 = new src_1.Point(0, 1);
            angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(90);
        });
        test('Calculate 135 degrees', function () {
            var point1 = new src_1.Point(1, 0);
            var point2 = new src_1.Point(0, 0);
            var point3 = new src_1.Point(-1, 1);
            var angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(135);
        });
        test('Calculate 180 degrees', function () {
            var point1 = new src_1.Point(1, 0);
            var point2 = new src_1.Point(0, 0);
            var point3 = new src_1.Point(-1, 0);
            var angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(180);

            point1 = new src_1.Point(0, 0);
            point2 = new src_1.Point(1, 0);
            point3 = new src_1.Point(1, 0);
            angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(180);

            point1 = new src_1.Point(141, 0);
            point2 = new src_1.Point(141.97053556783166, -162.93931967100983);
            point3 = new src_1.Point(141.97053556783166, -162.93931967100983);
            angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(180);
        });
        test('Calculate 225 degrees', function () {
            var point1 = new src_1.Point(1, 0);
            var point2 = new src_1.Point(0, 0);
            var point3 = new src_1.Point(-1, -1);
            var angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(225);
        });
        test('Calculate 315 degrees', function () {
            var point1 = new src_1.Point(1, 0);
            var point2 = new src_1.Point(0, 0);
            var point3 = new src_1.Point(1, -1);
            var angle = (0, src_1.getAngleBetween3Points)(point1, point2, point3);
            expect(angle).toBe(315);
        });
    });
    describe('getDistanceBetweenPoints', function () {
        test('straight line', function () {
            var point1 = new src_1.Point(0, 0);
            var point2 = new src_1.Point(1, 0);
            var distance = (0, src_1.getDistanceBetweenPoints)(point1, point2);
            expect(distance).toBe(1);
        });
        test('right angle', function () {
            var point1 = new src_1.Point(0, 0);
            var point2 = new src_1.Point(1, 1);
            var distance = (0, src_1.getDistanceBetweenPoints)(point1, point2);
            expect(distance).toBe(Math.sqrt(2));
        });
    });
});
