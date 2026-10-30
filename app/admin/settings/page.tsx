'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/components/supabase'

export default function AdminSettings() {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin')
        return
      }
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
      if (data) {
        setStartDate(data.gb_start_date ? new Date(data.gb_start_date).toISOString().slice(0, 16) : '')
        setEndDate(data.gb_end_date ? new Date(data.gb_end_date).toISOString().slice(0, 16) : '')
      }
    }
    checkUser()
  }, [router])

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.from('settings').update({
      gb_start_date: new Date(startDate).toISOString(),
      gb_end_date: new Date(endDate).toISOString(),
    }).eq('id', 1)
    
    setMessage(error ? 'Error: ' + error.message : 'Settings updated successfully!')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-peppermint-base">
      <div className="bg-white/80 backdrop-blur-md border-b border-peppermint-wash px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <h1 className="font-heading text-2xl text-charcoal tracking-tight">KD Admin</h1>
        </div>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-charcoal bg-peppermint-base px-4 py-2 rounded-full hover:bg-peppermint-wash transition-colors">
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        <h2 className="font-heading text-3xl text-charcoal mb-8">Store Settings</h2>

        <div className="bg-white p-6 md:p-8 rounded-premium shadow-sm border border-peppermint-wash max-w-lg">
          <h3 className="font-heading text-xl text-charcoal mb-6">Group Buy Dates</h3>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">Start Date & Time</label>
              <input required type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutralgrey uppercase tracking-wider mb-1">End Date & Time</label>
              <input required type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 text-sm" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-peppermint-primary hover:bg-peppermint-deep text-white font-bold py-3 rounded-soft mt-4 transition-colors">
              {isLoading ? 'Saving...' : 'Save Dates'}
            </button>
            {message && <p className="text-sm font-bold text-center text-peppermint-deep mt-2">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}