'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // 開発環境ではプレースホルダーを表示
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-brawl-card/50 border-2 border-dashed border-brawl-blue/30 rounded-xl flex items-center justify-center text-gray-500 ${className}`}
        style={{ minHeight: '90px' }}
      >
        <div className="text-center p-4">
          <span className="text-2xl">📢</span>
          <p className="text-sm mt-1">広告スペース</p>
          <p className="text-xs text-gray-600">（本番環境で表示）</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
