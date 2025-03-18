let c;
function setup() {
	// Set aspect ratio
	let aspectRatio = 0.75;
	console.log(inputData);

	// Set pixel density; normalizing the p5js canvas
	pixelDensity(displayDensity());

	// Calculate dimensions
	let ih = windowHeight;
	let iw = windowWidth;

	if (iw / ih < aspectRatio) {
		c = createCanvas(iw, iw / aspectRatio);
	} else {
		c = createCanvas(ih * aspectRatio, ih);
	}

	// Create white background
	background(255);
}

function draw() {
	console.log(inputData);
	// Traits defined in traits.js; live from chain
	let amountOfLines = parseInt(inputData["Amount Of Lines"].value);
	let color = inputData["Paint Color"].value;

	// Create white background
	background(255);

	// Color from trait
	stroke(color);

	// Use dimension-agnostic variables (e.g., lineWidth based on canvas width)
	strokeWeight(width * 0.05);

	for (let i = 0; i < amountOfLines; i++) {
		// Examples using the Random class
		let startX = width * R.random_dec();
		let startY = height * R.random_dec();
		let endX = width * R.random_dec();
		let endY = height * R.random_dec();

		// Draw line
		line(startX, startY, endX, endY);
	}

	// Draw border
	noFill();
	rect(0, 0, width, height);
	noLoop();

	// Set window.rendered to canvas when done rendering
	// Image generation scripts use this for still images
	window.rendered = c.canvas;
}

new p5();
