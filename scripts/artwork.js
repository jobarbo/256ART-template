function setup() {
	// Set aspect ratio
	let aspectRatio = 0.75;

	let dp = window.devicePixelRatio;

	// Calculate dimensions
	let ih = window.innerHeight * dp;
	let iw = window.innerWidth * dp;

	if (iw / ih < aspectRatio) {
		canvas.width = iw;
		canvas.height = iw / aspectRatio;
	} else {
		canvas.height = ih;
		canvas.width = ih * aspectRatio;
	}
	document.body.appendChild(canvas);
}

function draw() {
	// Traits defined in traits.js; live from chain
	let amountOfLines = parseInt(inputData["Amount Of Lines"].value);
	let color = inputData["Paint Color"].value;

	// Remove in p5js
	let ctx = canvas.getContext("2d");

	// Initiate Random class
	let R = new Random();

	// Create white background
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Color from trait
	ctx.strokeStyle = color;

	// Use dimension-agnostic variables (e.g., lineWidth based on canvas width)
	ctx.lineWidth = canvas.width * 0.05;

	for (let i = 0; i < amountOfLines; i++) {
		// Examples using the Random class
		let startX = canvas.width * R.random_dec();
		let startY = canvas.height * R.random_dec();
		let endX = canvas.width * R.random_dec();
		let endY = canvas.height * R.random_dec();

		// Draw line
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	}

	// Draw border
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.stroke();

	// Set window.rendered to canvas when done rendering
	// Image generation scripts use this for still images
	window.rendered = canvas;
}

let canvas = document.createElement("canvas");
setup();
draw();
