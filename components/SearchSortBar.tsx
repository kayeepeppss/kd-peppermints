'use client'

import { useState } from 'react'
import { Product } from './ProductCard'

type Props = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortQuery: string
  setSortQuery: (sort: string) => void
  allProducts?: Product[]
}

export default function SearchSortBar({ searchQuery, setSearchQuery, sortQuery, setSortQuery, allProducts = [] }: Props) {
  const [isFocused, setIsFocused] = useState(false)

  // Get top 4 matches for the dropdown
  const suggestions = searchQuery.length > 0 
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
    : []

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-neutralgrey" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full bg-white border border-peppermint-wash rounded-full py-4 pl-12 pr-4 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50 shadow-sm"
        />

        {/* SUGGESTION DROPDOWN */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-peppermint-wash rounded-soft shadow-xl z-50 overflow-hidden">
            {suggestions.map(p => (
              <div 
                key={p.id} 
                className="flex justify-between items-center p-3 hover:bg-peppermint-base border-b border-peppermint-wash/50 last:border-0 cursor-pointer"
                onClick={() => {
                  setSearchQuery(p.name)
                  setIsFocused(false)
                }}
              >
                <span className="text-sm font-medium text-charcoal">{p.name}</span>
                <span className="text-xs font-bold text-peppermint-deep">₱{p.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="relative md:w-64">
        <select 
          value={sortQuery}
          onChange={(e) => setSortQuery(e.target.value)}
          className="w-full bg-white border border-peppermint-wash rounded-full py-4 px-6 text-sm font-medium text-charcoal appearance-none focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50 shadow-sm cursor-pointer"
        >
          <option value="default">Sort by: Default</option>
          <option value="name">Sort by Alphabetical</option>
          <option value="price-low">Sort by Price (Low to High)</option>
          <option value="price-high">Sort by Price (High to Low)</option>
          <option value="in-stock">Show In Stock Only</option>
          <option value="out-of-stock">Show Out of Stock Only</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  )
}