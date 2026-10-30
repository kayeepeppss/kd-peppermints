'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

// Fake data for the guides (we can connect this to real PDFs later)
const dummyGuides = [
  { 
    id: 1, 
    title: 'Peptide Cheat Sheet', 
    description: 'A quick reference guide for mixing, dosing, and storage.',
    fileType: 'PDF'
  },
  { 
    id: 2, 
    title: 'Optimization Guide', 
    description: 'How to get the most out of your wellness routine.',
    fileType: 'PDF'
  },
  { 
    id: 3, 
    title: 'Reconstitution Basics', 
    description: 'Step-by-step instructions on how to safely mix your vials.',
    fileType: 'PDF'
  },
]

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openGuideId, setOpenGuideId] = useState<number | null>(null)

  // Filter guides based on search
  const displayedGuides = dummyGuides.filter((guide) =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle accordion open/close
  const toggleAccordion = (id: number) => {
    setOpenGuideId(openGuideId === id ? null : id)
  }

  return (
    <main className="min-h-screen pt-32 px-6 pb-20">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-5xl text-charcoal mb-4">Smart Guides</h1>
          <p className="text-neutralgrey text-lg">Search for a problem or topic to find the answers you need.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-neutralgrey" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search for a problem or topic..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-peppermint-wash rounded-full py-4 pl-14 pr-6 text-charcoal placeholder:text-neutralgrey focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50 transition-all"
          />
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {displayedGuides.length === 0 ? (
            <div className="text-center py-10 text-neutralgrey">
              No guides found for "{searchQuery}"
            </div>
          ) : (
            displayedGuides.map((guide) => (
              <div 
                key={guide.id} 
                className="bg-white border border-peppermint-wash rounded-premium overflow-hidden shadow-sm transition-all duration-300"
              >
                {/* Accordion Header (Click to open) */}
                <button 
                  onClick={() => toggleAccordion(guide.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-peppermint-base/50 transition-colors"
                >
                  <div>
                    <h3 className="font-heading text-xl text-charcoal">{guide.title}</h3>
                    <p className="text-sm text-neutralgrey mt-1">{guide.description}</p>
                  </div>
                  
                  {/* Chevron Icon (Rotates when open) */}
                  <div className={`text-peppermint-primary transition-transform duration-300 ${openGuideId === guide.id ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>

                {/* Accordion Content (Shows when open) */}
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    openGuideId === guide.id ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pt-4 border-t border-peppermint-wash flex items-center justify-between">
                    <span className="text-sm font-medium text-charcoal/60 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      {guide.fileType} Document
                    </span>
                    
                    {/* Download Button */}
                    <button className="bg-peppermint-wash text-peppermint-deep hover:bg-peppermint-primary hover:text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors">
                      View / Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}