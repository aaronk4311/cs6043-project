// TODO: allow users to set parameters, e.g., vertexCount
// TODO: some vertices are slightly out of bounds, fix so the entire point is in frame and not cut off
"use strict";
exports.__esModule = true;
exports.Point = exports.generateRandomPoints = exports.getP1 = exports.splitPoints = exports.getAngle = exports.getDistanceBetweenPoints = exports.sortInOrderOfAngleWithP1 = exports.crossProduct = exports.getTurnDirection = exports.getNextToTopOfStack = exports.getTopOfStack = exports.grahamScan = exports.getAngleBetween3Points = exports.jarvisMarch = exports.arePointsEqual = exports.chan = void 0;

var width = 800, height = 600;
var xRange = d3.scaleLinear().range([0, width]), yRange = d3.scaleLinear().range([0, height]);
var vertexCount = 50;

xRange.domain([0, width]);
yRange.domain([0, height]);

var svgChan = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.selectAll("svg").append("rect")
    .attr("width", width)
    .attr("height", height);

var gVertices = svgChan.append("g"),
    gEdges = svgChan.append("g");

// utlity functions
class Point {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Point = Point;

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
// utility functions end

// computation functions
const TurnDirection = Object.freeze({COLLINEAR: 0, LEFT: 1, RIGHT: 2});

function getTurnDirection(point1, point2, point3) {
    var seg1x = point2.x - point1.x, seg1y = point2.y - point1.y;
    var seg2x = point3.x - point1.x, seg2y = point3.y - point1.y;

    return (seg1x * seg2y) - (seg1y * seg2x);

    // if (crossProduct > 0) return TurnDirection.LEFT;
    // else if (crossProduct < 0) return TurnDirection.RIGHT;
    // else return TurnDirection.COLLINEAR;
}
exports.getTurnDirection = getTurnDirection;

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
function sortInOrderOfAngleWithP1(points) {
    const p1 = getP1(points);
    const pointsCache = points.reduce((pointsCache, point) => {
        const angle = getAngle(p1, point);
        const distance = getDistanceBetweenPoints(p1, point);
        const pointInfo = { point, distance };
        if (!pointsCache[angle]) {
            pointsCache[angle] = pointInfo;
        }
        else if (pointsCache[angle].distance < distance) {
            pointsCache[angle] = pointInfo;
        }
        return pointsCache;
    }, {});
    return Object.values(pointsCache).sort(({ point: p2 }, { point: p3 }) => {
        return getAngle(p1, p3) - getAngle(p1, p2);
    })
        .map(a => a.point);
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
function generateRandomPoints() {
    var vertices = []

    for (let i = 0; i < vertexCount; i++) {
        var x = d3.randomUniform(0, width)(), y = d3.randomUniform(0, height)();
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

/**
 * Run Graham Scan to find the convex hull of a set of points.
 * O(nlog(n))
 * @param points Array of {@link Point}s
 * @returns Array of {@link Point}s representing the convex hall
 */
function grahamScan(points) {
    const hullStack = [];

    if (points.length === 0) return hullStack;
    const sortedPoints = sortInOrderOfAngleWithP1(points);

    for (let i = 0; i < sortedPoints.length; i++) {
        drawVertex(sortedPoints[i]);
    }

    for (let i = 0; i < sortedPoints.length; i++) {
        const p3 = sortedPoints[i];
        while (hullStack.length >= 2 &&
            crossProduct(getNextToTopOfStack(hullStack), getTopOfStack(hullStack), p3) >= 0) {

            removeEdge(getNextToTopOfStack(hullStack), getTopOfStack(hullStack));
            hullStack.pop();
        }
        hullStack.push(p3);

        if (i >= 1) {
            drawEdge(getNextToTopOfStack(hullStack), getTopOfStack(hullStack));
        }
    }
    
    drawEdge(sortedPoints[0], getTopOfStack(hullStack));
    return hullStack;
}
exports.grahamScan = grahamScan;

function jarvisMarch(points, miniHulls, m) {
    var binarySearchHull = function(hull) {
        // this is a linear search testing if calculations are correct
        // let angle = -Infinity;
        // let point = null;
        // // let testColor = randColor();
        // for (const curPoint of hull) {
        //     if (p0 === curPoint || p1 === curPoint) continue;
        //     // drawEdge(p1, curPoint, testColor, 10);

        //     const curAngle = getAngleBetween3Points(p0, p1, curPoint);
        //     if (curAngle > angle) {
        //         angle = curAngle;
        //         point = curPoint;
        //     }
        // }

        // return {point, angle};

        const hullPointsCount = hull.length;

        let left = 0, right = hull.length - 1;
        while (true) {

            const mid1 = Math.ceil((left + right) / 2) % hullPointsCount, mid2 = (mid1 + Math.ceil(hullPointsCount / 2)) % hullPointsCount;
            const v1 = hull[mid1], v2 = hull[mid2];

            const v1Prev = hull[(((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount], v1Next = hull[(mid1 + 1) % hullPointsCount];
            const v2Prev = hull[(((mid2 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount], v2Next = hull[(mid2 + 1) % hullPointsCount];

            const v1PrevTurn = getTurnDirection(p1, v1, v1Prev), v1NextTurn = getTurnDirection(p1, v1, v1Next);
            const v2PrevTurn = getTurnDirection(p1, v2, v2Prev), v2NextTurn = getTurnDirection(p1, v2, v2Next);

            console.log(p0, p1, '\n', v1, v2, '\n', left, right, '\n', v1PrevTurn, v1NextTurn, '\n', v2PrevTurn, v2NextTurn);


            // note below, that for some reason, the parity is flipped when taking the cross product, e.g., turning left yields a cross product < 0, rather than > 0 as expected.

            // found hull point
            if (v1PrevTurn <= 0 && v1NextTurn < 0) {
                return {point: v1, angle: p1 != v1 ? getAngleBetween3Points(p0, p1, v1) : -Infinity};
            }
            if (v2PrevTurn <= 0 && v2NextTurn < 0) {
                return {point: v2, angle: p1 != v2 ? getAngleBetween3Points(p0, p1, v2) : -Infinity};
            }

            if (v1PrevTurn === 0 && v1NextTurn === 0) {         // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
                return {point: v1Next, angle: p1 != v1Next ? getAngleBetween3Points(p0, p1, v1Next) : -Infinity};
            }
            else if (v2PrevTurn === 0 && v2NextTurn === 0) {    // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
                return {point: v2Next, angle: p1 != v2Next ? getAngleBetween3Points(p0, p1, v2Next) : -Infinity};
            }

            // midpoint1 hidden, midpoint2 illuminated / upper tangent
            if ((v1PrevTurn > 0 && v1NextTurn < 0) && ((v2PrevTurn < 0 && v2NextTurn > 0) || (v2PrevTurn > 0 && v2NextTurn >= 0))) {
                right = (((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount;
            }

            // midpoint1 illuminated / upper tangent, midpoint2 hidden
            else if (((v1PrevTurn < 0 && v1NextTurn > 0) || (v1PrevTurn > 0 && v1NextTurn >= 0)) && (v2PrevTurn > 0 && v2NextTurn < 0)) {
                left = (mid1 + 1) % hullPointsCount;
            }

            // mid1point hidden, midpoint2 hidden
            else if ((v1PrevTurn > 0 && v1NextTurn < 0) && (v2PrevTurn > 0 && v2NextTurn < 0)) {

                if (getTurnDirection(v2, v1, p1) > 0) { // TODO: what about collinear points?
                    right = (((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount;
                }
                else {
                    left = (mid1 + 1) % hullPointsCount;
                }
            }

            // midpoint1 illuminated / upper tangent, midpoint2 illuminated / upper tangent
            else if (((v1PrevTurn < 0 && v1NextTurn > 0) || (v1PrevTurn > 0 && v1NextTurn > 0)) 
                && ((v2PrevTurn < 0 && v2NextTurn > 0) || (v2PrevTurn > 0 && v2NextTurn > 0))) {

                if (getTurnDirection(v2, v1, p1) > 0) {
                    left = (mid1 + 1) % hullPointsCount;
                }
                else {
                    right = (((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount;
                }
            }
        }
    }
    
    var p0 = new Point(-Infinity, 0);
    var p1 = getP1(points);
    
    var hullPoints = [p1];
    for (let i = 0; i < m; i++) {
        let curBest = null;
        
        for (const curHull of miniHulls) {
            const bestOfHull = binarySearchHull(curHull);
            
            if (!curBest || bestOfHull.angle > curBest.angle) {  // TODO: edge case where two points are the best angle? choose the one closest to p1.
                curBest = bestOfHull;
            }
        }
        
        drawVertex(curBest.point, "purple", 10);
        drawEdge(p1, curBest.point, "black", 5);
        
        hullPoints.push(curBest.point);
        if (hullPoints[0] === getTopOfStack(hullPoints)) {
            // hullPoints.pop();
            break;
        }
        
        p0 = getNextToTopOfStack(hullPoints);
        p1 = getTopOfStack(hullPoints);
    }

    return hullPoints;
}
exports.jarvisMarch = jarvisMarch;

function chan(points) {
    var n = points.length;

    for (let t = 1; t <= Math.ceil(Math.log2(Math.log2(n))); t++) {
        console.log("Number of iterations gone through: " + t);
        const m = Math.pow(2, Math.pow(2, t));
        const groupCount = Math.ceil(n / m);

        var partition = function(m) {
            let groups = Array.from(Array(groupCount), () => new Array());

            var groupColor = randColor();
            var prevIdx = 0;
            for (let i = 0; i < points.length; i++) {
                var curIdx = Math.floor(i / m);

                if (curIdx != prevIdx) {
                    groupColor = randColor();
                    prevIdx = curIdx;
                }

                points[i].color = groupColor;   // TODO: should we shuffle the points every time m is updated so there's more "randomness"?
                groups[curIdx].push(points[i]);
            }

            return groups;
        }

        var groups = partition(m);

        var miniHulls = Array.from(Array(groupCount), () => new Array());
        for (let i = 0; i < groups.length; i++) {   // find mini hulls for jarvis march
            miniHulls[i] = grahamScan(groups[i]);
        }

        const hullPoints = jarvisMarch(points, miniHulls, m);
        // console.log(miniHulls.length, hullPoints.length);
        if (arePointsEqual(hullPoints[0], hullPoints[hullPoints.length - 1])) {
            hullPoints.pop();   // remove duplicate vertex
            return hullPoints;
        }

        removeAllVertices();
        removeAllEdges();
    }
}
exports.chan = chan;

console.log(chan(generateRandomPoints()));
