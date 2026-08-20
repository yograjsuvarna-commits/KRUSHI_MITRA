import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RadarDataPoint {
  subject: string;
  score: number;
  fullMark?: number;
  compareScore?: number;
  compareName?: string;
}

interface TalentRadarChartProps {
  data: RadarDataPoint[];
  playerName?: string;
  comparePlayerName?: string;
  height?: number;
}

export const TalentRadarChart: React.FC<TalentRadarChartProps> = ({
  data,
  playerName = 'Player',
  comparePlayerName,
  height = 320,
}) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0b1a30',
              borderColor: '#e2f939',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '12px',
            }}
          />
          <Radar
            name={playerName}
            dataKey="score"
            stroke="#e2f939"
            fill="#e2f939"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          {comparePlayerName && (
            <Radar
              name={comparePlayerName}
              dataKey="compareScore"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
