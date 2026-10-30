'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard, { Product } from '@/components/ProductCard'
import QuickViewModal from '@/components/QuickViewModal'
import SearchSortBar from '@/components/SearchSortBar'
import CategoryBar from '@/components/CategoryBar'
import { supabase } from '@/components/supabase'

const onHandCategories = ['Peppers', 'Syringes', 'Alcohol Pads', 'Vial Case', 'Vial Opener']

export default function OnHandPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortQuery, setSortQuery] = useState('default')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('category', 'ilike', 'Manufacturer%') 
      
      if (!error && data) {
        setProducts(data.map(item => ({ 
          ...item, 
          inStock: item.quantity > 0 || item.in_stock,
          quantity: item.quantity || 0
        })) as Product[])
      }
      setIsLoading(false)
    }
    fetchProducts()
  }, [])

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

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
          <h1 className="font-heading text-4xl md:text-5xl text-charcoal">Ready to Ship</h1>
          <span className="text-peppermint-primary text-sm md:text-xl font-medium pb-1 tracking-widest">
            オン ハンド (On Hand)
          </span>
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
          categories={onHandCategories}
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