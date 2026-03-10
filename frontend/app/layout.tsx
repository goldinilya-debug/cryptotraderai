'use client'

import { Inter } from 'next/font/google'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Handle SPA routing for GitHub Pages
    const params = new URLSearchParams(window.location.search)
    const path = params.get('__path')
    if (path) {
      window.history.replaceState({}, '', path)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
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
