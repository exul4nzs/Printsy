import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Printsy',
  description: 'Where some memories deserve more than a screen. Print them, feel them, and make them last 💕',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-off-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
