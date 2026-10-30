'use client'

import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import CartDrawer from '@/components/CartDrawer'
import { useState, useEffect } from 'react'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-heading', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

const leaves = [
  { left: '5%', size: 'text-5xl', duration: '12s', delay: '0s', opacity: 0.6, symbol: '☘︎' },
  { left: '15%', size: 'text-3xl', duration: '15s', delay: '0.5s', opacity: 0.4, symbol: '⸙' },
  { left: '25%', size: 'text-6xl', duration: '10s', delay: '1s', opacity: 0.7, symbol: '☘︎' },
  { left: '35%', size: 'text-2xl', duration: '18s', delay: '0s', opacity: 0.5, symbol: '⸙' },
  { left: '45%', size: 'text-4xl', duration: '14s', delay: '0.5s', opacity: 0.6, symbol: '☘︎' },
  { left: '55%', size: 'text-5xl', duration: '11s', delay: '1s', opacity: 0.4, symbol: '⸙' },
  { left: '65%', size: 'text-3xl', duration: '16s', delay: '0s', opacity: 0.8, symbol: '☘︎' },
  { left: '75%', size: 'text-6xl', duration: '13s', delay: '0.5s', opacity: 0.5, symbol: '⸙' },
  { left: '85%', size: 'text-4xl', duration: '17s', delay: '1s', opacity: 0.6, symbol: '☘︎' },
  { left: '95%', size: 'text-5xl', duration: '12s', delay: '0s', opacity: 0.4, symbol: '⸙' },
  { left: '10%', size: 'text-6xl', duration: '19s', delay: '11s', opacity: 0.5, symbol: '☘︎' },
  { left: '30%', size: 'text-3xl', duration: '14s', delay: '5s', opacity: 0.7, symbol: '⸙' },
  { left: '50%', size: 'text-4xl', duration: '11s', delay: '12s', opacity: 0.6, symbol: '☘︎' },
  { left: '70%', size: 'text-5xl', duration: '15s', delay: '3s', opacity: 0.5, symbol: '⸙' },
  { left: '90%', size: 'text-2xl', duration: '13s', delay: '8s', opacity: 0.8, symbol: '☘︎' },
  { left: '40%', size: 'text-6xl', duration: '18s', delay: '10s', opacity: 0.4, symbol: '⸙' },
  { left: '80%', size: 'text-3xl', duration: '12s', delay: '2s', opacity: 0.7, symbol: '☘︎' },
  { left: '20%', size: 'text-4xl', duration: '16s', delay: '6s', opacity: 0.5, symbol: '⸙' },
]

const recentSales = [
  { name: 'Kaye', location: 'Quezon City', product: 'BPC-157' },
  { name: 'Maria', location: 'Makati', product: 'Tirzepatide' },
  { name: 'Juan', location: 'Cebu', product: 'Semaglutide' },
  { name: 'Ana', location: 'Davao', product: 'Retatrutide' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sale, setSale] = useState<any>(null)

  useEffect(() => {
    const showSale = () => {
      const randomSale = recentSales[Math.floor(Math.random() * recentSales.length)]
      setSale(randomSale)
      setTimeout(() => setSale(null), 5000)
    }
    const timer = setTimeout(showSale, 5000)
    const interval = setInterval(showSale, 20000)
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [])

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <title>KD-PEPPERMINTS — Small doses, real care</title>
        <meta name="description" content="Premium wellness products, delivered with care." />
        
        {/* 🔥 PWA META TAGS FOR MOBILE APP INSTALLATION */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KD-Pep" />
        <meta name="theme-color" content="#3FBFA0" />
      </head>
      
      <body className="bg-peppermint-base text-charcoal font-body antialiased relative min-h-screen">
        
        {/* FALLING LEAVES */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {leaves.map((leaf, index) => (
            <div
              key={index}
              className={`absolute -top-10 text-peppermint-deep animate-falling select-none ${leaf.size}`}
              style={{
                left: leaf.left,
                animationDuration: leaf.duration,
                animationDelay: leaf.delay,
                opacity: leaf.opacity,
              }}
            >
              {leaf.symbol}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <CartProvider>
            <div className="flex-1">
              {children}
            </div>
            
            <CartDrawer />

            {/* TRUST TICKER POPUP */}
            {sale && (
              <div className="fixed bottom-4 left-4 z-50 bg-white border border-peppermint-wash shadow-xl rounded-premium p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-[280px]">
                <div className="w-10 h-10 bg-peppermint-wash rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg">🛒</span>
                </div>
                <div>
                  <p className="text-xs text-charcoal font-bold">{sale.name} from {sale.location}</p>
                  <p className="text-[11px] text-neutralgrey">just bought <span className="font-bold text-peppermint-deep">{sale.product}</span></p>
                </div>
              </div>
            )}
            
            <footer className="bg-charcoal text-white/70 py-10 mt-auto">
              <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <h2 className="font-heading text-2xl text-white mb-1">KD-PEPPERMINTS</h2>
                  <p className="text-sm text-peppermint-wash/60">Small doses, real care.</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <a href="/guides" className="hover:text-white transition-colors">Guides</a>
                  <a href="/contact" className="hover:text-white transition-colors">FAQ</a>
                  <a href="/track" className="hover:text-white transition-colors">Track Order</a>
                </div>
                <div className="text-sm">
                  <p className="text-sm">© 2026 KD-Peppermints.</p>
                </div>
              </div>
            </footer>

          </CartProvider>
        </div>

      </body>
    </html>
  )
}