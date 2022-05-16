function lines() {
    return "<p>" + Array.prototype.slice.call(arguments).join("</p><p>") + "</p>";
}

exports.generateRandomPoints = lines();
exports.grahamScan = lines();
exports.jarvisMarch = lines();
exports.binarySearch = lines();
exports.increaseMAndRestart = lines();
exports.foundConvexHull = lines();
