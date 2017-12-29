import React, { Component } from 'react';
import GameBoard from './GameBoard';
import { GameState, newGame, GAME_STATUS } from '../game/game-state';
import { createAgent, rewardFromGS } from '../game/solver';
import chunk from 'lodash-es/chunk';
import mean from 'lodash-es/mean';

// Slider for game speed
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

// Training controller
class TrainingView extends Component {
  constructor(props) {
    super(props);

    this.startTraining = this.startTraining.bind(this);
    this.pauseTraining = this.pauseTraining.bind(this);
    this.resetAgent = this.resetAgent.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.downloadAgent = this.downloadAgent.bind(this);

    this.state = {
      agent: createAgent(),
      gameState: newGame({ numInitials: 7 }),
      trainingSpeed: 50,
      status: 'idle',
      // game stats
      numHumanWins: 0,
      numCatWins: 0,
      last5Games: [0.0, 0.0, 0.0, 0.0, 0.0]
    };
  }

  startTraining() {
    // todo - episodics
    if (this.state.status === 'training') {
      return;
    }

    const trainingInterval = setInterval(() => {
      const { agent, gameState } = this.state;

      const action = agent.act(gameState.toStateVector());
      // action is the index of the tile to click

      gameState.click({
        row: Math.floor(action / 11), // javascript ??????
        col: action % 11
      });
      gameState.moveCat();
      agent.learn(rewardFromGS(gameState));
      this.setState({
        agent: agent,
        gameState: gameState
      });

      const isHumanWon = gameState.isHumanWon();
      const isCatWon = gameState.isCatWon();
      if (isHumanWon || isCatWon) {
        this.setState({
          agent: agent,
          gameState: newGame({ numInitials: 7 }),
          numHumanWins: this.state.numHumanWins + (isHumanWon ? 1 : 0),
          numCatWins: this.state.numCatWins + (isCatWon ? 1 : 0),
          last5Games: this.state.last5Games.slice(1).concat([isHumanWon ? 1.0 : 0.0])
        });
      }
    }, this.state.trainingSpeed);
    this.setState({
      trainingInterval: trainingInterval,
      status: 'training'
    });
  }

  pauseTraining() {
    clearInterval(this.state.trainingInterval);
    this.setState({ status: 'idle' });
  }

  resetAgent() {
    this.pauseTraining();
    this.setState({
      agent: createAgent(),
      gameState: newGame({ numInitials: 7 }),
    });
  }

  downloadAgent() {
    if (this.state.agent) {
      this.pauseTraining();
      const agentRepr = this.state.agent.toJSON();
      const agentJSON = JSON.stringify(agentRepr);
      const blob = new Blob([agentJSON], { type: 'application/json' });

      // temporary shadow link
      const tempAnchor = document.createElement('a');
      tempAnchor.href = URL.createObjectURL(blob);
      tempAnchor.download = `agent-${this.state.agent.tderror}.json`;
      tempAnchor.click();
      this.startTraining();
    }
  }

  importAgent() {
    
  }

  handleSliderChange(value) {
    this.setState({
      trainingSpeed: value
    });
  }

  render() {
    const gameStatus = this.state.gameState.getGameStatus();

    return (
      <div>
        <h1>Training...</h1>
        <div className='container'>
          <div style={{display: 'inline-block'}}>
            <div className='trainingControls'>
              <button className='startTraining' onClick={this.startTraining}>Train</button>
              <button className='pause' onClick={this.pauseTraining}>Pause Training</button>
              <button className='resetAgent' onClick={this.resetAgent}>Reset Agent</button>
              <button className='downloadAgent' onClick={this.downloadAgent}>Download agent as JSON</button>
              <Slider
                min={2}
                max={1000}
                step={10}
                value={this.state.trainingSpeed}
                onChangeStart={this.pauseTraining}
                onChange={this.handleSliderChange}
                onChangeComplete={this.startTraining}
                orientation='horizontal'
                handleLabel='Training speed'
              />
            </div>
            <GameBoard
              gameStateAsRows={this.state.gameState.getAsModedRows()}
              handleCircleClick={this.handleCircleClick}
              gameStatus={gameStatus}
            />
          </div>
          <div className='statistics' style={{display: 'inline-block', position: 'absolute' }}>
            <p>Error: {this.state.agent.tderror}</p>
            <p>Num Human Wins: {this.state.numHumanWins}</p>
            <p>Num Cat Wins: {this.state.numCatWins}</p>
            <p>Recent results?: {100 * mean(this.state.last5Games)}% winrate</p>
  {/*          <Matrix
              values={chunk(this.state.agent.latestAmat, 11)}
            />*/}
          </div>
        </div>
      </div>
    );
  }
}

export default TrainingView;