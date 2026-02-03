'use client';

import { Player } from '@/lib/types';

interface PlayerCompareProps {
  players: Player[];
  onRemovePlayer: (tag: string) => void;
}

type PlayerStatKey = 'trophies' | 'highestTrophies' | 'expLevel' | '3vs3Victories' | 'soloVictories' | 'duoVictories';

const getPlayerStat = (player: Player, key: string): number => {
  switch (key) {
    case 'trophies': return player.trophies;
    case 'highestTrophies': return player.highestTrophies;
    case 'expLevel': return player.expLevel;
    case '3vs3Victories': return player['3vs3Victories'];
    case 'soloVictories': return player.soloVictories;
    case 'duoVictories': return player.duoVictories;
    case 'brawlerCount': return player.brawlers.length;
    default: return 0;
  }
};

export default function PlayerCompare({ players, onRemovePlayer }: PlayerCompareProps) {
  if (players.length < 2) return null;

  const getWinner = (values: number[], higherIsBetter = true) => {
    if (higherIsBetter) {
      const max = Math.max(...values);
      return values.indexOf(max);
    }
    const min = Math.min(...values);
    return values.indexOf(min);
  };

  const compareStats = [
    { label: 'トロフィー', key: 'trophies', icon: '🏆' },
    { label: '最高トロフィー', key: 'highestTrophies', icon: '👑' },
    { label: 'レベル', key: 'expLevel', icon: '⭐' },
    { label: '3vs3勝利', key: '3vs3Victories', icon: '👥' },
    { label: 'ソロ勝利', key: 'soloVictories', icon: '🎯' },
    { label: 'デュオ勝利', key: 'duoVictories', icon: '🤝' },
    { label: 'ブロウラー数', key: 'brawlerCount', icon: '⚔️' },
  ];

  return (
    <div className="card mb-8">
      <h2 className="section-title">プレイヤー比較</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3 text-gray-400 font-normal">項目</th>
              {players.map((player) => (
                <th key={player.tag} className="text-center p-3 min-w-[150px]">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="font-bold text-lg glow-text"
                      style={{ color: player.nameColor || '#FFC425' }}
                    >
                      {player.name}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{player.tag}</span>
                    <button
                      onClick={() => onRemovePlayer(player.tag)}
                      className="text-xs text-brawl-red hover:text-red-400 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareStats.map((stat) => {
              const values = players.map((p) => getPlayerStat(p, stat.key));
              const winnerIndex = getWinner(values);

              return (
                <tr key={stat.key} className="border-t border-brawl-blue/20">
                  <td className="p-3 text-gray-400">
                    <span className="mr-2">{stat.icon}</span>
                    {stat.label}
                  </td>
                  {values.map((value, index) => (
                    <td
                      key={index}
                      className={`p-3 text-center font-bold text-xl ${
                        index === winnerIndex
                          ? 'text-brawl-yellow bg-brawl-yellow/10'
                          : 'text-white'
                      }`}
                    >
                      {value.toLocaleString()}
                      {index === winnerIndex && (
                        <span className="ml-2 text-sm">👑</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* 総勝利数 */}
            <tr className="border-t-2 border-brawl-yellow/30 bg-brawl-card/50">
              <td className="p-3 text-brawl-yellow font-bold">
                <span className="mr-2">🎮</span>
                総勝利数
              </td>
              {players.map((player, index) => {
                const totalWins =
                  player['3vs3Victories'] + player.soloVictories + player.duoVictories;
                const allTotals = players.map(
                  (p) => p['3vs3Victories'] + p.soloVictories + p.duoVictories
                );
                const isWinner = index === getWinner(allTotals);

                return (
                  <td
                    key={player.tag}
                    className={`p-3 text-center font-bold text-xl ${
                      isWinner
                        ? 'text-brawl-yellow bg-brawl-yellow/10'
                        : 'text-white'
                    }`}
                  >
                    {totalWins.toLocaleString()}
                    {isWinner && <span className="ml-2 text-sm">👑</span>}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Brawler Comparison */}
      <div className="mt-6 pt-6 border-t border-brawl-blue/20">
        <h3 className="text-lg font-bold text-brawl-blue mb-4">ブロウラー統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const avgTrophies = Math.round(
              player.brawlers.reduce((sum, b) => sum + b.trophies, 0) / player.brawlers.length
            );
            const maxPower = player.brawlers.filter((b) => b.power === 11).length;
            const avgRank = Math.round(
              player.brawlers.reduce((sum, b) => sum + b.rank, 0) / player.brawlers.length
            );

            return (
              <div
                key={player.tag}
                className="bg-gradient-to-br from-brawl-card/50 to-brawl-darker rounded-xl p-4 border border-brawl-blue/20"
              >
                <div
                  className="font-bold text-lg mb-3 glow-text"
                  style={{ color: player.nameColor || '#FFC425' }}
                >
                  {player.name}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">平均トロフィー</span>
                    <span className="text-brawl-yellow font-bold">{avgTrophies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">平均ランク</span>
                    <span className="text-brawl-blue font-bold">{avgRank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">最大パワー</span>
                    <span className="text-brawl-purple font-bold">{maxPower}体</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
