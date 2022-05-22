var explanations = require("./explanations");

"use strict";

exports.__esModule = true;
exports.Point = exports.Edge = exports.grahamScan = exports.jarvisMarch = exports.chan = exports.runChansAlgorithm = void 0;
exports.generateRandomPoints = exports.getP1 = exports.splitPoints = exports.getAngle = exports.getDistanceBetweenPoints = exports.sortInOrderOfAngleWithP1 = exports.crossProduct = exports.getNextToTopOfStack = exports.getTopOfStack = exports.getAngleBetween3Points = exports.arePointsEqual = void 0;

/*
UTILITY FUNCTIONS BEGIN
*/

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
var states = [];

class State {
    vertices;
    edges;
    text;
    constructor(vertices = [], edges = [], text = null) {
        this.vertices = vertices;
        this.edges = edges;
        this.text = text;
    }
}

function generateRandomPoints(vertexCount) {
    var vertexSet = []

    for (let i = 0; i < vertexCount; i++) {
        var x = d3.randomUniform(10, width - 10)(), y = d3.randomUniform(10, height - 10)();
        vertexSet.push(new Point(x, y));
    }

    return vertexSet;
}
exports.generateRandomPoints = generateRandomPoints;

function drawVertex(p) {
    gVertices.append("circle")
        .attr("id", "(" + p.x.toString() + ", " + p.y.toString() + p.radius.toString() + p.color.toString() + ")")
        .attr("r", p.radius)
        .attr("cx", xRange(p.x))
        .attr("cy", yRange(p.y))
        .style("fill", p.color)
        .style("stroke", "black")
        .style("stroke-width", 1);
}

function drawEdge(e) {
    // draw an edge connecting two points
    gEdges.append("line")
        .attr("id", "(" + e.p1.x.toString() + ", " + e.p1.y.toString() + "), (" + e.p2.x.toString() + ", " + e.p2.y.toString() + e.size.toString() + e.color.toString() + ")")
        .attr("x1", xRange(e.p1.x))
        .attr("y1", yRange(e.p1.y))
        .attr("x2", xRange(e.p2.x))
        .attr("y2", yRange(e.p2.y))
        .style("stroke", e.color)
        .style("stroke-width", e.size);
}

function removeVertex(p) {  // TODO: if multiple vertices are drawn at the same position, they share the same id and only one gets removed
    gVertices.select("circle[id='(" + p.x.toString() + ", " + p.y.toString() + p.radius.toString() + p.color.toString() + ")']").remove();
}

function removeEdge(e) {   // TODO: same issue as removeVertex
    gEdges.select("line[id='(" + e.p1.x.toString() + ", " + e.p1.y.toString() + "), (" + e.p2.x.toString() + ", " + e.p2.y.toString() + e.size.toString() + e.color.toString() +  ")']").remove();
}

function removeAllEdges() {
    gEdges.selectAll("line").remove();
}

function removeAllVertices() {
    gVertices.selectAll("circle").remove();
}
// rendering functions end

/*
UTILITY FUNCTIONS END
*/



/*
DEMO PAGE FUNCTIONS BEGIN
*/

var minVerticesAllowed = 3,
    maxVerticesAllowed = 1000;

var defaultAutorunSpeed = 200,
    autorunSpeed = defaultAutorunSpeed;

// demo container
var demoContainer = d3.select("body").append("div")
    .attr("class", "container")
    .attr("style", "max-width:100%;");

var demoRow1 = demoContainer.append("div").attr("class", "row");
var column1 = demoRow1.append("div").attr("id", "demo-container-column1");
column1.append("h3").attr("style", "text-align:center;").text("Visualization of Chan's Algorithm");
column1.append("div").attr("id", "text");

var column2 = demoRow1.append("div").attr("id", "demo-container-column2");

var text = d3.select("#text");
text.html(explanations.intro);

var navContainer = column2.append("div").attr("class", "row").attr("id", "nav-container");

// vertex count input
var navColumn1 = navContainer.append("div").attr("class", "col-sm");
var navColumn2 = navContainer.append("div").attr("class", "col-sm");

var vertexCountForm = navColumn1.append("form")
    .attr("class", "form-inline")
    .attr("style", "padding:5px");

var vertexCountFormGroup = vertexCountForm.append("div")
    .attr("class", "form-group");

var vertexCountFormLabel = vertexCountFormGroup.append("label")
    .text("Number of Points (" + minVerticesAllowed + " - " + maxVerticesAllowed + ")");

var vertexCountFormInput = vertexCountFormGroup.append("input")
    .attr("class", "form-control")
    .attr("id", "vertex-count-input")
    .attr("type", "number")
    .attr("min", minVerticesAllowed)
    .attr("max", maxVerticesAllowed)
    .attr("style", "max-width:30%");
    
var vertexCountFormSubmit = vertexCountForm.append("button")
    .attr("id", "vertex-count-form-submit")
    .attr("class", "btn btn-primary")
    .attr("disabled", true)
    .text("Generate Points");
// end vertex count input

var startStep = navColumn1.append("button")
    .attr("id", "start-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:5px")
    .attr("disabled", true)
    .text("<<");

var prevStep = navColumn1.append("button")
    .attr("id", "prev-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:5px")
    .attr("disabled", true)
    .text("Previous Step");

var nextStep = navColumn1.append("button")
    .attr("id", "next-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:5px")
    .attr("disabled", true)
    .text("Next Step");

var endStep = navColumn1.append("button")
    .attr("id", "end-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:20px")
    .attr("disabled", true)
    .text(">>");

var autorun = navColumn1.append("button")
    .attr("id", "autorun")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("disabled", true)
    .text("Autorun");

var speedSliderLabel = navColumn1.append("label")
    .attr("for", "speed-slider")
    .attr("class", "form-label")
    .text("Autorun Speed");

var speedSlider = navColumn1.append("input")
    .attr("id", "speed-slider")
    .attr("type", "range")
    .attr("class", "form-range")
    .attr("style", "width:20%; height:0.5rem;")
    .attr("min", "1")
    .attr("max", toString(defaultAutorunSpeed))
    .attr("step", "1")
    .attr("value", "1");

var width = document.getElementById("demo-container-column2").offsetWidth - 5,
    height = window.innerHeight - document.getElementById("chan-header").offsetHeight - document.getElementById("nav-container").offsetHeight - 5;

var xRange = d3.scaleLinear().range([0, width]), 
    yRange = d3.scaleLinear().range([0, height]);

navColumn2.append("label").text("Modify Demo Behavior (changes applied on next set of generated points)").append("hr").attr("style", "margin:5px 5px;");

var navControlGroup = navColumn2.append("div").attr("class", "input-group");
var navCheckboxes1 = navControlGroup.append("div").attr("class", "nav-checkboxes");
var navCheckboxes2 = navControlGroup.append("div").attr("class", "nav-checkboxes");

var checkbox1 = navCheckboxes1.append("div").attr("class", "form-check");
checkbox1.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "increase-m-slower");
checkbox1.append("label")
    .attr("class", "form-check-label")
    .attr("for", "increase-m-slower")
    .attr("data-bs-html", true)
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Standard Chan's Algorithm uses <em>m = 2<sup>2<sup>t</sup></sup></em>. Setting this option allows you to see Chan's Algorithm run through more passes, although this is less efficient of course (<em>O(nlog<sup>2</sup>h)</em> work).")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true)
    .text("Use m = 2^t");

var checkbox2 = navCheckboxes1.append("div").attr("class", "form-check");
checkbox2.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "fast-forward-graham-scan");
checkbox2.append("label")
    .attr("class", "form-check-label")
    .attr("for", "fast-forward-graham-scan")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Skips straight to the end of constructing each minihull in the visualization.")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true)
    .text("Fast Forward Building Minihulls");

var checkbox3 = navCheckboxes1.append("div").attr("class", "form-check");
checkbox3.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "jarvis-march-cache-points");
checkbox3.append("label")
    .attr("class", "form-check-label")
    .attr("for", "jarvis-march-cache-points")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Instead of using binary search to find max tangents on each minihull, we just binary search once at the start of the modified Jarvis' March.")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true)
    .text("Cache Points in Jarvis March Step");

var checkbox4 = navCheckboxes1.append("div").attr("class", "form-check");
checkbox4.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "discard-points");
checkbox4.append("label")
    .attr("class", "form-check-label")
    .attr("for", "discard-points")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "During Graham Scan, points that don't make it into minihulls will be discarded in the next iteration of Chan's algorithm if the current iteration does not find conv<em>(P)</em>.")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true)
    .text("Discard Unused Points in Graham Scan");

var checkbox5 = navCheckboxes2.append("div").attr("class", "form-check");
checkbox5.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "discard-points");
checkbox5.append("label")
    .attr("class", "form-check-label")
    .attr("for", "discard-points")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true)
    .text("Use m = min(2^(t^2), n)");

var demoOutput = column2.append("svg")
    .attr("class", "demo-output")
    .attr("width", width)
    .attr("height", height);

demoOutput.append("rect")
    .attr("width", width)
    .attr("height", height);

var gVertices = demoOutput.append("g"),
    gEdges = demoOutput.append("g");
// demo container end


xRange.domain([0, width]);
yRange.domain([0, height]);


// render state
function clearRender() {
    removeAllVertices();
    removeAllEdges();
}

function renderState(state) {
    clearRender();

    for (const vertex of state.vertices) drawVertex(vertex);
    for (const edge of state.edges) drawEdge(edge);
    if (state.text) text.html(state.text);
}
// end render state


// step through algorithm
var vertexCountInput = document.getElementById("vertex-count-input");
vertexCountInput.oninput = function(event) {
    var vertexCount = Number(vertexCountInput.value);
    document.getElementById("vertex-count-form-submit").disabled = (vertexCount < vertexCountInput.min || vertexCount > vertexCountInput.max);
}

var stepIdx = 0;

var startStepBtn = document.getElementById("start-step");
startStepBtn.onclick = function(event) {
    event.preventDefault();

    stepIdx = 0;
    renderState(states[stepIdx]);

    document.getElementById("next-step").disabled = false;
    document.getElementById("end-step").disabled = false;
    document.getElementById("prev-step").disabled = true;
    document.getElementById("start-step").disabled = true;
}

var prevStepBtn = document.getElementById("prev-step");
prevStepBtn.onclick = function(event) {
    event.preventDefault();

    if (stepIdx - 1 >= 0) {
        stepIdx--;
        renderState(states[stepIdx]);
    }

    if (stepIdx === 0) {
        document.getElementById("prev-step").disabled = true;
        document.getElementById("start-step").disabled = true;
    }

    document.getElementById("next-step").disabled = false;
    document.getElementById("end-step").disabled = false;
}

var nextStepBtn = document.getElementById("next-step");
nextStepBtn.onclick = function(event) {
    event.preventDefault();

    if (stepIdx + 1 < states.length) {
        stepIdx++;
        renderState(states[stepIdx]);
    }

    if (stepIdx === states.length - 1) {
        document.getElementById("next-step").disabled = true;
        document.getElementById("end-step").disabled = true;
    }

    document.getElementById("prev-step").disabled = false;
    document.getElementById("start-step").disabled = false;
}

var endStepBtn = document.getElementById("end-step");
endStepBtn.onclick = function(event) {
    event.preventDefault();

    stepIdx = states.length - 1;
    renderState(states[stepIdx]);

    document.getElementById("next-step").disabled = true;
    document.getElementById("end-step").disabled = true;
    document.getElementById("prev-step").disabled = false;
    document.getElementById("start-step").disabled = false;
}

var autorunBtn = document.getElementById("autorun");
const timer = ms => new Promise(res => setTimeout(res, ms));
autorunBtn.onclick = async function(event) {
    event.preventDefault();

    document.getElementById("next-step").disabled = true;
    document.getElementById("end-step").disabled = true;
    document.getElementById("prev-step").disabled = true;
    document.getElementById("start-step").disabled = true;
    document.getElementById("vertex-count-input").disabled = true;
    document.getElementById("vertex-count-form-submit").disabled = true;
    document.getElementById("autorun").disabled = true;

    while (stepIdx < states.length) {
        renderState(states[stepIdx]);
        stepIdx++;
        await timer(autorunSpeed);
    }
    text.html(explanations.foundConvexHull);

    stepIdx--;
    document.getElementById("prev-step").disabled = false;
    document.getElementById("start-step").disabled = false;
    document.getElementById("vertex-count-input").disabled = false;
    document.getElementById("vertex-count-form-submit").disabled = false;
    document.getElementById("autorun").disabled = false;
}

var speedSliderSubmit = document.getElementById("speed-slider");
speedSliderSubmit.oninput = function(event) {
    event.preventDefault();
    autorunSpeed = defaultAutorunSpeed / speedSliderSubmit.value;
}

var increaseMSlower = false,
    fastForwardGrahamScan = false;

var increaseMSlowerBtn = document.getElementById("increase-m-slower");
increaseMSlowerBtn.oninput = function(event) {
    event.preventDefault();
    increaseMSlower = !increaseMSlower;
}

var fastForwardGrahamScanBtn = document.getElementById("fast-forward-graham-scan");
fastForwardGrahamScanBtn.oninput = function(event) {
    event.preventDefault();
    fastForwardGrahamScan = !fastForwardGrahamScan;
}
// end step through algorithm

/*
DEMO PAGE FUNCTIONS END
*/



/*
CHAN'S ALGORITHM BEGIN
*/

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
            // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice(0, -1)});
            if (!fastForwardGrahamScan) states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice(0, -1)));
            hullVertices.pop();
            hullEdges.pop();
        }
        
        hullVertices.push(p3);
        hullEdges.push(new Edge(getNextToTopOfStack(hullVertices), getTopOfStack(hullVertices)));
        // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(getNextToTopOfStack(hullVertices), getTopOfStack(hullVertices))])});
        if (!fastForwardGrahamScan) states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat([getTopOfStack(hullEdges)]), explanations.grahamScan));
    }
    
    // for "hulls" of size 2, do not connect last vertex with first, otherwise we get a duplicate edge visually
    if (points.length > 2) {
        hullEdges.push(new Edge(sortedPoints[0], getTopOfStack(hullVertices)));
        // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(sortedPoints[0], getTopOfStack(hullVertices))])});
        if (!fastForwardGrahamScan) states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat([getTopOfStack(hullEdges)]), explanations.miniHullFound));
    }

    if (fastForwardGrahamScan) states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat(hullEdges), explanations.fastForwardGrahamScan));

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
        
        const temp = states.slice();
        for (let j = 0; j < miniHulls.length; j++) {
            const curHull = miniHulls[j];
            const bestOfHull = binarySearchHull(curHull);
            
            if (!curBest || bestOfHull.angle > curBest.angle) {  // TODO: if there's time, handle edge case where two points are the best angle, then choose the one closest to p1.
                curBest = bestOfHull;
            }

            // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(p1, bestOfHull.point, 5, "grey")])});
            states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat([new Edge(p1, bestOfHull.point, 5, "grey")]), i === 0 ? explanations.jarvisMarch1 : explanations.jarvisMarch2));
        }
        
        hullPoints.push(curBest.point);
        // states.push({vertices: temp[temp.length - 1].vertices.concat([new Point(curBest.point.x, curBest.point.y, 10, "purple")]), 
        //     edges: temp[temp.length - 1].edges.slice().concat([new Edge(p1, curBest.point, 5, "black")])});

        const curExplanation = i === 0 ? explanations.foundMiniHullMax1 : explanations.foundMiniHullMax2;
        states.push(new State(temp[temp.length - 1].vertices.concat([new Point(curBest.point.x, curBest.point.y, 10, "purple")]), 
            temp[temp.length - 1].edges.slice().concat([new Edge(p1, curBest.point, 5, "black")]), curExplanation));
        
        if (hullPoints[0] === getTopOfStack(hullPoints)) {
            // hullPoints.pop();
            states[states.length - 1].text = explanations.foundConvexHull;
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

    // states.push({vertices: originalVertices, edges: []});
    states.push(new State(originalVertices, [], explanations.generatedRandomPoints));
    var n = points.length;

    var iterations = !increaseMSlower ? Math.ceil(Math.log2(Math.log2(n))) : Math.ceil(Math.log2(n));
    for (let t = 1; t <= iterations; t++) {
        console.log("Number of iterations gone through: " + t);
        const m = !increaseMSlower ? Math.pow(2, Math.pow(2, t)) : Math.pow(2, t);
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
        // states.push({vertices: partitionedVertices, edges: []});
        states.push(new State(partitionedVertices, [], explanations.partition));

        var miniHulls = Array.from(Array(groupCount), () => new Array());
        for (let i = 0; i < groups.length; i++) {   // find mini hulls for jarvis march
            miniHulls[i] = grahamScan(groups[i]);
        }

        let hullPoints = jarvisMarch(points, miniHulls, m);
        if (arePointsEqual(hullPoints[0], hullPoints[hullPoints.length - 1])) {
            hullPoints.pop();   // remove duplicate vertex
            return hullPoints;
        }

        // states.push({vertices: originalVertices, edges: []});
        states.push(new State(originalVertices, [], explanations.increaseMAndRestart));
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
    document.getElementById("autorun").disabled = false;

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

/*
CHAN'S ALGORITHM END
*/