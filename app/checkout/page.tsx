'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useCart } from '@/components/CartContext'
import { supabase } from '@/components/supabase'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zip: '',
    region: 'NCR',
    courier: 'J&T Express',
    needsLabels: 'No Labels',
    paymentMethod: 'GCash',
  })

  // Load saved details on mount
  useEffect(() => {
    const saved = localStorage.getItem('kd_customer_details')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFormData(prev => ({ ...prev, ...parsed }))
    }
  }, [])

  const hasGroupBuyItems = cart.some(item => item.product.category.includes('Manufacturer'))
  const adminFee = hasGroupBuyItems ? 300 : 0

  const getShippingFee = () => {
    if (formData.courier === 'Lalamove') return 0
    if (formData.region === 'NCR') return 75
    if (formData.region === 'Luzon') return 100
    if (formData.region === 'Visayas & Mindanao') return 130
    return 0
  }

  const shippingFee = getShippingFee()
  const finalTotal = cartTotal + adminFee + shippingFee

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegionSelect = (region: string) => {
    setFormData({ ...formData, region, courier: 'J&T Express' })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setProofFile(e.target.files[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile) return alert('Please upload your proof of payment.')
    if (cart.length === 0) return alert('Your cart is empty.')

    setIsSubmitting(true)

    try {
      // 1. Upload Receipt
      const fileExt = proofFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('Proof of Payment').upload(fileName, proofFile)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('Proof of Payment').getPublicUrl(fileName)

      // 2. Combine Address
      const fullAddress = `${formData.street}, Brgy. ${formData.barangay}, ${formData.city}, ${formData.province}, ${formData.zip}`

      // 3. Save to Database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: fullAddress,
          shipping_region: formData.region,
          shipping_fee: shippingFee,
          courier: formData.courier,
          needs_labels: formData.needsLabels === 'With labels',
          payment_method: formData.paymentMethod,
          items: cart, 
          total: finalTotal,
          proof_url: publicUrl, 
          status: 'Pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 4. Generate WhatsApp Message
      const itemsText = cart.map(item => `▪️ ${item.product.name} (${item.product.variant})\n   Qty: ${item.quantity} x ₱${item.product.price} = *₱${item.product.price * item.quantity}*`).join('\n\n')

      const message = `*🌿 KD-PEPPERMINTS - NEW ORDER*

*👤 CUSTOMER DETAILS*
Name: ${formData.name}
Phone: ${formData.phone}

*📦 SHIPPING INFO*
Address: ${fullAddress}
Region: ${formData.region}
Courier: ${formData.courier} ${formData.courier === 'Lalamove' ? '(Book upon delivery)' : ''}
Labels: ${formData.needsLabels}

*🛒 ORDER DETAILS*
${itemsText}

*💰 PAYMENT SUMMARY*
Subtotal: ₱${cartTotal}
Admin Fee: ₱${adminFee}
Shipping Fee: ₱${shippingFee}
*GRAND TOTAL: ₱${finalTotal}*

*💳 PAYMENT:* ${formData.paymentMethod}
*📸 PROOF:* ${publicUrl}
*📋 ORDER ID:* ${orderData.id}`

      const encodedMessage = encodeURIComponent(message)
      
      // 🔥 MOBILE DETECTION & WHATSAPP FIX
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=639761710264&text=${encodedMessage}`
        : `https://wa.me/639761710264?text=${encodedMessage}`;

      // Save details for next time
      const saveDetails = (document.getElementById('saveDetails') as HTMLInputElement)?.checked
      if (saveDetails) {
        localStorage.setItem('kd_customer_details', JSON.stringify(formData))
      }

      clearCart()
      window.location.href = whatsappUrl
      
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-32 px-4 md:px-6 pb-20 text-center">
        <Navbar />
        <h1 className="font-heading text-3xl mt-20">Your cart is empty.</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-32 px-4 md:px-6 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="font-heading text-4xl text-charcoal mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Customer Info */}
              <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-peppermint-wash flex items-center justify-center text-peppermint-deep">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <h2 className="font-heading text-2xl text-charcoal">Customer Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} placeholder="Juan Dela Cruz" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Email Address *</label>
                      <input required type="email" name="email" value={formData.email} placeholder="juan@gmail.com" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Phone Number *</label>
                      <input required type="tel" name="phone" value={formData.phone} placeholder="09XX XXX XXXX" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-peppermint-wash flex items-center justify-center text-peppermint-deep">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  </div>
                  <h2 className="font-heading text-2xl text-charcoal">Shipping Address</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Street Address *</label>
                    <input required type="text" name="street" value={formData.street} placeholder="123 Rizal Street" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Barangay *</label>
                    <input required type="text" name="barangay" value={formData.barangay} placeholder="Brgy. San Antonio" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">City *</label>
                      <input required type="text" name="city" value={formData.city} placeholder="Quezon City" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Province *</label>
                      <input required type="text" name="province" value={formData.province} placeholder="Metro Manila" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">ZIP / Postal Code *</label>
                    <input required type="text" name="zip" value={formData.zip} placeholder="1100" onChange={handleChange} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm focus:ring-2 focus:ring-peppermint-primary/50" />
                  </div>
                </div>
              </div>

              {/* 3. Shipping Location & Courier */}
              <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-peppermint-wash flex items-center justify-center text-peppermint-deep">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                  </div>
                  <h2 className="font-heading text-2xl text-charcoal">Choose Shipping Location *</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { name: 'NCR', fee: 75 },
                    { name: 'Luzon', fee: 100 },
                    { name: 'Visayas & Mindanao', fee: 130 },
                  ].map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleRegionSelect(loc.name)}
                      className={`p-3 rounded-soft border text-center transition-all ${
                        formData.region === loc.name 
                          ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' 
                          : 'border-peppermint-wash hover:bg-peppermint-base'
                      }`}
                    >
                      <div className="font-bold text-charcoal text-sm">{loc.name}</div>
                      <div className="text-xs text-neutralgrey mt-1">₱{loc.fee}</div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setFormData({...formData, region: 'Lalamove', courier: 'Lalamove'}) }}
                    className={`p-3 rounded-soft border text-center transition-all ${
                      formData.region === 'Lalamove' 
                        ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' 
                        : 'border-peppermint-wash hover:bg-peppermint-base'
                    }`}
                  >
                    <div className="font-bold text-charcoal text-sm">LALAMOVE</div>
                    <div className="text-xs text-neutralgrey mt-1">₱0</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormData({...formData, region: 'Punuan', courier: 'Punuan'}) }}
                    className={`p-3 rounded-soft border text-center transition-all ${
                      formData.region === 'Punuan' 
                        ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' 
                        : 'border-peppermint-wash hover:bg-peppermint-base'
                    }`}
                  >
                    <div className="font-bold text-charcoal text-sm">PUNUAN</div>
                    <div className="text-xs text-neutralgrey mt-1">₱0</div>
                  </button>
                </div>

                <label className="block text-sm font-medium text-charcoal mb-2">Select Courier *</label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <label className={`cursor-pointer border p-3 rounded-soft flex items-center justify-center gap-2 transition-all ${formData.courier === 'J&T Express' ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' : 'border-peppermint-wash'}`}>
                    <input type="radio" name="courier" value="J&T Express" checked={formData.courier === 'J&T Express'} onChange={handleChange} className="accent-peppermint-primary w-4 h-4" />
                    <span className="font-semibold text-charcoal text-sm">J&T Express</span>
                  </label>
                  <label className={`cursor-pointer border p-3 rounded-soft flex items-center justify-center gap-2 transition-all ${formData.courier === 'Lalamove' ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' : 'border-peppermint-wash'}`}>
                    <input type="radio" name="courier" value="Lalamove" checked={formData.courier === 'Lalamove'} onChange={handleChange} className="accent-peppermint-primary w-4 h-4" />
                    <span className="font-semibold text-charcoal text-sm">Lalamove</span>
                  </label>
                </div>
                {formData.courier === 'Lalamove' && (
                  <p className="text-xs text-warmpop-coral font-medium">Lalamove is only available for NCR delivery.</p>
                )}
              </div>

              {/* 4. Labels */}
              <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-peppermint-wash flex items-center justify-center text-peppermint-deep">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                  </div>
                  <h2 className="font-heading text-2xl text-charcoal">Labels *</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer border p-3 rounded-soft flex items-center justify-center gap-2 transition-all ${formData.needsLabels === 'With labels' ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' : 'border-peppermint-wash'}`}>
                    <input type="radio" name="needsLabels" value="With labels" checked={formData.needsLabels === 'With labels'} onChange={handleChange} className="accent-peppermint-primary w-4 h-4" />
                    <span className="font-semibold text-charcoal text-sm">With labels</span>
                  </label>
                  <label className={`cursor-pointer border p-3 rounded-soft flex items-center justify-center gap-2 transition-all ${formData.needsLabels === 'No labels' ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' : 'border-peppermint-wash'}`}>
                    <input type="radio" name="needsLabels" value="No labels" checked={formData.needsLabels === 'No labels'} onChange={handleChange} className="accent-peppermint-primary w-4 h-4" />
                    <span className="font-semibold text-charcoal text-sm">No labels</span>
                  </label>
                </div>
              </div>

              {/* 5. Payment */}
              <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash">
                <h2 className="font-heading text-2xl text-charcoal mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <label className={`cursor-pointer border p-4 rounded-soft text-center transition-all ${formData.paymentMethod === 'GCash' ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' : 'border-peppermint-wash'}`}>
                    <input type="radio" name="paymentMethod" value="GCash" checked={formData.paymentMethod === 'GCash'} onChange={handleChange} className="sr-only" />
                    <span className="font-semibold text-charcoal">GCash</span>
                  </label>
                  <label className={`cursor-pointer border p-4 rounded-soft text-center transition-all ${formData.paymentMethod === 'Bank' ? 'border-peppermint-primary bg-peppermint-wash/30 shadow-sm' : 'border-peppermint-wash'}`}>
                    <input type="radio" name="paymentMethod" value="Bank" checked={formData.paymentMethod === 'Bank'} onChange={handleChange} className="sr-only" />
                    <span className="font-semibold text-charcoal">Bank Transfer</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-charcoal mb-2">Upload Proof of Payment *</label>
                  <input required type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-neutralgrey file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-peppermint-wash file:text-peppermint-deep hover:file:bg-peppermint-primary hover:file:text-white transition-all cursor-pointer" />
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-peppermint-base rounded-soft border border-peppermint-wash mt-6">
                  <input type="checkbox" id="saveDetails" className="w-4 h-4 accent-peppermint-primary" defaultChecked />
                  <span className="text-sm font-medium text-charcoal">Save my details for faster checkout next time</span>
                </label>
              </div>

            </form>
          </div>

          <div className="lg:w-[400px] shrink-0">
            <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash sticky top-32">
              <h2 className="font-heading text-2xl text-charcoal mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-bold text-charcoal">{item.product.name} <span className="text-neutralgrey font-normal">x{item.quantity}</span></p>
                      <p className="text-xs text-neutralgrey">{item.product.purity} Purity</p>
                    </div>
                    <span className="font-medium text-charcoal">₱{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-peppermint-wash pt-4 space-y-2 text-sm mb-4">
                <div className="flex justify-between text-neutralgrey">
                  <span>Subtotal</span>
                  <span className="text-charcoal font-medium">₱{cartTotal}</span>
                </div>
                <div className="flex justify-between text-neutralgrey">
                  <span>Shipping</span>
                  <span className="text-charcoal font-medium">₱{shippingFee}</span>
                </div>
                <div className="flex justify-between text-neutralgrey">
                  <span>Admin Fee</span>
                  <span className="text-charcoal font-medium">₱{adminFee}</span>
                </div>
              </div>

              <div className="border-t border-peppermint-wash pt-4 mb-6 flex justify-between items-center">
                <span className="font-bold text-charcoal text-lg">Total</span>
                <div className="text-right">
                  <span className="font-heading text-3xl text-charcoal">₱{finalTotal}</span>
                  <span className="block text-xs text-neutralgrey">PHP</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-warmpop-coral hover:bg-warmpop-caramel text-white font-bold py-4 rounded-full transition-colors shadow-md text-lg disabled:opacity-50 flex justify-center items-center gap-2 mb-4"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
                {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
              </button>

              <button 
                type="button"
                onClick={() => router.push('/group-buy')}
                className="w-full bg-white border border-peppermint-wash text-charcoal font-semibold py-4 rounded-full transition-colors hover:bg-peppermint-base flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Continue Shopping
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}