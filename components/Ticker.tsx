'use client'

import { useState, useEffect } from 'react'

const recentSales = [
  { name: 'Kaye', location: 'Quezon City', product: 'BPC-157' },
  { name: 'Maria', location: 'Makati', product: 'Tirzepatide' },
  { name: 'Juan', location: 'Cebu', product: 'Semaglutide' },
  { name: 'Ana', location: 'Davao', product: 'Retatrutide' },
]

export default function TrustTicker() {
  const [sale, setSale] = useState<any>(null)

  useEffect(() => {
    const showSale = () => {
      const randomSale = recentSales[Math.floor(Math.random() * recentSales.length)]
      setSale(randomSale)
      setTimeout(() => setSale(null), 5000)
    }

    const timer = setTimeout(showSale, 5000)
    const interval = setInterval(showSale, 20000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  if (!sale) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-peppermint-wash shadow-xl rounded-premium p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-[280px]">
      <div className="w-10 h-10 bg-peppermint-wash rounded-full flex items-center justify-center shrink-0">
        <span className="text-lg">🛒</span>
      </div>
      <div>
        <p className="text-xs text-charcoal font-bold">{sale.name} from {sale.location}</p>
        <p className="text-[11px] text-neutralgrey">just bought <span className="font-bold text-peppermint-deep">{sale.product}</span></p>
      </div>
    </div>
  )
}