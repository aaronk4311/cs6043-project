// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");

// function draw(x, y) {
//     var pointSz = 5;
    
//     ctx.fillStyle = "#ffff00"
//     ctx.beginPath();
//     ctx.arc(x, y, pointSz, 0, Math.PI * 2, true);
//     ctx.fill();
// }

// canvas.addEventListener("click", function(event) {
//     var rect = canvas.getBoundingClientRect();
//     var x = event.clientX - rect.left;
//     var y = event.clientY - rect.top;

//     draw(x, y);
// }, false);

// window.addEventListener("load", function() {
//     // canvas.width = window.innerWidth;
//     // canvas.height = window.innerHeight;
//     console.log("Loaded project")
// }, false);

// // not scaling canvas and images inside properly, e.g., drawing on canvas and then opening debug console will not scale the canvas data and some of the contents are destroyed.
// // window.addEventListener("resize", function() {
// //     // canvas.style.width = window.innerWidth;
// //     // canvas.style.height = window.innerHeight;

// //     var temp = canvas.toDataURL();
// //     canvas.width = window.innerWidth;
// //     canvas.height = window.innerHeight;
// //     ctx.drawImage(temp, 0, 0);
// //     console.log("TEST2")
// // }, false);
