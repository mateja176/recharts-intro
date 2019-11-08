import csv from 'csvtojson';
import React from 'react';
import './App.css';

const App: React.FC = () => {
  const [ufcFightHistory, setUfcFightHistory] = React.useState({});

  React.useEffect(() => {
    fetch('/data/ufc-fight-history.csv')
      .then(res => res.text())
      .then(
        text =>
            csv().fromString(text),
      )
      .then(setUfcFightHistory);
  }, []);

  return <pre>{JSON.stringify(ufcFightHistory, null, 2)}</pre>;
};

export default App;
