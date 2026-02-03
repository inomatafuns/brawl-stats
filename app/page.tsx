'use client';

import { useState } from 'react';
import PlayerSearch from '@/components/PlayerSearch';
import PlayerProfile from '@/components/PlayerProfile';
import BrawlerList from '@/components/BrawlerList';
import TrophyDistribution from '@/components/TrophyDistribution';
import BattleLog from '@/components/BattleLog';
import BattleAnalysis from '@/components/BattleAnalysis';
import PlayerCompare from '@/components/PlayerCompare';
import AdBanner from '@/components/AdBanner';
import { Player, BattleLog as BattleLogType } from '@/lib/types';

// プロキシサーバーURL（環境変数から取得、フォールバックはローカルAPI）
const API_BASE = process.env.NEXT_PUBLIC_BRAWL_API_PROXY || '';

interface PlayerData {
  player: Player;
  battleLog: BattleLogType | null;
}

export default function Home() {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerData | null>(null);
  const [comparePlayers, setComparePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'analysis' | 'compare'>('profile');

  const handleSearch = async (tag: string) => {
    setLoading(true);
    setError(null);

    try {
      // タグから#を除去
      const cleanTag = tag.replace('#', '');

      // プロキシサーバーまたはローカルAPIを使用
      const playerUrl = API_BASE
        ? `${API_BASE}/api/player/${cleanTag}`
        : `/api/player/${encodeURIComponent(tag)}`;

      const playerRes = await fetch(playerUrl);

      if (!playerRes.ok) {
        if (playerRes.status === 404) {
          throw new Error('プレイヤーが見つかりませんでした');
        }
        throw new Error('データの取得に失敗しました');
      }

      const playerData = await playerRes.json();

      // バトルログを取得
      let battleLogData = null;
      const battleLogUrl = API_BASE
        ? `${API_BASE}/api/battlelog/${cleanTag}`
        : `/api/battlelog/${encodeURIComponent(tag)}`;

      const battleLogRes = await fetch(battleLogUrl);
      if (battleLogRes.ok) {
        battleLogData = await battleLogRes.json();
      }

      setCurrentPlayer({ player: playerData, battleLog: battleLogData });
      setActiveTab('profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setCurrentPlayer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCompare = () => {
    if (currentPlayer && !comparePlayers.find((p) => p.tag === currentPlayer.player.tag)) {
      if (comparePlayers.length >= 3) {
        alert('比較できるプレイヤーは最大3人までです');
        return;
      }
      setComparePlayers([...comparePlayers, currentPlayer.player]);
      setActiveTab('compare');
    }
  };

  const handleRemoveFromCompare = (tag: string) => {
    setComparePlayers(comparePlayers.filter((p) => p.tag !== tag));
  };

  const isInCompare = currentPlayer
    ? comparePlayers.some((p) => p.tag === currentPlayer.player.tag)
    : false;

  return (
    <div>
      <PlayerSearch onSearch={handleSearch} />

      {/* 広告: 検索バーの下 */}
      <AdBanner slot="1234567890" format="horizontal" className="mb-6" />

      {loading && (
        <div className="card text-center py-12">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-brawl-yellow rounded-full animate-spin border-t-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-pulse">⚔️</span>
            </div>
          </div>
          <p className="mt-4 text-brawl-yellow font-bold animate-pulse">データを読み込み中...</p>
        </div>
      )}

      {error && (
        <div className="card-accent text-center">
          <div className="text-4xl mb-4">😢</div>
          <p className="text-brawl-red text-xl font-bold">{error}</p>
          <p className="text-sm text-gray-400 mt-2">
            プレイヤータグを確認してもう一度お試しください
          </p>
        </div>
      )}

      {!loading && currentPlayer && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-b from-brawl-yellow to-yellow-600 text-brawl-dark shadow-brawl'
                  : 'bg-brawl-card text-gray-400 hover:text-white border border-brawl-blue/30'
              }`}
            >
              👤 プロフィール
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'analysis'
                  ? 'bg-gradient-to-b from-brawl-yellow to-yellow-600 text-brawl-dark shadow-brawl'
                  : 'bg-brawl-card text-gray-400 hover:text-white border border-brawl-blue/30'
              }`}
            >
              📊 バトル分析
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-6 py-3 rounded-xl font-bold transition-all relative ${
                activeTab === 'compare'
                  ? 'bg-gradient-to-b from-brawl-yellow to-yellow-600 text-brawl-dark shadow-brawl'
                  : 'bg-brawl-card text-gray-400 hover:text-white border border-brawl-blue/30'
              }`}
            >
              ⚖️ 比較
              {comparePlayers.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-brawl-red rounded-full text-white text-xs flex items-center justify-center">
                  {comparePlayers.length}
                </span>
              )}
            </button>
            {!isInCompare && (
              <button
                onClick={handleAddToCompare}
                className="px-6 py-3 rounded-xl font-bold bg-brawl-card text-brawl-blue hover:text-brawl-yellow border border-brawl-blue/30 hover:border-brawl-yellow/50 transition-all"
              >
                ➕ 比較に追加
              </button>
            )}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <PlayerProfile player={currentPlayer.player} />

              {/* 広告: プロフィールの下 */}
              <AdBanner slot="2345678901" format="rectangle" className="mx-auto max-w-md" />

              {currentPlayer.player.brawlers.length > 0 && (
                <TrophyDistribution brawlers={currentPlayer.player.brawlers} />
              )}
              {currentPlayer.battleLog && currentPlayer.battleLog.items.length > 0 && (
                <BattleLog battles={currentPlayer.battleLog.items} />
              )}

              {currentPlayer.player.brawlers.length > 0 && (
                <BrawlerList
                  brawlers={currentPlayer.player.brawlers}
                  battles={currentPlayer.battleLog?.items}
                  playerTag={currentPlayer.player.tag}
                />
              )}

              {/* 広告: ブロウラー一覧の下 */}
              <AdBanner slot="3456789012" format="horizontal" />
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div>
              {currentPlayer.battleLog && currentPlayer.battleLog.items.length > 0 ? (
                <>
                  <BattleAnalysis battles={currentPlayer.battleLog.items} />
                  {/* 広告: 分析の下 */}
                  <AdBanner slot="4567890123" format="horizontal" className="mt-8" />
                </>
              ) : (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-400">バトルログがありません</p>
                </div>
              )}
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === 'compare' && (
            <div>
              {comparePlayers.length >= 2 ? (
                <>
                  <PlayerCompare
                    players={comparePlayers}
                    onRemovePlayer={handleRemoveFromCompare}
                  />
                  {/* 広告: 比較の下 */}
                  <AdBanner slot="5678901234" format="horizontal" className="mt-8" />
                </>
              ) : (
                <div className="card text-center py-12">
                  <div className="text-6xl mb-4 animate-float">⚖️</div>
                  <p className="text-xl font-bold text-brawl-yellow mb-2">
                    プレイヤーを比較しよう
                  </p>
                  <p className="text-gray-400 mb-4">
                    {comparePlayers.length === 0
                      ? '「比較に追加」ボタンでプレイヤーを追加してください'
                      : '比較するにはもう1人追加してください'}
                  </p>
                  {comparePlayers.length === 1 && (
                    <div className="inline-block bg-brawl-card rounded-xl p-4 border border-brawl-blue/30">
                      <span className="text-gray-400">追加済み: </span>
                      <span
                        className="font-bold"
                        style={{ color: comparePlayers[0].nameColor || '#FFC425' }}
                      >
                        {comparePlayers[0].name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !currentPlayer && !error && (
        <div className="card text-center py-16">
          <div className="text-6xl mb-6 animate-float">🎮</div>
          <p className="text-2xl font-bold text-brawl-yellow mb-2">
            プレイヤー統計を分析しよう
          </p>
          <p className="text-gray-400 mb-6">
            プレイヤータグを入力して検索してください
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span className="bg-brawl-darker px-3 py-1 rounded-full">#2PP</span>
            <span className="bg-brawl-darker px-3 py-1 rounded-full">#8CG8LUJ</span>
            <span className="bg-brawl-darker px-3 py-1 rounded-full">#YOURTAGHERE</span>
          </div>
        </div>
      )}
    </div>
  );
}
