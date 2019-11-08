import parse from 'csv-parse';
import csvToJSON from 'csvtojson';
import { startCase } from 'lodash';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './App.css';
import { Fight, RawFight } from './interfaces';

const getLastName = (fullName: string) =>
  (fullName.match(/^\w+ (\w+)/) || [])[1];
const concatNames = (first: string, second: string) =>
  first.concat(' - ').concat(second);

const borderStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderCollapse: 'collapse',
};

const fieldStyle: React.CSSProperties = { whiteSpace: 'nowrap', padding: 5 };

const dataStyle = { ...borderStyle, ...fieldStyle };

interface FightData {
  label: string;
  fullNames: string;
  totalSigStrikesLanded: Fight['R_avg_SIG_STR_landed'];
}

type Fights = FightData[];

const App: React.FC = () => {
  const [ufcFightHistory, setUfcFightHistoryCSV] = React.useState([[]]);
  const [ufcFightHistoryJSON, setUfcFightHistoryJSON] = React.useState<Fights>(
    [],
  );

  React.useEffect(() => {
    fetch('/data/ufc-fight-history.csv')
      .then(res => res.text())
      .then(csv => csv.split('\n'))
      .then(csv => csv.slice(0, 101))
      .then(csv => csv.join('\n'))
      .then(csv => {
        csvToJSON()
          .fromString(csv)
          .then((fights: RawFight[]) =>
            fights
              .filter(
                ({ R_avg_SIG_STR_landed, B_avg_SIG_STR_landed }) =>
                  R_avg_SIG_STR_landed && B_avg_SIG_STR_landed,
              )
              .map<FightData>(
                ({
                  R_fighter,
                  B_fighter,
                  R_avg_SIG_STR_landed,
                  B_avg_SIG_STR_landed,
                }) => {
                  const fullNames = concatNames(B_fighter, R_fighter);

                  const blueSigStrikesLanded = Math.round(
                    parseFloat(R_avg_SIG_STR_landed),
                  );
                  const redSigStrikesLanded = Math.round(
                    parseFloat(B_avg_SIG_STR_landed),
                  );

                  const totalSigStrikesLanded =
                    blueSigStrikesLanded + redSigStrikesLanded;

                  return {
                    label: concatNames(
                      getLastName(B_fighter),
                      getLastName(R_fighter),
                    ),
                    fullNames,
                    totalSigStrikesLanded,
                    blueSigStrikesLanded,
                    redSigStrikesLanded,
                  };
                },
              ),
          )
          .then(setUfcFightHistoryJSON);
        parse(csv, (err, data) => {
          if (!err) {
            setUfcFightHistoryCSV(data);
          }
        });
      });
  }, []);

  return (
    <div style={{ margin: 20 }}>
      <div style={{ marginBottom: 40 }}>
        <BarChart
          width={11000}
          height={1000}
          data={ufcFightHistoryJSON}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="blueSigStrikesLanded" fill="#8884d8" />
          <Bar dataKey="redSigStrikesLanded" fill="#82ca9d" />
        </BarChart>
        <LineChart
          data={ufcFightHistoryJSON}
          width={10000}
          height={1000}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <Line
            dataKey="totalSigStrikesLanded"
            type="monotone"
            stroke="#8884d8"
            activeDot={{ r: 6 }}
          />
          <Tooltip />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="label" />
          <YAxis />
        </LineChart>
      </div>
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
