'use client'

import { useState } from 'react'
import { Product } from './ProductCard'
import { useCart } from './CartContext'

export default function QuickViewModal({ 
  product, 
  onClose, 
  allProducts = [], 
  onQuickView 
}: { 
  product: Product, 
  onClose: () => void,
  allProducts?: Product[],
  onQuickView?: (p: Product) => void
}) {
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()

  const handleAdd = () => {
    addToCart(product, qty)
    onClose()
  }

  // Find 3 related products from the same category
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-premium w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-peppermint-wash rounded-full text-charcoal transition-colors">✕</button>

        <div className="w-full md:w-1/2 p-6 flex flex-col border-b md:border-b-0 md:border-r border-peppermint-wash overflow-y-auto">
          <div className="w-full h-64 bg-peppermint-base rounded-soft mb-6 flex items-center justify-center overflow-hidden shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className={`w-full h-full object-cover ${!product.inStock && 'grayscale opacity-80'}`} />
            ) : (
              <span className="text-neutralgrey/50">No Image</span>
            )}
          </div>
          
          <h2 className="font-heading text-3xl text-charcoal mb-2">{product.name}</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-peppermint-wash text-peppermint-deep text-xs font-bold px-3 py-1 rounded-full">{product.variant}</span>
            <span className="bg-peppermint-wash text-peppermint-deep text-xs font-bold px-3 py-1 rounded-full">✨ {product.purity} Pure</span>
          </div>

          <p className="text-sm text-neutralgrey leading-relaxed mb-6">
            {product.description || 'No description available.'}
          </p>

          {relatedProducts.length > 0 && onQuickView && (
            <div className="mt-auto pt-6 border-t border-peppermint-wash">
              <p className="text-xs font-bold text-neutralgrey uppercase tracking-wider mb-3">You Might Also Like</p>
              <div className="flex gap-2">
                {relatedProducts.map(rp => (
                  <button 
                    key={rp.id}
                    onClick={() => {
                      onClose()
                      setTimeout(() => onQuickView(rp), 100)
                    }}
                    className="flex-1 bg-peppermint-base border border-peppermint-wash rounded-soft p-2 text-left hover:border-peppermint-primary transition-colors"
                  >
                    <p className="text-xs font-bold text-charcoal line-clamp-1">{rp.name}</p>
                    <p className="text-xs text-peppermint-deep font-medium">₱{rp.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-peppermint-base/30">
          <div className="mb-6">
            <p className="text-sm text-neutralgrey font-medium mb-1">Price</p>
            <p className="text-4xl font-heading text-charcoal">₱{product.price}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-neutralgrey font-medium mb-2">Quantity</p>
            <div className={`flex items-center border border-peppermint-wash rounded-full bg-white w-fit ${!product.inStock && 'opacity-50 pointer-events-none'}`}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-charcoal/50 hover:text-charcoal transition-colors rounded-l-full">-</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-charcoal/50 hover:text-charcoal transition-colors rounded-r-full">+</button>
            </div>
          </div>

          <div className="bg-charcoal text-white rounded-soft p-4 mb-6 flex justify-between items-center">
            <span className="text-sm text-white/70">Total</span>
            <span className="text-xl font-bold">₱{product.price * qty}</span>
          </div>

          <button 
            onClick={handleAdd} 
            disabled={!product.inStock}
            className={`w-full font-bold py-4 rounded-full transition-colors shadow-md text-lg ${
              product.inStock 
                ? 'bg-warmpop-coral hover:bg-warmpop-caramel text-white' 
                : 'bg-neutralgrey/20 text-neutralgrey cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>

      </div>
    </div>
  )
}