'use client'

import { useState } from 'react'

export default function AdminOrdersTab({ orders, onSelectOrder }: { orders: any[], onSelectOrder: (order: any) => void }) {
  const [orderSearch, setOrderSearch] = useState('')

  // Filter orders based on search
  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) || 
    order.customer_phone.includes(orderSearch)
  )

  // Download CSV Function
  const downloadCSV = () => {
    if (orders.length === 0) return alert("No orders to download.")
    
    const headers = ["Order ID", "Date", "Customer Name", "Phone", "Address", "Courier", "Total", "Status"]
    
    const csvData = orders.map(order => {
      const date = new Date(order.created_at).toLocaleDateString()
      return [
        order.id,
        date,
        `"${order.customer_name}"`,
        `"${order.customer_phone}"`,
        `"${order.shipping_address}"`,
        order.courier,
        order.total,
        order.status
      ].join(",")
    })
    
    const csvContent = [headers.join(","), ...csvData].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `KD_Orders_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-premium shadow-sm border border-peppermint-wash overflow-hidden">
      
      {/* Search & Export Bar */}
      <div className="p-4 border-b border-peppermint-wash bg-peppermint-base/30 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-neutralgrey" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={orderSearch} 
            onChange={e => setOrderSearch(e.target.value)} 
            className="w-full bg-white border border-peppermint-wash rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50" 
          />
        </div>

        <button 
          onClick={downloadCSV}
          className="w-full md:w-auto bg-charcoal text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-charcoal/80 transition-colors shadow-sm"
        >
          Download CSV
        </button>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-peppermint-base border-b border-peppermint-wash text-charcoal">
          <tr>
            <th className="p-4 font-semibold">Date</th>
            <th className="p-4 font-semibold">Customer</th>
            <th className="p-4 font-semibold">Total</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr><td colSpan={5} className="p-4 text-center text-neutralgrey">No orders found.</td></tr>
          ) : (
            filteredOrders.map(order => (
              <tr key={order.id} className="border-b border-peppermint-wash last:border-0 hover:bg-peppermint-base/50 cursor-pointer transition-colors" onClick={() => onSelectOrder(order)}>
                <td className="p-4 text-neutralgrey font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-medium"><p className="text-charcoal">{order.customer_name}</p><p className="text-xs text-neutralgrey font-normal">{order.customer_phone}</p></td>
                <td className="p-4 font-bold text-charcoal">₱{order.total}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600 border border-orange-200' : order.status === 'Paid' ? 'bg-peppermint-wash text-peppermint-deep border border-peppermint-primary/30' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>{order.status}</span>
                </td>
                <td className="p-4"><button className="text-xs font-bold bg-white text-charcoal border border-peppermint-wash hover:border-peppermint-primary hover:text-peppermint-deep px-4 py-2 rounded-full transition-all shadow-sm">View</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}