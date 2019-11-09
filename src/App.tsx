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
const getLabel = (first: string, second: string) =>
  concatNames(getLastName(first), getLastName(second));

const borderStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderCollapse: 'collapse',
};

const fieldStyle: React.CSSProperties = { whiteSpace: 'nowrap', padding: 5 };

const dataStyle = { ...borderStyle, ...fieldStyle };

interface FightData
  extends Pick<
    Fight,
    'R_fighter' | 'B_fighter' | 'R_avg_SIG_STR_landed' | 'B_avg_SIG_STR_landed'
  > {}

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
                  return {
                    B_fighter,
                    R_fighter,
                    B_avg_SIG_STR_landed: Math.round(
                      parseFloat(B_avg_SIG_STR_landed),
                    ),
                    R_avg_SIG_STR_landed: Math.round(
                      parseFloat(R_avg_SIG_STR_landed),
                    ),
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
          data={ufcFightHistoryJSON.map(
            ({
              B_fighter,
              R_fighter,
              B_avg_SIG_STR_landed,
              R_avg_SIG_STR_landed,
            }) => ({
              label: getLabel(B_fighter, R_fighter),
              'Blue Fighter Significant Strikes Landed': B_avg_SIG_STR_landed,
              'Red Fighter Significant Strikes Landed': R_avg_SIG_STR_landed,
            }),
          )}
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
          <Bar
            dataKey="Blue Fighter Significant Strikes Landed"
            fill="#8884d8"
          />
          <Bar
            dataKey="Red Fighter Significant Strikes Landed"
            fill="#82ca9d"
          />
        </BarChart>
        <LineChart
          data={ufcFightHistoryJSON.map(
            ({
              B_fighter,
              R_fighter,
              B_avg_SIG_STR_landed,
              R_avg_SIG_STR_landed,
            }) => ({
              label: getLabel(B_fighter, R_fighter),
              'Combined Significant Strikes Landed':
                B_avg_SIG_STR_landed + R_avg_SIG_STR_landed,
            }),
          )}
          width={10000}
          height={1000}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <Line
            dataKey="Combined Significant Strikes Landed"
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
