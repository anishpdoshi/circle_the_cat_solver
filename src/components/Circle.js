import React, { Component } from 'react';
import { GAME_STATUS } from '../game/game-state';

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

export default Circle;