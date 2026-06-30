import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MegaSonic Command Center',
  description: 'Business Operating System for FeelBassVIP & HomeSetupSolutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
