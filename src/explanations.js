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
