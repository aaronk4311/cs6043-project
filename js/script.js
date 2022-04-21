// TODO: allow users to set parameters, e.g., vertexCount
// TODO: some vertices are slightly out of bounds, fix so the entire point is in frame and not cut off

var width = 800, height = 600;
var xRange = d3.scaleLinear().range([0, width]), yRange = d3.scaleLinear().range([0, height]);
var vertexCount = 26;

xRange.domain([0, width]);
yRange.domain([0, height]);

var svgChan = d3.select("#chan")
    .attr("width", width)
    .attr("height", height);

d3.selectAll("svg").append("rect")
    // .attr("x", function(d) { return xRange(d) - width / 2 })
    // .attr("y", function(d) { return yRange(d) - height / 2 })
    .attr("width", width)
    .attr("height", height);

var gVertices = svgChan.append("g"),
    gEdges = svgChan.append("g");

// utlity functions
function randColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}
// utility functions end

// computation functions
const TurnDirection = Object.freeze({COLLINEAR: 0, LEFT: 1, RIGHT: 2});

function getTurnDirection(p0, p1, p2) {
    var seg1x = p1.x - p0.x, seg1y = p1.y - p0.y;
    var seg2x = p2.x - p1.x, seg2y = p2.y - p1.y;

    var crossProduct = seg1x * seg2y - seg1y * seg2x;

    if (crossProduct < 0) return TurnDirection.LEFT;
    else if (crossProduct > 0) return TurnDirection.RIGHT;
    else return TurnDirection.COLLINEAR;
}

// TODO: handle collinear points
// computation functions end

// rendering functions
function generateRandomPoints() {
    var vertices = []

    for (let i = 0; i < vertexCount; i++) {
        var x = d3.randomUniform(0, width)(), y = d3.randomUniform(0, height)();
        vertices.push({x, y});
    }

    return vertices;
}

function drawVertex(p) {
    // draw vertex
    gVertices.append("circle")
        .attr("r", 4)
        .attr("cx", xRange(p.x))
        .attr("cy", yRange(p.y))
        .style("fill", p.color)
        .style("stroke", "black")
        .style("stroke-width", 1);
}

function drawEdge(p0, p1) {
    // draw an edge connecting two points
    gEdges.append("line")
        .attr("id", "(" + p0.x.toString() + ", " + p0.y.toString() + "), (" + p1.x.toString() + ", " + p1.y.toString() + ")")
        .attr("r", 2)
        .attr("x1", xRange(p0.x))
        .attr("y1", yRange(p0.y))
        .attr("x2", xRange(p1.x))
        .attr("y2", yRange(p1.y))
        .style("stroke", p0.color)
        .style("stroke-width", 2);
}

function removeEdge(p0, p1) {
    gEdges.select("line[id='(" + p0.x.toString() + ", " + p0.y.toString() + "), (" + p1.x.toString() + ", " + p1.y.toString() + ")']")
        .remove();
}
// rendering functions end

function grahamScan(dataVertices) {
    if (dataVertices.length == 0) return;

    var stk = [];

    var minYPoint = dataVertices[0];
    for (let i = 1; i < dataVertices.length; i++) {
        if (dataVertices[i].y > minYPoint.y) {  // update if "greater" because on a computer screen, y coordinates increase as you go down.
            minYPoint = dataVertices[i];
        }
    }

    dataVertices.sort(function(p0, p1) {
        angle1 = Math.atan2(p0.y - minYPoint.y, p0.x - minYPoint.x) * 180 / Math.PI;
        angle2 = Math.atan2(p1.y - minYPoint.y, p1.x - minYPoint.x) * 180 / Math.PI;
        
        return angle2 - angle1;
    });
    
    for (const vertex of dataVertices) {
        drawVertex(vertex);
    }

    stk.push(dataVertices[0]);
    for (let i = 1; i < dataVertices.length; i++) {
        while (stk.length > 1 && getTurnDirection(stk[stk.length - 2], stk[stk.length - 1], dataVertices[i]) == TurnDirection.RIGHT) {
            removeEdge(stk[stk.length - 2], stk[stk.length - 1]);
            stk.pop();
        }

        stk.push(dataVertices[i]);
        drawEdge(stk[stk.length - 2], stk[stk.length - 1]);
    }

    drawEdge(minYPoint, stk[stk.length - 1]);
}

function jarvisMarch() {

}

function chan(dataVertices) {
    var t = 1, m = 4, n = dataVertices.length;
    var groupCount = Math.ceil(n / m);

    // TODO: delete this, it's a test, t and m will be updated elsewhere
    // for (let i = 0; i < 5; i++) {
    //     t++;
    //     m = Math.pow(2, Math.pow(2, t))
    // }

    var partition = function(m) {
        let groups = Array.from(Array(groupCount), () => new Array());

        var groupColor = randColor();   // TODO: should generate a color that does not exist in other groups yet. ideally, the colors look different enough to the human eye.
        var prevIdx = 0;
        for (let i = 0; i < dataVertices.length; i++) {
            var curIdx = Math.floor(i / m);

            if (curIdx != prevIdx) {
                groupColor = randColor();
                prevIdx = curIdx;
            }

            dataVertices[i].color = groupColor;
            groups[curIdx].push(dataVertices[i]);
        }

        return groups;
    }

    var groups = partition(m);

    for (const group of groups) {
        grahamScan(group);
    }
}

var verticesArr = generateRandomPoints();
chan(verticesArr);
