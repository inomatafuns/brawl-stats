'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Battle } from '@/lib/types';

interface BattleLogProps {
  battles: Battle[];
}

interface BrawlifyMap {
  id: number;
  name: string;
  imageUrl: string;
}

const INITIAL_DISPLAY_COUNT = 6;
const LOAD_MORE_COUNT = 6;

// ゲームモードIDマッピング（API mode名 → CDN ID）
const getModeId = (mode: string): number | null => {
  const modeIds: Record<string, number> = {
    gemGrab: 48000000,
    showdown: 48000001,
    soloShowdown: 48000001,
    duoShowdown: 48000002,
    heist: 48000003,
    bounty: 48000004,
    siege: 48000005,
    brawlBall: 48000006,
    bigGame: 48000007,
    roboRumble: 48000008,
    bossFight: 48000009,
    hotZone: 48000010,
    presentPlunder: 48000011,
    knockout: 48000013,
    takedown: 48000014,
    loneStar: 48000015,
    volleyBrawl: 48000017,
    basketBrawl: 48000018,
    holdTheTrophy: 48000019,
    trophyThieves: 48000020,
    duels: 48000021,
    wipeout: 48000023,
    payload: 48000024,
    botDrop: 48000025,
    hunters: 48000026,
    lastStand: 48000027,
    snowtelThieves: 48000028,
    pumpkinPlunder: 48000029,
    godzillaCitySmash: 48000030,
    jellyfishing: 48000031,
    paintBrawl: 48000032,
    trophyEscape: 48000034,
    unknown: 48000035,
  };
  return modeIds[mode] || null;
};

// ゲームモードアイコンURL
const getModeIconUrl = (mode: string): string | null => {
  const modeId = getModeId(mode);
  if (!modeId) return null;
  return `https://cdn.brawlify.com/game-modes/regular/${modeId}.png`;
};

export default function BattleLog({ battles }: BattleLogProps) {
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [mapData, setMapData] = useState<Map<string, BrawlifyMap>>(new Map());

  // Brawlify APIからマップ情報を取得
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await fetch('https://api.brawlify.com/v1/maps');
        const data = await response.json();
        const mapsByName = new Map<string, BrawlifyMap>();

        if (data.list) {
          data.list.forEach((map: { id: number; name: string; imageUrl: string }) => {
            // マップ名を正規化（ハイフン/スペース/アポストロフィ削除、大文字小文字を揃える）
            const normalizedName = map.name.toLowerCase().replace(/[-\s']/g, '');
            mapsByName.set(normalizedName, {
              id: map.id,
              name: map.name,
              imageUrl: map.imageUrl,
            });
          });
        }
        setMapData(mapsByName);
      } catch (error) {
        console.error('Failed to fetch map data:', error);
      }
    };
    fetchMaps();
  }, []);

  // マップ画像URLを取得（マップ名からIDを取得し、CDNのURLを生成）
  const getMapImageUrl = (mapName: string): string | null => {
    // マップ名を正規化（ハイフン/スペース/アポストロフィ削除、大文字小文字を揃える）
    const normalizedName = mapName.toLowerCase().replace(/[-\s']/g, '');
    const map = mapData.get(normalizedName);
    if (!map) return null;
    // IDを使用してCDN URLを生成
    return `https://cdn.brawlify.com/maps/regular/${map.id}.png`;
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, battles.length));
  };

  const formatTime = (timeString: string) => {
    // Brawl Stars APIのタイムスタンプ形式: "20230101T120000.000Z"
    // 注意: APIは"Z"(UTC)を付けているが、実際の時刻はJST（日本時間）で記録されている
    // そのため、+09:00として解釈する必要がある
    try {
      const year = timeString.substring(0, 4);
      const month = timeString.substring(4, 6);
      const day = timeString.substring(6, 8);
      const hour = timeString.substring(9, 11);
      const minute = timeString.substring(11, 13);
      const second = timeString.substring(13, 15);

      // JSTとして解釈（Zを無視して+09:00として扱う）
      const jstString = `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
      const date = new Date(jstString);

      // 無効な日付の場合
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', timeString, '->', jstString);
        return '不明';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 0) return 'たった今'; // 時計のずれで若干未来になる場合
      if (diffMins < 1) return 'たった今';
      if (diffMins < 60) return `${diffMins}分前`;
      if (diffHours < 24) return `${diffHours}時間前`;
      if (diffDays < 30) return `${diffDays}日前`;
      return `${Math.floor(diffDays / 30)}ヶ月前`;
    } catch (error) {
      console.error('Error parsing time:', timeString, error);
      return '不明';
    }
  };

  const getResultStyle = (result?: string) => {
    switch (result) {
      case 'victory':
        return 'bg-gradient-to-r from-brawl-green to-green-600 text-white';
      case 'defeat':
        return 'bg-gradient-to-r from-brawl-red to-red-700 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getResultText = (result?: string, rank?: number) => {
    if (rank) return `#${rank}`;
    switch (result) {
      case 'victory':
        return '勝利';
      case 'defeat':
        return '敗北';
      case 'draw':
        return '引分';
      default:
        return '完了';
    }
  };

  // 勝敗統計を計算
  const stats = battles.reduce(
    (acc, battle) => {
      if (battle.battle.result === 'victory') acc.wins++;
      else if (battle.battle.result === 'defeat') acc.losses++;
      else acc.draws++;
      if (battle.battle.trophyChange) acc.trophyChange += battle.battle.trophyChange;
      return acc;
    },
    { wins: 0, losses: 0, draws: 0, trophyChange: 0 }
  );

  return (
    <div className="card">
      <h2 className="section-title">最近のバトル</h2>

      {/* Battle Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-brawl-green/20 to-brawl-card rounded-xl p-3 text-center border border-brawl-green/30">
          <div className="text-2xl font-bold text-brawl-green">{stats.wins}</div>
          <div className="text-xs text-gray-400">勝利</div>
        </div>
        <div className="bg-gradient-to-br from-brawl-red/20 to-brawl-card rounded-xl p-3 text-center border border-brawl-red/30">
          <div className="text-2xl font-bold text-brawl-red">{stats.losses}</div>
          <div className="text-xs text-gray-400">敗北</div>
        </div>
        <div className="bg-gradient-to-br from-brawl-yellow/20 to-brawl-card rounded-xl p-3 text-center border border-brawl-yellow/30">
          <div className={`text-2xl font-bold ${stats.trophyChange >= 0 ? 'text-brawl-green' : 'text-brawl-red'}`}>
            {stats.trophyChange >= 0 ? '+' : ''}{stats.trophyChange}
          </div>
          <div className="text-xs text-gray-400">🏆 変動</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {battles.slice(0, displayCount).map((battle, index) => {
          const modeIconUrl = getModeIconUrl(battle.event.mode);
          const mapImageUrl = getMapImageUrl(battle.event.map);

          return (
            <div
              key={index}
              className="bg-gradient-to-r from-brawl-card/50 to-brawl-darker rounded-xl overflow-hidden border border-brawl-blue/20 hover:border-brawl-yellow/30 transition-all"
            >
              {/* 横並びレイアウト: 左（モード情報） | 中央（マップ画像） | 右（結果） */}
              <div className="flex items-stretch h-[140px]">
                {/* 左: モード情報 */}
                <div className="flex flex-col justify-center p-3 min-w-0 w-[120px] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    {/* ゲームモードアイコン */}
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brawl-blue to-brawl-purple flex items-center justify-center shadow-brawl flex-shrink-0 overflow-hidden">
                      {modeIconUrl ? (
                        <Image
                          src={modeIconUrl}
                          alt={battle.event.mode}
                          width={32}
                          height={32}
                          className="w-8 h-8"
                          unoptimized
                        />
                      ) : (
                        <span className="text-lg">🎮</span>
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-sm truncate">{battle.event.mode}</div>
                  <div className="text-xs text-gray-400 truncate">{battle.event.map}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatTime(battle.battleTime)}</div>
                  {battle.battle.starPlayer && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-brawl-yellow text-xs">⭐</span>
                      <span className="text-xs text-brawl-yellow font-bold truncate">{battle.battle.starPlayer.name}</span>
                    </div>
                  )}
                </div>

                {/* 中央: マップ画像 */}
                <div className="flex-1 bg-brawl-darker flex items-center justify-center overflow-hidden">
                  {mapImageUrl ? (
                    <Image
                      src={mapImageUrl}
                      alt={battle.event.map}
                      width={100}
                      height={140}
                      className="object-contain h-full w-auto"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-[80px] h-[120px] bg-brawl-card/50 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No Map</span>
                    </div>
                  )}
                </div>

                {/* 右: 結果とトロフィー */}
                <div className="flex flex-col justify-center items-center p-3 gap-3 w-[70px] flex-shrink-0">
                  <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${getResultStyle(battle.battle.result)}`}>
                    {getResultText(battle.battle.result, battle.battle.rank)}
                  </div>
                  {battle.battle.trophyChange !== undefined && battle.battle.trophyChange !== 0 && (
                    <div
                      className={`text-sm font-bold px-2 py-1 rounded ${
                        battle.battle.trophyChange > 0 ? 'bg-brawl-green/80 text-white' : 'bg-brawl-red/80 text-white'
                      }`}
                    >
                      {battle.battle.trophyChange > 0 ? '+' : ''}
                      {battle.battle.trophyChange} 🏆
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* さらに表示ボタン */}
      {displayCount < battles.length && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            className="btn-secondary px-6 py-2 text-sm"
          >
            さらに表示 ({Math.min(LOAD_MORE_COUNT, battles.length - displayCount)}件)
          </button>
        </div>
      )}
    </div>
  );
}
