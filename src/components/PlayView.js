import React, { Component } from 'react';
import GameBoard from './GameBoard';
import { GameState, newGame, GAME_STATUS } from '../game/game-state';

// Game controller
class PlayView extends Component {
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
        this.setState({
          gameState: newState
        });
      }
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

export default PlayView;
