import React, { Component } from 'react';
import GameBoard from './GameBoard';
import { GameState, newGame, GAME_STATUS } from '../game/game-state';

function toReadableHeading(status) {
  switch (status) {
    case GAME_STATUS.PLAYING:
      return 'Playing Circle the Cat! Click a circle to put a barrier on it. The game ends when the cat (black circle) escapes.';
    case GAME_STATUS.CAT_WON:
      return 'The cat has escaped! Click \'Reset Game\' to try again.';
    case GAME_STATUS.HUMAN_WON:
      return 'You won!! Click \'Reset Game\' to play again.';
  }
}
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

  handleCircleClick(row, col) {
    if (this.state.gameState.gameStatus === GAME_STATUS.PLAYING) {
      this.state.gameState.click(row, col);
      this.state.gameState.updateStatus();
      if (this.state.gameState.gameStatus === GAME_STATUS.PLAYING) {
        this.state.gameState.moveCat(this.state.gameState.getCatChoice());  
      }

      this.setState({
        gameState: this.state.gameState
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
    const gameStatus = this.state.gameState.gameStatus;

    return (
      <div>
        <div>
          <h4>{toReadableHeading(gameStatus)}</h4>
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
