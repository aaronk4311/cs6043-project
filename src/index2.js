"use strict";
exports.__esModule = true;
exports.Point = exports.Grid = exports.getP1 = exports.splitPoints = exports.getAngle = exports.getDistanceBetweenPoints = exports.sortInOrderOfAngleWithP1 = exports.crossProduct = exports.getNextToTopOfStack = exports.getTopOfStack = exports.grahamScan = exports.getAngleBetween3Points = exports.jarvisBinary = exports.jarvisMarch = exports.arePointsEqual = exports.chan = void 0;
function chan(grid) {
    var points = grid.points;
    var p0 = new Point(-Infinity, 0);
    var p1 = getP1(grid.points);
    var n = points.length;
    for (var i = 1; i <= Math.log2(Math.log2(n)); i++) {
        var m = Math.pow(Math.pow(i, 2), 2);
        var hullPoints = [p0, p1];
        var k = Math.ceil(n / m);
        var splitPointsArray = splitPoints(grid.points, m);
        var grahamHulls = [];
        for (var i_1 = 0; i_1 < splitPointsArray.length; i_1++) {
            var grahamHull = grahamScan(splitPointsArray[i_1]);
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
exports.chan = chan;
function arePointsEqual(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}
exports.arePointsEqual = arePointsEqual;
function jarvisMarch(pointsArray, hullPoints, m) {
    for (var i = 0; i < m; i++) {
        var currentBest = null;
        for (var k = 0; k < pointsArray.length; k++) {
            var bestOfGroup = jarvisBinary(pointsArray[k], getNextToTopOfStack(hullPoints), getTopOfStack(hullPoints));
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
exports.jarvisMarch = jarvisMarch;
function jarvisBinary(points, p1, p2) {
    // TODO check that we are not testing against one of the current angles
    var left = 0;
    var right = points.length - 1;
    while (true) {
        var idx = Math.ceil((right + left) / 2);
        var point = points[idx];
        var angle = getAngleBetween3Points(p1, p2, point);
        if (left === right) {
            return { point: point, angle: angle };
        }
        var leftNeighborAngle = getAngleBetween3Points(p1, p2, points[idx - 1]);
        var rightNeighborAngle = getAngleBetween3Points(p1, p2, points[idx + 1]);
        if (angle >= leftNeighborAngle && angle >= rightNeighborAngle) {
            return { point: points[idx], angle: angle };
        }
        if (leftNeighborAngle > angle) {
            right = idx - 1;
        }
        else {
            left = idx + 1;
        }
    }
}
exports.jarvisBinary = jarvisBinary;
function getAngleBetween3Points(p1, p2, p3) {
    var angle = getAngle(p2, p3) - getAngle(p2, p1);
    return angle >= 0 ? angle : angle + 360;
    // return getAngle(p2, p3) - getAngle(p2, p1);
}
exports.getAngleBetween3Points = getAngleBetween3Points;
/**
 * Run Graham Scan to find the convex hull of a set of points.
 * O(nlog(n))
 * @param points Array of {@link Point}s
 * @returns Array of {@link Point}s representing the convex hall
 */
function grahamScan(points) {
    var sortedPoints = sortInOrderOfAngleWithP1(points);
    var hullStack = [];
    for (var i = 0; i < sortedPoints.length; i++) {
        var p3 = sortedPoints[i];
        while (hullStack.length >= 2 &&
            crossProduct(getNextToTopOfStack(hullStack), getTopOfStack(hullStack), p3) <= 0) {
            hullStack.pop();
        }
        hullStack.push(p3);
    }
    return hullStack;
}
exports.grahamScan = grahamScan;
function getTopOfStack(stack) {
    return stack[stack.length - 1];
}
exports.getTopOfStack = getTopOfStack;
function getNextToTopOfStack(stack) {
    return stack[stack.length - 2];
}
exports.getNextToTopOfStack = getNextToTopOfStack;
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
function crossProduct(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}
exports.crossProduct = crossProduct;
/**
 * Find the {@link Point}, p1, according to {@link getP1} and sort the angles in ascending order
 * by the angle each {@link Point} makes with {@link p1}
 * @param points {@link Point[]}s
 * @returns sorted {@link Point[]}s
 */
function sortInOrderOfAngleWithP1(points) {
    var p1 = getP1(points);
    var pointsCache = points.reduce(function (pointsCache, point) {
        var angle = getAngle(p1, point);
        var distance = getDistanceBetweenPoints(p1, point);
        var pointInfo = { point: point, distance: distance };
        if (!pointsCache[angle]) {
            pointsCache[angle] = pointInfo;
        }
        else if (pointsCache[angle].distance < distance) {
            pointsCache[angle] = pointInfo;
        }
        return pointsCache;
    }, {});
    return Object.values(pointsCache).sort(function (_a, _b) {
        var p2 = _a.point;
        var p3 = _b.point;
        return getAngle(p1, p2) - getAngle(p1, p3);
    })
        .map(function (a) { return a.point; });
}
exports.sortInOrderOfAngleWithP1 = sortInOrderOfAngleWithP1;
/**
 * Find the distance between two {@link Point}s
 * @param p1 {@link Point} 1
 * @param p2 {@link Point} 2
 * @returns {@link number} distance between {@param p1} and {@param p2}
 */
function getDistanceBetweenPoints(p1, p2) {
    var deltaXSquared = Math.pow(p1.x - p2.x, 2);
    var deltaYSquared = Math.pow(p1.y - p2.y, 2);
    return Math.sqrt(deltaXSquared + deltaYSquared);
}
exports.getDistanceBetweenPoints = getDistanceBetweenPoints;
/**
 * Find the angle that two points make with the x axis
 * @param point1 {@link Point}
 * @param point2 {@link Point}
 * @returns {@link number} angle
 */
function getAngle(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
}
exports.getAngle = getAngle;
/**
 * Split a set of points in groups of size m.
 * O(n) runtime
 * @param points {@link Point[]}
 * @param m Group size
 * @returns Array of arrays with size m
 */
function splitPoints(points, m) {
    var result = [];
    for (var i = 0; i < points.length;) {
        var temp = [];
        var start = i;
        for (; i < m + start; i++) {
            if (i === points.length) {
                break;
            }
            temp.push(points[i]);
        }
        result.push(temp);
    }
    return result;
}
exports.splitPoints = splitPoints;
/**
 * Finds the {@link Point} with the minimum y coordinate.
 * If two {@link Point}s share the same y coordinate, choose the one with the smaller x coordinate.
 * O(n) runtime.
 * @param points array of {@link Point[]}
 * @returns {@link Point} with the minimum y coordinate.
 */
function getP1(points) {
    var lowestYPoint = points[0];
    for (var i = 1; i < points.length; i++) {
        if (points[i].y < lowestYPoint.y) {
            lowestYPoint = points[i];
        }
        else if (points[i].y === lowestYPoint.y) {
            if (points[i].x < lowestYPoint.x) {
                lowestYPoint = points[i];
            }
        }
    }
    return lowestYPoint;
}
exports.getP1 = getP1;
var Grid = /** @class */ (function () {
    function Grid() {
        this.points = [];
    }
    Grid.prototype.addPoint = function (x, y) {
        var point = new Point(x, y);
        this.points.push(point);
        return this;
    };
    Grid.prototype.clear = function () {
        this.points = [];
        return this;
    };
    return Grid;
}());
exports.Grid = Grid;
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
exports.Point = Point;
