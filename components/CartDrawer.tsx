'use client'

import Link from 'next/link'
import { useCart } from './CartContext'

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, cartTotal, removeFromCart } = useCart()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-peppermint-wash">
          <h2 className="font-heading text-2xl text-charcoal">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-neutralgrey hover:text-charcoal transition-colors text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-neutralgrey mt-10">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 items-center border-b border-peppermint-wash/50 pb-4">
                <div className="w-16 h-16 bg-peppermint-base rounded-soft overflow-hidden shrink-0">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutralgrey">Img</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-charcoal text-sm leading-tight">{item.product.name}</h3>
                  <p className="text-xs text-neutralgrey mb-1">{item.product.variant}</p>
                  <p className="text-sm font-bold text-peppermint-deep">₱{item.product.price} x {item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-warmpop-coral font-semibold hover:underline">Remove</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-peppermint-wash bg-peppermint-base/30">
            <div className="flex justify-between font-bold text-charcoal mb-4">
              <span>Subtotal</span>
              <span>₱{cartTotal}</span>
            </div>
            <Link 
              href="/cart"
              onClick={() => setIsCartOpen(false)}
              className="w-full block text-center bg-charcoal text-white font-bold py-4 rounded-full hover:bg-charcoal/80 transition-colors"
            >
              View Cart & Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}