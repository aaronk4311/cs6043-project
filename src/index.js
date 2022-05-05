"use strict";

// const { generateRandomPoints } = require("./explanation");

exports.__esModule = true;
exports.Point = exports.Edge = exports.grahamScan = exports.jarvisMarch = exports.chan = exports.runChansAlgorithm = void 0;

class Point {
    x;
    y;
    radius;
    color;
    constructor(x, y, radius = null, color = null) {
        this.x = x;
        this.y = y;
        this.radius = radius ? radius : 4;
        this.color = color ? color : "black";
    }
}
exports.Point = Point;

class Edge {
    p1;
    p2;
    size;
    color;
    constructor(p1, p2, size = null, color = null) {
        this.p1 = p1;
        this.p2 = p2;
        this.size = size ? size : 2;
        this.color = color ? color : p1.color;
    }
}
exports.Edge = Edge;

/**
 * Run Graham Scan to find the convex hull of a set of points.
 * O(nlog(n))
 * @param points Array of {@link Point}s
 * @returns Array of {@link Point}s representing the convex hall
 */
function grahamScan(points) {
    var hullVertices = [],
        hullEdges = [];

    if (points.length === 0) return hullVertices;
    const sortedPoints = sortInOrderOfAngleWithP1(points);

    hullVertices.push(sortedPoints[0]);
    for (let i = 1; i < sortedPoints.length; i++) {
        const p3 = sortedPoints[i];
        while (hullVertices.length >= 2 && crossProduct(getNextToTopOfStack(hullVertices), getTopOfStack(hullVertices), p3) >= 0) {
            states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice(0, -1)});
            hullVertices.pop();
            hullEdges.pop();
        }
        
        hullVertices.push(p3);
        hullEdges.push({p1: getNextToTopOfStack(hullVertices), p2: getTopOfStack(hullVertices)});
        states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(getNextToTopOfStack(hullVertices), getTopOfStack(hullVertices))])});
    }
    
    // for "hulls" of size 2, do not connect last vertex with first, otherwise we get a duplicate edge visually
    if (points.length > 2) {
        hullEdges.push({p1: sortedPoints[0], p2: getTopOfStack(hullVertices)});
        states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(sortedPoints[0], getTopOfStack(hullVertices))])});
    }

    return hullVertices;
}
exports.grahamScan = grahamScan;

function jarvisMarch(points, miniHulls, m) {
    var binarySearchHull = function(hull) { // yandere dev would be proud
        const hullPointsCount = hull.length;

        let left = 0, right = hull.length - 1;
        while (true) {
            const mid1 = Math.ceil((left + right) / 2) % hullPointsCount, 
                mid2 = (mid1 + Math.ceil(hullPointsCount / 2)) % hullPointsCount;

            const v1 = hull[mid1], 
                v2 = hull[mid2];

            const v1Prev = hull[(((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount], 
                v1Next = hull[(mid1 + 1) % hullPointsCount],
                v2Prev = hull[(((mid2 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount], 
                v2Next = hull[(mid2 + 1) % hullPointsCount];

            const v1PrevTurn = crossProduct(p1, v1, v1Prev), 
                v1NextTurn = crossProduct(p1, v1, v1Next),
                v2PrevTurn = crossProduct(p1, v2, v2Prev), 
                v2NextTurn = crossProduct(p1, v2, v2Next);

            // TODO: visualization for binary search if there's time
            // const temp = states[states.length - 1];
            // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(p1, v1, null, "grey")])});
            // states.push(temp);

            // note below, that for some reason, the parity is flipped when taking the cross product, e.g., turning left yields a cross product < 0, rather than > 0.
            // so if checking for left turns, we check if it's a right turn instead. probably has to do with lower points having higher y values than points above?

            // found hull point
            if (v1PrevTurn <= 0 && v1NextTurn < 0) {
                return {point: v1, angle: p1 !== v1 ? getAngleBetween3Points(p0, p1, v1) : -Infinity};
            }
            else if (v2PrevTurn <= 0 && v2NextTurn < 0) {
                return {point: v2, angle: p1 !== v2 ? getAngleBetween3Points(p0, p1, v2) : -Infinity};
            }

            if (v1PrevTurn === 0 && v1NextTurn === 0) {         // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
                if (hullPointsCount === 2) {
                    const retPoint = (p1 === v1Next ? v1 : v1Next);
                    return {point: retPoint, angle: getAngleBetween3Points(p0, p1, retPoint)};
                }

                return {point: v1Next, angle: p1 !== v1Next ? getAngleBetween3Points(p0, p1, v1Next) : -Infinity};
            }
            else if (v2PrevTurn === 0 && v2NextTurn === 0) {    // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
                if (hullPointsCount === 2) {
                    const retPoint = (p1 === v2Next ? v2 : v2Next);
                    return {point: retPoint, angle: getAngleBetween3Points(p0, p1, retPoint)};
                }

                return {point: v2Next, angle: p1 !== v2Next ? getAngleBetween3Points(p0, p1, v2Next) : -Infinity};
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
                if (crossProduct(v2, v1, p1) > 0) { // TODO: handle collinear points in demo if there's time
                    right = (((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount;
                }
                else {
                    left = (mid1 + 1) % hullPointsCount;
                }
            }

            // midpoint1 illuminated / upper tangent, midpoint2 illuminated / upper tangent
            else if (((v1PrevTurn < 0 && v1NextTurn > 0) || (v1PrevTurn > 0 && v1NextTurn > 0)) && ((v2PrevTurn < 0 && v2NextTurn > 0) || (v2PrevTurn > 0 && v2NextTurn > 0))) {
                if (crossProduct(v2, v1, p1) > 0) {
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
            
            if (!curBest || bestOfHull.angle > curBest.angle) {  // TODO: if there's time, handle edge case where two points are the best angle, then choose the one closest to p1.
                curBest = bestOfHull;
            }
        }
        
        states.push({vertices: states[states.length - 1].vertices.concat([new Point(curBest.point.x, curBest.point.y, 10, "purple")]), 
            edges: states[states.length - 1].edges.slice().concat([new Edge(p1, curBest.point, 5, "black")])});
        
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
    var originalVertices = [];
    for (const p of points) {
        originalVertices.push(new Point(p.x, p.y, p.radius, p.color));
    }

    states.push({vertices: originalVertices, edges: []});
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

                if (curIdx !== prevIdx) {
                    groupColor = randColor();
                    prevIdx = curIdx;
                }

                points[i].color = groupColor;
                groups[curIdx].push(points[i]);
            }

            return groups;
        }

        var groups = partition(m);

        var partitionedVertices = [];
        for (const group of groups) {
            for (const p of group) {
                partitionedVertices.push(new Point(p.x, p.y, p.radius, p.color));
            }
        }
        states.push({vertices: partitionedVertices, edges: []});

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

        states.push({vertices: originalVertices, edges: []});
        clearRender();
    }
}
exports.chan = chan;

var vertexCountFormSubmit = document.getElementById("vertex-count-form-submit");
vertexCountFormSubmit.onclick = function(event) {
    event.preventDefault();
    document.getElementById("next-step").disabled = false;
    document.getElementById("end-step").disabled = false;
    document.getElementById("prev-step").disabled = true;
    document.getElementById("start-step").disabled = true;

    states = [];
    clearRender();
    stepIdx = 0;
    
    const vertexCountInput = document.getElementById("vertex-count-input");
    const vertexCount = Number(vertexCountInput.value);
    if (vertexCount >= vertexCountInput.min && vertexCount <= vertexCountInput.max) {
        var vertexSet = generateRandomPoints(vertexCount);
        const convexHull = chan(vertexSet);
    }
    
    renderState(states[stepIdx]);
}
