// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import ParticleBackground from '@/components/ParticleBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata = { title: 'Attendance', description: 'One-tap attendance' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative min-h-screen`}>
        <ParticleBackground />
        <main className="relative z-10 mx-auto max-w-6xl p-6 md:p-10">{children}</main>
      </body>
    </html>
  )
}
