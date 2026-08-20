import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ProgressRecord } from '../../types';

interface TrajectoryChartProps {
  history: ProgressRecord[];
  height?: number;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  history,
  height = 280,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No historical trajectory records available yet.
      </div>
    );
  }

  const chartData = history.map((h) => ({
    name: h.evaluation_phase.replace('_', ' '),
    date: h.recorded_date,
    Potential: h.overall_potential,
    Performance: h.performance_score,
    Athleticism: h.athletic_score,
    Technical: h.technical_score,
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#172a45" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0b1a30',
              borderColor: '#1e293b',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Line
            type="monotone"
            dataKey="Potential"
            stroke="#e2f939"
            strokeWidth={3}
            dot={{ r: 4, fill: '#e2f939' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Performance"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 3, fill: '#38bdf8' }}
          />
          <Line
            type="monotone"
            dataKey="Athleticism"
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={{ r: 3, fill: '#ffffff' }}
          />
          <Line
            type="monotone"
            dataKey="Technical"
            stroke="#a78bfa"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={{ r: 3, fill: '#a78bfa' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
