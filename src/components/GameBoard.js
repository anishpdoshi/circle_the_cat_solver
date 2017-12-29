import React, { Component } from 'react';
import Circle from './Circle';

// Given a GameState, renders a corresponding 11x11 board of circles.
// Doesn't handle game logic itself, that's left to the parent. Proxies
// circle clicks to the parent as well.
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
            handleCircleClick={() => {
              if (handleCircleClick) {
                handleCircleClick({ row: i, col: j})
              }
            }}
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

export default GameBoard;