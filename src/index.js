// TODO: allow users to set parameters, e.g., vertexCount
"use strict";
exports.__esModule = true;
exports.Point = exports.grahamScan = exports.jarvisMarch = exports.chan = exports.runChansAlgorithm = void 0;

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
        const hullPointsCount = hull.length;

        let left = 0, right = hull.length - 1;
        while (true) {
            const mid1 = Math.ceil((left + right) / 2) % hullPointsCount, mid2 = (mid1 + Math.ceil(hullPointsCount / 2)) % hullPointsCount;
            const v1 = hull[mid1], v2 = hull[mid2];

            const v1Prev = hull[(((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount], v1Next = hull[(mid1 + 1) % hullPointsCount];
            const v2Prev = hull[(((mid2 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount], v2Next = hull[(mid2 + 1) % hullPointsCount];

            const v1PrevTurn = crossProduct(p1, v1, v1Prev), v1NextTurn = crossProduct(p1, v1, v1Next);
            const v2PrevTurn = crossProduct(p1, v2, v2Prev), v2NextTurn = crossProduct(p1, v2, v2Next);

            // console.log(p0, p1, '\n', v1, v2, '\n', left, right, '\n', v1PrevTurn, v1NextTurn, '\n', v2PrevTurn, v2NextTurn);


            // note below, that for some reason, the parity is flipped when taking the cross product, e.g., turning left yields a cross product < 0, rather than > 0.
            // so if checking for left turns, we check if it's a right turn instead. it probably has to do with lower points having higher y values than points above.

            // found hull point
            if (v1PrevTurn <= 0 && v1NextTurn < 0) {
                return {point: v1, angle: p1 != v1 ? getAngleBetween3Points(p0, p1, v1) : -Infinity};
            }
            else if (v2PrevTurn <= 0 && v2NextTurn < 0) {
                return {point: v2, angle: p1 != v2 ? getAngleBetween3Points(p0, p1, v2) : -Infinity};
            }

            if (v1PrevTurn === 0 && v1NextTurn === 0) {         // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
                if (hullPointsCount === 2) {
                    const retPoint = (p1 === v1Next ? v1 : v1Next);
                    return {point: retPoint, angle: getAngleBetween3Points(p0, p1, retPoint)};
                }

                return {point: v1Next, angle: p1 != v1Next ? getAngleBetween3Points(p0, p1, v1Next) : -Infinity};
            }
            else if (v2PrevTurn === 0 && v2NextTurn === 0) {    // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
                if (hullPointsCount === 2) {
                    const retPoint = (p1 === v2Next ? v2 : v2Next);
                    return {point: retPoint, angle: getAngleBetween3Points(p0, p1, retPoint)};
                }

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
                if (crossProduct(v2, v1, p1) > 0) { // TODO: what about collinear points?
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

var vertexCountFormSubmit = document.getElementById("vertex-count-form-submit");
vertexCountFormSubmit.onclick = function(event) {
    event.preventDefault();

    removeAllVertices();
    removeAllEdges();
    
    const vertexCountInput = document.getElementById("vertex-count-input");
    const vertexCount = Number(vertexCountInput.value);
    if (vertexCount >= vertexCountInput.min && vertexCount <= vertexCountInput.max) {
        const convexHull = chan(generateRandomPoints(vertexCount));
    }
}
