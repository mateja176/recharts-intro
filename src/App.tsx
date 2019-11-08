import parse from 'csv-parse';
import { startCase } from 'lodash';
import React from 'react';
import './App.css';

const borderStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderCollapse: 'collapse',
};

const fieldStyle: React.CSSProperties = { whiteSpace: 'nowrap', padding: 5 };

const App: React.FC = () => {
  const [ufcFightHistory, setUfcFightHistory] = React.useState([[]]);

  React.useEffect(() => {
    fetch('/data/ufc-fight-history.csv')
      .then(res => res.text())
      .then(text =>
        parse(text, (err, data) => {
          if (!err) {
            setUfcFightHistory(data.slice(0, 100));
          }
        }),
      );
  }, []);

  return (
    <div style={{ margin: 20 }}>
      <table style={borderStyle}>
        <thead>
          {ufcFightHistory.slice(0, 1).map((row, i) => (
            <tr key={i}>
              {row.map((heading, j) => (
                <th key={j} style={{ ...borderStyle, ...fieldStyle }}>
                  {startCase(heading)}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {ufcFightHistory.slice(1).map((row, i) => (
            <tr key={i} style={{ background: i % 2 ? '#eee' : 'white' }}>
              {row.map((field, j) => (
                <td key={j} style={{ ...borderStyle, ...fieldStyle }}>
                  {field}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
