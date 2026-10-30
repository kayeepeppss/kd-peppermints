'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/components/supabase'

export default function AdminOverview() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin')
        return
      }

      // 1. Fetch Orders
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (ordersData) setOrders(ordersData)

      // 2. Fetch Low Stock Products (Quantity between 1 and 5)
      const { data: productsData } = await supabase.from('products').select('*').gt('quantity', 0).lte('quantity', 5)
      if (productsData) setLowStockProducts(productsData)

      setIsLoading(false)
    }
    fetchData()
  }, [router])

  // Calculate Analytics
  const totalSales = orders.filter(o => o.status === 'Paid' || o.status === 'Shipped').reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const totalOrders = orders.length

  if (isLoading) return <div className="min-h-screen bg-peppermint-base flex items-center justify-center font-bold text-peppermint-deep">Loading Overview...</div>

  return (
    <div className="min-h-screen bg-peppermint-base">
      
      {/* Top Navbar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-peppermint-wash px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <h1 className="font-heading text-2xl text-charcoal tracking-tight">KD Admin</h1>
        </div>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-charcoal bg-peppermint-base px-4 py-2 rounded-full hover:bg-peppermint-wash transition-colors">
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        <h2 className="font-heading text-3xl text-charcoal mb-8">Store Overview</h2>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-premium shadow-sm border border-peppermint-wash">
            <p className="text-sm text-neutralgrey font-bold uppercase tracking-wider mb-2">Total Sales</p>
            <p className="font-heading text-4xl text-peppermint-deep">₱{totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-premium shadow-sm border border-peppermint-wash">
            <p className="text-sm text-neutralgrey font-bold uppercase tracking-wider mb-2">Pending Orders</p>
            <p className="font-heading text-4xl text-warmpop-coral">{pendingOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-premium shadow-sm border border-peppermint-wash">
            <p className="text-sm text-neutralgrey font-bold uppercase tracking-wider mb-2">Total Orders</p>
            <p className="font-heading text-4xl text-charcoal">{totalOrders}</p>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="bg-white rounded-premium shadow-sm border border-peppermint-wash overflow-hidden">
          <div className="p-6 border-b border-peppermint-wash bg-peppermint-base/30 flex justify-between items-center">
            <h3 className="font-heading text-xl text-charcoal">⚠️ Low Stock Alerts</h3>
            <span className="bg-warmpop-coral text-white text-xs font-bold px-3 py-1 rounded-full">{lowStockProducts.length} items</span>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="p-6 text-neutralgrey">All products are well-stocked!</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-peppermint-base border-b border-peppermint-wash text-charcoal">
                <tr>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold text-right">Quantity Left</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id} className="border-b border-peppermint-wash last:border-0">
                    <td className="p-4 font-bold text-charcoal">{p.name}</td>
                    <td className="p-4 text-neutralgrey">{p.category}</td>
                    <td className="p-4 text-right">
                      <span className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full">{p.quantity} left</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}