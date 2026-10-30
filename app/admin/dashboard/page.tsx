'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/components/supabase'
import { Product } from '@/components/ProductCard'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('default')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Product form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [purity, setPurity] = useState('')
  const [variant, setVariant] = useState('')
  const [category, setCategory] = useState('Manufacturer A')
  const [stockStatus, setStockStatus] = useState('In Stock')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<any[]>([])
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin')
      } else {
        fetchProducts()
        fetchOrders()
      }
    }
    checkUser()
  }, [router])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*')
    if (data) {
      const formatted = data.map(item => ({ 
        ...item, 
        inStock: (item.quantity || 0) > 0 || item.in_stock,
        quantity: item.quantity || 0
      }))
      setProducts(formatted as Product[])
    }
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.clear() 
    window.location.replace('/admin') 
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      let imageUrl = ''
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
        imageUrl = publicUrl
      }

      const { error } = await supabase.from('products').insert({
        name, description, price: parseFloat(price), purity, variant, category, 
        in_stock: stockStatus !== 'Out of Stock',
        quantity: stockStatus === 'In Stock' ? 10 : stockStatus === 'Low Stock' ? 3 : 0,
        image_url: imageUrl
      })

      if (error) throw error

      setMessage('Product added successfully!')
      setName(''); setDescription(''); setPrice(''); setPurity(''); setVariant(''); setStockStatus('In Stock'); setImageFile(null);
      fetchProducts()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setIsLoading(true)

    try {
      let imageUrl = editingProduct.image_url
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, editImageFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
        imageUrl = publicUrl
      }

      const { error } = await supabase.from('products').update({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        purity: editingProduct.purity,
        variant: editingProduct.variant,
        category: editingProduct.category,
        in_stock: editingProduct.inStock,
        quantity: editingProduct.quantity,
        image_url: imageUrl
      }).eq('id', editingProduct.id)

      if (error) throw error
      setEditingProduct(null)
      setEditImageFile(null)
      fetchProducts()
    } catch (error: any) {
      alert('Error updating product: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      setEditingProduct(null)
      fetchProducts()
    }
  }

  const handleBulkOutOfStock = async () => {
    if (!window.confirm(`Mark ${selectedProducts.length} products as Out of Stock?`)) return;
    const { error } = await supabase.from('products').update({ in_stock: false, quantity: 0 }).in('id', selectedProducts);
    if (!error) {
      setSelectedProducts([]);
      fetchProducts();
    }
  }

  const handleBulkPriceUpdate = async (percentage: number) => {
    if (selectedProducts.length === 0) return
    if (!window.confirm(`Change the price of ${selectedProducts.length} products by ${percentage}%?`)) return;

    const updates = selectedProducts.map(id => {
      const product = products.find(p => p.id === id)
      if (!product) return null
      const newPrice = product.price + (product.price * (percentage / 100))
      return supabase.from('products').update({ price: Math.round(newPrice) }).eq('id', id)
    })

    await Promise.all(updates)
    setSelectedProducts([])
    fetchProducts()
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (!error) {
      setOrders(orders.filter(o => o.id !== orderId))
      setSelectedOrder(null)
    }
  }

  // FILTERING & SORTING
  let displayedProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (sortOption === 'alphabetical') displayedProducts.sort((a, b) => a.name.localeCompare(b.name))
  if (sortOption === 'price-high') displayedProducts.sort((a, b) => b.price - a.price)
  if (sortOption === 'price-low') displayedProducts.sort((a, b) => a.price - b.price)
  if (sortOption === 'in-stock') displayedProducts = displayedProducts.filter(p => (p.quantity || 0) > 5)
  if (sortOption === 'low-stock') displayedProducts = displayedProducts.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= 5)
  if (sortOption === 'out-of-stock') displayedProducts = displayedProducts.filter(p => (p.quantity || 0) === 0)

  return (
    <div className="min-h-screen bg-peppermint-base">
      
      <div className="bg-white/80 backdrop-blur-md border-b border-peppermint-wash px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <h1 className="font-heading text-xl md:text-2xl text-charcoal tracking-tight">KD Admin</h1>
        </div>
        <button onClick={handleLogout} className="text-xs md:text-sm font-semibold text-warmpop-coral hover:text-warmpop-caramel transition-colors bg-warmpop-coral/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full">Log Out</button>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 mt-4 md:mt-8">
        
        {/* Top Navigation (Scrollable on Mobile) */}
        <div className="flex gap-2 mb-6 md:mb-8 bg-white p-2 rounded-full w-full md:w-fit shadow-sm border border-peppermint-wash overflow-x-auto scrollbar-hide whitespace-nowrap">
          <Link href="/admin/overview" className="font-semibold px-4 md:px-6 py-2 rounded-full text-xs md:text-sm text-neutralgrey hover:bg-peppermint-base flex items-center transition-all">📊 Overview</Link>
          <Link href="/admin/settings" className="font-semibold px-4 md:px-6 py-2 rounded-full text-xs md:text-sm text-neutralgrey hover:bg-peppermint-base flex items-center transition-all">⚙️ Settings</Link>
          <div className="w-px h-6 bg-peppermint-wash mx-1 self-center"></div>
          <button onClick={() => setActiveTab('products')} className={`font-semibold px-4 md:px-6 py-2 rounded-full transition-all text-xs md:text-sm ${activeTab === 'products' ? 'bg-charcoal text-white shadow-md' : 'text-neutralgrey hover:bg-peppermint-base'}`}>Products</button>
          <button onClick={() => setActiveTab('orders')} className={`font-semibold px-4 md:px-6 py-2 rounded-full transition-all text-xs md:text-sm ${activeTab === 'orders' ? 'bg-charcoal text-white shadow-md' : 'text-neutralgrey hover:bg-peppermint-base'}`}>Orders ({orders.length})</button>
        </div>

        {activeTab === 'products' && (
          <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
            
            {/* Add Product Form */}
            <div className="xl:w-1/3">
              <div className="bg-white p-5 md:p-8 rounded-premium shadow-sm border border-peppermint-wash xl:sticky xl:top-28">
                <h2 className="font-heading text-xl md:text-2xl text-charcoal mb-4 md:mb-6">Add New Product</h2>
                <form onSubmit={handleAddProduct} className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Product Name</label>
                    <input required type="text" placeholder="e.g. BPC-157" value={name} onChange={e => setName(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Description</label>
                    <textarea required placeholder="What does this product do?" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" rows={2}></textarea>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Price (₱)</label>
                      <input required type="number" placeholder="850" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Stock Status</label>
                      <select value={stockStatus} onChange={e => setStockStatus(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm">
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Purity</label>
                      <input required type="text" placeholder="99%" value={purity} onChange={e => setPurity(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Variant</label>
                      <input required type="text" placeholder="5mg" value={variant} onChange={e => setVariant(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm">
                      <option value="Manufacturer A">Manufacturer A</option>
                      <option value="Manufacturer B">Manufacturer B</option>
                      <option value="Manufacturer C">Manufacturer C</option>
                      <option value="Manufacturer D">Manufacturer D</option>
                      <option value="Peppers">Peppers</option>
                      <option value="Syringes">Syringes</option>
                      <option value="Alcohol Pads">Alcohol Pads</option>
                      <option value="Vial Case">Vial Case</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Image</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-xs md:text-sm text-neutralgrey file:mr-2 md:file:mr-4 file:py-2 md:file:py-2.5 file:px-4 md:file:px-6 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-peppermint-wash file:text-peppermint-deep hover:file:bg-peppermint-primary hover:file:text-white transition-all cursor-pointer" />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-peppermint-primary hover:bg-peppermint-deep text-white font-bold py-3 md:py-4 rounded-soft mt-2 md:mt-4 transition-colors">{isLoading ? 'Adding...' : 'Add Product'}</button>
                  {message && <p className="text-xs md:text-sm font-bold text-center text-peppermint-deep mt-2">{message}</p>}
                </form>
              </div>
            </div>

            {/* Product List */}
            <div className="xl:w-2/3">
              <div className="bg-white rounded-premium shadow-sm border border-peppermint-wash overflow-hidden">
                
                {/* Search & Sort */}
                <div className="p-3 md:p-4 border-b border-peppermint-wash bg-peppermint-base/30 flex flex-col sm:flex-row gap-2 md:gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-neutralgrey" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-peppermint-wash rounded-full py-2 md:py-2.5 pl-9 md:pl-10 pr-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50" />
                  </div>
                  <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="bg-white border border-peppermint-wash rounded-full py-2 md:py-2.5 px-3 md:px-4 text-xs md:text-sm font-medium focus:outline-none">
                    <option value="default">Sort: Default</option>
                    <option value="alphabetical">Sort: Alphabetical</option>
                    <option value="price-high">Sort: Price (High to Low)</option>
                    <option value="price-low">Sort: Price (Low to High)</option>
                    <option value="in-stock">Sort: In Stock</option>
                    <option value="low-stock">Sort: Low Stock</option>
                    <option value="out-of-stock">Sort: Out of Stock</option>
                  </select>
                </div>

                {/* Bulk Actions Bar */}
                {selectedProducts.length > 0 && (
                  <div className="p-3 bg-peppermint-wash flex flex-col md:flex-row gap-3 justify-between items-center border-b border-peppermint-primary/20">
                    <p className="text-xs md:text-sm text-peppermint-deep font-bold md:pl-2 w-full text-center md:text-left">{selectedProducts.length} products selected</p>
                    
                    <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 items-center">
                      <span className="text-[10px] md:text-xs font-bold text-charcoal mr-1 hidden sm:inline">Adjust Price:</span>
                      <button onClick={() => handleBulkPriceUpdate(10)} className="bg-white border border-peppermint-primary text-peppermint-deep text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full hover:bg-peppermint-primary hover:text-white transition-colors">+10%</button>
                      <button onClick={() => handleBulkPriceUpdate(20)} className="bg-white border border-peppermint-primary text-peppermint-deep text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full hover:bg-peppermint-primary hover:text-white transition-colors">+20%</button>
                      <button onClick={() => handleBulkPriceUpdate(-10)} className="bg-white border border-peppermint-primary text-peppermint-deep text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full hover:bg-peppermint-primary hover:text-white transition-colors">-10%</button>
                      
                      <div className="w-px h-5 md:h-6 bg-peppermint-primary/30 mx-0.5 md:mx-1"></div>
                      
                      <button onClick={handleBulkOutOfStock} className="bg-charcoal text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 md:py-1.5 rounded-full hover:bg-charcoal/80 transition-colors">Out of Stock</button>
                    </div>
                  </div>
                )}

                {/* Table (Scrollable on mobile) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm min-w-[600px]">
                    <thead className="bg-peppermint-base border-b border-peppermint-wash text-charcoal">
                      <tr>
                        <th className="p-3 md:p-4 w-10">
                          <input type="checkbox" 
                            checked={selectedProducts.length === displayedProducts.length && displayedProducts.length > 0}
                            onChange={(e) => {
                              if(e.target.checked) setSelectedProducts(displayedProducts.map(p => p.id));
                              else setSelectedProducts([]);
                            }} 
                            className="w-4 h-4 accent-peppermint-primary"
                          />
                        </th>
                        <th className="p-3 md:p-4 font-semibold">Product</th>
                        <th className="p-3 md:p-4 font-semibold">Price</th>
                        <th className="p-3 md:p-4 font-semibold">Status</th>
                        <th className="p-3 md:p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProducts.map(p => (
                        <tr key={p.id} className={`border-b border-peppermint-wash last:border-0 transition-colors ${selectedProducts.includes(p.id) ? 'bg-peppermint-base/50' : 'hover:bg-peppermint-base/30'}`}>
                          <td className="p-3 md:p-4">
                            <input type="checkbox" 
                              checked={selectedProducts.includes(p.id)} 
                              onChange={(e) => {
                                if(e.target.checked) setSelectedProducts([...selectedProducts, p.id]);
                                else setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                              }} 
                              className="w-4 h-4 accent-peppermint-primary"
                            />
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-3 md:gap-4">
                              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-soft border border-peppermint-wash shadow-sm shrink-0" /> : <div className="w-10 h-10 md:w-12 md:h-12 bg-peppermint-base rounded-soft border border-peppermint-wash flex items-center justify-center text-[10px] text-neutralgrey shrink-0">No Img</div>}
                              <div>
                                <p className="font-bold text-charcoal text-sm md:text-base leading-tight">{p.name}</p>
                                <p className="text-[10px] md:text-xs text-neutralgrey">{p.category} • {p.variant}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 md:p-4 font-bold text-charcoal whitespace-nowrap">₱{p.price}</td>
                          <td className="p-3 md:p-4 whitespace-nowrap">
                            <span className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-sm inline-block ${
                              (p.quantity || 0) === 0 ? 'bg-red-50 text-red-600 border border-red-200' : 
                              (p.quantity || 0) <= 5 ? 'bg-orange-50 text-orange-600 border border-orange-200' : 
                              'bg-peppermint-primary text-white'
                            }`}>
                              {(p.quantity || 0) === 0 ? 'Out of Stock' : (p.quantity || 0) <= 5 ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <button onClick={() => setEditingProduct(p)} className="text-[10px] md:text-xs font-bold bg-white text-charcoal border border-peppermint-wash hover:border-peppermint-primary hover:text-peppermint-deep px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all shadow-sm">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-premium shadow-sm border border-peppermint-wash overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm min-w-[600px]">
                <thead className="bg-peppermint-base border-b border-peppermint-wash text-charcoal">
                  <tr>
                    <th className="p-3 md:p-4 font-semibold">Date</th>
                    <th className="p-3 md:p-4 font-semibold">Customer</th>
                    <th className="p-3 md:p-4 font-semibold">Total</th>
                    <th className="p-3 md:p-4 font-semibold">Status</th>
                    <th className="p-3 md:p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-peppermint-wash last:border-0 hover:bg-peppermint-base/50 cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)}>
                      <td className="p-3 md:p-4 text-neutralgrey font-medium whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="p-3 md:p-4 font-medium"><p className="text-charcoal">{order.customer_name}</p><p className="text-[10px] md:text-xs text-neutralgrey font-normal">{order.customer_phone}</p></td>
                      <td className="p-3 md:p-4 font-bold text-charcoal">₱{order.total}</td>
                      <td className="p-3 md:p-4">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600 border border-orange-200' : order.status === 'Paid' ? 'bg-peppermint-wash text-peppermint-deep border border-peppermint-primary/30' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>{order.status}</span>
                      </td>
                      <td className="p-3 md:p-4"><button className="text-[10px] md:text-xs font-bold bg-white text-charcoal border border-peppermint-wash hover:border-peppermint-primary hover:text-peppermint-deep px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all shadow-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="bg-white rounded-premium w-full max-w-md relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-peppermint-base hover:bg-peppermint-wash rounded-full text-charcoal transition-colors">✕</button>
            <div className="p-5 md:p-8 overflow-y-auto">
              <h2 className="font-heading text-xl md:text-2xl text-charcoal mb-4 md:mb-6">Edit Product</h2>
              <form onSubmit={handleUpdateProduct} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Product Name</label>
                  <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Description</label>
                  <textarea required rows={3} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm"></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Price (₱)</label>
                    <input required type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Stock Status</label>
                    <select 
                      value={
                        !editingProduct.inStock ? 'Out of Stock' : 
                        (editingProduct.quantity || 0) <= 5 ? 'Low Stock' : 'In Stock'
                      } 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'Out of Stock') setEditingProduct({...editingProduct, inStock: false, quantity: 0});
                        else if (val === 'Low Stock') setEditingProduct({...editingProduct, inStock: true, quantity: 3});
                        else setEditingProduct({...editingProduct, inStock: true, quantity: 10});
                      }} 
                      className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Purity</label>
                    <input required type="text" value={editingProduct.purity} onChange={e => setEditingProduct({...editingProduct, purity: e.target.value})} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Variant</label>
                    <input required type="text" value={editingProduct.variant} onChange={e => setEditingProduct({...editingProduct, variant: e.target.value})} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Category</label>
                  <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-2.5 md:p-3 text-sm">
                    <option value="Manufacturer A">Manufacturer A</option>
                    <option value="Manufacturer B">Manufacturer B</option>
                    <option value="Manufacturer C">Manufacturer C</option>
                    <option value="Manufacturer D">Manufacturer D</option>
                    <option value="Peppers">Peppers</option>
                    <option value="Syringes">Syringes</option>
                    <option value="Alcohol Pads">Alcohol Pads</option>
                    <option value="Vial Case">Vial Case</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Update Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-xs md:text-sm text-neutralgrey file:mr-2 md:file:mr-4 file:py-2 md:file:py-2.5 file:px-4 md:file:px-6 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-peppermint-wash file:text-peppermint-deep hover:file:bg-peppermint-primary hover:file:text-white transition-all cursor-pointer" />
                
                                </div>
                
                <div className="flex gap-2 mt-4 md:mt-6">
                  <button type="submit" disabled={isLoading} className="flex-1 bg-charcoal hover:bg-charcoal/80 text-white font-bold py-3 md:py-4 rounded-soft transition-colors">{isLoading ? 'Saving...' : 'Save Changes'}</button>
                  <button type="button" onClick={() => handleDeleteProduct(editingProduct.id)} className="px-3 md:px-4 py-3 md:py-4 bg-red-50 text-red-500 border border-red-200 font-bold rounded-soft hover:bg-red-500 hover:text-white transition-colors text-xs md:text-sm">Delete</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-premium w-full max-w-2xl relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-peppermint-base hover:bg-peppermint-wash rounded-full text-charcoal transition-colors print:hidden">✕</button>
            
            <div className="p-5 md:p-8 overflow-y-auto">
              <h2 className="font-heading text-xl md:text-2xl text-charcoal mb-1">Order Details</h2>
              <p className="text-xs text-neutralgrey mb-4 md:mb-6">ID: {selectedOrder.id}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8 bg-peppermint-base p-3 md:p-4 rounded-soft border border-peppermint-wash">
                <div>
                  <p className="text-xs text-neutralgrey font-bold uppercase tracking-wider mb-1 md:mb-2">Customer</p>
                  <p className="font-bold text-charcoal text-sm md:text-base">{selectedOrder.customer_name}</p>
                  <p className="text-xs md:text-sm text-charcoal mt-1">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs text-neutralgrey font-bold uppercase tracking-wider mb-1 md:mb-2">Shipping</p>
                  <p className="text-xs md:text-sm text-charcoal font-medium">{selectedOrder.shipping_address}</p>
                  <p className="text-xs md:text-sm font-bold text-peppermint-deep mt-1">Via {selectedOrder.courier}</p>
                </div>
              </div>

              <div className="mb-6 md:mb-8">
                <p className="text-xs text-neutralgrey font-bold uppercase tracking-wider mb-2">Items Ordered</p>
                <div className="bg-white rounded-soft p-3 md:p-4 space-y-2 md:space-y-3 border border-peppermint-wash shadow-sm">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs md:text-sm pb-2 border-b border-peppermint-wash/50 last:border-0 last:pb-0">
                      <span className="text-charcoal font-medium">{item.product.name} <span className="text-neutralgrey">({item.product.variant}) x{item.quantity}</span></span>
                      <span className="font-bold text-charcoal">₱{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 md:mb-8">
                <p className="text-xs text-neutralgrey font-bold uppercase tracking-wider mb-2">Proof of Payment</p>
                {selectedOrder.proof_url ? (
                  <a href={selectedOrder.proof_url} target="_blank" rel="noopener noreferrer" className="block relative group w-full max-w-sm h-48 md:h-64">
                    <img src={selectedOrder.proof_url} alt="Proof" className="w-full h-full object-cover rounded-soft border border-peppermint-wash shadow-sm" />
                    <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-soft print:hidden"><span className="text-white text-xs md:text-sm font-bold">Click to enlarge</span></div>
                  </a>
                ) : (<p className="text-sm text-red-500 font-medium">No image uploaded.</p>)}
              </div>

              <div>
                <p className="text-xs text-neutralgrey font-bold uppercase tracking-wider mb-3 print:hidden">Update Status</p>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full">
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'Pending')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${selectedOrder.status === 'Pending' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-white text-neutralgrey border border-peppermint-wash hover:bg-peppermint-base'}`}>Pending</button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'Paid')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${selectedOrder.status === 'Paid' ? 'bg-peppermint-wash text-peppermint-deep border border-peppermint-primary' : 'bg-white text-neutralgrey border border-peppermint-wash hover:bg-peppermint-base'}`}>Paid</button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'Shipped')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-white text-neutralgrey border border-peppermint-wash hover:bg-peppermint-base'}`}>Shipped</button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, 'Cancelled')} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-white text-neutralgrey border border-peppermint-wash hover:bg-red-50 hover:text-red-500'}`}>Cancel</button>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto justify-center">
                    <button onClick={() => window.print()} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold bg-white text-charcoal border border-peppermint-wash hover:bg-peppermint-base transition-all flex items-center gap-1 md:gap-2">
                      🖨️ Print
                    </button>
                    <button onClick={() => deleteOrder(selectedOrder.id)} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold bg-white text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1 md:gap-2">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
                
                