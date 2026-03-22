// src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HardHat, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.username}!`)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'SUPPLIER') navigate('/supplier')
      else if (user.role === 'DELIVERY') navigate('/delivery')
      else navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-brand-black text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, #F5C518 0, #F5C518 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px'}} />
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-yellow p-4 rounded-2xl">
              <HardHat size={48} className="text-brand-black" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Build<span className="text-brand-yellow">Mart</span></h1>
          <p className="text-lg text-gray-300 max-w-sm">Your one-stop marketplace for quality construction materials. Trusted suppliers, competitive prices.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['500+', 'Suppliers'], ['10K+', 'Materials'], ['50K+', 'Orders']].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <p className="text-brand-yellow text-xl font-extrabold">{val}</p>
                <p className="text-gray-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-brand-light">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="bg-brand-yellow p-1.5 rounded-lg"><HardHat size={20} className="text-brand-black" /></div>
              <span className="font-extrabold text-xl">Build<span className="text-brand-orange">Mart</span></span>
            </div>
            <h2 className="text-2xl font-extrabold text-brand-black mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your BuildMart account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input id="username" type="text" className="input-field" placeholder="Enter your username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input id="password" type={showPwd ? 'text' : 'password'} className="input-field pr-10" placeholder="Enter your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button id="login-btn" type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
                {loading ? <Loader size={18} className="animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-orange font-semibold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
