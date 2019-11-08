import parse from 'csv-parse';
import { startCase } from 'lodash';
import React from 'react';
import './App.css';

const borderStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderCollapse: 'collapse',
};

const fieldStyle: React.CSSProperties = { whiteSpace: 'nowrap', padding: 5 };

const dataStyle = { ...borderStyle, ...fieldStyle };

const App: React.FC = () => {
  const [ufcFightHistory, setUfcFightHistory] = React.useState([[]]);

  React.useEffect(() => {
    fetch('/data/ufc-fight-history.csv')
      .then(res => res.text())
      .then(csv => csv.split('\n'))
      .then(csv => csv.slice(0, 101))
      .then(csv => csv.join('\n'))
      .then(csv =>
        parse(csv, (err, data) => {
          if (!err) {
            setUfcFightHistory(data);
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
              <th />
              {row.map((heading, j) => (
                <th key={j} style={dataStyle}>
                  {startCase(heading)}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {ufcFightHistory.slice(1).map((row, i) => (
            <tr key={i} style={{ background: i % 2 ? '#eee' : 'white' }}>
              <td style={{ ...dataStyle, textAlign: 'right' }}>{i + 1}.</td>
              {row.map((field, j) => (
                <td key={j} style={dataStyle}>
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
