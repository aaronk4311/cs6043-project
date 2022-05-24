(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function lines() {return "<p>" + Array.prototype.slice.call(arguments).join("</p><p>") + "</p>";}

exports.intro = lines("In this demo, we visualize Chan's Algorithm for a given set of input points. To start, enter an integer and click the corresponding button to generate a set of random points. All points will start off uncolored. As you step through the algorithm, new texts will appear on this side of the page explaining the corresponding step.");

exports.generatedRandomPoints = lines("A set of random points <em>P</em> has been generated. Next, we'll partition <em>P</em> into <em>ceil(n/m)</em> subsets, each of size at most <em>m</em>.")

exports.partition = lines("The points are now partitioned into subsets of the original input set of points. Each subset is assigned a random color and all of its points will take on that color.");

exports.grahamScan = lines("With all points partitioned into subsets, we run Graham Scan on all subsets to form the minihulls.");

exports.fastForwardGrahamScan = lines("For each subset of <em>P</em>, we construct their minihulls.");

exports.miniHullFound = lines("Minihull successfully constructed for this subset of <em>P</em>.");

exports.grahamScanDone = lines("Graham Scan finished, all minihulls have been found. We move onto Jarvis' March.", "In the first iteration of Jarvis' March, we start off with <em>p<sub>0</sub> = (-∞, 0)</em> and <em>p<sub>1</sub> = y<sub>min</sub></em> (note <em>p<sub>1</sub></em> is the first hull point technically). We now begin Jarvis' March. First, we visualize the binary search step to find tangents on all minihulls and their candidate points. Then we pick the one that forms the max angle with <em>p<sub>0</sub></em> and <em>p<sub>1</sub></em>.");

exports.jarvisMarch1 = lines("We've found our first hull edge. Now, repeat until we've found the convex hull or we've iterated up to <em>m</em>.");
exports.jarvisMarch2 = lines("Repeating modified Jarvis March step on new <em>p<sub>0</sub></em> and <em>p<sub>1</sub></em>.");

exports.jarvisBinary = lines("Running binary search on current minihull to find tangent.");
exports.jarvisBinaryDone = lines("We've found the corresponding minihull's tangent and its candidate point.");

exports.foundMiniHullMax1 = lines("With all candidate points found for each minihull, we pick the one that maximizes the angle formed between it, <em>p<sub>0</sub></em>, and <em>p<sub>1</sub></em>. This point chosen is the second hull point (first hull edge) found.");

exports.foundMiniHullMax2 = lines("Another hull point is found. We now update <em>p<sub>0</sub></em> to be <em>p<sub>1</sub></em>, and <em>p<sub>1</sub></em> to be the new convex hull point we just found. Now, repeat the same process with the new points mentioned to find the next convex hull point. We repeat until we've either reached <em>m</em> and did not finish the convex hull yet, or the convex hull is fully constructed, i.e., the last hull point connects with the very first hull point.");

exports.increaseMAndRestart = lines("The number of iterations will now exceed <em>m</em> and the convex hull is not constructed yet, so we have to increase <em>m</em> and restart from the beginning, i.e., when the points were uncolored.");

exports.foundConvexHull = lines("Convex hull successfully constructed.", "Note that with standard Chan's Algorithm, the amount of points that we would need to generate to see more than three passes of Chan's (a pass being every time <em>m</em> is updated) is too much for most machines to handle. If you generate the maximum number of points specified in this demo, you'll find that it won't take more than three passes to construct the convex hull.", "Chan's Algorithm does have extensions and modifications, and we implemented some of them in this demo so that you can select them to see the differences compared to standard Chan's Algorithm. For example, binary search turns out to be unnecessary, and so we can shave off a <em>log</em> factor when we're finding the candidate point in each minihull.");

},{}],2:[function(require,module,exports){
var explanations = require("./explanations");

"use strict";

exports.__esModule = true;
exports.Point = exports.Edge = exports.grahamScan = exports.jarvisMarch = exports.jarvisBinary = exports.jarvisWalk = exports.chan = exports.runChansAlgorithm = void 0;
exports.generateRandomPoints = exports.getP1 = exports.splitPoints = exports.getAngle = exports.getDistanceBetweenPoints = exports.sortInOrderOfAngleWithP1 = exports.crossProduct = exports.getNextToTopOfStack = exports.getTopOfStack = exports.getAngleBetween3Points = exports.arePointsEqual = exports.isequalToP1OrP2 = exports.chanWithHullCache = void 0;

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
 * O(mlog(m)) runtime
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
        var groupColor = randColor();
        for (; i < m + start; i++) {
            if (i === points.length) {
                break;
            }
            points[i].color = groupColor;
            temp.push(points[i]);
        }
        result.push(temp);
    }
    return result;
}
exports.splitPoints = splitPoints;

/**
 * Check if two points are equal
 * @param p1 point 1
 * @param p2 point 2
 * @returns {boolean} are points equal
 */
function arePointsEqual(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}
exports.arePointsEqual = arePointsEqual;

/**
 * is {@param p3} equal to {@param p1} or {@param p2}
 * @param p1 {@link Point} point 1
 * @param p2 {@link Point} point 2
 * @param p3 {@link Point} point 3
 * @returns {boolean} is p3 equal to p1 or p2
 */
 function isequalToP1OrP2(p1, p2, p3) {
    return arePointsEqual(p1, p3) || arePointsEqual(p2, p3);
}
exports.isequalToP1OrP2 = isequalToP1OrP2;

function goRight(hull, p1, p2, index) {
    while (++index < hull.length) {
        if (!isequalToP1OrP2(p1, p2, hull[index])) {
            return true;
        }
    }
    return false;
}
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
    .text("Use m = 2^t");
checkbox1.append("i")
    .attr("id", "info-icon")
    .attr("class", "fa-solid fa-circle-info")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Standard Chan's Algorithm uses <em>m = 2<sup>2<sup>t</sup></sup></em>. Setting this option allows you to see Chan's Algorithm run through more passes, although this is less efficient of course (<em>O(nlog<sup>2</sup>h)</em> work).")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true);

var checkbox2 = navCheckboxes1.append("div").attr("class", "form-check");
checkbox2.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "fast-forward-graham-scan");
checkbox2.append("label")
    .attr("class", "form-check-label")
    .attr("for", "fast-forward-graham-scan")
    .text("Fast Forward Building Minihulls");
checkbox2.append("i")
    .attr("id", "info-icon")
    .attr("class", "fa-solid fa-circle-info")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Skips straight to the end of constructing each minihull in the visualization.")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true);
    
var checkbox3 = navCheckboxes1.append("div").attr("class", "form-check");
checkbox3.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "chan-improved");
checkbox3.append("label")
    .attr("class", "form-check-label")
    .attr("for", "chan-improved")
    .text("Run with Improvements");
checkbox3.append("i")
    .attr("id", "info-icon")
    .attr("class", "fa-solid fa-circle-info")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Improvements include:<br><ul><li>Instead of using binary search to find max tangents on each minihull, we just binary search once at the start of the Jarvis' March.</li><li>Discard points that did not make it into any of the minihulls during Graham Scan.</li><li>Cache hull points so they don't have to be recomputed in future iterations of Chan's.</li><li>TODO: Rather than using <em>m = H</em>, use <em>H = m / logm</em></li><li>Since we're discarding points, we can grow <em>m</em> slower, <em>m = 2<sup>t<sup>2</sup></sup></em>.</li></ul>")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true);

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
    fastForwardGrahamScan = false,
    chanImproved = false;

var increaseMSlowerBtn = document.getElementById("increase-m-slower");
increaseMSlowerBtn.oninput = function(event) {
    event.preventDefault();
    increaseMSlower = !increaseMSlower;
    chanImprovedBtn.disabled = !chanImprovedBtn.disabled;
}

var fastForwardGrahamScanBtn = document.getElementById("fast-forward-graham-scan");
fastForwardGrahamScanBtn.oninput = function(event) {
    event.preventDefault();
    fastForwardGrahamScan = !fastForwardGrahamScan;
}

var chanImprovedBtn = document.getElementById("chan-improved");
chanImprovedBtn.oninput = function(event) {
    event.preventDefault();
    chanImproved = !chanImproved;
    increaseMSlowerBtn.disabled = !increaseMSlowerBtn.disabled;
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
            if (!fastForwardGrahamScan) {
                states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice(0, -1)));
            }
            hullVertices.pop();
            hullEdges.pop();
        }
        
        hullVertices.push(p3);
        hullEdges.push(new Edge(getNextToTopOfStack(hullVertices), getTopOfStack(hullVertices)));
        // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(getNextToTopOfStack(hullVertices), getTopOfStack(hullVertices))])});
        if (!fastForwardGrahamScan) {
            states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat([getTopOfStack(hullEdges)]), explanations.grahamScan));
        }
    }
    
    // for "hulls" of size 2, do not connect last vertex with first, otherwise we get a duplicate edge visually
    if (points.length > 2) {
        hullEdges.push(new Edge(sortedPoints[0], getTopOfStack(hullVertices)));
        // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(sortedPoints[0], getTopOfStack(hullVertices))])});
        if (!fastForwardGrahamScan) states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat([getTopOfStack(hullEdges)]), explanations.miniHullFound));
    }

    if (fastForwardGrahamScan) {
        states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat(hullEdges), explanations.fastForwardGrahamScan));
    }

    return hullVertices;
}
exports.grahamScan = grahamScan;

function jarvisWalk(p0, p1, hullStates, hull) {
    var candidateIdx = hullStates.get(hull);
    var candidatePoint = hull[candidateIdx];
    var candidateAngle = (candidatePoint !== p1) ? getAngleBetween3Points(p0, p1, candidatePoint) : 0;

    var nextIdx = (candidateIdx + 1) % hull.length;
    var nextPoint = hull[nextIdx];
    var nextAngle = getAngleBetween3Points(p0, p1, nextPoint);
    while (hull.length > 1 && nextAngle >= candidateAngle) {
        candidateIdx = nextIdx;
        candidatePoint = nextPoint;
        candidateAngle = nextAngle;

        nextIdx = (candidateIdx + 1) % hull.length;
        nextPoint = hull[nextIdx];
        nextAngle = getAngleBetween3Points(p0, p1, nextPoint);
    }

    hullStates.set(hull, candidateIdx);
    return {point: candidatePoint, angle: candidateAngle, index: candidateIdx};
}
exports.jarvisWalk = jarvisWalk;

function jarvisBinary(p0, p1, hullStates, hull) { // yandere dev would be proud
    const hullPointsCount = hull.length;

    var candidate = null;
    var left = 0, right = hull.length - 1;
    const temp = states[states.length - 1];
    while (true) {
        const mid1 = Math.ceil((left + right) / 2) % hullPointsCount, 
            mid2 = (mid1 + Math.ceil(hullPointsCount / 2)) % hullPointsCount;

        const v1 = hull[mid1], 
            v2 = hull[mid2];

        const mid1Prev = (((mid1 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount,
            mid1Next = (mid1 + 1) % hullPointsCount,
            mid2Prev = (((mid2 - 1) % hullPointsCount) + hullPointsCount) % hullPointsCount,
            mid2Next = (mid2 + 1) % hullPointsCount;

        const v1Prev = hull[mid1Prev], 
            v1Next = hull[mid1Next],
            v2Prev = hull[mid2Prev], 
            v2Next = hull[mid2Next];

        const v1PrevTurn = crossProduct(p1, v1, v1Prev), 
            v1NextTurn = crossProduct(p1, v1, v1Next),
            v2PrevTurn = crossProduct(p1, v2, v2Prev), 
            v2NextTurn = crossProduct(p1, v2, v2Next);

        // note, that for some reason, the parity is flipped when taking the cross product, e.g., turning left yields a cross product < 0, rather than > 0.
        // so if checking for left turns, we check if it's a right turn instead. probably has to do with lower points having higher y values than points above.

        // found tangent point
        if (v1PrevTurn <= 0 && v1NextTurn < 0) {
            candidate = {point: v1, angle: p1 !== v1 ? getAngleBetween3Points(p0, p1, v1) : -Infinity, index: mid1};
        }
        else if (v2PrevTurn <= 0 && v2NextTurn < 0) {
            candidate = {point: v2, angle: p1 !== v2 ? getAngleBetween3Points(p0, p1, v2) : -Infinity, index: mid2};
        }
        else if (v1PrevTurn === 0 && v1NextTurn === 0) {         // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
            if (hullPointsCount === 2) {
                const retIdx = (p1 === v1Next ? mid1 : mid1Next);
                const retPoint = (p1 === v1Next ? v1 : v1Next);
                candidate = {point: retPoint, angle: getAngleBetween3Points(p0, p1, retPoint), index: retIdx};
            }
            else {
                candidate = {point: v1Next, angle: p1 !== v1Next ? getAngleBetween3Points(p0, p1, v1Next) : -Infinity, index: mid1Next};
            }
        }
        else if (v2PrevTurn === 0 && v2NextTurn === 0) {    // we're on the midpoint (tangent is exactly one to the right) or point is already on top of the tangent.
            if (hullPointsCount === 2) {
                const retIdx = (p1 === v2Next ? mid2 : mid2Next);
                const retPoint = (p1 === v2Next ? v2 : v2Next);
                candidate = {point: retPoint, angle: getAngleBetween3Points(p0, p1, retPoint), index: retIdx};
            }
            else {
                candidate = {point: v2Next, angle: p1 !== v2Next ? getAngleBetween3Points(p0, p1, v2Next) : -Infinity, index: mid2Next};
            }
        }

        states.push(new State(temp.vertices, temp.edges.slice().concat([new Edge(p1, candidate ? candidate.point : v1, 5, "red")]), explanations.jarvisBinary));

        if (candidate) {
            break;
        }

        // midpoint1 hidden, midpoint2 illuminated / upper tangent
        if ((v1PrevTurn > 0 && v1NextTurn < 0) && ((v2PrevTurn < 0 && v2NextTurn > 0) || (v2PrevTurn > 0 && v2NextTurn >= 0))) {
            right = mid1Prev;
        }

        // midpoint1 illuminated / upper tangent, midpoint2 hidden
        else if (((v1PrevTurn < 0 && v1NextTurn > 0) || (v1PrevTurn > 0 && v1NextTurn >= 0)) && (v2PrevTurn > 0 && v2NextTurn < 0)) {
            left = mid1Next;
        }

        // mid1point hidden, midpoint2 hidden
        else if ((v1PrevTurn > 0 && v1NextTurn < 0) && (v2PrevTurn > 0 && v2NextTurn < 0)) {
            if (crossProduct(v2, v1, p1) > 0) { // TODO: handle collinear points in demo if there's time
                right = mid1Prev;
            }
            else {
                left = mid1Next;
            }
        }

        // midpoint1 illuminated / upper tangent, midpoint2 illuminated / upper tangent
        else if (((v1PrevTurn < 0 && v1NextTurn > 0) || (v1PrevTurn > 0 && v1NextTurn > 0)) && ((v2PrevTurn < 0 && v2NextTurn > 0) || (v2PrevTurn > 0 && v2NextTurn > 0))) {
            if (crossProduct(v2, v1, p1) > 0) {
                left = mid1Next;
            }
            else {
                right = mid1Prev;
            }
        }
    }

    hullStates.set(hull, candidate.index);
    return candidate;
}
exports.jarvisBinary = jarvisBinary;

function jarvisMarch(miniHulls, points, m) {
    var p0 = new Point(-Infinity, 0);
    var p1 = getP1(points);
    
    var hullPoints = [p1];
    var hullStates = new Map();
    for (const hull of miniHulls) {
        hullStates.set(hull, 0);
    }
    for (let i = 0; i < m; i++) {
        let curBest = null;
        
        const temp = states.slice();
        for (let j = 0; j < miniHulls.length; j++) {
            const curHull = miniHulls[j];
            
            if (!chanImproved || i === 0) {
                var bestOfHull = jarvisBinary(p0, p1, hullStates, curHull);
            }
            else {
                var bestOfHull = jarvisWalk(p0, p1, hullStates, curHull);
            }
            
            if (!curBest || bestOfHull.angle >= curBest.angle) {
                // if two points have max angle, the furthest point wins as specified in chan's paper.
                if (curBest && bestOfHull.angle === curBest.angle && getDistanceBetweenPoints(p1, bestOfHull) < getDistanceBetweenPoints(p1, curBest)) {
                    break;
                }
                
                curBest = bestOfHull;
            }

            // states.push({vertices: states[states.length - 1].vertices, edges: states[states.length - 1].edges.slice().concat([new Edge(p1, bestOfHull.point, 5, "grey")])});
            states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges.slice().concat([new Edge(p1, bestOfHull.point, 5, "grey")]), explanations.jarvisBinaryDone));
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

    states.push(new State(originalVertices, [], explanations.generatedRandomPoints));
    var n = points.length;

    var iterations = !increaseMSlower ? Math.ceil(Math.log2(Math.log2(n))) : Math.ceil(Math.log2(n));
    for (let t = 1; t <= iterations; t++) {
        console.log("Number of iterations gone through: " + t);
        const m = !increaseMSlower ? Math.pow(2, Math.pow(2, t)) : Math.pow(2, t);
        const groupCount = Math.ceil(n / m);

        var groups = splitPoints(points, m);
        var partitionedVertices = [];
        for (const group of groups) {
            for (const p of group) {
                partitionedVertices.push(new Point(p.x, p.y, p.radius, p.color));
            }
        }

        states.push(new State(partitionedVertices, [], explanations.partition));

        var miniHulls = [];
        for (let i = 0; i < groups.length; i++) {   // find mini hulls for jarvis march
            miniHulls.push(grahamScan(groups[i]));
        }

        states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges, explanations.grahamScanDone));
        let hullPoints = jarvisMarch(miniHulls, points, m);
        if (arePointsEqual(hullPoints[0], hullPoints[hullPoints.length - 1])) {
            hullPoints.pop();   // remove duplicate vertex
            return hullPoints;
        }

        states.push(new State(originalVertices, [], explanations.increaseMAndRestart));
        clearRender();
    }
}
exports.chan = chan;

/*
CHAN'S ALGORITHM END
*/



/*
IMPROVED CHAN'S ALGORITHM BEGIN
*/

/**
 * Compute the convex hull of a set of points using a modified version of chan's algorithm
 * Modifications include:
 * 1. Cache the hull points found during previous iterations.
 * 2. Only consider points found using graham's algorithm during subsequent iterations
 * 3. Modify the value of m to be the min between 2 ^ (t ^ 2) and n.
 * @param grid
 * @returns
 */
 function chanWithHullCache(points) {
    var originalVertices = [];
    for (const p of points) {
        originalVertices.push(new Point(p.x, p.y, p.radius, p.color));
    }
    states.push(new State(originalVertices, [], explanations.generatedRandomPoints));

    var p1 = getP1(points);
    var p0 = new Point(p1.x - 1, p1.y);
    var n = points.length;
    var stop = Math.ceil(Math.log2(Math.log2(n)));
    var hullPoints = [p0, p1];
    var grahamHulls = [];
    for (var i = 1; i <= stop + 1; i++) {
        if (grahamHulls.length) {
            points = grahamHulls.reduce(function (newPoints, hull) {
                newPoints.push.apply(newPoints, hull);
                return newPoints;
            }, []);
        }

        n = points.length;
        var m = Math.min(Math.pow(2, Math.pow(i, 2)), n);
        var splitPointsArray = splitPoints(points, m);
        var partitionedVertices = [];
        for (const group of splitPointsArray) {
            for (const p of group) {
                partitionedVertices.push(new Point(p.x, p.y, p.radius, p.color));
            }
        }
        states.push(new State(partitionedVertices, [], explanations.partition));

        grahamHulls = [];
        for (var i_1 = 0; i_1 < splitPointsArray.length; i_1++) {
            var grahamHull = grahamScan(splitPointsArray[i_1]);
            grahamHulls.push(grahamHull);
        }
        states.push(new State(states[states.length - 1].vertices, states[states.length - 1].edges, explanations.grahamScanDone));

        jarvisMarch(grahamHulls, hullPoints, m);
        // TODO: jarvisMarch functions differ. one returns while the other updates as reference.
        if (arePointsEqual(hullPoints[1], hullPoints[hullPoints.length - 1])) {
            // get rid of the fake point at the start for only the first iteration
            hullPoints.shift();
            return hullPoints;
        }

        states.push(new State(originalVertices, [], explanations.increaseMAndRestart));
        clearRender();
    }
}
exports.chanWithHullCache = chanWithHullCache;

/*
IMPROVED CHAN'S ALGORITHM END
*/



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

},{"./explanations":1}]},{},[2]);
