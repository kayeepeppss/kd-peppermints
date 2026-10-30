'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard, { Product } from '@/components/ProductCard'
import QuickViewModal from '@/components/QuickViewModal'
import SearchSortBar from '@/components/SearchSortBar'
import CategoryBar from '@/components/CategoryBar'
import { supabase } from '@/components/supabase'

const groupBuyCategories = ['Manufacturer A', 'Manufacturer B', 'Manufacturer C', 'Manufacturer D']

export default function GroupBuyPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortQuery, setSortQuery] = useState('default')
  const [activeCategory, setActiveCategory] = useState('All')

  const [gbStartDate, setGbStartDate] = useState<string>('')
  const [gbEndDate, setGbEndDate] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    async function fetchData() {
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single()
      if (settings) {
        setGbStartDate(settings.gb_start_date)
        setGbEndDate(settings.gb_end_date)
      }

      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .in('category', groupBuyCategories)
      
      if (!error && productsData) {
        setProducts(productsData.map(item => ({ 
          ...item, 
          inStock: item.quantity > 0 || item.in_stock,
          quantity: item.quantity || 0
        })) as Product[])
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!gbEndDate) return
    const targetDate = new Date(gbEndDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gbEndDate])

  let displayedProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    return matchesSearch && matchesCategory
  })

  if (sortQuery === 'name') displayedProducts.sort((a, b) => a.name.localeCompare(b.name))
  if (sortQuery === 'price-low') displayedProducts.sort((a, b) => a.price - b.price)
  if (sortQuery === 'price-high') displayedProducts.sort((a, b) => b.price - a.price)
  if (sortQuery === 'in-stock') displayedProducts = displayedProducts.filter(p => (p.quantity || 0) > 0)
  if (sortQuery === 'out-of-stock') displayedProducts = displayedProducts.filter(p => (p.quantity || 0) === 0)

  const formatDate = (dateString: string) => {
    if (!dateString) return '...'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
          <h1 className="font-heading text-4xl md:text-5xl text-charcoal">My Collection</h1>
          <span className="text-peppermint-primary text-sm md:text-xl font-medium pb-1 tracking-widest">
            コレクション (Group Buy)
          </span>
        </div>

        <div className="relative w-full mb-6 rounded-[2rem] p-1 overflow-hidden shadow-[0_0_30px_-5px_rgba(63,191,160,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-r from-peppermint-wash via-peppermint-primary to-peppermint-wash opacity-50 blur-sm"></div>
          <div className="relative w-full h-32 md:h-64 rounded-[1.8rem] overflow-hidden bg-peppermint-base border-4 border-white z-10">
            <img src="/gb-banner.jpg" alt="Group Buy Banner" className="w-full h-full object-cover block" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-peppermint-wash rounded-premium shadow-sm p-4 md:p-6 mb-8 gap-4 md:gap-6">
          <div className="text-center md:text-left">
            <h2 className="font-heading text-lg md:text-3xl text-charcoal">
              {formatDate(gbStartDate)} - {formatDate(gbEndDate)}
            </h2>
            <p className="text-neutralgrey text-xs md:text-sm mt-1">Group Buy ordering window is open!</p>
          </div>

          <div className="bg-peppermint-base border border-peppermint-wash shadow-sm rounded-full px-4 py-2 md:px-6 md:py-3 flex items-center gap-3 md:gap-4 shrink-0">
            <span className="text-xs md:text-sm font-bold text-charcoal uppercase tracking-wider hidden sm:block">Ends In:</span>
            <div className="flex gap-2 md:gap-3 text-center">
              <div>
                <span className="block font-heading text-lg md:text-2xl text-peppermint-deep leading-none">{timeLeft.days}</span>
                <span className="text-[8px] md:text-[10px] text-neutralgrey uppercase font-bold">Days</span>
              </div>
              <span className="text-peppermint-primary font-bold">:</span>
              <div>
                <span className="block font-heading text-lg md:text-2xl text-peppermint-deep leading-none">{timeLeft.hours}</span>
                <span className="text-[8px] md:text-[10px] text-neutralgrey uppercase font-bold">Hrs</span>
              </div>
              <span className="text-peppermint-primary font-bold">:</span>
              <div>
                <span className="block font-heading text-lg md:text-2xl text-peppermint-deep leading-none">{timeLeft.mins}</span>
                <span className="text-[8px] md:text-[10px] text-neutralgrey uppercase font-bold">Min</span>
              </div>
              <span className="text-peppermint-primary font-bold">:</span>
              <div>
                <span className="block font-heading text-lg md:text-2xl text-peppermint-deep leading-none">{timeLeft.secs}</span>
                <span className="text-[8px] md:text-[10px] text-neutralgrey uppercase font-bold">Sec</span>
              </div>
            </div>
          </div>
        </div>

        <SearchSortBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortQuery={sortQuery}
          setSortQuery={setSortQuery}
          allProducts={products}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <CategoryBar 
          categories={groupBuyCategories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6">
        {isLoading ? (
          <div className="text-center py-20 text-peppermint-deep font-bold animate-pulse">Loading products...</div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-20 text-neutralgrey">No products found in this category or search.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={setSelectedProduct} 
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <QuickViewModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          allProducts={products}
          onQuickView={setSelectedProduct}
        />
      )}
    </main>
  )
}