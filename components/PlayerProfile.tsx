'use client';

import { Player } from '@/lib/types';

interface PlayerProfileProps {
  player: Player;
}

export default function PlayerProfile({ player }: PlayerProfileProps) {
  const totalVictories = player['3vs3Victories'] + player.soloVictories + player.duoVictories;

  return (
    <div className="card mb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brawl-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brawl-blue/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Header with name and trophies */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brawl-blue to-brawl-purple flex items-center justify-center text-3xl shadow-brawl">
            👤
          </div>
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold glow-text"
              style={{ color: player.nameColor || '#FFC425' }}
            >
              {player.name}
            </h2>
            <p className="text-brawl-blue font-mono">{player.tag}</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="trophy-badge text-xl px-4 py-2 animate-pulse-glow">
            🏆 {player.trophies.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            最高: <span className="text-brawl-yellow">{player.highestTrophies.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-sm text-gray-400 mb-1">レベル</div>
          <div className="text-2xl font-bold text-brawl-yellow">{player.expLevel}</div>
        </div>

        <div className="stat-card text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-sm text-gray-400 mb-1">3vs3勝利</div>
          <div className="text-2xl font-bold text-brawl-green">
            {player['3vs3Victories'].toLocaleString()}
          </div>
        </div>

        <div className="stat-card text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-sm text-gray-400 mb-1">ソロ勝利</div>
          <div className="text-2xl font-bold text-brawl-blue">
            {player.soloVictories.toLocaleString()}
          </div>
        </div>

        <div className="stat-card text-center">
          <div className="text-3xl mb-2">🤝</div>
          <div className="text-sm text-gray-400 mb-1">デュオ勝利</div>
          <div className="text-2xl font-bold text-brawl-purple">
            {player.duoVictories.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Total Victories */}
      <div className="bg-gradient-to-r from-brawl-card to-brawl-darker rounded-xl p-4 mb-4 border border-brawl-yellow/30">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">総勝利数</span>
          <span className="text-2xl font-bold text-brawl-yellow">
            🎮 {totalVictories.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Club Info */}
      {player.club && (
        <div className="bg-gradient-to-r from-brawl-purple/20 to-brawl-card rounded-xl p-4 border border-brawl-purple/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brawl-purple to-purple-800 flex items-center justify-center text-2xl">
              🏠
            </div>
            <div>
              <div className="text-sm text-gray-400">所属クラブ</div>
              <div className="text-lg font-bold text-brawl-purple">{player.club.name}</div>
              <div className="text-xs text-gray-500 font-mono">{player.club.tag}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
