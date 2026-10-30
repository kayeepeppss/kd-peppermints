'use client'

import { useState, useEffect } from 'react'
import { useCart } from './CartContext'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  piece_price?: number
  purity: string
  variant: string
  inStock: boolean
  category: string
  image_url?: string
  quantity?: number
}

export default function ProductCard({ product, onQuickView }: { product: Product, onQuickView: (p: Product) => void }) {
  const [qty, setQty] = useState(1)
  const [buyMode, setBuyMode] = useState<'kit' | 'piece'>('kit')
  const { addToCart } = useCart()
  
  const isGroupBuy = product.category.includes('Manufacturer')
  const currentQty = product.quantity !== undefined ? product.quantity : (product.inStock ? 10 : 0)
  const isLowStock = currentQty > 0 && currentQty <= 5
  const isOutOfStock = currentQty === 0

  // Calculate price based on toggle
  const activePrice = buyMode === 'kit' ? product.price : (product.piece_price || Math.round(product.price / 10))

  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    if (!isGroupBuy) return
    const targetDate = new Date('2026-11-07T23:59:59').getTime()
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now
      if (distance > 0) setDaysLeft(Math.floor(distance / (1000 * 60 * 60 * 24)))
      else setDaysLeft(0)
    }, 1000 * 60 * 60)
    
    return () => clearInterval(interval)
  }, [isGroupBuy])

  return (
    <div className={`bg-white rounded-premium p-3 md:p-4 shadow-sm border border-peppermint-wash transition-shadow group flex flex-col ${!isOutOfStock ? 'hover:shadow-md' : 'opacity-80'}`}>
      
      {/* Product Image */}
      <div 
        onClick={() => onQuickView(product)}
        className="w-full h-32 md:h-48 bg-peppermint-base rounded-soft mb-3 md:mb-4 flex items-center justify-center cursor-pointer overflow-hidden relative"
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock && 'grayscale'}`} />
        ) : (
          <span className="text-neutralgrey/50 text-xs md:text-sm">No Image</span>
        )}
        
        <div className="absolute top-1 left-1 md:top-2 md:left-2 flex flex-col gap-1">
          {isLowStock && !isOutOfStock && (
            <span className="bg-warmpop-coral text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold shadow-md">
              Only {currentQty} left!
            </span>
          )}
          {isGroupBuy && daysLeft > 0 && (
            <span className="bg-charcoal text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold shadow-md">
              GB Ends in {daysLeft}d
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-charcoal text-white px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1 gap-1">
          <h3 className="font-heading text-charcoal text-sm md:text-lg leading-tight cursor-pointer hover:text-peppermint-deep transition-colors line-clamp-1" onClick={() => onQuickView(product)}>
            {product.name}
          </h3>
        </div>
        
        {/* Kit / Piece Toggle */}
        <div className="flex bg-peppermint-base rounded-full p-1 mb-2 md:mb-3 w-fit">
          <button 
            onClick={() => setBuyMode('kit')}
            className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded-full transition-all ${buyMode === 'kit' ? 'bg-white text-charcoal shadow-sm' : 'text-neutralgrey hover:text-charcoal'}`}
          >
            Kit
          </button>
          <button 
            onClick={() => setBuyMode('piece')}
            className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded-full transition-all ${buyMode === 'piece' ? 'bg-white text-charcoal shadow-sm' : 'text-neutralgrey hover:text-charcoal'}`}
          >
            Piece
          </button>
        </div>

        <div className="flex gap-1 md:gap-2 mb-2 md:mb-3">
          <span className="bg-peppermint-wash text-peppermint-deep text-[9px] md:text-xs font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">{product.variant}</span>
          <span className="bg-peppermint-wash text-peppermint-deep text-[9px] md:text-xs font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">✨ {product.purity}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2 mt-auto">
        <div className={`flex items-center border border-peppermint-wash rounded-soft bg-peppermint-base ${isOutOfStock && 'opacity-50 pointer-events-none'}`}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-2 py-1.5 md:px-3 md:py-2 text-charcoal/50 hover:text-charcoal transition-colors text-xs md:text-sm">-</button>
          <span className="w-4 md:w-6 text-center text-xs md:text-sm font-medium">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-2 py-1.5 md:px-3 md:py-2 text-charcoal/50 hover:text-charcoal transition-colors text-xs md:text-sm">+</button>
        </div>

        <button 
          onClick={() => addToCart({ ...product, price: activePrice, name: `${product.name} (${buyMode === 'kit' ? 'Kit' : 'Piece'})` }, qty)}
          disabled={isOutOfStock}
          className={`flex-1 font-semibold py-1.5 md:py-2 rounded-soft transition-colors shadow-sm text-[10px] md:text-sm ${
            !isOutOfStock ? 'bg-warmpop-coral hover:bg-warmpop-caramel text-white' : 'bg-neutralgrey/20 text-neutralgrey cursor-not-allowed'
          }`}
        >
          {!isOutOfStock ? `Add ₱${activePrice}` : 'Out'}
        </button>
      </div>

    </div>
  )
}