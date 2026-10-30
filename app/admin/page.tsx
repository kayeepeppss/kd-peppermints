'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/components/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Invalid email or password.')
      setIsLoading(false)
      return
    }

    // If successful, send them to the dashboard
    window.location.href = '/admin/dashboard'
  }

  return (
    <div className="min-h-screen bg-peppermint-base flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-premium p-8 shadow-sm border border-peppermint-wash">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-peppermint-wash rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="font-heading text-3xl text-charcoal">Admin Access</h1>
          <p className="text-neutralgrey text-sm mt-2">Log in to manage orders and products.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50" 
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-peppermint-base border border-peppermint-wash rounded-soft p-3 focus:outline-none focus:ring-2 focus:ring-peppermint-primary/50" 
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-warmpop-coral text-sm font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-charcoal hover:bg-charcoal/80 text-white font-bold py-3 rounded-soft transition-colors mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

      </div>
    </div>
  )
}