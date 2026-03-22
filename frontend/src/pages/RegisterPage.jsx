// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HardHat, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      const errData = err.response?.data
      const msg = errData ? Object.values(errData).flat().join(', ') : 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light p-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-brand-yellow p-1.5 rounded-lg"><HardHat size={20} className="text-brand-black" /></div>
            <span className="font-extrabold text-xl">Build<span className="text-brand-orange">Mart</span></span>
          </div>
          <h2 className="text-2xl font-extrabold text-brand-black mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">Join the marketplace today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input id="reg-username" type="text" className="input-field" placeholder="Choose a username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input id="reg-email" type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="reg-password" type="password" className="input-field" placeholder="Create a strong password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                {['CUSTOMER', 'SUPPLIER', 'DELIVERY'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm({...form, role: r})}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${form.role === r ? 'border-brand-yellow bg-brand-yellow text-brand-black' : 'border-gray-200 text-gray-500 hover:border-brand-yellow'}`}
                  >
                    {r === 'CUSTOMER' ? '🛒 Customer' : r === 'SUPPLIER' ? '🏗️ Supplier' : '🚚 Delivery'}
                  </button>
                ))}
              </div>
            </div>
            <button id="register-btn" type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
              {loading ? <Loader size={18} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-orange font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
