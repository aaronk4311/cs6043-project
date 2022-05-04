var width = 800, 
    height = 600;

var xRange = d3.scaleLinear().range([0, width]), 
    yRange = d3.scaleLinear().range([0, height]);

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
    .attr("style", "padding:10px");

var vertexCountFormGroup = vertexCountForm.append("div")
    .attr("class", "form-group")
    .append("label")
    .text("Number of Points (3 - 1000)")
    .append("input")
    .attr("id", "vertex-count-input")
    .attr("class", "form-control")
    .attr("type", "number")
    .attr("min", 3)
    .attr("max", 1000);

var vertexCountFormSubmit = vertexCountForm.append("button")
    .attr("id", "vertex-count-form-submit")
    .attr("class", "btn btn-primary")
    .text("Generate Points")
// end vertex count input

var prevStep = navContainer.append("button")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .attr("style", "margin-right:10px")
    .text("Previous Step")
    .on("click", function() {console.log("prev step clicked");});

var nextStep = navContainer.append("button")
    .attr("type", "button")
    .attr("class", "btn btn-primary")
    .text("Next Step")
    .on("click", function() {console.log("next step clicked");});

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
