'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from './CartContext'

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl">
      
      {/* MAIN NAVBAR CONTAINER */}
      <div className="rounded-full bg-white/95 backdrop-blur-xl border border-peppermint-wash px-4 py-2 md:py-2.5 flex items-center justify-between shadow-sm">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="relative w-8 h-8 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-peppermint-primary">
            <img src="/kdpep1.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading text-charcoal text-lg md:text-xl tracking-tight hidden sm:block">
            KD-PEPPERMINTS
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-charcoal/80">
          <Link href="/" className="hover:text-peppermint-primary transition-colors">Home</Link>
          <Link href="/group-buy" className="hover:text-peppermint-primary transition-colors">Group Buy</Link>
          <Link href="/on-hand" className="hover:text-peppermint-primary transition-colors">On Hand</Link>
          <Link href="/guides" className="hover:text-peppermint-primary transition-colors">Guides</Link>
          <Link href="/track" className="hover:text-peppermint-primary transition-colors">Track Order</Link>
          <Link href="/contact" className="hover:text-peppermint-primary transition-colors">Contact</Link>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-1 md:gap-2">
          
          {/* WHATSAPP BUTTON - Icon on mobile, Text on desktop */}
          <a
            href="https://wa.me/639761710264"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-peppermint-wash text-peppermint-deep p-2.5 md:px-4 md:py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-peppermint-primary hover:text-white transition-all duration-300"
          >
            <span className="hidden md:inline">WhatsApp</span>
            <svg className="w-4 h-4 md:hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </a>

          {/* CART BUTTON */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 md:gap-2 bg-peppermint-wash text-peppermint-deep px-3 py-2 md:px-4 md:py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-peppermint-primary hover:text-white transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span className="hidden sm:inline">Cart</span> ({cartCount})
          </button>

          {/* MOBILE HAMBURGER BUTTON */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-peppermint-base rounded-full text-charcoal hover:bg-peppermint-wash transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>

      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-xl border border-peppermint-wash rounded-premium shadow-2xl p-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal font-medium text-lg border-b border-peppermint-wash pb-2">Home</Link>
          <Link href="/group-buy" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal font-medium text-lg border-b border-peppermint-wash pb-2">Group Buy</Link>
          <Link href="/on-hand" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal font-medium text-lg border-b border-peppermint-wash pb-2">On Hand</Link>
          <Link href="/guides" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal font-medium text-lg border-b border-peppermint-wash pb-2">Guides</Link>
          <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal font-medium text-lg border-b border-peppermint-wash pb-2">Track Order</Link>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-charcoal font-medium text-lg">Contact & FAQ</Link>
          
          <a href="https://wa.me/639761710264" target="_blank" className="mt-2 w-full text-center bg-peppermint-primary text-white font-bold py-3 rounded-full">
            Message us on WhatsApp
          </a>
        </div>
      )}

    </nav>
  )
}