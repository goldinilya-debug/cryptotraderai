import { Inter } from 'next/font/google'
import NavigationHandler from '@/components/NavigationHandler'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
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
      <body className={inter.className}>
        <NavigationHandler />
        {children}
      </body>
    </html>
  )
}
