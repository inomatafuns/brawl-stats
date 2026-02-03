'use client';

import { useState, useEffect, useRef } from 'react';

interface PlayerSearchProps {
  onSearch: (tag: string) => void;
}

interface SearchHistoryItem {
  tag: string;
  name?: string;
  timestamp: number;
}

interface BookmarkItem {
  tag: string;
  name?: string;
  createdAt: number;
}

const HISTORY_KEY = 'brawl-search-history';
const BOOKMARK_KEY = 'brawl-bookmarks';
const MAX_HISTORY = 10;

export default function PlayerSearch({ onSearch }: PlayerSearchProps) {
  const [playerTag, setPlayerTag] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');
  const isComposingRef = useRef(false);

  // ローカルストレージから読み込み
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        setHistory([]);
      }
    }

    const savedBookmarks = localStorage.getItem(BOOKMARK_KEY);
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);

  // 履歴を保存
  const saveToHistory = (tag: string) => {
    const newItem: SearchHistoryItem = {
      tag,
      timestamp: Date.now(),
    };

    const newHistory = [
      newItem,
      ...history.filter((h) => h.tag !== tag),
    ].slice(0, MAX_HISTORY);

    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // 履歴を削除
  const removeFromHistory = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newHistory = history.filter((h) => h.tag !== tag);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // 履歴を全削除
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  // ブックマークに追加
  const addBookmark = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (bookmarks.some((b) => b.tag === tag)) return;

    const newBookmark: BookmarkItem = {
      tag,
      createdAt: Date.now(),
    };

    const newBookmarks = [newBookmark, ...bookmarks];
    setBookmarks(newBookmarks);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(newBookmarks));
  };

  // ブックマークを削除
  const removeBookmark = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newBookmarks = bookmarks.filter((b) => b.tag !== tag);
    setBookmarks(newBookmarks);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(newBookmarks));
  };

  // ブックマーク済みかチェック
  const isBookmarked = (tag: string) => bookmarks.some((b) => b.tag === tag);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerTag.trim()) {
      const tag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;
      saveToHistory(tag);
      onSearch(tag);
      setShowHistory(false);
    }
  };

  const handleItemClick = (tag: string) => {
    setPlayerTag(tag.replace('#', ''));
    saveToHistory(tag);
    onSearch(tag);
    setShowHistory(false);
  };

  return (
    <div className="card mb-8">
      <h2 className="section-title">プレイヤーを検索</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          <input
            type="text"
            value={playerTag}
            onChange={(e) => {
              // IMEコンポジション中は大文字変換をスキップ
              if (isComposingRef.current) {
                setPlayerTag(e.target.value);
              } else {
                setPlayerTag(e.target.value.toUpperCase());
              }
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={(e) => {
              isComposingRef.current = false;
              // コンポジション終了時に大文字変換
              setPlayerTag((e.target as HTMLInputElement).value.toUpperCase());
            }}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="プレイヤータグを入力 (例: #2PP)"
            className="input-field w-full pl-12 text-lg"
          />

          {/* ドロップダウン */}
          {showHistory && (history.length > 0 || bookmarks.length > 0) && (
            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-brawl-card border border-brawl-blue/30 rounded-xl shadow-lg overflow-hidden">
              {/* タブ */}
              <div className="flex border-b border-brawl-blue/20">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setActiveTab('history'); }}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'text-brawl-yellow bg-brawl-darker'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🕒 履歴 ({history.length})
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setActiveTab('bookmarks'); }}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'bookmarks'
                      ? 'text-brawl-yellow bg-brawl-darker'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⭐ ブックマーク ({bookmarks.length})
                </button>
              </div>

              {/* 履歴タブ */}
              {activeTab === 'history' && (
                <>
                  {history.length > 0 ? (
                    <>
                      <div className="flex justify-end px-4 py-2 bg-brawl-darker/50">
                        <button
                          type="button"
                          onClick={clearHistory}
                          className="text-xs text-brawl-red hover:text-red-400 transition-colors"
                        >
                          全削除
                        </button>
                      </div>
                      <ul className="max-h-64 overflow-y-auto">
                        {history.map((item) => (
                          <li key={item.tag} className="flex items-center justify-between px-4 py-3 hover:bg-brawl-blue/10 transition-colors">
                            <button
                              type="button"
                              onClick={() => handleItemClick(item.tag)}
                              className="flex items-center gap-3 flex-1 text-left"
                            >
                              <span className="text-gray-500">🕒</span>
                              <span className="font-mono text-brawl-yellow">{item.tag}</span>
                            </button>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onMouseDown={(e) => addBookmark(item.tag, e)}
                                className={`text-xl p-1 transition-colors ${
                                  isBookmarked(item.tag)
                                    ? 'text-brawl-yellow'
                                    : 'text-gray-400 hover:text-brawl-yellow'
                                }`}
                                title={isBookmarked(item.tag) ? 'ブックマーク済み' : 'ブックマークに追加'}
                              >
                                {isBookmarked(item.tag) ? '⭐' : '☆'}
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => removeFromHistory(item.tag, e)}
                                className="text-lg text-gray-400 hover:text-brawl-red transition-colors p-1"
                              >
                                ✕
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      履歴がありません
                    </div>
                  )}
                </>
              )}

              {/* ブックマークタブ */}
              {activeTab === 'bookmarks' && (
                <>
                  {bookmarks.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto">
                      {bookmarks.map((item) => (
                        <li key={item.tag} className="flex items-center justify-between px-4 py-3 hover:bg-brawl-blue/10 transition-colors">
                          <button
                            type="button"
                            onClick={() => handleItemClick(item.tag)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            <span className="text-brawl-yellow">⭐</span>
                            <span className="font-mono text-brawl-yellow">{item.tag}</span>
                          </button>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onMouseDown={(e) => removeBookmark(item.tag, e)}
                              className="text-xl p-1 text-brawl-yellow hover:text-gray-400 transition-colors"
                              title="ブックマーク解除"
                            >
                              ★
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => removeBookmark(item.tag, e)}
                              className="text-lg text-gray-400 hover:text-brawl-red transition-colors p-1"
                            >
                              ✕
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p>ブックマークがありません</p>
                      <p className="text-xs mt-2">履歴の ☆ をクリックして追加</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap">
          検索する
        </button>
      </form>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <span className="text-brawl-yellow">💡</span>
        <span>プレイヤータグはゲーム内のプロフィールから確認できます</span>
      </div>
    </div>
  );
}
