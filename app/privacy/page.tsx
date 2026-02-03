import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | Brawl Stats Analyzer',
  description: 'Brawl Stats Analyzerのプライバシーポリシー',
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-brawl-card rounded-2xl border-2 border-brawl-blue/30 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-brawl-yellow mb-6">
          プライバシーポリシー
        </h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. はじめに</h2>
            <p>
              Brawl Stats Analyzer（以下「本サービス」）は、ユーザーのプライバシーを尊重し、
              個人情報の保護に努めています。本プライバシーポリシーは、本サービスがどのような
              情報を収集し、どのように使用するかを説明します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. 収集する情報</h2>
            <p className="mb-2">本サービスは以下の情報を収集する場合があります：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Brawl Starsのプレイヤータグ（ユーザーが入力した場合）</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
              <li>Cookieおよび類似技術による情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. 情報の利用目的</h2>
            <p className="mb-2">収集した情報は以下の目的で利用します：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Brawl Stars APIを通じたプレイヤー統計の表示</li>
              <li>サービスの改善と最適化</li>
              <li>広告の配信（Google AdSense）</li>
              <li>アクセス解析</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. 広告について</h2>
            <p className="mb-2">
              本サービスはGoogle AdSenseを利用して広告を配信しています。
              Google AdSenseは、ユーザーの興味に基づいた広告を表示するために
              Cookieを使用することがあります。
            </p>
            <p className="mb-2">
              ユーザーはGoogleの広告設定ページ（
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brawl-blue hover:underline"
              >
                https://www.google.com/settings/ads
              </a>
              ）でパーソナライズ広告を無効にすることができます。
            </p>
            <p>
              詳細については、Googleのプライバシーポリシー（
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brawl-blue hover:underline"
              >
                https://policies.google.com/privacy
              </a>
              ）をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Cookieの使用</h2>
            <p>
              本サービスはCookieを使用しています。Cookieはユーザーのブラウザに保存される
              小さなテキストファイルで、サービスの機能向上や広告配信に使用されます。
              ユーザーはブラウザの設定でCookieを無効にすることができますが、
              一部の機能が正常に動作しなくなる可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. 第三者への提供</h2>
            <p>
              本サービスは、法令に基づく場合を除き、ユーザーの個人情報を第三者に
              提供することはありません。ただし、Google AdSenseなどの広告サービスは、
              独自のプライバシーポリシーに基づいて情報を収集・利用する場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. 外部サービス</h2>
            <p className="mb-2">本サービスは以下の外部サービスを利用しています：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Brawl Stars API（Supercell）- プレイヤーデータの取得</li>
              <li>Brawlify API - ゲームアセットの取得</li>
              <li>Google AdSense - 広告配信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. プライバシーポリシーの変更</h2>
            <p>
              本プライバシーポリシーは予告なく変更される場合があります。
              重要な変更がある場合は、本サービス上でお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. お問い合わせ</h2>
            <p>
              本プライバシーポリシーに関するお問い合わせは、GitHubリポジトリの
              Issueを通じてご連絡ください。
            </p>
          </section>

          <div className="pt-6 border-t border-gray-700 text-sm text-gray-500">
            <p>最終更新日: 2025年2月1日</p>
          </div>
        </div>
      </div>
    </div>
  )
}
