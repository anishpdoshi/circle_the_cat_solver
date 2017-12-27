import React, { Component } from 'react';
import './styles/App.css';
import { GameState, newGame, GAME_STATUS } from './game/game-state';
import { createAgent, rewardFromGS } from './game/solver';
import chunk from 'lodash-es/chunk';
import mean from 'lodash-es/mean';

// sliders
// Using an ES6 transpiler like Babel
import Slider from 'react-rangeslider';

// To include the default styles
import 'react-rangeslider/lib/index.css';

// import partial from 'lodash-es/partial';

// A single circle in the game.
class Circle extends Component {
  constructor(props) {
    super(props);
    this.modeToColor = this.modeToColor.bind(this);
    this.statusToEmoji = this.statusToEmoji.bind(this);
  }

  modeToColor() {
    const { mode } = this.props;
    if (mode === 'cat') {
      // black
      return '#000000';
    } else if (mode === 'fill') {
      // dark green
      return '#1D8348';
    } else {
      // light green
      return '#DAF7A6';
    }
  }

  statusToEmoji() {
    const { mode, gameStatus } = this.props;

    if (mode === 'cat') {
      if (gameStatus === GAME_STATUS.PLAYING) {
        return (
          <text x='50%' y='50%' textAnchor='middle' dy='.3em'>😺</text>
        );
      } else if (gameStatus === GAME_STATUS.HUMAN_WON) {
        return (
          <text x='50%' y='50%' textAnchor='middle' dy='.3em'>😿</text>
        );
      } else if (gameStatus === GAME_STATUS.CAT_WON) {
        return (
          <text x='50%' y='50%' textAnchor='middle' dy='.3em'>😸</text>
        );
      }
    }
  }

  render() {
    const { 
      index,
      handleCircleClick
    } = this.props;

    return (
      <svg x={`${50 * index}`} height='50' width='50' onClick={handleCircleClick}>
        <circle
          cx='25'
          cy='25'
          r='20'
          strokeWidth='1'
          fill={this.modeToColor()}
        />
        {this.statusToEmoji()} 
      </svg>
    );
  }
}

// Given a GameState, renders a corresponding 11x11 board of circles.
// Doesn't handle game logic itself, that's left to the parent.
class GameBoard extends Component {
  render() {
    const {
      gameStateAsRows,
      handleCircleClick,
      gameStatus
    } = this.props;

    const rows = gameStateAsRows.map((row, i) => {
      const items = row.map((item, j) => {
        return (
          <Circle
            key={`row-${i}-col-${j}`}
            handleCircleClick={() => handleCircleClick({ row: i, col: j})}
            mode={item.mode}
            index={j}
            gameStatus={gameStatus}
          />
        );
      });

      return (
        <svg x={`${(i % 2) * 25}`} y={`${i * 50}`} height='50' width='550' key={`row-${i}`}>
            {items}
        </svg>
      );
    });

    return (
      <svg width='575' height='550'>{rows}</svg>
    );
  }
}

// Game controller
class Game extends Component {
  constructor(props) {
    super(props);

    this.handleCircleClick = this.handleCircleClick.bind(this);
    this.handleResetGame = this.handleResetGame.bind(this);

    this.state = {
      gameState: newGame({ numInitials: 7 })
    };
  }

  handleCircleClick(loc) {
    if (this.state.gameState.getGameStatus() === GAME_STATUS.PLAYING) {
      const newState = this.state.gameState.click(loc);
      if (newState) {
        newState.moveCat();
      }

      this.setState({
        gameState: newState
      });
    }
  }

  handleResetGame() {
    // handle any other reset logic here?
    this.setState({
      gameState: newGame({ numInitials: 7 })
    });
  }

  render() {
    const gameStatus = this.state.gameState.getGameStatus();

    return (
      <div>
        <div>
          <h1>{gameStatus}</h1>
          <button className='resetGame' onClick={this.handleResetGame}>Reset Game</button>
        </div>
        <GameBoard
          gameStateAsRows={this.state.gameState.getAsModedRows()}
          handleCircleClick={this.handleCircleClick}
          gameStatus={gameStatus}
        />
      </div>
    );
  }
}

class Matrix extends Component {
  render() {
    const { values } = this.props;

    const rows = values.map((row, i) => {
      const items = row.map((item, j) => {
        return (
          <td key={`Mat[${i},${j}]`}>{item}</td>
        );
      });

      return (
        <tr key={`Mat[${i}]`}>{items}</tr>
      );
    });

    return (
      <table><tbody>
        {rows}
      </tbody></table>
    );
  }
}

// Training controller
class Training extends Component {
  constructor(props) {
    super(props);

    // this.tick = this.tick.bind(this);
    this.startTraining = this.startTraining.bind(this);
    this.pauseTraining = this.pauseTraining.bind(this);
    this.resetAgent = this.resetAgent.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);

    this.state = {
      agent: createAgent(),
      gameState: newGame({ numInitials: 7 }),
      trainingSpeed: 50,
      // game stats
      numHumanWins: 0,
      numCatWins: 0,
      last5Games: [0.0, 0.0, 0.0, 0.0, 0.0]
    };
  }

  startTraining() {
    // todo - episodics
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
        // clearInterval(trainingInterval);
        this.setState({
          agent: agent,
          gameState: newGame({ numInitials: 7 }),
          numHumanWins: this.state.numHumanWins + (isHumanWon ? 1 : 0),
          numCatWins: this.state.numCatWins + (isCatWon ? 1 : 0),
          last5Games: this.state.last5Games.slice(1).concat([isHumanWon ? 1.0 : 0.0])
        });
      }
    }, this.state.trainingSpeed);
    this.setState({ trainingInterval: trainingInterval });
  }

  pauseTraining() {
    clearInterval(this.state.trainingInterval);
  }

  resetAgent() {
    this.pauseTraining();
    this.setState({
      agent: createAgent(),
      gameState: newGame({ numInitials: 7 }),
    });
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
              {/*<button className='downloadAgent' onClick={}*/}
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

class App extends Component {
  render() {
    return (
      <Training />
    );
  }
}

export default App;
