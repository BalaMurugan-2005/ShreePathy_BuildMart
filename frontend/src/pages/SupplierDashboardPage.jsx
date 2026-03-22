// src/pages/SupplierDashboardPage.jsx
import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Package, ShoppingBag, Plus, X, Loader, BarChart3, Edit, Trash2,
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle,
  Truck, Copy, Download, MessageSquare, Star, Settings, Bell,
  LayoutDashboard, Send, RefreshCw, Award, Shield, ChevronDown,
  RotateCcw, Eye, Wallet, Target
} from 'lucide-react'
import { supplierAPI, materialsAPI, ordersAPI, messagingAPI, 
         withdrawalAPI, notificationsAPI, reviewsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
         ResponsiveContainer, BarChart, Bar } from 'recharts'

const TABS = [
  { id: 'overview',   label: 'Overview',       icon: LayoutDashboard },
  { id: 'orders',     label: 'Orders',          icon: ShoppingBag },
  { id: 'inventory',  label: 'Inventory',       icon: Package },
  { id: 'analytics',  label: 'Analytics',       icon: BarChart3 },
  { id: 'messages',   label: 'Messages',        icon: MessageSquare },
  { id: 'earnings',   label: 'Earnings',        icon: DollarSign },
  { id: 'settings',   label: 'Settings',        icon: Settings },
]

const ORDER_FLOW = {
  PENDING:          ['ACCEPTED', 'CANCELLED'],
  ACCEPTED:         ['PACKED',   'CANCELLED'],
  PACKED:           ['CANCELLED'],
  SHIPPED:          [],
  DELIVERED:        [],
  CANCELLED:        [],
  RETURN_REQUESTED: ['RETURNED'],
  RETURNED:         [],
}

const STATUS_COLOR = {
  PENDING:          'badge-yellow',
  ACCEPTED:         'bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg text-xs font-bold',
  PACKED:           'bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-lg text-xs font-bold',
  SHIPPED:          'badge-orange',
  DELIVERED:        'badge-green',
  CANCELLED:        'badge-red',
  RETURN_REQUESTED: 'badge-orange',
  RETURNED:         'badge-red',
}

export default function SupplierDashboardPage() {
  const [tab, setTab] = useState('overview')
  const [materials, setMaterials] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const [withdrawals, setWithdrawals] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editMaterial, setEditMaterial] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bank_account_details: '' })
  const [form, setForm] = useState({ name: '', category: '', price: '', discount_percent: '0', stock: '', description: '' })
  const [newMsgModal, setNewMsgModal] = useState(false)
  const [customerList, setCustomerList] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const msgEndRef = useRef(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [mRes, oRes, aRes, pRes, notifRes] = await Promise.all([
        supplierAPI.getMaterials(),
        supplierAPI.getOrders(),
        supplierAPI.getAnalytics(),
        supplierAPI.getProfile(),
        notificationsAPI.getAll(),
      ])
      setMaterials(mRes.data)
      setOrders(oRes.data)
      setAnalytics(aRes.data)
      setProfile(pRes.data)
      setNotifications(notifRes.data?.notifications || [])
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (tab === 'messages') {
      messagingAPI.getConversations().then(r => setConversations(r.data)).catch(() => {})
    }
    if (tab === 'earnings') {
      withdrawalAPI.getAll().then(r => setWithdrawals(r.data)).catch(() => {})
    }
  }, [tab])

  useEffect(() => {
    if (newMsgModal) {
      supplierAPI.getCustomers().then(r => setCustomerList(r.data)).catch(() => {})
    }
  }, [newMsgModal])

  useEffect(() => {
    if (activeThread) {
      messagingAPI.getThread(activeThread.user_id).then(r => {
        setMessages(r.data)
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }).catch(() => {})
    }
  }, [activeThread])

  // Derived
  const revenue = useMemo(() => analytics?.total_revenue || 0, [analytics])
  const pendingCount = useMemo(() => analytics?.pending_orders || 0, [analytics])
  const lowStock = useMemo(() => materials.filter(m => m.stock > 0 && m.stock <= 10), [materials])
  const outOfStock = useMemo(() => materials.filter(m => m.stock === 0), [materials])
  const unread = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications])

  // Handlers
  const handleSubmitMaterial = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.target)
    try {
      if (editMaterial) {
        const res = await materialsAPI.update(editMaterial.id, fd)
        setMaterials(prev => prev.map(m => m.id === editMaterial.id ? res.data : m))
        toast.success('Product updated!')
      } else {
        const res = await materialsAPI.create(fd)
        setMaterials(prev => [res.data, ...prev])
        toast.success('Product published!')
      }
      setShowAddForm(false); setEditMaterial(null)
      e.target.reset()
    } catch { toast.error('Failed to save product') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return
    try {
      await materialsAPI.delete(id)
      setMaterials(prev => prev.filter(m => m.id !== id))
      toast.success('Product deleted')
    } catch { toast.error('Cannot delete — check if it has active orders') }
  }

  const handleStockBlur = async (m, newStock) => {
    if (String(newStock) === String(m.stock)) return
    try {
      const fd = new FormData(); fd.append('stock', newStock)
      const res = await materialsAPI.update(m.id, fd)
      setMaterials(prev => prev.map(x => x.id === m.id ? res.data : x))
      toast.success(`Stock updated to ${newStock}`)
    } catch { toast.error('Stock update failed') }
  }

  const handleOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') { setCancelModal(orderId); return }
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order marked ${newStatus}`)
    } catch { toast.error('Status update failed') }
  }

  const handleCancelConfirm = async () => {
    try {
      await ordersAPI.updateStatus(cancelModal, 'CANCELLED', cancelReason)
      setOrders(prev => prev.map(o => o.id === cancelModal ? { ...o, status: 'CANCELLED' } : o))
      toast.success('Order cancelled')
      setCancelModal(null); setCancelReason('')
    } catch { toast.error('Cancel failed') }
  }

  const handleSendMessage = async () => {
    if (!msgText.trim() || !activeThread) return
    try {
      const res = await messagingAPI.sendMessage(activeThread.user_id, msgText)
      setMessages(prev => [...prev, res.data])
      setMsgText('')
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      // refresh sidebar so new conversation appears
      messagingAPI.getConversations().then(r => setConversations(r.data)).catch(() => {})
    } catch { toast.error('Send failed') }
  }

  const handleStartConversation = (customer) => {
    const existing = conversations.find(c => c.user_id === customer.user_id)
    const thread = existing || { user_id: customer.user_id, username: customer.username, avatar: customer.avatar || '🧑', unread: 0, last_message: '' }
    setActiveThread(thread)
    setNewMsgModal(false)
    setCustomerSearch('')
  }

  const handleChatFromOrder = (order) => {
    const existing = conversations.find(c => c.username === order.customer_name)
    if (existing) {
      setActiveThread(existing)
      setTab('messages')
    } else {
      supplierAPI.getCustomers().then(r => {
        const customer = r.data.find(c => c.username === order.customer_name)
        if (customer) {
          setActiveThread({ user_id: customer.user_id, username: customer.username, avatar: customer.avatar || '🧑', unread: 0, last_message: '' })
          setTab('messages')
        } else {
          toast.error('Customer not found')
        }
      }).catch(() => toast.error('Failed to load customer info'))
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    try {
      const res = await withdrawalAPI.create(withdrawForm)
      setWithdrawals(prev => [res.data, ...prev])
      toast.success('Withdrawal request submitted!')
      setWithdrawModal(false)
      setWithdrawForm({ amount: '', bank_account_details: '' })
    } catch { toast.error('Withdrawal request failed') }
  }


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="animate-spin text-brand-yellow w-10 h-10" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 animate-fade-in-up">
      
      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-60 shrink-0">
        <div className="card p-4 sticky top-24 space-y-1">
          <div className="px-3 pb-4 mb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>
              {profile?.company_name || 'My Shop'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {profile?.is_verified
                ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><Shield size={12}/> Verified</span>
                : <span className="text-xs text-gray-400">Not Verified</span>
              }
            </div>
          </div>

          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-brand-yellow text-brand-black shadow' : 'btn-ghost'}`}
                style={!active ? { color: 'var(--text-secondary)' } : {}}
              >
                <Icon size={16} /> {t.label}
                {t.id === 'orders' && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
                {t.id === 'inventory' && outOfStock.length > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{outOfStock.length}</span>
                )}
                {t.id === 'messages' && conversations.some(c => c.unread > 0) && (
                  <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            )
          })}

          <div className="pt-4">
            <button onClick={() => { setEditMaterial(null); setShowAddForm(true) }} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold">
              <Plus size={16} /> New Product
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black capitalize" style={{ color: 'var(--text-primary)' }}>
              {TABS.find(t => t.id === tab)?.label}
            </h1>
            <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Rank #{analytics?.my_rank || '—'} of {analytics?.total_suppliers || '—'} suppliers
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <button onClick={() => setTab('messages')} className="btn-ghost p-2 rounded-full"><MessageSquare size={20}/></button>
            </div>
            <div className="relative">
              <button onClick={() => notificationsAPI.markAllRead()} className="btn-ghost p-2 rounded-full"><Bell size={20}/></button>
              {unread > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>}
            </div>
          </div>
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Net Revenue', value: `₹${Number(revenue).toLocaleString()}`, sub: '+delivered orders', icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10', border: 'border-emerald-500' },
                { label: 'Pending Orders', value: pendingCount, sub: 'Needs action', icon: ShoppingBag, color: 'text-blue-500 bg-blue-500/10', border: 'border-blue-500' },
                { label: 'Low/Out of Stock', value: lowStock.length + outOfStock.length, sub: `${outOfStock.length} disabled`, icon: AlertTriangle, color: 'text-orange-500 bg-orange-500/10', border: 'border-orange-500' },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className={`card p-5 border-l-4 ${s.border}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                        <p className="text-3xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.sub}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${s.color}`}><Icon size={22}/></div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Sales Chart */}
              <div className="card p-6">
                <h3 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>📈 Weekly Revenue (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={analytics?.daily_sales || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5C518" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F5C518" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)"/>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={v => `₹${v}`}/>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }} formatter={v => [`₹${v}`, 'Revenue']}/>
                    <Area type="monotone" dataKey="revenue" stroke="#F5C518" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Action Required */}
              <div className="card p-6">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <AlertTriangle size={16} className="text-amber-500"/> Action Required
                </h3>
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {outOfStock.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                        <p className="text-xs font-bold text-red-400">OUT OF STOCK • Auto-disabled</p>
                      </div>
                      <button onClick={() => setTab('inventory')} className="text-xs btn-primary px-3 py-1">Fix</button>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'PENDING').slice(0, 3).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Order #{o.id} • {o.customer_name}</p>
                        <p className="text-xs font-bold text-blue-400">PENDING — Accept or Reject</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleOrderStatus(o.id, 'ACCEPTED')} className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-lg font-bold">Accept</button>
                        <button onClick={() => setCancelModal(o.id)} className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-lg font-bold">Reject</button>
                      </div>
                    </div>
                  ))}
                  {outOfStock.length === 0 && pendingCount === 0 && (
                    <p className="text-sm font-bold text-center py-8 opacity-40" style={{ color: 'var(--text-secondary)' }}>✅ All caught up!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vendor Leaderboard */}
            {analytics?.vendor_leaderboard?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Award size={16} className="text-brand-yellow"/> 🏆 Vendor Ranking
                </h3>
                <div className="space-y-3">
                  {analytics.vendor_leaderboard.map((v, i) => (
                    <div key={v.username} className={`flex items-center gap-4 p-3 rounded-xl ${i === 0 ? 'border-2 border-brand-yellow' : 'border'}`} style={{ borderColor: i !== 0 ? 'var(--border-color)' : undefined, background: 'var(--bg-primary)' }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${i === 0 ? 'bg-brand-yellow text-brand-black' : i === 1 ? 'bg-gray-300 text-gray-800' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{v.username}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div className="bg-brand-yellow h-1.5 rounded-full" style={{ width: `${Math.max(5, (v.revenue / (analytics.vendor_leaderboard[0]?.revenue || 1)) * 100)}%` }}></div>
                        </div>
                      </div>
                      <p className="text-sm font-black text-emerald-500 shrink-0">₹{Number(v.revenue).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="card p-12 text-center"><ShoppingBag size={48} className="mx-auto mb-3 opacity-20"/><p style={{ color: 'var(--text-secondary)' }} className="font-bold">No orders yet</p></div>
            ) : orders.map(o => {
              const next = ORDER_FLOW[o.status] || []
              return (
                <div key={o.id} className="card p-5 border-l-4" style={{ borderLeftColor: o.status === 'PENDING' ? '#F5C518' : o.status === 'CANCELLED' ? '#ef4444' : o.status === 'DELIVERED' ? '#10b981' : '#3b82f6' }}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>Order #{o.id}</h3>
                        <span className={STATUS_COLOR[o.status] || 'badge-yellow'}>{o.status}</span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                        👤 {o.customer_name} · 📅 {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        📍 {o.delivery_address}
                      </p>
                      {/* Items */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {o.items?.map(item => (
                          <span key={item.id} className="text-xs font-bold px-2 py-1 rounded-lg border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                            {item.material_name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between shrink-0 gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-500">₹{parseFloat(o.final_price).toFixed(2)}</p>
                        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--text-secondary)' }}>{o.payment_method} · {o.payment_status}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {next.map(ns => (
                          <button key={ns} onClick={() => handleOrderStatus(o.id, ns)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              ns === 'ACCEPTED' ? 'bg-emerald-500 text-white' :
                              ns === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                              ns === 'PACKED' ? 'bg-purple-500 text-white' : 'btn-primary'
                            }`}>
                            {ns === 'ACCEPTED' ? '✅ Accept' : ns === 'CANCELLED' ? '❌ Reject/Cancel' : ns === 'PACKED' ? '📦 Mark Packed' : `→ ${ns}`}
                          </button>
                        ))}
                        <button onClick={() => handleChatFromOrder(o)}
                          className="btn-outline text-xs px-3 py-2 flex items-center gap-1 font-bold">
                          <MessageSquare size={13}/> Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ══ INVENTORY ══ */}
        {tab === 'inventory' && (
          <div className="card overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Product Catalog</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{materials.length} listings · {outOfStock.length} disabled</p>
              </div>
              <button onClick={() => { setEditMaterial(null); setShowAddForm(true) }} className="btn-primary text-sm flex items-center gap-2 font-bold">
                <Plus size={16}/> Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-left font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {materials.map(m => (
                    <tr key={m.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                            {m.image ? <img src={m.image} className="w-full h-full object-cover" alt={m.name}/> : <Package size={20} className="m-auto mt-2 opacity-20"/>}
                          </div>
                          <p className="font-bold line-clamp-1" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{m.category_name || '—'}</td>
                      <td className="px-5 py-4 font-black text-emerald-500">₹{m.price}</td>
                      <td className="px-5 py-4">
                        <input type="number" defaultValue={m.stock} min={0}
                          className="input-field py-1 px-2 w-20 text-center font-bold text-sm"
                          onBlur={e => handleStockBlur(m, e.target.value)}/>
                      </td>
                      <td className="px-5 py-4">
                        {m.stock === 0 ? <span className="badge-red">Disabled</span> :
                         m.stock <= 10 ? <span className="badge-orange">Low Stock</span> :
                         <span className="badge-green">Active</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditMaterial(m); setForm({ name: m.name, category: m.category_name || '', price: m.price, discount_percent: m.discount_percent || '0', stock: m.stock, description: m.description || '' }); setShowAddForm(true) }}
                            className="p-1.5 hover:text-brand-yellow transition-colors" style={{ color: 'var(--text-secondary)' }} title="Edit"><Edit size={16}/></button>
                          <button onClick={() => { setForm({ name: m.name + ' (Copy)', category: m.category_name || '', price: m.price, discount_percent: '0', stock: '', description: m.description || '' }); setEditMaterial(null); setShowAddForm(true) }}
                            className="p-1.5 hover:text-blue-500 transition-colors" style={{ color: 'var(--text-secondary)' }} title="Duplicate"><Copy size={16}/></button>
                          <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:text-red-500 transition-colors" style={{ color: 'var(--text-secondary)' }} title="Delete"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>📅 Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics?.monthly_sales || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)"/>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={v => `₹${v}`}/>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }} formatter={v => [`₹${v}`, 'Revenue']}/>
                    <Bar dataKey="revenue" fill="#F5C518" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  🔥 Top Selling Materials
                </h3>
                <div className="space-y-4">
                  {(analytics?.top_products || []).length === 0
                    ? <p className="text-sm text-center py-8 opacity-40" style={{ color: 'var(--text-secondary)' }}>No sales data yet</p>
                    : analytics.top_products.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-lg font-black opacity-30 w-5">#{i+1}</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-brand-yellow h-1.5 rounded-full" style={{ width: `${Math.max(10, (p.qty / (analytics.top_products[0]?.qty || 1)) * 100)}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-brand-orange">{p.qty} sold</span>
                          </div>
                        </div>
                        <span className="text-sm font-black text-emerald-500 shrink-0">₹{p.revenue.toFixed(0)}</span>
                      </div>
                    ))
                  }
                </div>
                {(analytics?.least_products || []).length > 0 && (
                  <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-400">
                      <TrendingDown size={14}/> Least Performing
                    </h4>
                    {analytics.least_products.map(p => (
                      <div key={p.id} className="flex justify-between text-sm py-1">
                        <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                        <span className="font-bold text-red-400">{p.qty || 0} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {tab === 'messages' && (
          <div className="card overflow-hidden flex h-[520px]">
            {/* Sidebar */}
            <div className="w-64 border-r shrink-0 flex flex-col" style={{ borderColor: 'var(--border-color)' }}>
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Conversations</span>
                <button
                  onClick={() => setNewMsgModal(true)}
                  title="Start new conversation"
                  className="flex items-center gap-1 text-xs font-bold bg-brand-yellow text-brand-black px-2.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                  <Plus size={13}/> New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-4 text-center">
                      <MessageSquare size={32} className="opacity-20" style={{ color: 'var(--text-secondary)' }}/>
                      <p className="text-xs font-bold opacity-50" style={{ color: 'var(--text-secondary)' }}>No conversations yet</p>
                      <button onClick={() => setNewMsgModal(true)}
                        className="text-xs font-bold text-brand-yellow underline underline-offset-2">
                        Message a customer →
                      </button>
                    </div>
                  )
                  : conversations.map(c => (
                    <button key={c.user_id} onClick={() => setActiveThread(c)}
                      className={`w-full text-left p-4 border-b transition-colors ${activeThread?.user_id === c.user_id ? 'bg-brand-yellow/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                      style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.avatar || '🧑'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{c.username}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{c.last_message}</p>
                        </div>
                        {c.unread > 0 && <span className="w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{c.unread}</span>}
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>


            {/* Thread */}
            {activeThread ? (
              <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b font-bold flex items-center gap-2" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  <span>{activeThread.avatar || '🧑'}</span> {activeThread.username}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender !== activeThread.user_id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm font-medium ${msg.sender !== activeThread.user_id ? 'bg-brand-yellow text-brand-black' : 'border'}`}
                        style={msg.sender === activeThread.user_id ? { background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } : {}}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={msgEndRef}/>
                </div>
                <div className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border-color)' }}>
                  <input value={msgText} onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="input-field flex-1 py-2 text-sm" placeholder="Type a message..."/>
                  <button onClick={handleSendMessage} className="btn-primary p-2 rounded-xl"><Send size={18}/></button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-40">
                <div className="text-center">
                  <MessageSquare size={40} className="mx-auto mb-2"/>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ EARNINGS ══ */}
        {tab === 'earnings' && (
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-gray-900 to-black p-8 text-white relative overflow-hidden">
              <div className="absolute right-6 top-6 opacity-10"><Wallet size={80}/></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
              <h2 className="text-5xl font-black text-emerald-400 mb-2">₹{(Number(revenue) * 0.95).toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
              <p className="text-xs text-gray-400 mb-6">After 5% platform commission from ₹{Number(revenue).toLocaleString()} gross</p>
              <div className="flex gap-3">
                <button onClick={() => setWithdrawModal(true)} className="bg-white text-black px-6 py-3 rounded-xl font-black hover:bg-gray-100 transition-colors">Withdraw to Bank</button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Withdrawal History</h3>
              {withdrawals.length === 0
                ? <p className="text-sm text-center py-8 opacity-40" style={{ color: 'var(--text-secondary)' }}>No withdrawal requests yet</p>
                : <table className="w-full text-sm">
                    <thead><tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      {['Amount', 'Bank', 'Status', 'Date'].map(h => (
                        <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                      {withdrawals.map(w => (
                        <tr key={w.id}>
                          <td className="py-3 px-4 font-black text-emerald-500">₹{w.amount}</td>
                          <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{w.bank_account_details}</td>
                          <td className="py-3 px-4"><span className={w.status === 'COMPLETED' ? 'badge-green' : w.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'}>{w.status}</span></td>
                          <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {tab === 'settings' && (
          <div className="card p-6 max-w-lg">
            <h2 className="font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Shop Settings</h2>
            <form onSubmit={async e => {
              e.preventDefault()
              const fd = new FormData(e.target)
              const data = { company_name: fd.get('company_name'), delivery_area: fd.get('delivery_area') }
              try {
                const res = await supplierAPI.updateProfile(data)
                setProfile(res.data)
                toast.success('Settings saved!')
              } catch { toast.error('Save failed') }
            }} className="space-y-5">
              <div>
                <label className="label">Company / Shop Name</label>
                <input name="company_name" defaultValue={profile?.company_name || ''} required className="input-field w-full"/>
              </div>
              <div>
                <label className="label">Delivery Area / Zone</label>
                <input name="delivery_area" defaultValue={profile?.delivery_area || ''} className="input-field w-full" placeholder="e.g. Chennai, Tamil Nadu"/>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <Shield size={24} className={profile?.is_verified ? 'text-emerald-400' : 'text-gray-400'}/>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Seller Verification</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{profile?.is_verified ? '✅ Your account is verified' : '⏳ Verification pending — contact admin'}</p>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3 font-bold">Save Settings</button>
            </form>
          </div>
        )}

      </main>

      {/* ══ PRODUCT FORM MODAL ══ */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card w-full max-w-xl p-6 border-2 border-brand-yellow animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                {editMaterial ? '✏️ Edit Product' : '🚀 New Product Listing'}
              </h2>
              <button onClick={() => { setShowAddForm(false); setEditMaterial(null) }} className="btn-ghost p-2 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitMaterial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Product Name *</label>
                  <input name="name" required defaultValue={form.name} className="input-field w-full" placeholder="e.g. OPC Cement 50kg"/>
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select name="category" required defaultValue={form.category} className="input-field w-full">
                    <option value="">Select…</option>
                    {['Cement', 'Sand', 'Steel', 'Bricks', 'Wood', 'Tools', 'Aggregates', 'Paint', 'Tiles'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Price (₹) *</label>
                  <input name="price" type="number" min="0" step="0.01" required defaultValue={form.price} className="input-field w-full" placeholder="0.00"/>
                </div>
                <div>
                  <label className="label">Stock (units) *</label>
                  <input name="stock" type="number" min="0" required defaultValue={form.stock} className="input-field w-full" placeholder="0"/>
                </div>
                <div>
                  <label className="label">Discount (%)</label>
                  <input name="discount_percent" type="number" min="0" max="100" step="0.01" defaultValue={form.discount_percent || '0'} className="input-field w-full" placeholder="0"/>
                </div>
                <div className="col-span-2">
                  <label className="label">Product Image</label>
                  <input name="image" type="file" accept="image/*" className="input-field w-full"/>
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea name="description" defaultValue={form.description} className="input-field w-full h-24 resize-none" placeholder="Specifications, grade, usage..."/>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddForm(false); setEditMaterial(null) }} className="btn-outline flex-1 py-3 font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 font-black flex items-center justify-center gap-2">
                  {submitting ? <Loader size={16} className="animate-spin"/> : editMaterial ? '💾 Update' : '🚀 Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ CANCEL MODAL ══ */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 border-t-4 border-red-500">
            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Cancel / Reject Order #{cancelModal}</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Provide a reason to notify the customer.</p>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              className="input-field w-full min-h-[80px] resize-none mb-4"
              placeholder="Reason (e.g. out of stock, unable to fulfil)..."/>
            <div className="flex gap-3">
              <button onClick={() => { setCancelModal(null); setCancelReason('') }} className="btn-outline flex-1 py-3 font-bold">Back</button>
              <button onClick={handleCancelConfirm} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ WITHDRAW MODAL ══ */}
      {withdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 border-t-4 border-emerald-500">
            <h3 className="text-xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>💳 Withdraw Funds</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="label">Amount (₹) *</label>
                <input required type="number" min="1" max={Number(revenue) * 0.95}
                  value={withdrawForm.amount} onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))}
                  className="input-field w-full" placeholder="Enter amount"/>
              </div>
              <div>
                <label className="label">Bank Account Details *</label>
                <textarea required value={withdrawForm.bank_account_details}
                  onChange={e => setWithdrawForm(p => ({ ...p, bank_account_details: e.target.value }))}
                  className="input-field w-full min-h-[80px] resize-none"
                  placeholder="Account No, IFSC, Bank Name..."/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setWithdrawModal(false)} className="btn-outline flex-1 py-3 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ NEW MESSAGE MODAL ══ */}
      {newMsgModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 border-t-4 border-brand-yellow animate-fade-in-up">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>💬 New Message</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Select a customer to start a conversation</p>
              </div>
              <button onClick={() => { setNewMsgModal(false); setCustomerSearch('') }} className="btn-ghost p-2 rounded-full"><X size={20}/></button>
            </div>
            <input
              type="text"
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              className="input-field w-full mb-4 py-2 text-sm"
              placeholder="Search customers..."
              autoFocus
            />
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {customerList.length === 0 ? (
                <p className="text-sm text-center py-8 opacity-40" style={{ color: 'var(--text-secondary)' }}>
                  No customers have placed orders yet
                </p>
              ) : (
                customerList
                  .filter(c => c.username.toLowerCase().includes(customerSearch.toLowerCase()))
                  .map(customer => (
                    <button key={customer.user_id}
                      onClick={() => handleStartConversation(customer)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:border-brand-yellow hover:bg-brand-yellow/5"
                      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                      <span className="text-2xl">{customer.avatar || '🧑'}</span>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{customer.username}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customer</p>
                      </div>
                      <MessageSquare size={16} className="ml-auto opacity-40" style={{ color: 'var(--text-secondary)' }}/>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

