import React, { Component } from 'react';
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

export default Matrix;