// Avoid modifying this file
// It emulates data coming from chain and injects the artwork.js file

let search = new URLSearchParams(window.location.search);

let genHash = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
let hash = search.get("hash") || "0x" + genHash(64);

// Generate a random Ethereum address
let genRandomAddress = () => "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

// Additional fields with default values
let ownerOfPiece = search.get("ownerOfPiece") || genRandomAddress();
let blockHash = search.get("blockHash") || "0x" + genHash(64);
let blockNumber = search.get("blockNumber") || Math.floor(Math.random() * 10000000);
let prevrandao = search.get("prevrandao") || Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
let totalSupply = search.get("totalSupply") || Math.floor(Math.random() * 256);
let balanceOfOwner = search.get("balanceOfOwner") || Math.floor(Math.random() * totalSupply);
let tokenId = search.get("tokenId") || Math.floor(Math.random() * totalSupply);
let blockTimestamp = search.get("blockTimestamp") || Math.floor(Date.now() / 1000);
let blockBaseFee = search.get("blockBaseFee") || Math.floor(Math.random() * 1e9); // Example: up to 1 Gwei
let blockCoinbase = search.get("blockCoinbase") || genRandomAddress();
let ethBalanceOfOwner = search.get("ethBalanceOfOwner") || Math.floor(Math.random() * 1e18); // Up to 1 ETH

// Main input data
let inputData = {
	tokenId: tokenId,
	hash: hash,
	ownerOfPiece: ownerOfPiece,
	blockHash: blockHash,
	blockNumber: blockNumber,
	prevrandao: prevrandao,
	totalSupply: totalSupply,
	balanceOfOwner: balanceOfOwner,

	// Including the new fields
	blockTimestamp: blockTimestamp,
	blockBaseFee: blockBaseFee,
	blockCoinbase: blockCoinbase,
	ethBalanceOfOwner: ethBalanceOfOwner,
};

/**
 * Function to display error messages on the screen.
 * Creates an error container if it doesn't exist and appends the message.
 * @param {string} message - The error message to display.
 */
/**
 * Function to display error messages on the screen.
 * Creates an error container if it doesn't exist and appends the message along with helpful tips.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
	let errorDiv = document.getElementById("error-container");
	let errorMsg;
	if (!errorDiv) {
		errorDiv = document.createElement("div");
		errorDiv.id = "error-container";
		// Styling the error container for visibility
		errorDiv.style.display = "flex";
		errorDiv.style.alignItems = "center";
		errorDiv.style.justifyContent = "center";
		errorDiv.style.top = "0";
		errorDiv.style.left = "0";
		errorDiv.style.width = "100%";
		errorDiv.style.height = "100%";
		errorDiv.style.color = "white";
		errorDiv.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Added background for better readability
		errorDiv.style.padding = "20px";
		errorDiv.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
		errorDiv.style.zIndex = "1000";
		errorDiv.style.fontFamily = "Arial, sans-serif";
		errorDiv.style.fontSize = "16px";
		errorDiv.style.textAlign = "center";
		errorDiv.style.flexDirection = "column"; // Allow multiple lines

		errorMsg = document.createElement("p");
		errorMsg.style.marginBottom = "10px";
		errorDiv.appendChild(errorMsg);

		const tipMsg = document.createElement("p");
		tipMsg.style.fontStyle = "italic";
		tipMsg.style.fontSize = "14px";
		tipMsg.innerText = "Consider using parseInt(), parseFloat(), or comparing to 'true' for boolean values in your script.";
		errorDiv.appendChild(tipMsg);

		document.body.appendChild(errorDiv);
	} else {
		errorMsg = errorDiv.querySelector("p");
	}
	errorMsg.innerText = message;
}

(async function () {
	try {
		// Fetch traits data from the local JSON file
		const response = await fetch("../scripts/traits.json");
		if (!response.ok) {
			throw new Error(`Failed to fetch traits.json: ${response.status} ${response.statusText}`);
		}
		const traitsData = await response.json();

		const traits = traitsData;

		// Generate random numbers (as on chain)
		function generateRandomNumbers(seed, timesToCall) {
			let randNumbers = [];
			for (let i = 0; i < timesToCall; i++) {
				let finalSeed = ethers.BigNumber.from(seed).add(i);
				let keccak = ethers.utils.keccak256(finalSeed._hex.toString());
				let r = ethers.BigNumber.from(keccak).mod(10000);
				randNumbers[i] = parseInt(r);
			}
			return randNumbers;
		}

		let randNumbers = generateRandomNumbers(hash, Object.keys(traits).length);

		// Add traits to inputData based on generated random numbers
		const traitKeys = Object.keys(traits);
		for (let j = 0; j < traitKeys.length; j++) {
			let r = randNumbers[j];
			let traitArray = traits[traitKeys[j]];
			let traitAssigned = false;

			for (let k = 0; k < traitArray.length; k++) {
				if (r < traitArray[k].weight) {
					const traitValue = traitArray[k].trait_value;
					const traitDescription = traitArray[k].trait_description;

					// Type checks for trait_value and trait_description
					if (typeof traitValue !== "string") {
						throw new TypeError(`trait_value for trait "${traitKeys[j]}" must be a string (required for on-chain storage). Received type: ${typeof traitValue}`);
					}

					if (typeof traitDescription !== "string") {
						throw new TypeError(`trait_description for trait "${traitKeys[j]}" must be a string (required for on-chain storage). Received type: ${typeof traitDescription}`);
					}

					inputData[traitKeys[j]] = {value: traitValue, description: traitDescription};
					traitAssigned = true;
					break;
				}
			}

			// Optionally, handle case where no trait was assigned
			if (!traitAssigned) {
				throw new Error(`No valid trait found for trait category "${traitKeys[j]}" with random number ${r}.`);
			}
		}

		// Log inputData for easier debugging
		console.log(inputData);

		// Load artwork.js after inputData.js has finished executing
		const artworkScript = document.createElement("script");
		artworkScript.src = window.p5 ? "../scripts/artwork-p5.js" : "../scripts/artwork.js";
		document.body.appendChild(artworkScript);
	} catch (error) {
		console.error("Error processing traits data:", error);
		// Display the error on the screen
		displayError(`Error: ${error.message}`);
		// Optionally, you can prevent further script execution or provide fallback behavior here
	}
})();

// CUSTOM FUNCTIONS

// 256ART VAR
// will hold the Random class instance

// Recommended class for randomness; remove unneeded functionality
class Random {
	constructor() {
		let offset = 0;
		for (let i = 2; i < 66; i += 8) offset += parseInt(inputData.hash.substr(i, 8), 16);
		offset %= 7;

		const p = (pos) => parseInt(inputData.hash.substr(pos + offset, 8), 16);
		let a = p(2) ^ p(34),
			b = p(10) ^ p(42),
			c = p(18) ^ p(50),
			d = p(26) ^ p(58) ^ p(2 + (8 - offset));

		this.r = () => {
			a |= 0;
			b |= 0;
			c |= 0;
			d |= 0;
			let t = (((a + b) | 0) + d) | 0;
			d = (d + 1) | 0;
			a = b ^ (b >>> 9);
			b = (c + (c << 3)) | 0;
			c = (c << 21) | (c >>> 11);
			c = (c + t) | 0;
			return (t >>> 0) / 4294967296;
		};
		// 256 warmup cycles
		for (let i = 0; i < 256; i++) this.r();
	}
	// Random decimal [0, 1)
	random_dec = () => this.r();
	// Random number [a, b)
	random_num = (a, b) => a + (b - a) * this.random_dec();
	// Random integer [a, b] (a < b required)
	random_int = (a, b) => Math.floor(this.random_num(a, b + 1));
	// Random boolean (p = true probability)
	random_bool = (p) => this.random_dec() < p;
	// Choose random item from array
	random_choice = (list) => list[this.random_int(0, list.length - 1)];
}

// Initiate Random class

//* COMPOSITION TYPE DEFINITION *//
// CATEGORISE VARIABILITY INSIDE ARRAYS //

const complexityArr = [
	["1", 20],
	["2", 70],
	["3", 5],
	["4", 2],
	["5", 2],
	["6", 1],
];

const themeArr = [
	["bright", 0],
	["dark", 100],
];

const compositionArr = [
	["semiconstrained", 0],
	["constrained", 0],
	["compressed", 0],
	["unconstrained", 100],
];

const colorModeArr = [
	["monochrome", 100],
	["fixed", 0],
	["dynamic", 0],
	["iridescent", 0],
];

const strokestyleArr = [
	["thin", 100],
	["regular", 0],
	["bold", 0],
];

const clampvalueArr = [
	["0.0000015,0.25,0.25,0.0000015", 50],
	["0.0000015,0.025,0.025,0.0000015", 50],
	["0.00015,0.015,0.015,0.00015", 50],
	["0.15,0.00000015,0.15,0.0000015", 50],
	["0.0015,0.000015,0.0015,0.000015", 50],
	["0.05,0.05,0.05,0.05", 50],
	["0.15,0.15,0.15,0.15", 50],
	["0.015,0.015,0.015,0.015", 50],
	["0.0015,0.0015,0.0015,0.0015", 50],
	["0.0000015,0.0000015,0.0000015,0.0000015", 50],
];

// all input parameters are optional, they will be chosen at random if not passed into the function
function generate_composition_params(complexity, theme, composition, colormode, strokestyle, clampvalue) {
	// SET DEFAULTS IF NOT PASSED IN
	if (complexity === undefined) {
		complexity = weighted_choice(complexityArr);
	}

	if (theme === undefined) {
		theme = weighted_choice(themeArr);
	}

	if (composition === undefined) {
		composition = weighted_choice(compositionArr);
	}

	if (colormode === undefined) {
		colormode = weighted_choice(colorModeArr);
	}

	if (strokestyle === undefined) {
		strokestyle = weighted_choice(strokestyleArr);
	}

	if (clampvalue === undefined) {
		clampvalue = weighted_choice(clampvalueArr);
	}

	//* EXCEPTIONS AND OVER-RIDES *//
	// if necessary, add exceptions and over-rides here

	//* PACK PARAMETERS INTO OBJECT *//
	var composition_params = {
		complexity: complexity,
		theme: theme,
		composition: composition,
		colormode: colormode,
		strokestyle: strokestyle,
		clampvalue: clampvalue,
	};

	//* RETURN PARAMETERS *//
	return composition_params;
}

// MY UTILS

let noiseCanvasWidth = 1;
let noiseCanvasHeight = 1;

let clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
let smoothstep = (a, b, x) => (((x -= a), (x /= b - a)) < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
let mix = (a, b, p) => a + p * (b - a);
function dot(v1, v2) {
	if (v1.length !== 2 || v2.length !== 2) {
		throw new Error("Both vectors should have exactly 2 elements.");
	}
	return v1[0] * v2[0] + v1[1] * v2[1];
}
let subtract = (v1, v2) => ({x: v1.x - v2.x, y: v1.y - v2.y});
let multiply = (v1, v2) => ({x: v1.x * v2.x, y: v1.y * v2.y});
let length = (v) => Math.sqrt(v.x * v.x + v.y * v.y);
let randomInt = (max) => Math.floor(Math.random() * max);

let R = new Random();
let L = (x, y) => (x * x + y * y) ** 0.5; // Elements by Euclid 300 BC
let k = (a, b) => (a > 0 && b > 0 ? L(a, b) : a > b ? a : b);

fx = R;
fxhash = inputData.hash;
fxrand = R.random_dec;
rand = fxrand;
features = "Need to link features with the 256art system";
seed = parseInt(R.random_dec() * 10000000);

// Definitions ===========================================================
({sin, cos, imul, PI} = Math);
TAU = PI * 2;
F = (N, f) => [...Array(N)].map((_, i) => f(i)); // for loop / map / list function

S = Uint32Array.of(9, 7, 5, 3); // PRNG state
let RF = (x) => R.random_int(0, x);
[...(seed + "ThxPiter")].map((c) => RF((S[3] ^= c.charCodeAt() * 23205))); // seeding the random function

// general noise definitions =============================================
KNUTH = 0x9e3779b1; // prime number close to PHI * 2 ** 32
NSEED = RF(2 ** 32); // noise seed, random 32 bit integer
// 3d noise grid function
ri = (i, j, k) => ((i = imul((((i & 1023) << 20) | ((j & 1023) << 10) | ((i ^ j ^ k) & 1023)) ^ NSEED, KNUTH)), (i <<= 3 + (i >>> 29)), (i >>> 1) / 2 ** 31 - 0.5);

//* PARAMS *//

// 3D value noise function ===============================================
no = F(99, (_) => RF(1024)); // random noise offsets

n3 = (
	x,
	y,
	z,
	s,
	i, // (x,y,z) = coordinate, s = scale, i = noise offset index
	xi = floor((x = x * s + no[(i *= 3)])), // (xi,yi,zi) = integer coordinates
	yi = floor((y = y * s + no[i + 1])),
	zi = floor((z = z * s + no[i + 2]))
) => (
	(x -= xi),
	(y -= yi),
	(z -= zi), // (x,y,z) are now fractional parts of coordinates
	(x *= x * (3 - 2 * x)), // smoothstep polynomial (comment out if true linear interpolation is desired)
	(y *= y * (3 - 2 * y)), // this is like an easing function for the fractional part
	(z *= z * (3 - 2 * z)),
	// calculate the interpolated value
	ri(xi, yi, zi) * (1 - x) * (1 - y) * (1 - z) +
		ri(xi, yi, zi + 1) * (1 - x) * (1 - y) * z +
		ri(xi, yi + 1, zi) * (1 - x) * y * (1 - z) +
		ri(xi, yi + 1, zi + 1) * (1 - x) * y * z +
		ri(xi + 1, yi, zi) * x * (1 - y) * (1 - z) +
		ri(xi + 1, yi, zi + 1) * x * (1 - y) * z +
		ri(xi + 1, yi + 1, zi) * x * y * (1 - z) +
		ri(xi + 1, yi + 1, zi + 1) * x * y * z
);

// 2D value noise function ===============================================
na = F(99, (_) => RF(TAU)); // random noise angles
ns = na.map(sin);
nc = na.map(cos); // sin and cos of those angles
nox = F(99, (_) => RF(1024)); // random noise x offset
noy = F(99, (_) => RF(1024)); // random noise y offset

n2 = (
	x,
	y,
	s,
	i,
	c = nc[i] * s,
	n = ns[i] * s,
	xi = floor((([x, y] = [(x - noiseCanvasWidth / 2) * c + (y - noiseCanvasHeight * 2) * n + nox[i], (y - noiseCanvasHeight * 2) * c - (x - noiseCanvasWidth / 2) * n + noy[i]]), x)),
	yi = floor(y) // (x,y) = coordinate, s = scale, i = noise offset index
) => (
	(x -= xi),
	(y -= yi),
	(x *= x * (3 - 2 * x)),
	(y *= y * (3 - 2 * y)),
	ri(xi, yi, i) * (1 - x) * (1 - y) + ri(xi, yi + 1, i) * (1 - x) * y + ri(xi + 1, yi, i) * x * (1 - y) + ri(xi + 1, yi + 1, i) * x * y
);

//! Spell formula from Piter The Mage
ZZ = (x, m, b, r) => (x < 0 ? x : x > (b *= r * 4) ? x - b : ((x /= r), fract(x / 4) < 0.5 ? r : -r) * ((x = abs(fract(x / 2) - 0.5)), 1 - (x > m ? x * 2 : x * (x /= m) * x * (2 - x) + m)));

// the point of all the previous code is that now you have a very
// fast value noise function called nz(x,y,s,i). It has four parameters:
// x -- the x coordinate
// y -- the y coordinate
// s -- the scale (simply multiplies x and y by s)
// i -- the noise index, you get 99 different random noises! (but you
//      can increase this number by changing the 99s in the code above)
//      each of the 99 noises also has a random rotation which increases
//      the "randomness" if you add many together
//
// ohh also important to mention that it returns smooth noise values
// between -.5 and .5

function oct(x, y, s, i, octaves = 1) {
	let result = 0;
	let sm = 1;
	i *= octaves;
	for (let j = 0; j < octaves; j++) {
		result += n2(x, y, s * sm, i + j) / sm;
		sm *= 2;
	}
	return result;
}

function weighted_choice(data) {
	let total = 0;
	for (let i = 0; i < data.length; ++i) {
		total += data[i][1];
	}
	const threshold = rand() * total;
	total = 0;
	for (let i = 0; i < data.length - 1; ++i) {
		total += data[i][1];
		if (total >= threshold) {
			return data[i][0];
		}
	}
	return data[data.length - 1][0];
}

let mapValue = (v, s, S, a, b) => ((v = Math.min(Math.max(v, s), S)), ((v - s) * (b - a)) / (S - s) + a);
const pmap = (v, cl, cm, tl, th, c) => (c ? Math.min(Math.max(((v - cl) / (cm - cl)) * (th - tl) + tl, tl), th) : ((v - cl) / (cm - cl)) * (th - tl) + tl);

function sdf_box([x, y], [cx, cy], [w, h]) {
	x -= cx;
	y -= cy;
	return k(abs(x) - w, abs(y) - h);
}

function sdf_circle([x, y], [cx, cy], r) {
	x -= cx;
	y -= cy;
	return L(x, y) - r;
}

function sdf_hexagon(p, c, r) {
	// Vector from the center of the hexagon to the point
	let q = [Math.abs(p[0] - c[0]), Math.abs(p[1] - c[1])];

	// Rotate the hexagon 30 degrees
	let rotated = [q[0] * Math.cos(Math.PI / 6) - q[1] * Math.sin(Math.PI / 6), q[0] * Math.sin(Math.PI / 6) + q[1] * Math.cos(Math.PI / 6)];

	// Calculate the distance to the rotated hexagon
	let d = Math.max(rotated[1], rotated[0] * 0.5 + rotated[1] * 0.5);

	// Subtract the radius to get the signed distance
	let dist = d - r;

	return dist;
}

let dpi = (maxDPI = 3.0) => {
	var ua = window.navigator.userAgent;
	var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
	var webkit = !!ua.match(/WebKit/i);
	var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
	let mobileDPI = maxDPI * 2;
	if (iOSSafari) {
		if (mobileDPI > 6) {
			mobileDPI = 6;
		}
		return mobileDPI;
	} else {
		return maxDPI;
	}
};

// if cmd + s is pressed, save the canvas'
function saveCanvas(event) {
	console.log("saveCanvas function called");
	if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
		console.log("Save shortcut detected");
		saveArtwork();
		event.preventDefault();
		return false;
	}
}

// Example usage to add an event listener for key presses
document.addEventListener("keydown", saveCanvas);
document.addEventListener("keydown", toggleGuides);

// Function to toggle guide lines visibility
function toggleGuides(event) {
	// Toggle guides when 'g' key is pressed
	if (event.key === "g") {
		let guideContainer = document.querySelector(".guide-container");

		// Create guide container if it doesn't exist
		if (!guideContainer) {
			guideContainer = document.createElement("span");
			guideContainer.className = "guide-container";
			document.querySelector("main").appendChild(guideContainer);
		}

		// Toggle the show class
		guideContainer.classList.toggle("show");
		console.log("Guides toggled");
	}
}

// make a function to save the canvas as a png file with the git branch name and a timestamp
function saveArtwork() {
	var dom_spin = document.querySelector(".spin-container");
	var output_hash = fxhash;
	console.log(output_hash);
	var canvas = document.getElementById("defaultCanvas0");
	var d = new Date();
	var datestring = `${d.getMonth() + 1}` + "_" + d.getDate() + "_" + d.getFullYear() + "_" + `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}_${fxhash}`;
	console.log(canvas);
	var fileName = datestring + ".png";
	const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
	const a = document.createElement("a");
	a.href = imageUrl;
	a.setAttribute("download", fileName);
	a.click();

	//dom_spin.classList.remove("active");
	console.log("saved " + fileName);
}

// url search params
const sp = new URLSearchParams(window.location.search);

/**
 * Shows a loading bar with progress and time estimation
 * @param {number} elapsedTime - Current elapsed time
 * @param {number} maxFrames - Total number of frames
 * @param {number} renderStart - Timestamp when rendering started
 * @param {number} framesRendered - Number of frames rendered so far
 */
function showLoadingBar(elapsedTime, maxFrames, renderStart, framesRendered) {
	let currentTime = Date.now();
	let totalElapsedTime = currentTime - renderStart;

	let percent = (elapsedTime / maxFrames) * 100;
	if (percent > 100) percent = 100;

	let averageFrameTime = totalElapsedTime / framesRendered;
	let remainingFrames = maxFrames - framesRendered;
	let estimatedTimeRemaining = averageFrameTime * remainingFrames;

	// Convert milliseconds to seconds
	let timeLeftSec = Math.round(estimatedTimeRemaining / 1000);

	// put the percent in the title of the page
	document.title = percent.toFixed(0) + "% - Time left : " + timeLeftSec + "s";
}

/**
 * Creates a generator function for animation rendering
 * @param {Object} config - Configuration object
 * @param {Array} config.items - Array of items to animate
 * @param {number} config.maxFrames - Maximum number of frames to render
 * @param {number} config.startTime - Starting frame count
 * @param {number} config.cycleLength - Number of items to process before yielding
 * @param {Function} config.renderItem - Function to render a single item
 * @param {Function} config.moveItem - Function to update item position
 * @param {Function} config.onComplete - Callback when animation is complete
 * @returns {Generator} A generator function that handles the animation
 */
function createAnimationGenerator(config) {
	const {items, maxFrames, startTime, cycleLength, renderItem, moveItem, onComplete} = config;

	let elapsedTime = 0;
	let framesRendered = 0;
	let renderStart = Date.now();
	let drawing = true;
	let totalOperations = items.length * maxFrames;
	let operationsCompleted = 0;
	let currentFrame = 0;

	function* animationGenerator() {
		let count = 0;

		while (drawing) {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				renderItem(item, currentFrame);
				moveItem(item, currentFrame);
				operationsCompleted++;

				if (count > cycleLength) {
					count = 0;
					// Calculate progress based on total operations instead of just frames
					let progress = (operationsCompleted / totalOperations) * maxFrames;
					showLoadingBar(progress, maxFrames, renderStart, framesRendered);

					// Check if we've reached 100%
					if (progress >= maxFrames) {
						drawing = false;
						if (onComplete) {
							onComplete();
						}
						return;
					}

					yield;
				}
				count++;
			}

			currentFrame++;
			elapsedTime = currentFrame;
			framesRendered++;
		}
	}

	return animationGenerator();
}

/**
 * Starts an animation loop using a generator
 * @param {Generator} generator - The animation generator instance
 * @returns {number} The animation timeout ID
 */
function startAnimation(generator) {
	let animation;

	function animate() {
		animation = setTimeout(animate, 0);
		generator.next();
	}

	animate();
	return animation;
}

/**
 * A simple timer utility for measuring execution time
 */
class ExecutionTimer {
	constructor() {
		this.startTime = null;
		this.endTime = null;
	}

	start() {
		this.startTime = Date.now();
		return this;
	}

	stop() {
		this.endTime = Date.now();
		return this;
	}

	getElapsedTime() {
		if (!this.startTime) {
			console.warn("Timer was not started");
			return 0;
		}
		const endTime = this.endTime || Date.now();
		return (endTime - this.startTime) / 1000; // Convert to seconds
	}

	logElapsedTime(message = "Execution completed in") {
		console.log(`${message} ${this.getElapsedTime().toFixed(2)} seconds`);
		return this;
	}

	reset() {
		this.startTime = null;
		this.endTime = null;
		return this;
	}
}
