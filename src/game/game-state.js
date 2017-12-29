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

const GameState = function({ stateVec, initialLocations, catpos }) {
	if (stateVec) {
		this._state = stateVec.slice(0, -2);
		this._catloc = {
			row: stateVec[stateVec.length - 2],
			col: stateVec[stateVec.length - 1]
		};
	} else {
		this._state = Array(SQUARES).fill(0);
		this._catloc = catpos;
		this._gameStatus = GAME_STATUS.PLAYING; // todo -> should we differentiate between human to move/cat to move?

		initialLocations.forEach(({ row, col }) => {
			this._state[(row * LENGTH) + col] = 1;
		});
	}

	// this._validNexts = this._state.map((i) => )
}

GameState.prototype.toStateVector = function() {
	return this._state.concat([this._catloc.row, this._catloc.col]);
}

GameState.prototype.getValidNeighbors = function(loc) {
	return getNeighboring(loc).filter(({ row, col }) => {
		return this._state[(row * LENGTH) + col] === 0;
	});
}

GameState.prototype.isClickable = function(row, col) {
	return this._state[(row * LENGTH) + col] === 0
		&& !(row == this._catloc.row && col === this._catloc.col);
}

GameState.prototype.click = function({ row, col }) {
	if (!this.isClickable(row, col)) {
		console.log(`Error - circle at (${row}, ${col}) isn't clickable!`);
		return;
	} else {
		this._state[(row * LENGTH) + col] = 1;
	}
	return this;
}

GameState.prototype.isCatWon = function() {
	const { row, col } = this._catloc;

	// todo - differentiate by edge/or more for animation purposes
	return row === 0 || row === LENGTH - 1 || col === 0 || col === LENGTH - 1; 
}

GameState.prototype.isHumanWon = function() {
	return this.getValidNeighbors(this._catloc).length === 0;
}

GameState.prototype.moveCat = function() {

	// todo - differentiate by edge/or more for animation purposes
	if (this.isCatWon()) {
		this._gameStatus = GAME_STATUS.CAT_WON;
		return this;
	}

	const choices = this.getValidNeighbors(this._catloc);
	if (choices.length === 0) {
		this._gameStatus = GAME_STATUS.HUMAN_WON;
		return this;
	}

	// // random strat
	// const choice = sampleSize(choices, 1)[0];

	// slightly better strat - try to move to a tile as close to the edge as possible
	const choicesByMinEdgeDistance = choices
		// .map(({ row, col }) => {
		// 	return Math.min(row, LENGTH - 1 - row, col, LENGTH - 1 - col);
		// }).sort((choiceA, choiceB) => choiceA - choiceB);
		.sort((choiceA, choiceB) => {
			const { row: rowA, col: colA } = choiceA;
			const { row: rowB, col: colB } = choiceB;
			const choiceAMinEdgeDistance = Math.min(rowA, LENGTH - 1 - rowA, colA, LENGTH - 1 - colA);
			const choiceBMinEdgeDistance = Math.min(rowB, LENGTH - 1 - rowB, colB, LENGTH - 1 - colB);
			return choiceAMinEdgeDistance - choiceBMinEdgeDistance;
		});
	const choice = choicesByMinEdgeDistance[0];

	// // best strat -> do above, but if there are multiple optimal choices, randomly select one
	// const choicesWithMinEdgeDistance = choices.map((choice) => {
	// 	return {
	// 		choice: choice,
	// 		minEdgeDistance: Math.min(choice.row, LENGTH - 1 - choice.row, choice.col, LENGTH - 1 - choice.col)
	// 	}
	// });

	// const minMinEdgeDistance = minBy(choicesWithMinEdgeDistance, 'minEdgeDistance').minEdgeDistance;

	// const allBests = choicesWithMinEdgeDistance.filter((o) => o.minEdgeDistance === minMinEdgeDistance);

	// const choice = sampleSize(allBests, 1)[0].choice;

	this._catloc = choice;
	return this;
}

GameState.prototype.getGameStatus = function() {
	return this._gameStatus;
}

GameState.prototype.getClickableTiles = function() {
	return ALL_LOCATIONS.filter(({ row, col }) => this.isClickable(row, col));
}

GameState.prototype.getAsModedRows = function() {
	return chunk(this._state.map((val, ind) => {
		if ((this._catloc.row * LENGTH) + this._catloc.col === ind) {
			return {
				mode: 'cat'
			};
		}
		return {
			mode: val === 1 ? 'fill' : 'empty'
		};
	}), LENGTH)
	return chunk(this._state, LENGTH);
}

GameState.prototype.getAsRows = function() {
	return chunk(this._state, LENGTH);
}

const createNewGameState = ({ numInitials }) => {
	// todo -> what should the default val be?
	const initialLocations = sampleSize(ALL_LOCATIONS, numInitials ? numInitials : 0);
	return new GameState({
		initialLocations: initialLocations, 
		catpos: { row: 5, col: 5}
	});
}

export { GameState, createNewGameState as newGame, GAME_STATUS };