import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { schoolConfig, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.brand}`,
    template: `%s — ${siteConfig.name}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">本文へ移動</a>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="技術判断集 ホーム">
            <span className="brand-mark">JB</span>
            <span>
              <strong>技術判断集</strong>
              <small>JUNKBRANDING</small>
            </span>
          </Link>
          <nav aria-label="メインナビゲーション">
            <Link href="/goals">学ぶ順番</Link>
            <Link href="/decisions">技術判断</Link>
            <Link href="/books">書籍</Link>
            <Link href="/methodology">判定方法</Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div>
            <strong>JUNKBRANDING</strong>
            <p>検証可能な技術判断を、日付・条件・根拠とともに残す。</p>
          </div>
          <div className="footer-links">
            <Link href="/about">このサイトについて</Link>
            <a href={`${schoolConfig.url}?utm_source=decisions&utm_medium=referral&utm_campaign=footer`} target="_blank" rel="noreferrer">Web制作の学び方を相談する（運営元のスクール）</a>
            <a href="https://junkbranding.com" target="_blank" rel="noreferrer">junkbranding.com</a>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
