'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

const faqs = [
  // GROUP BUY QUESTIONS
  { 
    q: "How does the Group Buy work?", 
    a: "Group Buy is a pre-order system. The ordering window is open for exactly 1 week. Once the week ends, we place the bulk order with the manufacturer." 
  },
  { 
    q: "How long is the wait time for Group Buy?", 
    a: "Because we order directly from the manufacturer, the wait time is 7 to 14 days after the order window closes." 
  },
  { 
    q: "Is there an admin fee?", 
    a: "Yes, there is a flat ₱300 admin fee applied to all Group Buy orders. This covers processing and logistics. (On Hand items do not have this fee)." 
  },
  // ON HAND QUESTIONS
  { 
    q: "What does 'On Hand' mean?", 
    a: "On Hand items are physically here in our inventory. They are ready to be packed and shipped immediately, with no wait time." 
  },
  { 
    q: "What are the shipping times for J&T Express?", 
    a: "J&T Express usually takes: Luzon (1-3 days), Visayas (3-5 days), and Mindanao (5-7 days)." 
  },
  { 
    q: "What are the shipping times for TikTok Checkout?", 
    a: "TikTok Checkout uses similar couriers and timelines: Luzon (1-3 days), Visayas (3-5 days), and Mindanao (5-7 days)." 
  },
  { 
    q: "What about Lalamove?", 
    a: "Lalamove is same-day delivery, but it is usually only available for local/metro areas. You will book this yourself upon checkout." 
  },
  // GENERAL QUESTIONS
  { 
    q: "How do I pay?", 
    a: "We accept GCash and Bank Transfers. You will see the payment details on the checkout page. Please upload a screenshot of your receipt." 
  },
  { 
    q: "I made a mistake in my order, what do I do?", 
    a: "Please message us immediately on WhatsApp with your Order ID and we will fix it for you before it ships. You can also track your order on the 'Track Order' page." 
  },
]

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <main className="min-h-screen pt-32 px-6 pb-20">
      <Navbar />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl text-charcoal mb-4">We're here to help.</h1>
          <p className="text-neutralgrey text-lg">Find answers to common questions or reach out to us directly.</p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-peppermint-wash rounded-premium overflow-hidden shadow-sm">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left font-semibold text-charcoal hover:bg-peppermint-base/50 transition-colors"
              >
                {faq.q}
                <span className={`text-peppermint-primary transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              <div className={`px-6 overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-neutralgrey text-sm leading-relaxed border-t border-peppermint-wash pt-4">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Card */}
        <div className="bg-charcoal rounded-premium p-10 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-peppermint-deep/20 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="font-heading text-3xl text-white mb-4">Still have questions?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">Our team is ready to assist you with your order, product questions, or anything else.</p>
            <a 
              href="https://wa.me/639761710264" 
              target="_blank" 
              className="inline-flex items-center gap-2 bg-peppermint-primary hover:bg-peppermint-deep text-white font-bold px-8 py-4 rounded-full transition-colors shadow-lg"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}