(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function lines() {return "<p>" + Array.prototype.slice.call(arguments).join("</p><p>") + "</p>";}

exports.intro = lines("In this demo, we visualize Chan's Algorithm for a given set of input points. To start, enter an integer and click the corresponding button to generate a set of random points. All points will start off uncolored. As you step through the algorithm, new texts will appear on this side of the page explaining the corresponding step.");

exports.generatedRandomPoints = lines("A set of random points <em>P</em> has been generated. Next, we'll partition <em>P</em> into <em>ceil(n/m)</em> subsets, each of size at most <em>m</em>.")

exports.partition = lines("The points are now partitioned into subsets of the original input set of points. Each subset is assigned a random color and all of its points will take on that color.");

exports.grahamScan = lines("With all points partitioned into subsets, we run Graham Scan on all subsets to form the minihulls.");

exports.grahamScanDone = lines("Graham Scan finished, all minihulls have been found. We move onto Jarvis' March.", "In the first iteration of Jarvis' March, we start off with <em>p<sub>0</sub> = (-∞, 0)</em> and <em>p<sub>1</sub> = y<sub>min</sub></em> (note <em>p<sub>1</sub></em> is the first hull point technically). We now begin Jarvis' March. First, we visualize the binary search step to find tangents on all minihulls and their candidate points. Then we pick the one that forms the max angle with <em>p<sub>0</sub></em> and <em>p<sub>1</sub></em>.");

exports.jarvisMarch1 = lines("We've found our first hull edge. Now, repeat until we've found the convex hull or we've iterated up to <em>m</em>.");
exports.jarvisMarch2 = lines("Repeating modified Jarvis March step on new <em>p<sub>0</sub></em> and <em>p<sub>1</sub></em>.");

exports.jarvisBinary = lines("Running binary search on current minihull to find tangent.");
exports.jarvisWalk = lines("Rather than binary searching the minihulls to find the tangents in every iteration of Jarvis' March, we only binary searched once at the start, cached the tangent points, then in every subsequent iterations of Jarvis' March, we can find the new tangent on each minihull by walking CCW.", "The tangent in each minihull will either remain the same or be some point in CCW direction; each point won't be visited more than twice throughout the entire iteration of Chan's since building the convex hull only requires one \"walk\" around each minihull.");
exports.jarvisTangentFound = lines("We've found the corresponding minihull's tangent and its candidate point.");

exports.foundMiniHullMax1 = lines("With all candidate points found for each minihull, we pick the one that maximizes the angle formed between it, <em>p<sub>0</sub></em>, and <em>p<sub>1</sub></em>. This point chosen is the second hull point (first hull edge) found.");

exports.foundMiniHullMax2 = lines("Another hull point is found. We now update <em>p<sub>0</sub></em> to be <em>p<sub>1</sub></em>, and <em>p<sub>1</sub></em> to be the new convex hull point we just found. Now, repeat the same process with the new points mentioned to find the next convex hull point. We repeat until we've either reached <em>m</em> and did not finish the convex hull yet, or the convex hull is fully constructed, i.e., the last hull point connects with the very first hull point.");

exports.increaseMAndRestart = lines("The number of iterations will now exceed <em>H</em> and the convex hull is not constructed yet, so we have to increase <em>H</em> and restart from the beginning, i.e., when the points were uncolored.");

exports.foundConvexHull = lines("Convex hull successfully constructed.", "Note that with standard Chan's Algorithm, the amount of points that we would need to generate to see more than three passes of Chan's (a pass being every time <em>m</em> is updated) is too much for most machines to handle. If you generate the maximum number of points specified in this demo, you'll find that it won't take more than three passes to construct the convex hull.", "Chan's Algorithm does have extensions and modifications, and we implemented some of them in this demo so that you can select them to see the differences compared to standard Chan's Algorithm. For example, binary search turns out to be unnecessary, and so we can shave off a <em>log</em> factor when we're finding the candidate point in each minihull.");

exports.cachedHullPoints = lines("The option to cache found hull points was selected, so we continue where we left off from the last iteration of Chan's. The previously found hull points and their respective edges are also visualized for your convenience.");

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
    var deltaXSquared = Math.pow(p1.x - p2.x, 2);
    var deltaYSquared = Math.pow(p1.y - p2.y, 2);
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
function getP1(points, stepsObj) {
    var lowestYPoint = points[0];
    for (let i = 1; i < points.length; i++) {
        stepsObj.steps++;
        if (points[i].y > lowestYPoint.y) { // TODO: note, i had to swap operator from < to > since y coordinates increase going down on a computer.
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
function sortInOrderOfAngleWithP1(points, stepsObj) { // TODO: note i had to swap angle1 and angle2, and also distance1 and distance2 in calculation to get expected output. not sure why.
    var p1 = getP1(points, stepsObj);
    return points.sort(function (p2, p3) {
        stepsObj.steps++;
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
    if (point1 === point2 || point1 === point3 || point2 === point3) {
        return -Infinity;
    }

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
function splitPoints(points, m, stepsObj) {
    var result = [];
    for (var i = 0; i < points.length;) {
        stepsObj.steps++;
        var temp = [];
        var start = i;
        var groupColor = randColor();
        for (; i < m + start; i++) {
            stepsObj.steps++;
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
    points;
    edges;
    text;
    constructor(points = [], edges = [], text = null) {
        this.points = points;
        this.edges = edges;
        this.text = text;
    }
}

function generateRandomPoints(pointCount) {
    var pointSet = []

    for (let i = 0; i < pointCount; i++) {
        var x = d3.randomUniform(10, width - 10)(), y = d3.randomUniform(10, height - 10)();
        pointSet.push(new Point(x, y));
    }

    return pointSet;
}
exports.generateRandomPoints = generateRandomPoints;

function drawPoint(p) {
    gpoints.append("circle")
        .attr("id", "" + renderMap.get(p.type).toString() + ": " + "(" + p.x.toString() + ", " + p.y.toString() + p.radius.toString() + ")")
        .attr("r", p.radius)
        .attr("cx", xRange(p.x))
        .attr("cy", yRange(p.y))
        .style("fill", p.color)
        .style("stroke", "black")
        .style("opacity", p.opacity)
        .style("stroke-width", 1);
}

function drawEdge(e) {
    // draw an edge connecting two points
    gEdges.append("line")
        .attr("id", "" + renderMap.get(e.type).toString() + ", " + "(" + e.p1.x.toString() + ", " + e.p1.y.toString() + "), (" + e.p2.x.toString() + ", " + e.p2.y.toString() + ")")
        .attr("x1", xRange(e.p1.x))
        .attr("y1", yRange(e.p1.y))
        .attr("x2", xRange(e.p2.x))
        .attr("y2", yRange(e.p2.y))
        .style("stroke", e.color)
        .style("opacity", e.opacity)
        .style("stroke-width", e.size);
}

function removepoint(p) {
    gpoints.select("circle[id='" + renderMap.get(p.type).toString() + ": " + "(" + p.x.toString() + ", " + p.y.toString() + p.radius.toString() + ")']").remove();
}

function removeEdge(e) {
    gEdges.select("line[id='" + renderMap.get(e.type).toString() + ", " + "(" + e.p1.x.toString() + ", " + e.p1.y.toString() + "), (" + e.p2.x.toString() + ", " + e.p2.y.toString() + ")']").remove();
}

function removeAllEdges() {
    gEdges.selectAll("line").remove();
}

function removeAllpoints() {
    gpoints.selectAll("circle").remove();
}
// rendering functions end

/*
UTILITY FUNCTIONS END
*/



/*
DEMO PAGE FUNCTIONS BEGIN
*/

var minpointsAllowed = 3,
    maxpointsAllowed = 1000;

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

// point count input
var navColumn1 = navContainer.append("div").attr("class", "col-sm");
var navColumn2 = navContainer.append("div").attr("class", "col-sm");

var pointCountForm = navColumn1.append("form")
    .attr("class", "form-inline")
    .attr("style", "padding:5px");

var pointCountFormGroup = pointCountForm.append("div")
    .attr("class", "form-group");

var pointCountFormLabel = pointCountFormGroup.append("label")
    .text("Number of Points (" + minpointsAllowed + " - " + maxpointsAllowed + ")");

var pointCountFormInput = pointCountFormGroup.append("input")
    .attr("class", "form-control")
    .attr("id", "point-count-input")
    .attr("type", "number")
    .attr("min", minpointsAllowed)
    .attr("max", maxpointsAllowed)
    .attr("style", "max-width:30%");
    
var pointCountFormSubmit = pointCountForm.append("button")
    .attr("id", "point-count-form-submit")
    .attr("class", "btn btn-primary")
    .attr("disabled", true)
    .text("Generate Points");
// end point count input

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
checkbox1.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "modified-m-1");
checkbox1.append("label")
    .attr("class", "form-check-label")
    .attr("for", "modified-m-1")
    .text("Use m = 2^t");
checkbox1.append("i")
    .attr("id", "info-icon")
    .attr("class", "fa-solid fa-circle-info")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Standard Chan's Algorithm uses <em>m = 2<sup>2<sup>t</sup></sup></em>. Setting this option allows you to see Chan's Algorithm run through more passes, although this is less efficient of course (<em>O(nlog<sup>2</sup>h)</em> work).")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true);

var checkbox2 = navCheckboxes1.append("div").attr("class", "form-check");
    checkbox2.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "modified-m-2");
    checkbox2.append("label")
        .attr("class", "form-check-label")
        .attr("for", "modified-m-2")
        .text("Use m = 2^(t^2)");
    checkbox2.append("i")
        .attr("id", "info-icon")
        .attr("class", "fa-solid fa-circle-info")
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-original-title", "Standard Chan's Algorithm uses <em>m = 2<sup>2<sup>t</sup></sup></em>. TODO: time complexity")
        .attr("data-bs-html", true);

var checkbox3 = navCheckboxes1.append("div").attr("class", "form-check");
    checkbox3.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "modified-H");
    checkbox3.append("label")
        .attr("class", "form-check-label")
        .attr("for", "modified-H")
        .text("Use H = m / logm");
    checkbox3.append("i")
        .attr("id", "info-icon")
        .attr("class", "fa-solid fa-circle-info")
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-original-title", "Rather than using <em>m = H</em>, use <em>H = m / logm</em>")
        .attr("data-bs-html", true);

var checkbox4 = navCheckboxes1.append("div").attr("class", "form-check");
checkbox4.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "fast-forward-graham-scan");
checkbox4.append("label")
    .attr("class", "form-check-label")
    .attr("for", "fast-forward-graham-scan")
    .text("Fast Forward Minihulls");
checkbox4.append("i")
    .attr("id", "info-icon")
    .attr("class", "fa-solid fa-circle-info")
    .attr("data-bs-toggle", "tooltip")
    .attr("data-bs-original-title", "Skips straight to the end of constructing each minihull in the visualization.")
    .attr("data-bs-placement", "left")
    .attr("data-bs-html", true);

var checkbox5 = navCheckboxes2.append("div").attr("class", "form-check");
    checkbox5.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "cache-tangent-points");
    checkbox5.append("label")
        .attr("class", "form-check-label")
        .attr("for", "cache-tangent-points")
        .text("Cache Tangent Points");
    checkbox5.append("i")
        .attr("id", "info-icon")
        .attr("class", "fa-solid fa-circle-info")
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-original-title", "Rather than binary searching to find the tangent/candidate points in Jarvis' March every time, we only binary search at the start of Jarvis' March in each iteration of Chan's, cache those points, then we can just walk around each minihull in the subsequent iterations of the Jarvis' March step, we can find the new tangent on each minihull by walking CCW through them.")
        .attr("data-bs-placement", "left")
        .attr("data-bs-html", true);

var checkbox6 = navCheckboxes2.append("div").attr("class", "form-check");
    checkbox6.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "cache-hull-points");
    checkbox6.append("label")
        .attr("class", "form-check-label")
        .attr("for", "cache-hull-points")
        .text("Cache Hull Points");
    checkbox6.append("i")
        .attr("id", "info-icon")
        .attr("class", "fa-solid fa-circle-info")
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-original-title", "In each iteration of Chan's, if we don't find conv<em>(P)</em>, then all hull points are discarded and we have to find those points again. Instead of having to repeatedly find those hull points in every subsequent iteration of Chan's, we cache those points and continue building the convex hull from the last hull point we found.")
        .attr("data-bs-html", true);

var checkbox7 = navCheckboxes2.append("div").attr("class", "form-check");
    checkbox7.append("input").attr("class", "form-check-input").attr("type", "checkbox").attr("id", "discard-nonhull-points");
    checkbox7.append("label")
        .attr("class", "form-check-label")
        .attr("for", "discard-nonhull-points")
        .text("Discard Non-Hull Points");
    checkbox7.append("i")
        .attr("id", "info-icon")
        .attr("class", "fa-solid fa-circle-info")
        .attr("data-bs-toggle", "tooltip")
        .attr("data-bs-original-title", "During the Graham Scan step where we compute all the minihulls, not all the points will be a point on a minihull. Since it is not even a minihull, then it definitely cannot be one of the points that make up the convex hull of <em>P</em>; discard those points so subsequent iterations of Chan's will have to process fewer points.")
        .attr("data-bs-placement", "left")
        .attr("data-bs-html", true);

var demoOutput = column2.append("svg")
    .attr("class", "demo-output")
    .attr("width", width)
    .attr("height", height);

demoOutput.append("rect")
    .attr("width", width)
    .attr("height", height);

var gpoints = demoOutput.append("g"),
    gEdges = demoOutput.append("g");
// demo container end


xRange.domain([0, width]);
yRange.domain([0, height]);


// render state
function clearRender() {
    removeAllpoints();
    removeAllEdges();
}

function renderState(state) {
    clearRender();

    for (const point of state.points) drawPoint(point);
    for (const edge of state.edges) drawEdge(edge);
    if (state.text) text.html(state.text);
}
// end render state


// step through algorithm
var pointCountInput = document.getElementById("point-count-input");
pointCountInput.oninput = function(event) {
    var pointCount = Number(pointCountInput.value);
    document.getElementById("point-count-form-submit").disabled = (pointCount < pointCountInput.min || pointCount > pointCountInput.max);
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
    document.getElementById("point-count-input").disabled = true;
    document.getElementById("point-count-form-submit").disabled = true;
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
    document.getElementById("point-count-input").disabled = false;
    document.getElementById("point-count-form-submit").disabled = false;
    document.getElementById("autorun").disabled = false;
}

var speedSliderSubmit = document.getElementById("speed-slider");
speedSliderSubmit.oninput = function(event) {
    event.preventDefault();
    autorunSpeed = defaultAutorunSpeed / speedSliderSubmit.value;
}

var options = {
    modifiedM1: false,
    modifiedM2: false,
    modifiedH: false,
    fastForwardGrahamScan: false,
    cacheTangentPoints: false,
    cacheHullPoints: false,
    removeNonHullGrahamPoints: false
};

var modifiedM1Btn = document.getElementById("modified-m-1");
modifiedM1Btn.oninput = function(event) {
    event.preventDefault();
    options.modifiedM1 = !options.modifiedM1;
    options.modifiedM2 = false;
    modifiedM2Btn.disabled = !modifiedM2Btn.disabled;
}

var modifiedM2Btn = document.getElementById("modified-m-2");
modifiedM2Btn.oninput = function(event) {
    event.preventDefault();
    options.modifiedM2 = !options.modifiedM2;
    options.modifiedM1 = false;
    modifiedM1Btn.disabled = !modifiedM1Btn.disabled;
}

var modifiedHBtn = document.getElementById("modified-H");
modifiedHBtn.oninput = function(event) {
    event.preventDefault();
    options.modifiedH = !options.modifiedH;
}

var fastForwardGrahamScanBtn = document.getElementById("fast-forward-graham-scan");
fastForwardGrahamScanBtn.oninput = function(event) {
    event.preventDefault();
    options.fastForwardGrahamScan = !options.fastForwardGrahamScan;
}

var cacheTangentPointsBtn = document.getElementById("cache-tangent-points");
cacheTangentPointsBtn.oninput = function(event) {
    event.preventDefault();
    options.cacheTangentPoints = !options.cacheTangentPoints;
}

var cacheHullPointsBtn = document.getElementById("cache-hull-points");
cacheHullPointsBtn.oninput = function(event) {
    event.preventDefault();
    options.cacheHullPoints = !options.cacheHullPoints;
}

var removeNonHullGrahamPointsBtn = document.getElementById("discard-nonhull-points");
removeNonHullGrahamPointsBtn.oninput = function(event) {
    event.preventDefault();
    options.removeNonHullGrahamPoints = !options.removeNonHullGrahamPoints;
}

// end step through algorithm

/*
DEMO PAGE FUNCTIONS END
*/



/*
CHAN'S ALGORITHM BEGIN
*/

const RenderTypes = Object.freeze({"REGULAR": 0, "HELPER": 1, "HULL": 2});
const renderMap = new Map([
    [0, "Regular"],
    [1, "Helper"],
    [2, "Hull"]
]);
class Point {
    x;
    y;
    radius;
    color;
    opacity;
    type;
    constructor(x, y, radius = null, color = null, opacity = null, type = null) {
        this.x = x;
        this.y = y;
        this.radius = radius ? radius : 4;
        this.color = color ? color : "black";
        this.opacity = opacity ? opacity : 1;
        this.type = type ? type : RenderTypes.REGULAR;
    }
}
exports.Point = Point;

class Edge {
    p1;
    p2;
    size;
    color;
    opacity;
    type;
    constructor(p1, p2, size = null, color = null, opacity = null, type = null) {
        this.p1 = p1;
        this.p2 = p2;
        this.size = size ? size : 2;
        this.color = color ? color : p1.color;
        this.opacity = opacity ? opacity : 1;
        this.type = type ? type : RenderTypes.REGULAR;
    }
}
exports.Edge = Edge;

/**
 * Run Graham Scan to find the convex hull of a set of points.
 * O(nlog(n))
 * @param points Array of {@link Point}s
 * @returns Array of {@link Point}s representing the convex hall
 */
function grahamScan(points, stepsObj) {
    const sortedPoints = sortInOrderOfAngleWithP1(points, stepsObj);
    var hullStack = [];
    for (let i = 0; i < sortedPoints.length; i++) {
        stepsObj.steps++;
        const p3 = sortedPoints[i];
        while (hullStack.length >= 2 && crossProduct(getNextToTopOfStack(hullStack), getTopOfStack(hullStack), p3) >= 0) {
            if (!options.fastForwardGrahamScan) {
                states.push(new State(states[states.length - 1].points, states[states.length - 1].edges.slice(0, -1)));
            }
            stepsObj.steps++;
            hullStack.pop();
        }
        hullStack.push(p3);
        if (i > 0 && !options.fastForwardGrahamScan) {
            const hullEdge = new Edge(getNextToTopOfStack(hullStack), getTopOfStack(hullStack));
            states.push(new State(states[states.length - 1].points, states[states.length - 1].edges.concat([hullEdge]), explanations.grahamScan));
        }
    }

    // for "hulls" of size 2, do not connect last point with first, otherwise we get a duplicate edge visually
    if (points.length > 2 && !options.fastForwardGrahamScan) {
        const hullEdge = new Edge(hullStack[0], getTopOfStack(hullStack));
        states.push(new State(states[states.length - 1].points, states[states.length - 1].edges.concat([hullEdge]), explanations.grahamScan));
    }
    else if (options.fastForwardGrahamScan) {
        let hullEdges = []
        for (let i = 1; i < hullStack.length; i++) {
            hullEdges.push(new Edge(hullStack[i - 1], hullStack[i]));
        }
        if (points.length > 2) {
            hullEdges.push(new Edge(hullStack[0], getTopOfStack(hullStack)));
        }
        if (hullEdges.length > 0) {
            states.push(new State(states[states.length - 1].points, states[states.length - 1].edges.concat(hullEdges), explanations.grahamScan));
        }
    }

    return hullStack;
}
exports.grahamScan = grahamScan;

/**
 * 
 * @param hull minihull to walk through and find tangent
 * @param p0 {@link Point} second to last hull edge found
 * @param p1 {@link Point} last hull edge found
 * @param hullStates caches last tangent for each minihull, so we can avoid binary searching
 * @returns the lower tangent point of minihull that could potentially be the next hull edge
 */
function jarvisWalk(hull, p0, p1, hullStates, stepsObj) {
    const temp = states[states.length - 1];
    var candidateIdx = hullStates.get(hull);
    var candidatePoint = hull[candidateIdx];
    var candidateAngle = (candidatePoint !== p1) ? getAngleBetween3Points(p0, p1, candidatePoint) : 0;

    states.push(new State(temp.points, temp.edges.concat([new Edge(p1, candidatePoint, 5, "red", 1, RenderTypes.HELPER)]), explanations.jarvisWalk));

    var nextIdx = (candidateIdx + 1) % hull.length;
    var nextPoint = hull[nextIdx];
    var nextAngle = getAngleBetween3Points(p0, p1, nextPoint);
    while (hull.length > 1 && (nextAngle >= candidateAngle)) {
        stepsObj.steps++;

        candidateIdx = nextIdx;
        candidatePoint = nextPoint;
        candidateAngle = nextAngle;

        states.push(new State(temp.points, temp.edges.concat([new Edge(p1, candidatePoint, 5, "red", 1, RenderTypes.HELPER)]), explanations.jarvisWalk));

        nextIdx = (candidateIdx + 1) % hull.length;
        nextPoint = hull[nextIdx];
        nextAngle = getAngleBetween3Points(p0, p1, nextPoint);
    }

    hullStates.set(hull, candidateIdx);
    return {point: candidatePoint, angle: candidateAngle, index: candidateIdx};
}
exports.jarvisWalk = jarvisWalk;

function jarvisBinary(hull, p0, p1, hullStates, stepsObj) { // yandere dev would be proud
    const hullPointsCount = hull.length;

    var candidate = null;
    var left = 0, right = hull.length - 1;
    const temp = states[states.length - 1];
    while (true) {
        stepsObj.steps++;
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

        states.push(new State(temp.points, temp.edges.concat([new Edge(p1, candidate ? candidate.point : v1, 5, "red", 1, RenderTypes.HELPER)]), explanations.jarvisBinary));

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

function jarvisMarch(grahamHulls, hullPoints, H, stepsObj) {
    var hullStates = new Map();
    for (const hull of grahamHulls) {
        hullStates.set(hull, 0);
    }

    for (let i = 0; i < H; i++) {
        stepsObj.steps++;
        const initialState = states.slice();
        const p0 = getNextToTopOfStack(hullPoints),
                p1 = getTopOfStack(hullPoints);
        let currentBest = null;
        for (let k = 0; k < grahamHulls.length; k++) {
            stepsObj.steps++;
            var bestOfGroup = (!options.cacheTangentPoints || i === 0) ? jarvisBinary(grahamHulls[k], p0, p1, hullStates, stepsObj) : jarvisWalk(grahamHulls[k], p0, p1, hullStates, stepsObj);
            
            if (!currentBest || bestOfGroup.angle >= currentBest.angle) {
                // if two points have max angle, the furthest point wins.
                if (currentBest && bestOfGroup.angle === currentBest.angle && getDistanceBetweenPoints(p1, bestOfGroup) < getDistanceBetweenPoints(p1, currentBest)) {
                    break;
                }
                
                currentBest = bestOfGroup;
            }

            states.push(new State(states[states.length - 1].points, states[states.length - 1].edges.concat([new Edge(p1, bestOfGroup.point, 5, "grey", 1, RenderTypes.HELPER)]), explanations.jarvisTangentFound));
        }
        
        hullPoints.push(currentBest.point);

        const curExplanation = i === 0 ? explanations.foundMiniHullMax1 : explanations.foundMiniHullMax2;
        states.push(new State(initialState[initialState.length - 1].points.concat([new Point(currentBest.point.x, currentBest.point.y, 10, "purple", 1, RenderTypes.HULL)]), 
            initialState[initialState.length - 1].edges.concat([new Edge(p1, currentBest.point, 5, "black", 1, RenderTypes.HULL)]), curExplanation));
        
        if (arePointsEqual(hullPoints[1], getTopOfStack(hullPoints))) {
            states[states.length - 1].text = explanations.foundConvexHull;
            return;
        }
    }
}
exports.jarvisMarch = jarvisMarch;

function chan(points, stepsObj) {
    var originalPoints = [];
    for (const p of points) {
        originalPoints.push(new Point(p.x, p.y, p.radius, p.color, p.opacity, p.type));
    }
    states.push(new State(originalPoints, [], explanations.generatedRandomPoints));
    
    var p1 = getP1(points, stepsObj);
    var p0 = new Point(p1.x - 1, p1.y);
    var n = points.length;
    var hullPoints = [p0, p1];
    var stop = !options.modifiedM1 ? Math.ceil(Math.log2(Math.log2(n))) : Math.ceil(Math.log2(n));
    var grahamHulls = [];
    for (let t = 1; t <= stop; t++) {
        console.log("Number of iterations gone through: " + t);
        stepsObj.steps++;

        if (options.removeNonHullGrahamPoints && grahamHulls.length) {
            points = grahamHulls.reduce(function (newPoints, hull) {
                stepsObj.steps++;
                newPoints.push.apply(newPoints, hull);
                return newPoints;
            }, []);
            
            n = points.length;
        }

        var m = Math.min(n, Math.pow(2, Math.pow(2, t)));
        if (options.modifiedM1) {
            m = Math.min(n, Math.pow(2, t));
        }
        else if (options.modifiedM2) {
            m = Math.min(n, Math.pow(2, Math.pow(t, 2)));
        }
        
        var splitPointsArray = splitPoints(points, m, stepsObj);
        
        // visualize points being partitioned into subsets
        var partitionedPoints = [];
        for (const group of splitPointsArray) {
            for (const p of group) {
                partitionedPoints.push(new Point(p.x, p.y, p.radius, p.color, p.opacity, p.type));
            }
        }
        states.push(new State(partitionedPoints, [], explanations.partition));
        
        if (t > 1 && options.cacheHullPoints) {
            let hullEdges = [];
            for (let i = 1; i < hullPoints.length; i++) {
                hullEdges.push(new Edge(hullPoints[i - 1], hullPoints[i], 5, "black", 0.5, RenderTypes.HULL));
            }
            if (hullEdges) {
                states.push(new State(partitionedPoints.concat(hullPoints.map((p) => new Point(p.x, p.y, 10, "purple", 0.5, RenderTypes.HULL))), hullEdges, explanations.cachedHullPoints));
            }
        }
        
        grahamHulls = [];
        for (let i = 0; i < splitPointsArray.length; i++) {   // find minihulls
            stepsObj.steps++;
            var grahamHull = grahamScan(splitPointsArray[i], stepsObj);
            grahamHulls.push(grahamHull);
        }
        states.push(new State(states[states.length - 1].points, states[states.length - 1].edges, explanations.grahamScanDone));
        
        var H = !options.modifiedH ? m : (Math.ceil(m / Math.log2(m)));
        jarvisMarch(grahamHulls, hullPoints, H, stepsObj);
        if (arePointsEqual(hullPoints[1], getTopOfStack(hullPoints))) {
            hullPoints.pop();   // remove duplicate hull point
            hullPoints.shift(); // remove dummy point (initial p0)
            return hullPoints;
        }

        if (!options.cacheHullPoints) {
            hullPoints = [p0, p1];
        }

        // clear canvas for next iteration of chan's
        states.push(new State(originalPoints, [], explanations.increaseMAndRestart));
        clearRender();
    }
}
exports.chan = chan;

/*
CHAN'S ALGORITHM END
*/



var pointCountFormSubmit = document.getElementById("point-count-form-submit");
pointCountFormSubmit.onclick = function(event) {
    event.preventDefault();
    document.getElementById("next-step").disabled = false;
    document.getElementById("end-step").disabled = false;
    document.getElementById("prev-step").disabled = true;
    document.getElementById("start-step").disabled = true;
    document.getElementById("autorun").disabled = false;

    states = [];
    clearRender();
    stepIdx = 0;
    
    const pointCountInput = document.getElementById("point-count-input");
    const pointCount = Number(pointCountInput.value);
    if (pointCount >= pointCountInput.min && pointCount <= pointCountInput.max) {
        var pointSet = generateRandomPoints(pointCount);
        const convexHull = chan(pointSet, {steps: 0});
    }
    
    renderState(states[stepIdx]);
}

// TODO: maybe we can merge both chan's functions...
// TODO: handle degenerate cases.
// TODO: better html and css for demo
},{"./explanations":1}]},{},[2]);
