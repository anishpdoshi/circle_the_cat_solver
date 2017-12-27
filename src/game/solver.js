// Create the environment and dynamics of Circle the Cat for an RL agent

import { GameState, newGame, GAME_STATUS } from './game-state';

// just let gs be the game state
// TODOS - for now we'll do some relatively hefty conversion between state vector and gamestate object. We
// need a better way of doing this going forward since this conversion will happen far more than is necessary, 
// and ideally shouldn't happen at all.
const sToGS = (s) => new GameState({ stateVec: s });

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
		// reward: function(s, a, ns) {
		// 	// todo -> understand why this fn is associated with the transition from s->ns and not with the states themselves
		// 	// given that it is associated with the transition, though, assign -5 to a losing move and +5 to a winning move,
		// 	// regardless of prior state/action taken to get to next state
		// 	const nextGS = sToGS(ns);
		// 	if (nextGS.isCatWon()) {
		// 		return -5;
		// 	} else if (nextGS.isHumanWon()) {
		// 		return 5;
		// 	}
		// 	return 0;
		// },
		// nextStateDistribution: function(s, a) {

		// },
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
