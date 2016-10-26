let State = {
	OFF: 0, // cell state
	ON: 1, // cell state
	MARKED: 2, // cell state

	UNSOLVED: 0, // row/column state
	SOLVED: 1 // row/column state
};

let PuzzleGUI = function(elem) {

	this.htmlElem = elem;

	this.render = function (puzzle) {
		this.htmlElem.empty();

		let r = this.newRow();
		r.append(this.emptyCell());
		for (let col = 0; col < puzzle.width; col++){
			r.append(this.newSum(puzzle.sumColumn(col, puzzle.solution)));
		}
		r.append(this.emptyCell());
		this.htmlElem.append(r);
		for (let row = 0; row < puzzle.height; row++) {
			r = this.newRow();
			r.append(this.newSum(puzzle.sumRow(row, puzzle.solution)));
			for (let col = 0; col < puzzle.width; col++) {
				r.append(this.newCell(puzzle.grid[col][row]));
			}
			r.append(this.newSum(0));

			this.htmlElem.append(r);
		}
		r = this.newRow();
		r.append(this.emptyCell());
		for (let col = 0; col < puzzle.width; col++) {
			r.append(this.newSum(0));
		}
		r.append(this.emptyCell());
		this.htmlElem.append(r);
	};

	this.updateCellState = function (row, col, state) {
		this.htmlElem.children().eq(row + 1).children().eq(col + 1).attr("state", state);
	};

	this.updateColumnState = function (col, state) {
		this.htmlElem.children().first().children().eq(col + 1).attr("state", state);
		this.htmlElem.children().last().children().eq(col + 1).attr("state", state);
	};

	this.updateRowState = function (row, state) {
		this.htmlElem.children().eq(row + 1).children().first().attr("state", state);
		this.htmlElem.children().eq(row + 1).children().last().attr("state", state);
	};

	this.newRow = function () {
		return $("<div />").addClass("row");
	};

	this.emptyCell = function(){
		return $("<div />").addClass("cell");
	};

	this.newCell = function (value) {
		return $("<div />").addClass("cell").html(value).attr("state", State.ON);
	};

	this.newSum = function (sum) {
		return $("<div />").addClass("sum").html(sum).attr("state", State.UNSOLVED);
	}
};

let Puzzle = function(width, height, min, max, gui) {

	this.width = width;
	this.height = height;
	this.min = min;
	this.max = max;
	this.gui = gui;

	this.solution = [];
	this.state = [];
	this.grid = [];

	this.mark = function (row, col) {
		if(this.state[col][row] != State.OFF) {
			this.toggle(row, col, State.ON, State.MARKED);
		}
	};

	this.off = function (row, col) {
		if(this.state[col][row] != State.MARKED) {
			this.toggle(row, col, State.ON, State.OFF);
		}

		this.updateRowState(row);
		this.updateColumnState(col);

		if(this.checkSolution()) {
			alert("Finished!");
		}
	};

	this.setState = function (row, col, state) {
		this.state[col][row] = state;
		this.gui.updateCellState(row, col, state);
	};

	this.toggle = function (row, col, opt1, opt2) {
		this.setState(row, col, this.state[col][row] == opt1 ? opt2 : opt1);
	};

	this.checkSolution = function () {
		for (let col = 0; col < this.width; col++) {
			for (let row = 0; row < this.height; row++) {
				if(this.solution[col][row] == State.OFF && this.state[col][row] != State.OFF
					|| this.state[col][row] == State.OFF && this.solution[col][row] != State.OFF) {
					return false;
				}
			}
		}

		return true;
	};

	this.updateColumnState = function (col) {
		let sum = this.sumColumn(col, this.state);
		let aim = this.sumColumn(col, this.solution);

		this.gui.updateColumnState(col, sum == aim ? State.SOLVED : State.UNSOLVED);
	};

	this.updateRowState = function (row) {
		let sum = this.sumRow(row, this.state);
		let aim = this.sumRow(row, this.solution);

		this.gui.updateRowState(row, sum == aim ? State.SOLVED : State.UNSOLVED);
	};

	this.genericSum = function (x, xInc, y, yInc, n, mask) {
		let s = 0;
		for (let i = 0; i < n; i++, x += xInc, y += yInc) {
			if(mask[x][y] != State.OFF) {
				s += this.grid[x][y];
			}
		}

		return s;
	};

	this.sumRow = function (row, mask) {
		return this.genericSum(0, 1, row, 0, this.width, mask);
	};

	this.sumColumn = function (column, mask) {
		return this.genericSum(column, 0, 0, 1, this.height, mask);
	};

	this.generate = function(){
		this.grid = arrayFillRandom(this.width, this.height, this.min, this.max);
		this.solution = arrayFill(this.width, this.height, State.ON);
		this.state = arrayFill(this.width, this.height, State.ON);

		let rand;
		for (let col = 0; col < this.width; col++){
			do {
				rand = randBetween(0, this.height - 1);
			} while (this.solution[col][rand] == State.OFF);
			this.solution[col][rand] = State.OFF;
		}
		for (let row = 0; row < this.height; row++){
			do {
				rand = randBetween(0, this.width - 1);
			} while (this.solution[rand][row] == State.OFF);
			this.solution[rand][row] = State.OFF;
		}

		printGrid(this.solution)
	};

	this.reset = function(){
		for (let col = 0; col < this.width; col++){
			this.gui.updateColumnState(col, State.UNSOLVED);
			for (let row = 0; row < this.height; row++){
				this.setState(row, col, State.ON);
				if (col == 0){
					this.gui.updateRowState(row, State.UNSOLVED);
				}
			}
		}
	}
};


let printGrid = function (grid) {
	for (let row = 0; row < p.height; row++) {
		let r = "";
		for (let col  = 0; col < p.width; col ++) {
			r += grid[col][row] + " ";
		}

		log(r);
	}
};

let log = function (line) {
	$("#solution").append($("<div/>").html(line));
};

let arrayFill = function (width, height, value) {
	let a = [];
	for (let col = 0; col < width; col++) {
		a.push((new Array(height)).fill(value));
	}

	return a;
};

let arrayFillRandom = function (width, height, min, max) {
	let a = [];
	for (let col = 0; col < width; col++) {
		let colData = [];
		for (let row = 0; row < height; row++) {
			colData.push(randBetween(min, max));
		}
		a.push(colData);
	}

	return a;
};

let randBetween = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

var p; // puzzle

$(document).ready(function () {
	let htmlElem = $("#puzzle");
	let pGUI = new PuzzleGUI(htmlElem);

	$("#start").click(function () {
		$("#solution").empty().hide(0);

		p = new Puzzle(6, 8, 1, 9, pGUI);
		p.generate();

		pGUI.render(p);
	});
	$("#show_solution").click(function () {
		$("#solution").toggle();
	});
	$("#reset").click(function(){
		if (typeof p !== "undefined"){
			p.reset();
		}
	});


	let start;
	htmlElem.on("mousedown", ".cell", function () {
		start = new Date().getTime();
	}).on("mouseleave", ".cell", function () {
		start = 0;
	}).on("mouseup", ".cell", function () {
		let col = $(this).index() - 1;
		let row = $(this).parent().index() - 1;

		if(new Date().getTime() >= (start + 300)) {
			p.off(row, col);
		} else {
			p.mark(row, col);
		}
	});
});
