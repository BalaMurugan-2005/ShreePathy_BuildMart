// src/pages/AdminDashboardPage.jsx
import { useState, useEffect } from 'react'
import { Users, ShoppingBag, Building2, TrendingUp, Tag, Plus, CheckCircle, XCircle } from 'lucide-react'
import { adminAPI, ordersAPI, analyticsAPI } from '../services/api'
import AnalyticsSection from '../components/AnalyticsSection'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('analytics')
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  const [newCoupon, setNewCoupon] = useState({ code: '', discount_percent: 10, min_order_amount: 0 })
  const [creatingCoupon, setCreatingCoupon] = useState(false)

  useEffect(() => {
    Promise.all([
      adminAPI.getUsers(), 
      adminAPI.getOrders(), 
      adminAPI.getSuppliers(),
      adminAPI.getCoupons(),
      analyticsAPI.get()
    ])
      .then(([u, o, s, c, a]) => { 
        setUsers(u.data); setOrders(o.data); setSuppliers(s.data); setCoupons(c.data); setAnalytics(a.data)
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + parseFloat(o.final_price || o.total_price), 0)

  const ADMIN_STATUS_OPTIONS = ['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order #${orderId} status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order status.')
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setCreatingCoupon(true)
    try {
      const res = await adminAPI.createCoupon({
        ...newCoupon, code: newCoupon.code.toUpperCase().trim()
      })
      setCoupons([res.data, ...coupons])
      setNewCoupon({ code: '', discount_percent: 10, min_order_amount: 0 })
      toast.success('Coupon created')
    } catch (err) {
      toast.error('Failed to create coupon')
    } finally {
      setCreatingCoupon(false)
    }
  }

  const TABS = [
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'orders', label: '📦 Orders' },
    { id: 'users', label: '👥 Users' },
    { id: 'suppliers', label: '🏢 Suppliers' },
    { id: 'coupons', label: '🎟️ Coupons' },
  ]

  const statusBadge = (s) => {
    const map = { PENDING: 'badge-yellow', ACCEPTED: 'badge-blue', PACKED: 'badge-purple', SHIPPED: 'badge-orange', DELIVERED: 'badge-green', CANCELLED: 'badge-red' }
    return map[s] || 'badge-gray'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Platform overview and master control</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-yellow-500 bg-yellow-500/10' },
          { label: 'Coupons', value: coupons.length, icon: Tag, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
        ].map((s, idx) => (
          <div key={idx} className="card p-5 flex items-center gap-4">
            <div className={`${s.color} p-3 rounded-xl shrink-0`}><s.icon size={22} /></div>
            <div>
              <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-6 flex-wrap" style={{ background: 'var(--border-color)' }}>
        {TABS.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-brand-yellow text-brand-black shadow-sm' : ''}`}
            style={{ color: tab === t.id ? undefined : 'var(--text-secondary)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          
          {tab === 'analytics' && (
            <div className="p-6">
              <AnalyticsSection data={analytics} />
            </div>
          )}

          {tab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ background: 'var(--border-color)' }}>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>ID</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>User</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Role</th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>#{u.id}</td>
                      <td className="px-5 py-3 font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span className="text-xl">{u.avatar || '🧑'}</span>
                        {u.username}
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={
                          u.role === 'ADMIN' ? 'badge-red' : u.role === 'SUPPLIER' ? 'badge-purple' : u.role === 'DELIVERY' ? 'badge-orange' : 'badge-green'
                        }>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ background: 'var(--border-color)' }}>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Order ID</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Customer</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Final Total</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Payment</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Date</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Update</th>
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>#{o.id}</td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{o.customer_name}</td>
                      <td className="px-5 py-3 font-bold text-emerald-600">₹{parseFloat(o.final_price || o.total_price).toFixed(2)}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-primary)' }}>{o.payment_method || 'COD'} <span className={o.payment_status === 'COMPLETED' ? 'text-emerald-500' : 'text-yellow-500'}>({o.payment_status})</span></td>
                      <td className="px-5 py-3"><span className={statusBadge(o.status)}>{o.status}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <select
                          className="input-field text-xs py-1.5 w-32 cursor-pointer font-bold"
                          value={o.status}
                          onChange={e => handleStatusChange(o.id, e.target.value)}
                        >
                          {ADMIN_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'suppliers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ background: 'var(--border-color)' }}>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>ID</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Supplier</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Email</th>
                  <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                </tr></thead>
                <tbody>
                  {suppliers.map(s => (
                    <tr key={s.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>#{s.id}</td>
                      <td className="px-5 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{s.username}</td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td className="px-5 py-3"><span className="badge-green">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'coupons' && (
            <div className="p-6">
              <div className="mb-8 p-6 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <h3 className="section-title mb-4 flex items-center gap-2 text-emerald-600"><Plus size={20} /> Generate New Coupon</h3>
                <form onSubmit={handleCreateCoupon} className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="label">Coupon Code</label>
                    <input required type="text" className="input-field uppercase font-bold" placeholder="E.g. FESTIVAL20" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} />
                  </div>
                  <div className="w-32">
                    <label className="label">% Discount</label>
                    <input required min="1" max="100" type="number" className="input-field font-bold" value={newCoupon.discount_percent} onChange={e => setNewCoupon({...newCoupon, discount_percent: e.target.value})} />
                  </div>
                  <div className="w-40">
                    <label className="label">Min Order ₹</label>
                    <input required min="0" type="number" className="input-field font-bold" value={newCoupon.min_order_amount} onChange={e => setNewCoupon({...newCoupon, min_order_amount: e.target.value})} />
                  </div>
                  <button type="submit" disabled={creatingCoupon} className="btn-primary w-fit flex items-center gap-2">
                    {creatingCoupon ? 'Saving...' : 'Create Promo Code'}
                  </button>
                </form>
              </div>

              <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Active Coupons</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupons.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border relative overflow-hidden group" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      {c.is_active ? <CheckCircle className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                    </div>
                    <p className="text-2xl font-extrabold uppercase text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">{c.code}</p>
                    <p className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{parseFloat(c.discount_percent)}% OFF</p>
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <p>✓ Min order ₹{parseFloat(c.min_order_amount)}</p>
                      <p>✓ Max uses: {c.max_uses}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
