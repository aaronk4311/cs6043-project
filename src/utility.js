"use strict";
exports.__esModule = true;
exports.generateRandomPoints = exports.getP1 = exports.splitPoints = exports.getAngle = exports.getDistanceBetweenPoints = exports.sortInOrderOfAngleWithP1 = exports.crossProduct = exports.getNextToTopOfStack = exports.getTopOfStack = exports.getAngleBetween3Points = exports.arePointsEqual = void 0;

// wrappers and misc
function randColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

function getTopOfStack(stack) {
    return stack[stack.length - 1];
}
exports.getTopOfStack = getTopOfStack;

function getNextToTopOfStack(stack) {
    return stack[stack.length - 2];
}
exports.getNextToTopOfStack = getNextToTopOfStack;
// wrappers and misc end



// computation functions
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
 * Find the distance between two {@link Point}s
 * @param p1 {@link Point} 1
 * @param p2 {@link Point} 2
 * @returns {@link number} distance between {@param p1} and {@param p2}
 */
function getDistanceBetweenPoints(p1, p2) {
    const deltaXSquared = Math.pow(p1.x - p2.x, 2);
    const deltaYSquared = Math.pow(p1.y - p2.y, 2);
    return Math.sqrt(deltaXSquared + deltaYSquared);
}
exports.getDistanceBetweenPoints = getDistanceBetweenPoints;

/**
 * Finds the {@link Point} with the minimum y coordinate.
 * If two {@link Point}s share the same y coordinate, choose the one with the smaller x coordinate.
 * O(n) runtime.
 * @param points array of {@link Point[]}
 * @returns {@link Point} with the minimum y coordinate.
 */
function getP1(points) {
    let lowestYPoint = points[0];
    for (let i = 1; i < points.length; i++) {
        if (points[i].y > lowestYPoint.y) { // have to update lowest point if current point is "greater" since going down a computer screen increases y value.
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

/**
 * Find the {@link Point}, p1, according to {@link getP1} and sort the angles in ascending order
 * by the angle each {@link Point} makes with {@link p1}
 * @param points {@link Point[]}s
 * @returns sorted {@link Point[]}s
 */
function sortInOrderOfAngleWithP1(points) { // TODO: note i had to swap angle1 and angle2, and also distance1 and distance2 in calculation to get expected output. not sure why.
    var p1 = getP1(points);
    return points.sort(function (p2, p3) {
        var angle1 = getAngle(p1, p3);
        var angle2 = getAngle(p1, p2);
        if (angle1 !== angle2) {
            return angle1 - angle2;
        }
        var distance1 = getDistanceBetweenPoints(p1, p3);
        var distance2 = getDistanceBetweenPoints(p1, p2);
        return distance1 - distance2;
    });
}
exports.sortInOrderOfAngleWithP1 = sortInOrderOfAngleWithP1;

function getAngle(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
}
exports.getAngle = getAngle;

function getAngleBetween3Points(point1, point2, point3) {
    var angle = getAngle(point2, point3) - getAngle(point2, point1);
    return angle >= 0 ? angle : angle + 360;
    // return Math.abs(getAngle(point2, point3) - getAngle(point2, point1));
}
exports.getAngleBetween3Points = getAngleBetween3Points;

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

function arePointsEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
}
exports.arePointsEqual = arePointsEqual;

// TODO: check if we currently handle collinear points in implementation
// computation functions end



// rendering functions
function generateRandomPoints(vertexCount) {
    var vertices = []

    for (let i = 0; i < vertexCount; i++) {
        var x = d3.randomUniform(10, width - 10)(), y = d3.randomUniform(10, height - 10)();
        vertices.push(new Point(x, y));
    }

    return vertices;
}
exports.generateRandomPoints = generateRandomPoints;

function drawVertex(p, color = null, width = null) {
    gVertices.append("circle")
        .attr("id", "(" + p.x.toString() + ", " + p.y.toString() + ")")
        .attr("r", 4)
        .attr("cx", xRange(p.x))
        .attr("cy", yRange(p.y))
        .style("fill", p.color)
        .style("stroke", color ? color : "black")
        .style("stroke-width", width ? width : 1);
}

function drawEdge(p0, p1, color = null, width = null) {
    // draw an edge connecting two points
    gEdges.append("line")
        .attr("id", "(" + p0.x.toString() + ", " + p0.y.toString() + "), (" + p1.x.toString() + ", " + p1.y.toString() + ")")
        .attr("r", 2)
        .attr("x1", xRange(p0.x))
        .attr("y1", yRange(p0.y))
        .attr("x2", xRange(p1.x))
        .attr("y2", yRange(p1.y))
        .style("stroke", color ? color : p0.color)
        .style("stroke-width", width? width : 2);
}

function removeVertex(p) {  // TODO: if multiple vertices are drawn at the same position, they share the same id and only one gets removed
    gVertices.select("circle[id='(" + p.x.toString() + ", " + p.y.toString() + ")']").remove();
}

function removeEdge(p0, p1) {   // TODO: same issue as removeVertex
    gEdges.select("line[id='(" + p0.x.toString() + ", " + p0.y.toString() + "), (" + p1.x.toString() + ", " + p1.y.toString() + ")']").remove();
}

function removeAllEdges() {
    gEdges.selectAll("line").remove();
}

function removeAllVertices() {
    gVertices.selectAll("circle").remove();
}
// rendering functions end
