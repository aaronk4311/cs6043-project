var width = 800, 
    height = 600;

var xRange = d3.scaleLinear().range([0, width]), 
    yRange = d3.scaleLinear().range([0, height]);

var minVerticesAllowed = 3,
    maxVerticesAllowed = 1000;

// header
var headerText = d3.select("body").append("div")
    .attr("class", "container")
    .append("h1")
    .attr("align", "center")
    .text("Visualization of Chan's Algorithm")
// end header

// demo container
var demoContainer = d3.select("body").append("div")
    .attr("id", "demo-container");

var navContainer = demoContainer.append("div")
    .attr("class", "nav-container")
    .attr("style", "margin-bottom:10px");

// vertex count input
var vertexCountForm = navContainer.append("form")
    .attr("style", "padding:5px");

var vertexCountFormGroup = vertexCountForm.append("div")
    .attr("class", "form-group")
    .append("label")
    .text("Number of Points (" + minVerticesAllowed + " - " + maxVerticesAllowed + ")")
    .append("input")
    .attr("id", "vertex-count-input")
    .attr("class", "form-control")
    .attr("type", "number")
    .attr("min", minVerticesAllowed)
    .attr("max", maxVerticesAllowed);

var vertexCountFormSubmit = vertexCountForm.append("button")
    .attr("id", "vertex-count-form-submit")
    .attr("class", "btn btn-primary")
    .attr("disabled", true)
    .text("Generate Points");
// end vertex count input

var startStep = navContainer.append("button")
    .attr("id", "start-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:5px")
    .attr("disabled", true)
    .text("<<");

var prevStep = navContainer.append("button")
    .attr("id", "prev-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:5px")
    .attr("disabled", true)
    .text("Previous Step");

var nextStep = navContainer.append("button")
    .attr("id", "next-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:5px")
    .attr("disabled", true)
    .text("Next Step");

var endStep = navContainer.append("button")
    .attr("id", "end-step")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("disabled", true)
    .text(">>");

var demoOutput = demoContainer.append("svg")
    .attr("class", "demo-output")
    .attr("width", width)
    .attr("height", height);

var gVertices = demoOutput.append("g"),
    gEdges = demoOutput.append("g");
// demo container end



xRange.domain([0, width]);
yRange.domain([0, height]);

demoOutput.append("rect")
    .attr("width", width)
    .attr("height", height);



// render state
function clearRender() {
    removeAllVertices();
    removeAllEdges();
}

function renderState(state) {
    clearRender();

    for (const vertex of state.vertices) drawVertex(vertex);
    for (const edge of state.edges) drawEdge(edge);
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
// end step through algorithm
