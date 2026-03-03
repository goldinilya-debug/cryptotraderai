import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CryptoTraderAI — AI Trading Signals',
  description: 'AI-powered cryptocurrency trading signals with Wyckoff analysis, SMC, and Kill Zones',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: #0a0a0f; 
            color: #fff; 
            font-family: system-ui, -apple-system, sans-serif;
            min-height: 100vh;
          }
        `}} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
