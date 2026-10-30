'use client'

type Props = {
  categories: string[]
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export default function CategoryBar({ categories, activeCategory, setActiveCategory }: Props) {
  return (
    <div className="sticky top-28 z-40 bg-peppermint-base/90 backdrop-blur-md py-4 mb-6 -mx-6 px-6 border-b border-peppermint-wash/50">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-6xl mx-auto">
        
        {/* All Button */}
        <button
          onClick={() => setActiveCategory('All')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeCategory === 'All'
              ? 'bg-peppermint-primary text-white shadow-md'
              : 'bg-white text-charcoal hover:bg-peppermint-wash border border-peppermint-wash'
          }`}
        >
          All
        </button>

        {/* Map through the categories */}
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === category
                ? 'bg-peppermint-primary text-white shadow-md'
                : 'bg-white text-charcoal hover:bg-peppermint-wash border border-peppermint-wash'
            }`}
          >
            {category}
          </button>
        ))}
        
      </div>
    </div>
  )
}