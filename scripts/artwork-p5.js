let features = "";
let movers = [];
let startTime;
let maxFrames = 25;
let elapsedTime = 0;
let particleNum = 500000;
// Adjust cycle for smoother percentage updates (1% increments)
let cycle = parseInt((maxFrames * particleNum) / 1170);
let executionTimer = new ExecutionTimer(); // Replace executionStartTime with timer instance

let scl1;
let scl2;
let scl3;
let ang1;
let ang2;
let rseed;
let nseed;
let xMin;
let xMax;
let yMin;
let yMax;
let isBordered = true;

let img;
let mask;

// Base artwork dimensions (width: 948, height: 948 * 1.41)
let ARTWORK_RATIO = 1.41;
let BASE_WIDTH = 248;
let BASE_HEIGHT = BASE_WIDTH * ARTWORK_RATIO;

// This is our reference size for scaling
let DEFAULT_SIZE = BASE_WIDTH;

let W = window.innerWidth;
let H = window.innerHeight;
let DIM;
let MULTIPLIER;

function setup() {
	console.log(features);
	startTime = frameCount;
	executionTimer.start(); // Start the timer

	// canvas setup
	// Take the smaller screen dimension to ensure it fits
	DIM = min(windowWidth, windowHeight);
	MULTIPLIER = DIM / DEFAULT_SIZE;
	console.log(MULTIPLIER);
	c = createCanvas(DIM, DIM * ARTWORK_RATIO);
	pixelDensity(3);
	colorMode(HSB, 360, 100, 100, 100);
	randomSeed(fxrand() * 10000);
	noiseSeed(fxrand() * 10000);
	rseed = fxrand() * 10000;
	nseed = fxrand() * 10000;
	let scaleFactor = 1;

	translate(width / 2, height / 2);
	scale(scaleFactor);
	translate(-width / 2, -height / 2); // Move back to maintain center

	INIT(rseed, nseed);

	// Calculate the center offset based on scale

	// Create animation generator with configuration
	const animConfig = {
		items: movers,
		maxFrames: maxFrames,
		startTime: startTime,
		cycleLength: cycle,
		currentFrame: 0, // Add current frame tracking
		renderItem: (mover, currentFrame) => {
			if (currentFrame > -1) {
				mover.show();
			}
		},
		moveItem: (mover, currentFrame) => {
			mover.move(currentFrame, maxFrames);
		},
		onComplete: () => {
			executionTimer.stop().logElapsedTime("Sketch completed in");
			//initGrid(100);
			$fx.preview();
			document.complete = true;
		},
	};

	// Create and start the animation
	const generator = createAnimationGenerator(animConfig);
	startAnimation(generator);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	INIT(seed);
}

function INIT(rseed, nseed) {
	movers = [];

	// Scale noise values based on MULTIPLIER
	scl1 = 0.005 / MULTIPLIER;
	scl2 = 0.002 / MULTIPLIER;
	scl3 = 0.005 / MULTIPLIER;

	let sclOffset1 = 1;
	let sclOffset2 = 1;
	let sclOffset3 = 1;
	// Calculate padding based on the reference size and scale it
	let paddingRatioX = -0.05; // 45% padding for X axis
	let paddingRatioY = -0.05; // 45% padding for Y axis
	let basePaddingX = DEFAULT_SIZE * paddingRatioX;
	let basePaddingY = DEFAULT_SIZE * paddingRatioY;
	let paddingX = basePaddingX * MULTIPLIER;
	let paddingY = basePaddingY * MULTIPLIER;

	// Calculate bounds in absolute coordinates with equal padding
	let bounds = {
		left: paddingX,
		right: width - paddingX,
		top: paddingY,
		bottom: height - paddingY,
	};

	// Convert to relative coordinates
	xMin = bounds.left / width;
	xMax = bounds.right / width;
	yMin = bounds.top / height;
	yMax = bounds.bottom / height;

	let hue = random(360); // Define base hue for particles

	// Scale number of particles based on canvas size
	let baseParticleCount = particleNum;
	let scaledParticleCount = baseParticleCount;

	for (let i = 0; i < scaledParticleCount; i++) {
		let x = random(xMin, xMax) * width;
		let y = random(yMin, yMax) * height;

		let hueOffset = random(-20, 20);
		let initHue = hue + hueOffset;
		initHue = initHue > 360 ? initHue - 360 : initHue < 0 ? initHue + 360 : initHue;
		movers.push(new Mover(x, y, initHue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, rseed, nseed));
	}

	background(0, 0, 88);
	//initGrid(0);
}

function initGrid(brightness) {
	// Add subtle organic grid texture
	let gridSizeX = width / 150; // Size of grid cells
	let gridSizeY = width / 150; // Size of grid cells
	let variance = gridSizeX / 1; // Amount of variation for particles
	let g_variance = gridSizeX / 1111;
	let noiseScale = 0.05; // Scale of the noise

	// Vertical lines of particles
	for (let x = -gridSizeX; x <= width + gridSizeX; x += gridSizeX) {
		for (let y = -gridSizeY; y <= height + gridSizeY; y += gridSizeY / 10) {
			// More dense particle distribution
			let xPos = x + map(noise(x * noiseScale, y * noiseScale) + randomGaussian(0, g_variance), 0, 1, -variance, variance);
			noStroke();
			fill(0, 0, brightness, random(10, 60));
			rect(xPos, y, random(0.05, 0.25) * MULTIPLIER, random(0.05, 0.25) * MULTIPLIER);
		}
	}

	// Horizontal lines of particles
	for (let y = -gridSizeY; y <= height + gridSizeY; y += gridSizeY) {
		for (let x = -gridSizeX; x <= width + gridSizeX; x += gridSizeX / 10) {
			// More dense particle distribution
			let yPos = y + map(noise(x * noiseScale, y * noiseScale) + randomGaussian(0, g_variance), 0, 1, -variance, variance);
			noStroke();
			fill(0, 0, brightness, random(10, 60));
			rect(x, yPos, random(0.05, 0.25) * MULTIPLIER, random(0.05, 0.25) * MULTIPLIER);
		}
	}
}

class Mover {
	constructor(x, y, hue, scl1, scl2, scl3, sclOffset1, sclOffset2, sclOffset3, xMin, xMax, yMin, yMax, isBordered, rseed, nseed) {
		this.x = x;
		this.initX = x;
		this.y = y;
		this.initY = y;
		this.initHue = 0;
		this.initSat = random([0]);
		this.initBri = random([0]);
		this.initAlpha = random(60, 100);
		this.hue = random([this.initHue, this.initHue / 2]);
		this.sat = this.initSat;
		this.bri = this.initBri;
		this.initAlpha = 50;
		this.a = this.initAlpha;
		this.s = random([0.1]) * MULTIPLIER;
		this.scl1 = scl1;
		this.scl2 = scl2;
		this.scl3 = scl3;
		this.sclOffset1 = sclOffset1;
		this.sclOffset2 = sclOffset2;
		this.sclOffset3 = sclOffset3;
		this.rseed = rseed;
		this.nseed = nseed;
		this.xRandDivider = 0.01;
		this.yRandDivider = 0.01;
		this.xRandSkipper = 0;
		this.yRandSkipper = 0;
		this.xRandSkipperOffset = 0.0;
		this.yRandSkipperOffset = 0.0;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.isBordered = false;
		this.hasBeenOutside = false;

		// Pre-calculate padding values
		this.wrapPaddingX = (min(width, height) * 0.01) / width;
		this.wrapPaddingY = (min(width, height) * 0.01) / height;
		this.reentryOffsetX = (min(width, height) * 0.05) / width;
		this.reentryOffsetY = (min(width, height) * 0.05) / height;
		this.wrapPaddingMultiplier = 0.5; //! or 0.5

		// Pre-calculate bounds
		this.minBoundX = (this.xMin - this.wrapPaddingX) * width;
		this.maxBoundX = (this.xMax + this.wrapPaddingX) * width;
		this.minBoundY = (this.yMin - this.wrapPaddingY) * height;
		this.maxBoundY = (this.yMax + this.wrapPaddingY) * height;
	}

	show() {
		drawingContext.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.bri}%, ${this.a}%)`;
		drawingContext.fillRect(this.x, this.y, this.s, this.s);
	}

	move(frameCount, maxFrames) {
		let p = superCurve(this.x, this.y, this.scl1, this.scl2, this.scl3, this.sclOffset1, this.sclOffset2, this.sclOffset3, this.xMin, this.yMin, this.xMax, this.yMax, this.rseed, this.nseed);

		// Update isBordered state
		//this.isBordered = frameCount > maxFrames / 2;
		this.isBordered = true;

		// Update position with slight randomization
		this.xRandDivider = random(0.005, 0.00505);
		this.yRandDivider = random(0.005, 0.09505);
		this.xRandSkipper = random(-this.xRandSkipperOffset, this.xRandSkipperOffset);
		this.yRandSkipper = random(-this.yRandSkipperOffset, this.yRandSkipperOffset);
		this.x += p.x / this.xRandDivider + this.xRandSkipper;
		this.y += p.y / this.yRandDivider + this.yRandSkipper;

		if (this.isBordered) {
			// Wrap to opposite side with slight offset
			if (this.isOutside()) {
				this.hasBeenOutside = true;
			}
			if (this.x < this.minBoundX) {
				this.x = (this.xMax + this.wrapPaddingX * this.wrapPaddingMultiplier - random(0, this.reentryOffsetX)) * width;
			} else if (this.x > this.maxBoundX) {
				this.x = (this.xMin - this.wrapPaddingX * this.wrapPaddingMultiplier + random(0, this.reentryOffsetX)) * width;
			}

			if (this.y < this.minBoundY) {
				this.y = (this.yMax + this.wrapPaddingY * this.wrapPaddingMultiplier - random(0, this.reentryOffsetY)) * height;
			} else if (this.y > this.maxBoundY) {
				this.y = (this.yMin - this.wrapPaddingY * this.wrapPaddingMultiplier + random(0, this.reentryOffsetY)) * height;
			}
		} else {
			// Reset to initial position if not bordered
			if (this.isOutside()) {
				this.x = this.initX;
				this.y = this.initY;
			}
		}

		// Check if particle is currently outside
		let currentlyOutside = this.isOutside();

		// Update hasBeenOutside flag if particle is outside
		/* 		if (this.hasBeenOutside) {
			if (this.isBordered) {
				this.hue = 40;
				this.sat = 100;
				this.bri = random([0, 10, 10, 50]);
				this.xRandSkipperOffset = 5;
				this.yRandSkipperOffset = 5;
			}
		} */

		this.a = this.isOutside() ? 0 : this.initAlpha;
		//this.a = this.hasBeenOutside && !currentlyOutside ? 100 : 0;
	}
	isOutside() {
		return this.x < this.minBoundX || this.x > this.maxBoundX || this.y < this.minBoundY || this.y > this.maxBoundY;
	}
}

function superCurve(x, y, scl1, scl2, scl3, sclOff1, sclOff2, sclOff3, xMin, yMin, xMax, yMax, rseed, nseed) {
	let nx = x,
		ny = y,
		scale1 = scl1,
		scale2 = scl2,
		scale3 = scl3,
		scaleOffset1 = sclOff1,
		scaleOffset2 = sclOff2,
		scaleOffset3 = sclOff3,
		noiseScale1 = 3,
		noiseScale2 = 4,
		noiseScale3 = 3;

	un = sin(nx * (scale1 * scaleOffset1) + rseed) + cos(nx * (scale2 * scaleOffset2) + rseed) - sin(nx * (scale3 * scaleOffset3) + rseed);
	vn = cos(ny * (scale1 * scaleOffset1) + rseed) + sin(ny * (scale2 * scaleOffset2) + rseed) - cos(ny * (scale3 * scaleOffset3) + rseed);

	//! center focused introverted
	/* let maxU = map(ny, xMin * width, xMax * width, 3, -3, true);
	let maxV = map(nx, yMin * height, yMax * height, 3, -3, true);
	let minU = map(ny, xMin * width, xMax * width, -3, 3, true);
	let minV = map(nx, yMin * height, yMax * height, -3, 3, true); */

	//! center focused extroverted
	/* 	let maxU = map(nx, xMin * width, xMax * width, 3, -3, true);
	let maxV = map(ny, yMin * height, yMax * height, 3, -3, true);
	let minU = map(nx, xMin * width, xMax * width, -3, 3, true);
	let minV = map(ny, yMin * height, yMax * height, -3, 3, true); */

	//! pNoise x SineCos
	let maxU = map(oct(ny * (scale1 * scaleOffset1) + rseed, ny * (scale2 * scaleOffset3) + rseed, noiseScale1, 1, 1), -0.000015, 0.000015, -1, 1, true);
	let maxV = map(oct(nx * (scale2 * scaleOffset1) + rseed, nx * (scale1 * scaleOffset2) + rseed, noiseScale2, 2, 1), -0.000015, 0.000015, -1, 1, true);
	let minU = map(oct(ny * (scale3 * scaleOffset1) + rseed, ny * (scale1 * scaleOffset3) + rseed, noiseScale3, 0, 1), -0.000015, 0.000015, -1, 1, true);
	let minV = map(oct(nx * (scale1 * scaleOffset2) + rseed, nx * (scale3 * scaleOffset3) + rseed, noiseScale1, 3, 1), -0.000015, 0.000015, -1, 1, true);

	//! Wobbly noise square and stuff
	/* 	let maxU = map(noise(ny * (scale1 * scaleOffset1) + nseed), 0, 1, 0, 3, true);
	let maxV = map(noise(nx * (scale2 * scaleOffset2) + nseed), 0, 1, 0, 3, true);
	let minU = map(noise(ny * (scale2 * scaleOffset3) + nseed), 0, 1, -3, 0, true);
	let minV = map(noise(nx * (scale3 * scaleOffset1) + nseed), 0, 1, -3, 0, true); */

	//! Crayon mode
	/* 	let maxU = random(0.001, 4);
	let maxV = random(0.001, 4);
	let minU = random(-4, -0.001);
	let minV = random(-4, -0.001); */

	//! Standard Mode
	/* 	let maxU = 0.11;
	let maxV = 0.11;
	let minU = -0.11;
	let minV = -0.11; */

	//! Introverted
	let u = map(vn, map(nx, xMin * width, xMax * width, -3.5, -0.0000001), map(nx, xMin * width, xMax * width, 0.0000001, 3.5), minU, maxU, true);
	let v = map(un, map(ny, yMin * height, yMax * height, -3.5, -0.0000001), map(ny, yMin * height, yMax * height, 0.0000001, 3.5), minV, maxV, true);

	//! Extroverted
	/* 	let u = map(vn, map(ny, xMin * width, xMax * width, -5.4, -0.0001), map(ny, xMin * width, xMax * width, 0.0001, 5.4), minU, maxU, true);
	let v = map(un, map(nx, yMin * height, yMax * height, -5.4, -0.0001), map(nx, yMin * height, yMax * height, 0.0001, 5.4), minV, maxV, true); */

	//! Equilibrium
	/* 	let u = map(vn, -0.000000000000000001, 0.000000000000000001, minU, maxU, true);
	let v = map(un, -0.000000000000000001, 0.000000000000000001, minV, maxV, true); */
	let zu = ZZ(u, 35, 40, 0.005);
	let zv = ZZ(v, 35, 40, 0.005);

	//! PAGODA (below is noiseScale and scaleOffset)
	//! 2
	//! 0.001
	//! 2
	/* 	let zu = ZZ(u, 35, 40, 0.005) * MULTIPLIER;
	let zv = ZZ(v, 35, 40, 0.005) * MULTIPLIER; */

	let p = createVector(zu, zv);
	return p;
}

new p5();
