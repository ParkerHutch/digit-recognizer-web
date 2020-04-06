const CELL_SIZE = 20;
const NUMBER_OF_CELLS = 28;
const GRID_SIZE = CELL_SIZE * NUMBER_OF_CELLS;
let cells = new Array(NUMBER_OF_CELLS);

const GRID_PADDING = 10;

let slider;
let textInput;
let submitButton;
let imageArray = new Array(NUMBER_OF_CELLS);
let randomCircles;


//written by Andrew Ferrin
function setup() {
	createCanvas(windowWidth, windowHeight);

    randomCircles = new Array(25);

    colorMode(RGB);

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

	slider = createSlider(0, 255, 0, 0);
	slider.style('width', GRID_SIZE + 'px');
	slider.position(width / 2 - GRID_SIZE / 2, GRID_SIZE + GRID_PADDING * 2);

	submitButton = createButton("Make Guess");
	submitButton.position(slider.x, slider.y + GRID_PADDING * 6);
	submitButton.style("width", GRID_SIZE + "px");
  	submitButton.mousePressed(createPNG);
}

function createPNG() {
    var img = createImage(NUMBER_OF_CELLS, NUMBER_OF_CELLS);
    img.loadPixels();    
    for(var y = 0; y < cells.length; y++) {
    	for(var x = 0; x < cells[y].length; x++) {
       		img.set(x, y, cells[y][x].fillColor);
       		imageArray[y][x] = map(cells[y][x].fillColor, 0, 255, 1, 0);
    	}
    }

    img.updatePixels();
    img.save('image', "png");
}

function draw() {
	background(255);

	for(var i = 0; i < randomCircles.length; i++) {
		randomCircles[i].update();
		randomCircles[i].show();
	}

    showCells();
    drawColorRect();
}

function mouseDragged() {
	evaluateCell();
}

function mousePressed() {
	evaluateCell();
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
    rect(width / 2 - GRID_SIZE / 2, slider.y + GRID_PADDING * 3, GRID_SIZE, GRID_PADDING * 2);
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
		this.alpha = random(30, 150);
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
	}

	show() {
		fill(0, this.alpha);
		noStroke();
		ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
	}
}