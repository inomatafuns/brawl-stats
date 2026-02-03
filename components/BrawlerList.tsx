'use client';

import { Brawler, Battle } from '@/lib/types';
import { useState, useMemo } from 'react';
import Image from 'next/image';

// Brawlify CDNからアイコンを取得
const getBrawlerIconUrl = (brawlerId: number) => {
  return `https://cdn.brawlify.com/brawlers/borderless/${brawlerId}.png`;
};

const getStarPowerIconUrl = (starPowerId: number) => {
  return `https://cdn.brawlify.com/star-powers/borderless/${starPowerId}.png`;
};

const getGadgetIconUrl = (gadgetId: number) => {
  return `https://cdn.brawlify.com/gadgets/borderless/${gadgetId}.png`;
};

const getGearIconUrl = (gearId: number) => {
  return `https://raw.githubusercontent.com/Brawlify/CDN/master/gears/regular/${gearId}.png`;
};

interface BrawlerStats {
  wins: number;
  losses: number;
  draws: number;
  trophyChange: number;
  maxWinStreak: number;
  maxLoseStreak: number;
  battles: number;
}

interface BrawlerListProps {
  brawlers: Brawler[];
  battles?: Battle[];
  playerTag?: string;
}

const getRankColor = (rank: number) => {
  if (rank >= 35) return 'from-red-500 to-red-700';
  if (rank >= 30) return 'from-purple-500 to-purple-700';
  if (rank >= 25) return 'from-pink-500 to-pink-700';
  if (rank >= 20) return 'from-yellow-500 to-yellow-700';
  if (rank >= 15) return 'from-blue-400 to-blue-600';
  if (rank >= 10) return 'from-green-400 to-green-600';
  return 'from-gray-400 to-gray-600';
};

export default function BrawlerList({ brawlers, battles = [], playerTag = '' }: BrawlerListProps) {
  const [sortBy, setSortBy] = useState<'trophies' | 'rank' | 'power'>('trophies');
  const [hoveredBrawler, setHoveredBrawler] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // ブロウラーごとの統計を計算
  const brawlerStats = useMemo(() => {
    const stats: Record<number, BrawlerStats> = {};

    // 初期化
    brawlers.forEach((b) => {
      stats[b.id] = {
        wins: 0,
        losses: 0,
        draws: 0,
        trophyChange: 0,
        maxWinStreak: 0,
        maxLoseStreak: 0,
        battles: 0,
      };
    });

    // プレイヤータグを正規化
    const normalizedPlayerTag = playerTag.replace('#', '').toUpperCase();

    // バトルログからブロウラーごとの統計を計算
    const brawlerBattles: Record<number, { result: string }[]> = {};

    battles.forEach((battle) => {
      let usedBrawlerId: number | null = null;
      let result: string | null = null;

      // チーム戦の場合
      if (battle.battle.teams) {
        for (const team of battle.battle.teams) {
          for (const player of team) {
            const pTag = player.tag.replace('#', '').toUpperCase();
            if (pTag === normalizedPlayerTag) {
              usedBrawlerId = player.brawler.id;
              result = battle.battle.result || null;
              break;
            }
          }
          if (usedBrawlerId) break;
        }
      }

      // ソロ/デュオショーダウンの場合
      if (!usedBrawlerId && battle.battle.players) {
        for (const player of battle.battle.players) {
          const pTag = player.tag.replace('#', '').toUpperCase();
          if (pTag === normalizedPlayerTag) {
            usedBrawlerId = player.brawler.id;
            // ランクから勝敗を判定（1-4位は勝利、5-10位は敗北）
            if (battle.battle.rank) {
              result = battle.battle.rank <= 4 ? 'victory' : 'defeat';
            }
            break;
          }
        }
      }

      if (usedBrawlerId && stats[usedBrawlerId]) {
        stats[usedBrawlerId].battles++;

        if (result === 'victory') {
          stats[usedBrawlerId].wins++;
        } else if (result === 'defeat') {
          stats[usedBrawlerId].losses++;
        } else if (result === 'draw') {
          stats[usedBrawlerId].draws++;
        }

        if (battle.battle.trophyChange) {
          stats[usedBrawlerId].trophyChange += battle.battle.trophyChange;
        }

        // 連勝/連敗計算用にバトル結果を保存
        if (!brawlerBattles[usedBrawlerId]) {
          brawlerBattles[usedBrawlerId] = [];
        }
        if (result) {
          brawlerBattles[usedBrawlerId].push({ result });
        }
      }
    });

    // 連勝/連敗を計算
    Object.entries(brawlerBattles).forEach(([brawlerId, battles]) => {
      const id = parseInt(brawlerId);
      let currentWinStreak = 0;
      let currentLoseStreak = 0;
      let maxWin = 0;
      let maxLose = 0;

      // バトルは新しい順なので逆順で処理
      [...battles].reverse().forEach((b) => {
        if (b.result === 'victory') {
          currentWinStreak++;
          currentLoseStreak = 0;
          maxWin = Math.max(maxWin, currentWinStreak);
        } else if (b.result === 'defeat') {
          currentLoseStreak++;
          currentWinStreak = 0;
          maxLose = Math.max(maxLose, currentLoseStreak);
        } else {
          currentWinStreak = 0;
          currentLoseStreak = 0;
        }
      });

      stats[id].maxWinStreak = maxWin;
      stats[id].maxLoseStreak = maxLose;
    });

    return stats;
  }, [battles, brawlers, playerTag]);

  const handleMouseEnter = (brawlerId: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredBrawler(brawlerId);
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredBrawler(null);
    setPopupPosition(null);
  };

  // バトルログの期間を計算
  const battlePeriod = useMemo(() => {
    if (battles.length === 0) return null;

    const formatBattleTime = (timeString: string) => {
      // Brawl Stars APIのタイムスタンプ形式: "20230101T120000.000Z"
      const year = timeString.substring(0, 4);
      const month = timeString.substring(4, 6);
      const day = timeString.substring(6, 8);
      return `${year}/${month}/${day}`;
    };

    // バトルは新しい順なので、最初が最新、最後が最古
    const newest = formatBattleTime(battles[0].battleTime);
    const oldest = formatBattleTime(battles[battles.length - 1].battleTime);

    return { oldest, newest, count: battles.length };
  }, [battles]);

  const sortedBrawlers = [...brawlers].sort((a, b) => {
    switch (sortBy) {
      case 'trophies':
        return b.trophies - a.trophies;
      case 'rank':
        return b.rank - a.rank;
      case 'power':
        return b.power - a.power;
      default:
        return 0;
    }
  });

  const totalTrophies = brawlers.reduce((sum, b) => sum + b.trophies, 0);
  const avgTrophies = Math.round(totalTrophies / brawlers.length);
  const maxPowerBrawlers = brawlers.filter(b => b.power === 11).length;

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="section-title">ブロウラー一覧</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="text-brawl-yellow">⚔️</span>
              <span className="text-gray-400">{brawlers.length}体</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-brawl-yellow">🏆</span>
              <span className="text-gray-400">平均: {avgTrophies}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-brawl-yellow">⭐</span>
              <span className="text-gray-400">最大パワー: {maxPowerBrawlers}体</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">並び替え:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'trophies' | 'rank' | 'power')}
            className="bg-brawl-darker border-2 border-brawl-blue/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brawl-yellow"
          >
            <option value="trophies">🏆 トロフィー</option>
            <option value="rank">📊 ランク</option>
            <option value="power">⚡ パワー</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 relative">
        {sortedBrawlers.map((brawler) => {
          const stats = brawlerStats[brawler.id];
          return (
          <div
            key={brawler.id}
            className="brawler-card group p-3 cursor-pointer"
            onMouseEnter={(e) => handleMouseEnter(brawler.id, e)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={(e) => handleMouseEnter(brawler.id, e as unknown as React.MouseEvent)}
          >
            <div className="flex items-center gap-2 mb-2">
              {/* Brawler Icon from Brawlify CDN */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={getBrawlerIconUrl(brawler.id)}
                  alt={brawler.name}
                  width={48}
                  height={48}
                  className="rounded-lg"
                  unoptimized
                />
                {/* Rank badge overlay */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${getRankColor(brawler.rank)} flex items-center justify-center shadow-brawl border-2 border-brawl-darker`}>
                  <span className="text-white font-bold text-[10px]">{brawler.rank}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm group-hover:text-brawl-yellow transition-colors truncate">
                  {brawler.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="text-brawl-blue">⚡</span> {brawler.power}
                </div>
              </div>
            </div>

            {/* Trophy badge with current / highest */}
            <div className="trophy-badge text-xs mb-2 justify-center">
              🏆 {brawler.trophies} / {brawler.highestTrophies}
            </div>

            {/* Star Powers, Gadgets, Gears */}
            <div className="flex flex-wrap gap-1">
              {brawler.starPowers.map((sp) => (
                <span
                  key={sp.id}
                  className="bg-brawl-purple/60 p-1 rounded-md"
                  title={sp.name}
                >
                  <Image
                    src={getStarPowerIconUrl(sp.id)}
                    alt={sp.name}
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                    unoptimized
                  />
                </span>
              ))}

              {brawler.gadgets.map((gadget) => (
                <span
                  key={gadget.id}
                  className="bg-brawl-green/60 p-1 rounded-md"
                  title={gadget.name}
                >
                  <Image
                    src={getGadgetIconUrl(gadget.id)}
                    alt={gadget.name}
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                    unoptimized
                  />
                </span>
              ))}

              {brawler.gears.map((gear) => (
                <span
                  key={gear.id}
                  className="bg-brawl-orange/60 p-1 rounded-md flex items-center gap-0.5"
                  title={gear.name}
                >
                  <Image
                    src={getGearIconUrl(gear.id)}
                    alt={gear.name}
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                    unoptimized
                  />
                  <span className="text-[10px] font-bold text-white">{gear.level}</span>
                </span>
              ))}
            </div>
          </div>
        );
        })}
      </div>

      {/* ブロウラー統計ポップアップ */}
      {hoveredBrawler && popupPosition && brawlerStats[hoveredBrawler] && (
        <div
          className="fixed z-50 bg-brawl-darker border-2 border-brawl-yellow/50 rounded-xl p-4 shadow-2xl min-w-[200px] transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y - 10}px`,
          }}
        >
          {(() => {
            const stats = brawlerStats[hoveredBrawler];
            const brawler = brawlers.find(b => b.id === hoveredBrawler);
            const winRate = stats.battles > 0 ? Math.round((stats.wins / stats.battles) * 100) : 0;

            return (
              <>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-brawl-blue/30">
                  <Image
                    src={getBrawlerIconUrl(hoveredBrawler)}
                    alt={brawler?.name || ''}
                    width={32}
                    height={32}
                    className="rounded-lg"
                    unoptimized
                  />
                  <span className="font-bold text-brawl-yellow">{brawler?.name}</span>
                </div>

                {stats.battles > 0 ? (
                  <div className="space-y-2 text-sm">
                    {/* トロフィー推移 */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">トロフィー推移</span>
                      <span className={`font-bold ${stats.trophyChange >= 0 ? 'text-brawl-green' : 'text-brawl-red'}`}>
                        {stats.trophyChange >= 0 ? '+' : ''}{stats.trophyChange} 🏆
                      </span>
                    </div>

                    {/* 勝敗 */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">勝敗</span>
                      <span>
                        <span className="text-brawl-green font-bold">{stats.wins}勝</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-brawl-red font-bold">{stats.losses}敗</span>
                        {stats.draws > 0 && (
                          <>
                            <span className="text-gray-500 mx-1">/</span>
                            <span className="text-gray-400">{stats.draws}分</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* 勝率 */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">勝率</span>
                      <span className={`font-bold ${winRate >= 50 ? 'text-brawl-green' : 'text-brawl-red'}`}>
                        {winRate}%
                      </span>
                    </div>

                    {/* 最大連勝 */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">最大連勝</span>
                      <span className="text-brawl-green font-bold">{stats.maxWinStreak}連勝</span>
                    </div>

                    {/* 最大連敗 */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">最大連敗</span>
                      <span className="text-brawl-red font-bold">{stats.maxLoseStreak}連敗</span>
                    </div>

                    {/* 期間表示 */}
                    {battlePeriod && (
                      <div className="mt-3 pt-2 border-t border-brawl-blue/30 text-xs text-gray-500 text-center">
                        ※{battlePeriod.oldest} ~ {battlePeriod.newest} 直近{battlePeriod.count}戦の期間
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm text-center py-2">
                    期間内のバトルデータなし
                    {battlePeriod && (
                      <div className="mt-2 text-xs text-gray-500">
                        ※{battlePeriod.oldest} ~ {battlePeriod.newest}
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
