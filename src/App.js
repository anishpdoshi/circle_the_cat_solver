import React, { Component } from 'react';
import './styles/App.css';

import PlayView from './components/PlayView';
import TrainingView from './components/TrainingView';

import { Tab, Checkbox } from 'semantic-ui-react';


class App extends Component {
  render() {
    const panes = [
      { menuItem: 'Play', render: () => <Tab.Pane><PlayView /></Tab.Pane> },
      { menuItem: 'Train', render: () => <Tab.Pane><TrainingView /></Tab.Pane> }
    ];

    return (
      <Tab
        panes={panes}
        renderActiveOnly={true}
      />
    );
  }
}

export default App;
