let State = {
	OFF: 0, // cell state
	ON: 1, // cell state
	MARKED: 2, // cell state

	UNSOLVED: 0, // row/column state
	SOLVED: 1 // row/column state
};

let p;

let PuzzleGUI = function() {

	this.render = function (puzzle) {
		let htmlElem = $("#puzzle");
		htmlElem.empty();

		for (let y = 0; y < puzzle.height; y++) {
			let r = this.newRow();
			for (let x = 0; x < puzzle.width; x++) {
				r.append(this.newCell(puzzle.grid[x][y]));
			}

			r.append(this.newSum(puzzle.sumRow(y, puzzle.solution)));

			htmlElem.append(r);
		}
		let r = this.newRow();
		for (let x = 0; x < puzzle.width; x++) {
			r.append(this.newSum(puzzle.sumColumn(x, puzzle.solution)));
		}
		htmlElem.append(r);
	};

	this.updateCellState = function (row, col, state) {
		$("#puzzle").children().eq(row).children().eq(col).attr("state", state);
	};

	this.updateColumnState = function (col, state) {
		$("#puzzle").children().last().children().eq(col).attr("state", state);
	};

	this.updateRowState = function (row, state) {
		$("#puzzle").children().eq(row).children().last().attr("state", state);
	};

	this.newRow = function () {
		return $("<div />").addClass("row");
	};

	this.newCell = function (value) {
		return $("<div/>").addClass("cell").html(value).attr("state", State.ON);
	};

	this.newSum = function (sum) {
		return $("<div/>").addClass("sum").html(sum).attr("state", State.UNSOLVED);
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
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				if(this.solution[x][y] == State.OFF && this.state[x][y] != State.OFF
					|| this.state[x][y] == State.OFF && this.solution[x][y] != State.OFF) {
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

	this.genericSum = function (x, xInc, y, yInc, n, mask, grid) {
		let s = 0;
		for (let i = 0; i < n; i++, x += xInc, y += yInc) {
			if(mask[x][y] != State.OFF) {
				s += grid[x][y];
			}
		}

		return s;
	};

	this.sumRow = function (row, mask) {
		return this.genericSum(0, 1, row, 0, this.width, mask, this.grid);
	};

	this.sumColumn = function (column, mask) {
		return this.genericSum(column, 0, 0, 1, this.height, mask, this.grid);
	};

	this.generate = function(){
		this.grid = arrayFillRandom(this.width, this.height, this.min, this.max);
		this.solution = arrayFill(this.width, this.height, State.ON);
		this.state = arrayFill(this.width, this.height, State.ON);

		let rand;
		let i = 0;
		while (i < this.width) {
			let r = i++;
			do rand = randBetween(0, this.height - 1); while (this.solution[r][rand] == State.OFF);
			this.solution[r][rand] = State.OFF;
		}
		i = 0;
		while (i < this.height) {
			let c = i++;
			do rand = randBetween(0, this.width - 1); while (this.solution[rand][c] == State.OFF);
			this.solution[rand][c] = State.OFF;
		}

		printGrid(this.solution)
	};
};


let printGrid = function (grid) {
	for (let y = 0; y < p.height; y++) {
		let r = "";
		for (let x = 0; x < p.width; x++) {
			r += grid[x][y] + " ";
		}

		log(r);
	}
};

let log = function (line) {
	$("#solution").append($("<div/>").html(line));
};

let fisherYates = function (a) {
	for (let i = 0; i < a.length - 2; i++) {
		let j = randBetween(i, a.length - 1);
		let temp = a[i];
		a[i] = a[j];
		a[j] = temp;
	}

	return a;
};

let arrayFill = function (width, height, value) {
	let a = [];
	for (let y = 0; y < height; y++) {
		a.push((new Array(width)).fill(value));
	}

	return a;
};

let arrayFillRandom = function (width, height, min, max) {
	let a = [];
	for (let y = 0; y < height; y++) {
		let row = [];
		for (let x = 0; x < width; x++) {
			row.push(randBetween(min, max));
		}
		a.push(row);
	}

	return a;
};

let randBetween = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

$(document).ready(function () {
	$("#start").click(function () {
		$("#solution").empty();

		let pGUI = new PuzzleGUI();

		p = new Puzzle(5, 5, 1, 9, pGUI);
		p.generate();

		pGUI.render(p);
	});
	$("#show_solution").click(function () {
		$("#solution").toggle();
	});


	let start;
	$("#puzzle").on("mousedown", ".cell", function () {
		start = new Date().getTime();
	}).on("mouseleave", ".cell", function () {
		start = 0;
	}).on("mouseup", ".cell", function () {
		let col = $(this).index();
		let row = $(this).parent().index();

		if(new Date().getTime() >= (start + 300)) {
			p.off(row, col);
		} else {
			p.mark(row, col);
		}
	});
});
