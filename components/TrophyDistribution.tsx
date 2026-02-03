'use client';

import { Brawler } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TrophyDistributionProps {
  brawlers: Brawler[];
}

const COLORS = ['#6B7280', '#3B82F6', '#22C55E', '#EAB308', '#F97316', '#EF4444'];

export default function TrophyDistribution({ brawlers }: TrophyDistributionProps) {
  // トロフィー帯ごとにブロウラーを分類
  const distribution = {
    '0-199': 0,
    '200-399': 0,
    '400-599': 0,
    '600-799': 0,
    '800-999': 0,
    '1000+': 0,
  };

  brawlers.forEach((brawler) => {
    const trophies = brawler.trophies;
    if (trophies < 200) distribution['0-199']++;
    else if (trophies < 400) distribution['200-399']++;
    else if (trophies < 600) distribution['400-599']++;
    else if (trophies < 800) distribution['600-799']++;
    else if (trophies < 1000) distribution['800-999']++;
    else distribution['1000+']++;
  });

  const data = Object.entries(distribution).map(([range, count], index) => ({
    range,
    count,
    color: COLORS[index],
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brawl-card border-2 border-brawl-yellow rounded-xl p-3 shadow-brawl">
          <p className="text-brawl-yellow font-bold">{label}</p>
          <p className="text-white">
            <span className="text-2xl">🏆</span> {payload[0].value}体
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h2 className="section-title">トロフィー分布</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1BA5F5" opacity={0.2} />
          <XAxis
            dataKey="range"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#1BA5F5', strokeWidth: 2 }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            axisLine={{ stroke: '#1BA5F5', strokeWidth: 2 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-center gap-2 flex-wrap">
        {data.map((item, index) => (
          <div
            key={item.range}
            className="flex items-center gap-2 text-xs bg-brawl-darker px-3 py-1 rounded-full"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            />
            <span className="text-gray-400">{item.range}</span>
            <span className="text-white font-bold">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
