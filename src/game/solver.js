// Create the environment and dynamics of Circle the Cat for an RL agent
import { GameState, newGame, GAME_STATUS } from './game-state';

const createAgent = () => {

	const env = {
		getNumStates: function() {
			// possibly over-dimensional
			// 121 for each tile, 2 for the position of the cat (row/col)
			return 121 + 2; 
		},
		getMaxNumActions: function() {
			// At most 121 possible placements of the dot. Of course there are really at most 120 cause of the cat,
			// and in practice less cause of initial positions, but using 121 makes it easier.
			return 121;
		},
		allowedActions: function(s) {
			const allowed = [];
			const catInd = (s[s.length - 2] * 11) + s[s.length - 1];

			s.slice(0, -2).forEach((el, i) => {
				if (el === 0 && i !== catInd) {
					allowed.push(i);
				}
			});

			return allowed;
		},

	}

	const spec = {
		gamma: 0.9,
		alpha: 0.005,
		num_hidden_units: 200
		// override options here,
		// TODO - grid search
	}

	return new RL.DQNAgent(env, spec);
}

const rewardFromGS = (gs) => {
	if (gs.isCatWon()) {
		return -10;
	} else if (gs.isHumanWon()) {
		return 10;
	}
	return 0;
};

export { createAgent, rewardFromGS };
