'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useCart } from '@/components/CartContext'

export default function CartPage() {
  const { cart, removeFromCart, cartTotal, cartCount } = useCart()
  const router = useRouter()

  // Calculate Admin Fee (₱300 if there are Group Buy items)
  const hasGroupBuyItems = cart.some(item => item.product.category.includes('Manufacturer'))
  const adminFee = hasGroupBuyItems ? 300 : 0
  const finalTotal = cartTotal + adminFee

  // If cart is empty, show a nice empty state
  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-32 px-6 pb-20">
        <Navbar />
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="font-heading text-4xl text-charcoal mb-4">Your Cart is Empty</h1>
          <p className="text-neutralgrey mb-8">Looks like you haven't added anything yet.</p>
          <Link 
            href="/group-buy" 
            className="bg-peppermint-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-peppermint-deep transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    )
  }

  // If cart has items, show the list
  return (
    <main className="min-h-screen pt-32 px-6 pb-20">
      <Navbar />
      
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading text-4xl text-charcoal mb-8">Your Cart ({cartCount} items)</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Cart Items */}
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="bg-white p-4 rounded-premium shadow-sm border border-peppermint-wash flex gap-4 items-center">
                
                <div className="w-20 h-20 bg-peppermint-base rounded-soft flex items-center justify-center shrink-0 overflow-hidden">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-neutralgrey/50 text-xs">Img</span>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-heading text-lg text-charcoal">{item.product.name}</h3>
                  <p className="text-sm text-neutralgrey mb-1">{item.product.variant}</p>
                  <p className="text-peppermint-deep font-bold">₱{item.product.price}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-peppermint-wash rounded-soft bg-peppermint-base">
                    <span className="px-3 py-1 text-sm font-medium">Qty: {item.quantity}</span>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-xs text-warmpop-coral hover:text-warmpop-caramel font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white p-6 rounded-premium shadow-sm border border-peppermint-wash sticky top-32">
              <h2 className="font-heading text-2xl text-charcoal mb-6">Summary</h2>
              
              <div className="space-y-3 mb-6 text-sm text-neutralgrey">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-charcoal font-medium">₱{cartTotal}</span>
                </div>
                
                {/* Show Admin Fee if applicable */}
                {adminFee > 0 && (
                  <div className="flex justify-between">
                    <span>Admin Fee (Group Buy)</span>
                    <span className="text-charcoal font-medium">₱{adminFee}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-charcoal font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-peppermint-wash pt-4 mb-6 flex justify-between items-center">
                <span className="font-semibold text-charcoal text-lg">Total</span>
                <span className="font-heading text-2xl text-charcoal">₱{finalTotal}</span>
              </div>

              <Link 
                href="/checkout"
                className="w-full block text-center bg-warmpop-coral hover:bg-warmpop-caramel text-white font-bold py-4 rounded-full transition-colors shadow-md mb-3"
              >
                Proceed to Checkout
              </Link>

              {/* NEW: Continue Shopping Button */}
              <button 
                onClick={() => router.back()}
                className="w-full block text-center bg-white border border-peppermint-wash text-charcoal font-semibold py-4 rounded-full transition-colors hover:bg-peppermint-base shadow-sm flex justify-center items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Continue Shopping
              </button>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}