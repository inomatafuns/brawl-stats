'use client';

import { Battle } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface BattleAnalysisProps {
  battles: Battle[];
}

const MODE_COLORS: Record<string, string> = {
  gemGrab: '#9B59B6',
  brawlBall: '#2ECC71',
  heist: '#F39C12',
  bounty: '#E74C3C',
  siege: '#3498DB',
  hotZone: '#E91E63',
  knockout: '#9C27B0',
  soloShowdown: '#FF5722',
  duoShowdown: '#FF9800',
  showdown: '#FF9800',
  duels: '#673AB7',
  wipeout: '#F44336',
  payload: '#00BCD4',
  paintBrawl: '#4CAF50',
};

export default function BattleAnalysis({ battles }: BattleAnalysisProps) {
  // モード別統計
  const modeStats = battles.reduce(
    (acc, battle) => {
      const mode = battle.event.mode;
      if (!acc[mode]) {
        acc[mode] = { wins: 0, losses: 0, draws: 0, total: 0, trophyChange: 0 };
      }
      acc[mode].total++;
      if (battle.battle.result === 'victory') acc[mode].wins++;
      else if (battle.battle.result === 'defeat') acc[mode].losses++;
      else acc[mode].draws++;
      if (battle.battle.trophyChange) acc[mode].trophyChange += battle.battle.trophyChange;
      return acc;
    },
    {} as Record<string, { wins: number; losses: number; draws: number; total: number; trophyChange: number }>
  );

  // マップ別統計
  const mapStats = battles.reduce(
    (acc, battle) => {
      const map = battle.event.map;
      if (!acc[map]) {
        acc[map] = { wins: 0, losses: 0, total: 0, mode: battle.event.mode };
      }
      acc[map].total++;
      if (battle.battle.result === 'victory') acc[map].wins++;
      else if (battle.battle.result === 'defeat') acc[map].losses++;
      return acc;
    },
    {} as Record<string, { wins: number; losses: number; total: number; mode: string }>
  );

  // 全体統計
  const overallStats = {
    totalBattles: battles.length,
    wins: battles.filter((b) => b.battle.result === 'victory').length,
    losses: battles.filter((b) => b.battle.result === 'defeat').length,
    draws: battles.filter((b) => b.battle.result === 'draw').length,
    totalTrophyChange: battles.reduce((sum, b) => sum + (b.battle.trophyChange || 0), 0),
    starPlayerCount: battles.filter((b) => b.battle.starPlayer).length,
  };

  const winRate = overallStats.totalBattles > 0
    ? ((overallStats.wins / overallStats.totalBattles) * 100).toFixed(1)
    : '0';

  // 勝敗円グラフデータ
  const pieData = [
    { name: '勝利', value: overallStats.wins, color: '#2ECC71' },
    { name: '敗北', value: overallStats.losses, color: '#E74C3C' },
    { name: 'その他', value: overallStats.draws, color: '#95A5A6' },
  ].filter((d) => d.value > 0);

  // モード別プレイ回数
  const modePlayData = Object.entries(modeStats)
    .map(([mode, stats]) => ({
      name: mode,
      value: stats.total,
      color: MODE_COLORS[mode] || '#6B7280',
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brawl-card border-2 border-brawl-yellow rounded-xl p-3 shadow-brawl">
          <p className="text-brawl-yellow font-bold">{payload[0].name}</p>
          <p className="text-white text-lg">{payload[0].value}回</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <h2 className="section-title">バトル分析</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card text-center">
          <div className="text-3xl mb-2">⚔️</div>
          <div className="text-3xl font-bold text-brawl-yellow">{overallStats.totalBattles}</div>
          <div className="text-sm text-gray-400">総バトル数</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-3xl font-bold text-brawl-green">{winRate}%</div>
          <div className="text-sm text-gray-400">勝率</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className={`text-3xl font-bold ${overallStats.totalTrophyChange >= 0 ? 'text-brawl-green' : 'text-brawl-red'}`}>
            {overallStats.totalTrophyChange >= 0 ? '+' : ''}{overallStats.totalTrophyChange}
          </div>
          <div className="text-sm text-gray-400">トロフィー変動</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-brawl-yellow">{overallStats.starPlayerCount}</div>
          <div className="text-sm text-gray-400">スタープレイヤー</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Win/Loss Pie Chart */}
        <div className="bg-brawl-card/50 rounded-xl p-4 border border-brawl-blue/20">
          <h3 className="text-lg font-bold text-brawl-blue mb-4 text-center">勝敗割合</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mode Distribution */}
        <div className="bg-brawl-card/50 rounded-xl p-4 border border-brawl-blue/20">
          <h3 className="text-lg font-bold text-brawl-blue mb-4 text-center">モード別プレイ回数</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={modePlayData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {modePlayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mode Stats Table */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-brawl-blue mb-4">モード別詳細</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="p-3">モード</th>
                <th className="p-3 text-center">プレイ数</th>
                <th className="p-3 text-center">勝利</th>
                <th className="p-3 text-center">敗北</th>
                <th className="p-3 text-center">勝率</th>
                <th className="p-3 text-center">トロフィー</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(modeStats)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([mode, stats]) => {
                  const modeWinRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(0) : 0;
                  return (
                    <tr
                      key={mode}
                      className="border-t border-brawl-blue/20 hover:bg-brawl-card/30"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: MODE_COLORS[mode] || '#6B7280' }}
                          />
                          <span className="font-bold">{mode}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">{stats.total}</td>
                      <td className="p-3 text-center text-brawl-green">{stats.wins}</td>
                      <td className="p-3 text-center text-brawl-red">{stats.losses}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-lg text-sm font-bold ${
                            Number(modeWinRate) >= 50
                              ? 'bg-brawl-green/20 text-brawl-green'
                              : 'bg-brawl-red/20 text-brawl-red'
                          }`}
                        >
                          {modeWinRate}%
                        </span>
                      </td>
                      <td
                        className={`p-3 text-center font-bold ${
                          stats.trophyChange >= 0 ? 'text-brawl-green' : 'text-brawl-red'
                        }`}
                      >
                        {stats.trophyChange >= 0 ? '+' : ''}
                        {stats.trophyChange}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Maps */}
      <div>
        <h3 className="text-lg font-bold text-brawl-blue mb-4">マップ別統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(mapStats)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 6)
            .map(([map, stats]) => {
              const mapWinRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(0) : 0;
              return (
                <div
                  key={map}
                  className="bg-brawl-card/50 rounded-xl p-4 border border-brawl-blue/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white truncate">{map}</span>
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: MODE_COLORS[stats.mode] || '#6B7280', color: 'white' }}
                    >
                      {stats.mode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{stats.total}回プレイ</span>
                    <span
                      className={`font-bold ${
                        Number(mapWinRate) >= 50 ? 'text-brawl-green' : 'text-brawl-red'
                      }`}
                    >
                      勝率 {mapWinRate}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-brawl-darker rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        Number(mapWinRate) >= 50 ? 'bg-brawl-green' : 'bg-brawl-red'
                      }`}
                      style={{ width: `${mapWinRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
