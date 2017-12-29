// todo - is this really worth it?
import chunk from 'lodash-es/chunk';
import flatten from 'lodash-es/flatten';
import range from 'lodash-es/range';
import sampleSize from 'lodash-es/sampleSize';
import minBy from 'lodash-es/minBy';

const SQUARES = 121;
const LENGTH = 11;

const GAME_STATUS = {
	PLAYING: 'playing',
	CAT_WON: 'cat-won',
	HUMAN_WON: 'human-won',
}

// Treat as immutable
const ALL_LOCATIONS = flatten(range(LENGTH).map((i) => {
	return range(LENGTH).map((j) => {
		return { row: i, col: j };
	});
}));

// todo -> optimize and include a (greedyEdge) option or equivalent
// that finds a win in this function itself
const getNeighboring = ({ row, col }) => {
	const neighborings = [];

	const addloc = (rowv, colv) => neighborings.push({
		row: rowv,
		col: colv
	});

	if (row > 0) {
		addloc(row - 1, col);
		if (row % 2 === 0) {
			if (col > 0) {
				addloc(row - 1, col - 1);
			}
		} else {
			if (col < LENGTH - 1) {
				addloc(row - 1, col + 1);
			}
		}
	}

	if (row < LENGTH - 1) {
		addloc(row + 1, col);
		if (row % 2 === 0) {
			if (col > 0) {
				addloc(row + 1, col - 1);
			}
		} else {
			if (col < LENGTH - 1) {
				addloc(row + 1, col + 1);
			}
		}
	}

	if (col > 0) {
		addloc(row, col - 1);
	}

	if (col < LENGTH - 1) {
		addloc(row, col + 1);
	}

	return neighborings;
}

const indexToRC = (index) => [Math.floor(index / LENGTH), index % LENGTH];
const rcToIndex = (row, col) => (row * LENGTH) + col;

// cat pos array of row, col
const GameState = function({ stateVec, initialLocations, catpos }) {
	if (stateVec) {
		this.state = stateVec.slice(0, 121);
		this.catRC = stateVec.slice(122);
	} else {
		this.state = new Int8Array(SQUARES);
		this.catRC = catpos;

		initialLocations.forEach(({ row, col }) => {
			this.state[rcToIndex(row, col)] = 1;
		});
	}
	this.gameStatus = GAME_STATUS.PLAYING; // for now
}

GameState.prototype.asStateVector = function(row, col) {
	return [...this.state, this.catRC[0], this.catRC[1]];
}

GameState.prototype.getValidNeighbors = function([row, col]) {
	return getNeighboring({ row, col }).filter(({ row, col }) => {
		return this.state[rcToIndex(row, col)] === 0;
	});
}

GameState.prototype.click = function(row, col) {
	this.state[rcToIndex(row, col)] = 1;
}

// todo - balance out accessors (have to update getValidNeighbors to do this. maybe ju)
GameState.prototype.moveCat = function({ row, col }) {
	this.catRC = [row, col]; //validation is for dummies
}

GameState.prototype.updateStatus = function() {
	if (this.isCatWon()) {
		this.gameStatus = GAME_STATUS.CAT_WON;
	} else if (this.isHumanWon()) {
		this.gameStatus = GAME_STATUS.HUMAN_WON;
	} else {
		this.gameStatus = GAME_STATUS.PLAYING;	
	}
}

// Return a reasonably good choice for the cat's move. For the agent human, trainer cat purpose.
GameState.prototype.getCatChoice = function() {

	const choices = this.getValidNeighbors(this.catRC);
	if (choices.length === 0) {
		return; // this shouldn't have beene called...
	}

	// // random strat
	// const choice = sampleSize(choices, 1)[0];

	// // slightly better strat - try to move to a tile as close to the edge as possible
	// const choicesByMinEdgeDistance = choices
	// 	// .map(({ row, col }) => {
	// 	// 	return Math.min(row, LENGTH - 1 - row, col, LENGTH - 1 - col);
	// 	// }).sort((choiceA, choiceB) => choiceA - choiceB);
	// 	.sort((choiceA, choiceB) => {
	// 		const { row: rowA, col: colA } = choiceA;
	// 		const { row: rowB, col: colB } = choiceB;
	// 		const choiceAMinEdgeDistance = Math.min(rowA, LENGTH - 1 - rowA, colA, LENGTH - 1 - colA);
	// 		const choiceBMinEdgeDistance = Math.min(rowB, LENGTH - 1 - rowB, colB, LENGTH - 1 - colB);
	// 		return choiceAMinEdgeDistance - choiceBMinEdgeDistance;
	// 	});
	// const choice = choicesByMinEdgeDistance[0];

	// even better strat -> do above, but if there are multiple optimal choices, randomly select one
	const choicesWithMinEdgeDistance = choices.map((choice) => {
		return {
			choice: choice,
			minEdgeDistance: Math.min(choice.row, LENGTH - 1 - choice.row, choice.col, LENGTH - 1 - choice.col)
		}
	});

	const minMinEdgeDistance = minBy(choicesWithMinEdgeDistance, 'minEdgeDistance').minEdgeDistance;

	const allBests = choicesWithMinEdgeDistance.filter((o) => o.minEdgeDistance === minMinEdgeDistance);

	const choice = sampleSize(allBests, 1)[0].choice;

	return choice;
}

GameState.prototype.isCatWon = function() {
	const [row, col] = this.catRC;

	// todo - differentiate by edge/or more for animation purposes
	return row === 0 || row === LENGTH - 1 || col === 0 || col === LENGTH - 1; 
}

GameState.prototype.isHumanWon = function() {
	return this.getValidNeighbors(this.catRC).length === 0;
}

GameState.prototype.getAsModedRows = function() {
	// todo -> this kinda sucks. there should be a way to do this without
	// having to convert to regular array. speaks to larger question of reupdating state necessities
	const grid = chunk(Array.from(this.state).map((val) => {
		return {
			mode: val === 1 ? 'fill' : 'empty'
		};
	}), LENGTH);

	const [catR, catC] = this.catRC;
	grid[catR][catC] = {
		mode: 'cat'
	};
	return grid;
}

GameState.prototype.getAsRows = function() {
	return chunk(this.state, LENGTH);
}

const createNewGameState = ({ numInitials }) => {
	// todo -> what should the default val be?
	const initialLocations = sampleSize(ALL_LOCATIONS, numInitials ? numInitials : 0);
	return new GameState({
		initialLocations: initialLocations, 
		catpos: [5, 5]
	});
}


export { GameState, createNewGameState as newGame, GAME_STATUS };