import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Brawl Stats Analyzer',
  description: 'Analyze your Brawl Stars stats and performance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={notoSansJP.className}>
        <div className="min-h-screen">
          {/* Header */}
          <header className="relative bg-gradient-to-r from-brawl-dark via-brawl-card to-brawl-dark border-b-4 border-brawl-yellow overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFC425' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            <div className="container mx-auto px-4 py-5 relative z-10">
              <div className="flex items-center justify-center gap-4">
                {/* Brawl Stars Style Logo */}
                <div className="relative">
                  <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider">
                    <span className="bg-gradient-to-b from-brawl-yellow via-yellow-400 to-brawl-orange bg-clip-text text-transparent">
                      Brawl Stats
                    </span>
                  </h1>
                  <div className="text-center -mt-1">
                    <span className="text-xs md:text-sm font-bold text-brawl-blue tracking-widest uppercase">
                      Analyzer
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-400 mt-2 text-sm tracking-wide">
                プレイヤー統計を分析・比較
              </p>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8 relative">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
              <div className="absolute top-20 left-10 w-64 h-64 bg-brawl-yellow rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-10 w-64 h-64 bg-brawl-blue rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-brawl-dark via-brawl-card to-brawl-dark border-t-2 border-brawl-blue/30 mt-12">
            <div className="container mx-auto px-4 py-6 text-center">
              <p className="text-brawl-blue font-bold">⭐ Powered by Brawl Stars API ⭐</p>
              <p className="text-gray-500 text-sm mt-2">
                This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell
              </p>
              <div className="mt-3">
                <a
                  href="/privacy"
                  className="text-gray-500 hover:text-brawl-blue text-sm transition-colors"
                >
                  プライバシーポリシー
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
