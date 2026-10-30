'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/components/supabase'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Require at least one field to be filled out
    if (!orderId.trim() && !phone.trim()) {
      setError('Please enter either your Order ID or Mobile Number.')
      return
    }

    setIsLoading(true)
    setError('')
    setOrders([])

    let query = supabase.from('orders').select('*')

    // Build the search query based on what they typed
    if (orderId.trim()) {
      query = query.eq('id', orderId.trim())
    } else if (phone.trim()) {
      query = query.eq('customer_phone', phone.trim())
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      setError('An error occurred. Please try again.')
    } else if (!data || data.length === 0) {
      setError('No orders found. Please check your details and try again.')
    } else {
      setOrders(data)
    }
    setIsLoading(false)
  }

  return (
   <main className="min-h-screen pt-32 px-6 pb-20">
      <Navbar />
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl text-charcoal mb-2">Track Your Order</h1>
          <p className="text-neutralgrey">Enter your Order ID OR Mobile Number to see your order status.</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash mb-8">
          <form onSubmit={handleTrack} className="flex flex-col gap-4">
            
            {/* Order ID Input */}
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Order ID</label>
              <input 
                type="text" 
                placeholder="e.g. 33e6bac5-b518-4a37..." 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-4 text-sm focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50"
              />
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-peppermint-wash flex-1"></div>
              <span className="text-xs text-neutralgrey font-bold tracking-widest uppercase">OR</span>
              <div className="h-px bg-peppermint-wash flex-1"></div>
            </div>

            {/* Mobile Number Input */}
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Mobile Number</label>
              <input 
                type="tel" 
                placeholder="e.g. 0976 171 0264" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-4 text-sm focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-charcoal text-white font-bold py-4 rounded-soft hover:bg-charcoal/80 transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
          
          {error && <p className="text-warmpop-coral text-sm font-medium mt-4 text-center">{error}</p>}
        </div>

        {orders.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-neutralgrey font-medium">Found {orders.length} order(s)</p>
            
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-premium shadow-sm border border-peppermint-wash overflow-hidden">
                <div className="bg-peppermint-base p-6 border-b border-peppermint-wash flex justify-between items-center">
                  <div>
                    <p className="text-xs text-neutralgrey font-semibold uppercase tracking-wider mb-1">Order Status</p>
                    <p className="font-heading text-2xl text-charcoal">{order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutralgrey font-semibold uppercase tracking-wider mb-1">Date Ordered</p>
                    <p className="font-medium text-charcoal">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-heading text-lg text-charcoal mb-4">Items Ordered</h3>
                  <div className="space-y-3 mb-6">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm border-b border-peppermint-wash/50 pb-2">
                        <span className="text-charcoal">{item.product.name} (x{item.quantity})</span>
                        <span className="font-medium text-charcoal">₱{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-charcoal pt-2 border-t border-peppermint-wash">
                    <span>Total:</span>
                    <span>₱{order.total}</span>
                  </div>
                  
                  <div className="mt-8 text-center bg-peppermint-base/50 p-4 rounded-soft">
                    <p className="text-sm text-neutralgrey">Need help with this order?</p>
                    <a href="https://wa.me/639761710264" target="_blank" className="text-peppermint-deep font-bold hover:underline">
                      Message us on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}