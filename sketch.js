//written by Andrew Ferrin
var testModel;

var cellImage = null;

(async function() {
	console.log("Loading Model");
	testModel = await tf.loadLayersModel('model/saved_model_json/model.json');
	console.log("Model Loaded");
})();

const CELL_SIZE = 20;
const NUMBER_OF_CELLS = 28;
const GRID_SIZE = CELL_SIZE * NUMBER_OF_CELLS;
let cells = new Array(NUMBER_OF_CELLS);

const GRID_PADDING = 10;

var guesses = Array(10);

let slider;
let textInput;
let eraseButton;
let imageArray = new Array(NUMBER_OF_CELLS);
let randomCircles;

function setup() {
	createCanvas(max(windowWidth, 1200), max(windowHeight, 800));
	alert("Move the slider to adjust grayscale value. left click and drag to draw. Right click and drag to erase");
    	randomCircles = new Array(8);

    	colorMode(RGB);
	
	for(let i = 0; i < guesses.length; i++) {
    		guesses[i] = {digit: i, confidence: 0};
    	}

	for(var y = 0; y < cells.length; y++) {
		cells[y] = new Array(NUMBER_OF_CELLS);
		for(var x = 0; x < cells[y].length; x++) {
			cells[y][x] = new Cell(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
		}
	}

	for(var y = 0; y < imageArray.length; y++) {
		imageArray[y] = new Array(NUMBER_OF_CELLS);
		for(var x = 0; x < imageArray[y].length; x++) {
			imageArray[y][x] = 0;
		}
	}

	for(var i = 0; i < randomCircles.length; i++) {
		var radius = random(30, 150);
		randomCircles[i] = new Ball(random(radius, width - radius), random(radius, height - radius), radius);
	}

  	eraseButton = createButton("Erase All");
  	eraseButton.position(GRID_PADDING * 2, GRID_PADDING);
	
  	eraseButton.style("width", (width - GRID_SIZE) / 2.0 - (GRID_PADDING * 4) + "px");
  	eraseButton.style("height", (GRID_SIZE  / 4) + "px");
	eraseButton.style("background-color", "white");
  	eraseButton.style("border", "5px solid #000000");
  	eraseButton.style("color", "black");
	eraseButton.style("text-align", "center");
	eraseButton.style("font-size", "50px");
	eraseButton.mouseOver(onErase).mouseOut(offErase);
  	eraseButton.mousePressed(eraseAll);
	
	slider = createSlider(0, 255, 0, 0);
	slider.style('width', (width / 2 - GRID_SIZE / 2 - GRID_PADDING * 4) + 'px');
	slider.position(GRID_PADDING * 2, eraseButton.y + eraseButton.height + GRID_PADDING * 2);
}

function onErase() {
	eraseButton.style("background-color", "#c4c4c4");
}

function offErase() {
	eraseButton.style("background-color", "white");
}

function eraseAll() {
	for(var y = 0; y < cells.length; y++) {
		for(var x = 0; x < cells[y].length; x++) {
			cells[y][x].fillColor = color(255);
		}
	}
}

function predict() {
	cellImage = createImage(28, 28);
	for(var y = 0; y < cells.length; y++) {
    		for(var x = 0; x < cells[y].length; x++) {
			cellImage.set(x, y, cells[y][x].fillColor, (red(cells[y][x].fillColor) == 255) ? (0) : (255));
       			imageArray[y][x] = map(red(cells[y][x].fillColor), 5, 1, 0);
    		}
    	}
	cellImage.updatePixels();
	var predictions = testModel.predict(tf.expandDims(imageArray)).array().then(function(preds) {
		preds = preds[0];
		for(let i = 0; i < preds.length; i++) {
    			guesses[i] = {digit: i, confidence: preds[i]};
			console.log("Number: " + guesses[i].digit + " Confidence: " + guesses[i].confidence);
		}
		//sorts the list based on the confidence
		guesses.sort(function(x, y) {
			return x.confidence - y.confidence;
		});
		guesses.reverse();
		console.table(guesses);
	});
}

function draw() {
	background(255);

	for(var i = 0; i < randomCircles.length; i++) {
		randomCircles[i].update();
		randomCircles[i].drawLines(randomCircles);
		randomCircles[i].show();
	}

    	showCells();
    	drawColorRect();
	
	if(cellImage != null) {
		let colorRectY = slider.y + slider.height + GRID_PADDING * 1.5;
		let colorRectHeight = ((GRID_SIZE + GRID_PADDING) - (slider.y + slider.height + GRID_PADDING * 1.5)) / 2;
		let imageStartY = colorRectY + colorRectHeight + GRID_PADDING;
		let imgSize = ((GRID_SIZE + GRID_PADDING) - (imageStartY)) - GRID_PADDING;
		image(cellImage, GRID_PADDING * 2 + slider.width / 2 - imgSize / 2, imageStartY, imgSize, imgSize);
	}
	
	fill(255, 200);
	noStroke();
	rect(width / 2 + GRID_SIZE / 2 + GRID_PADDING * 2, GRID_PADDING, width / 2 - GRID_SIZE / 2 - GRID_PADDING * 4, GRID_SIZE);
	
	push();
	translate(0, GRID_PADDING * 10);
	for(let i = 0; i < 4; i++) {
    		fill(0, map(i, 0, 4, 255, 10));
		let sizeOfText = (i == 0) ? (100) : (50);
		textSize(sizeOfText);
		textAlign(CENTER, BOTTOM);
    		text(guesses[i].digit + "", (width / 2 + GRID_SIZE / 2) + (width - GRID_SIZE) / 4, GRID_PADDING * 10 + 110 * i);
		let amountMore = textWidth(guesses[i].digit + "") / 2.0;
		
		textSize(sizeOfText / 5);
		textAlign(LEFT, BOTTOM);
		text((guesses[i].confidence * 100).toFixed(5) + "%", (width / 2 + GRID_SIZE / 2) + (width - GRID_SIZE) / 4 + (amountMore * 4 / 5.0), GRID_PADDING * 10 + 110 * i);
    	}
	pop();
}

function mouseDragged() {
	evaluateCell();
}

function mousePressed() {
	evaluateCell();
}

function mouseReleased() {
	//predicts the number once the user releases 
	//their mouse (once they are done drawing)
	predict();
}

function evaluateCell() {
	if((mouseX >= width / 2 - GRID_SIZE / 2 && mouseX <= width / 2 + GRID_SIZE / 2) && (mouseY >= GRID_PADDING && mouseY <= GRID_SIZE + GRID_PADDING)) {
    	var gridMouse = createVector(mouseX - (width / 2 - GRID_SIZE / 2), mouseY - GRID_PADDING);
    	var cellSelected = createVector(parseInt(gridMouse.x / CELL_SIZE), parseInt(gridMouse.y / CELL_SIZE));
    	if(mouseButton == LEFT) {
    		if(slider.value() < red(cells[cellSelected.y][cellSelected.x].fillColor)) {
      			cells[cellSelected.y][cellSelected.x].fillColor = color(slider.value());
  			}
  		} else {
  			cells[cellSelected.y][cellSelected.x].fillColor = color(255);
  		}
    }
}

function drawColorRect() {
	strokeWeight(1);
    	stroke(0);
	fill(slider.value());
    	rect(GRID_PADDING * 2, slider.y + slider.height + GRID_PADDING * 1.5, slider.width, ((GRID_SIZE + GRID_PADDING) - (slider.y + slider.height + GRID_PADDING * 1.5)) / 2);
}

function showCells() {
  	push();
	translate(width / 2 - (GRID_SIZE) / 2, GRID_PADDING);
	for(var y = 0; y < cells.length; y++) {
		for(var x = 0; x < cells[y].length; x++) {
			cells[y][x].show();
		}
	}
	pop();
}

class Cell {
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.fillColor = color(255);
		this.strokeColor = color(0);
	}

	show() {
		noFill();
		strokeWeight(2);
        	fill(this.fillColor);
		stroke(this.strokeColor);
		rect(this.x, this.y, this.size, this.size);
	}
}

class Ball {
	constructor(x, y, radius) {
		this.position = createVector(x, y);
		this.velocity = createVector(random(-3, 3), random(-3, 3));
		this.radius = radius;
		this.alpha = random(30, 50);
	}

	update() {
		this.position.add(this.velocity);
		if(this.position.x - this.radius <= 0) {
			this.position.x = this.radius;
			this.velocity.x *= -1;
		} else if(this.position.x + this.radius >= width) {
			this.position.x = width - this.radius;
			this.velocity.x *= -1;
		}

		if(this.position.y - this.radius <= 0) {
			this.position.y = this.radius;
			this.velocity.y *= -1;
		} else if(this.position.y + this.radius >= height) {
			this.position.y = height - this.radius;
			this.velocity.y *= -1;
		}
		this.alpha = map(sin((frameCount + this.radius) / 60), -1, 1, -30, 30);
	}

	drawLines(balls) {
		for(let i = 0; i < balls.length; i++) {
			let d = dist(balls[i].position.x, balls[i].position.y, this.position.x, this.position.y);
			if(d > 0 && d < balls[i].radius + this.radius + (GRID_PADDING * 10)) {
				strokeWeight(2);
				stroke(0, min(map(d, 0, balls[i].radius + this.radius + (GRID_PADDING * 10), 255, 0), this.alpha) * 0.5);
				line(balls[i].position.x, balls[i].position.y, this.position.x, this.position.y);
			}
		}
	}

	show() {
		fill(0, this.alpha);
		noStroke();
		ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
	}
}
