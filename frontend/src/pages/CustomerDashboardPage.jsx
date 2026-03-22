// src/pages/CustomerDashboardPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingBag, Clock, CheckCircle, Package, Search, Filter, 
  ChevronLeft, ChevronRight, X, AlertTriangle, RotateCcw,
  BarChart2, TrendingUp, Calendar, Download, Eye,
  Truck, CreditCard, MapPin, Gift, Star, Shield,
  RefreshCw, ChevronDown, MoreVertical, Printer,
  Mail, Phone, Hash, CalendarDays, Wallet,
  Sparkles, Award, Target, Layers, Box, Heart
} from 'lucide-react'
import { ordersAPI, analyticsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import OrderStatusTracker from '../components/OrderStatusTracker'
import AnalyticsSection from '../components/AnalyticsSection'
import OrderDetailModal from '../components/OrderDetailModal'
import toast from 'react-hot-toast'

const STATUS_OPTS = ['ALL', 'PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED']
const TABS = ['orders', 'analytics']

const statusConfig = {
  PENDING: { label: 'Pending', badge: 'badge-yellow', icon: Clock },
  ACCEPTED: { label: 'Accepted', badge: 'badge-blue', icon: CheckCircle },
  PACKED: { label: 'Packed', badge: 'badge-purple', icon: Package },
  SHIPPED: { label: 'Shipped', badge: 'badge-orange', icon: Truck },
  DELIVERED: { label: 'Delivered', badge: 'badge-emerald', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', badge: 'badge-red', icon: X },
  RETURN_REQUESTED: { label: 'Return Req.', badge: 'badge-orange', icon: RotateCcw },
  RETURNED: { label: 'Returned', badge: 'badge-red', icon: RefreshCw }
}

export default function CustomerDashboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, currentPage: 1 })
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailOrder, setDetailOrder] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [returnModal, setReturnModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 10 }
      if (search) params.search = search
      if (statusFilter !== 'ALL') params.status = statusFilter
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const res = await ordersAPI.getAll(params)
      const data = res.data
      
      if (data.results) {
        setOrders(data.results)
        setPagination({ count: data.count, next: data.next, previous: data.previous, currentPage: page })
      } else {
        setOrders(data)
        setPagination({ count: data.length, next: null, previous: null, currentPage: 1 })
      }
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, dateFrom, dateTo, page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    if (tab === 'analytics') {
      analyticsAPI.get().then(r => setAnalytics(r.data)).catch(() => {})
    }
  }, [tab])

  const handleCancelOrder = async () => {
    try {
      await ordersAPI.cancel(cancelModal.id, cancelReason || 'Customer requested cancellation')
      toast.success(`Order #${cancelModal.id} cancelled`)
      setCancelModal(null)
      setCancelReason('')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order')
    }
  }

  const handleReturnOrder = async () => {
    try {
      await ordersAPI.requestReturn(returnModal.id, returnReason || 'Customer requested return')
      toast.success(`Return requested for Order #${returnModal.id}`)
      setReturnModal(null)
      setReturnReason('')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit return')
    }
  }

  const totalPages = Math.ceil(pagination.count / 10)

  const stats = {
    total: pagination.count,
    pending: orders.filter(o => ['PENDING', 'ACCEPTED', 'PACKED', 'SHIPPED'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-yellow rounded-xl shadow-lg">
            <Layers className="w-6 h-6 text-brand-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Customer Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Welcome back, <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.username}</span> • Member since {new Date().getFullYear()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/wishlist" className="btn-outline flex items-center gap-2 font-bold px-6 border-transparent bg-white shadow-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <Heart className="w-4 h-4 text-rose-500" /> Wishlist
          </Link>
          <Link to="/marketplace" className="btn-primary flex items-center gap-2 font-bold px-6 shadow-lg">
            <ShoppingBag className="w-4 h-4" /> Shop Now
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: pagination.count, icon: Package, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'In Progress', value: stats.pending, icon: Clock, color: 'text-orange-500 bg-orange-500/10' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' }
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="card p-6 flex flex-col justify-center transition-transform hover:scale-105">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-4 rounded-xl shrink-0`}><Icon size={24} /></div>
                <div>
                  <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-sm font-semibold mt-1 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl w-fit mb-6 shadow-sm border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {TABS.map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-8 py-3 rounded-lg text-sm font-bold transition-all capitalize flex items-center gap-2 ${tab === t ? 'bg-brand-yellow text-brand-black shadow-md' : 'btn-ghost'}`}
            style={tab !== t ? { color: 'var(--text-secondary)' } : {}}
          >
            {t === 'orders' ? <Package size={16}/> : <BarChart2 size={16}/>}
            {t === 'orders' ? 'My Orders' : 'Analytics'}
          </button>
        ))}
      </div>

      {tab === 'analytics' && <AnalyticsSection data={analytics} />}

      {tab === 'orders' && (
        <div className="space-y-6">
          {/* Enhanced Filters */}
          <div className="card">
            <div className="p-5 cursor-pointer flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }} onClick={() => setShowFilters(!showFilters)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-yellow/20 rounded-lg text-brand-yellow"><Filter size={18} /></div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Filter Orders</h3>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} />
            </div>

            {showFilters && (
              <div className="p-5 border-t border-dashed animate-fade-in-up" style={{ borderColor: 'var(--border-color)' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    <input type="text" placeholder="Search ID..." className="input-field pl-9 py-2 w-full text-sm font-semibold" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                  </div>
                  <select className="input-field py-2 w-full text-sm font-semibold" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="date" className="input-field py-2 w-full text-sm font-semibold" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} />
                  <input type="date" className="input-field py-2 w-full text-sm font-semibold" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} />
                </div>
                {(search || statusFilter !== 'ALL' || dateFrom || dateTo) && (
                  <div className="flex justify-end mt-4">
                    <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setDateFrom(''); setDateTo(''); setPage(1); }} className="text-red-500 font-bold text-sm flex items-center gap-1 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" /> Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="card overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-brand-yellow rounded-full"></div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Order History</h2>
              </div>
              <span className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-400">
                {pagination.count} Orders
              </span>
            </div>

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
                <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading history...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center animate-fade-in-up">
                <Package className="w-16 h-16 mx-auto mb-4 text-brand-yellow/50" />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No orders yet</h3>
                <p className="mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>Start shopping to see your orders here</p>
                <Link to="/marketplace" className="btn-primary inline-flex gap-2 font-bold px-8 shadow-md">
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
                      {['Order ID', 'Date & Time', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const status = statusConfig[order.status] || statusConfig.PENDING
                      const StatusIcon = status.icon
                      return (
                        <tr key={order.id} className="border-b transition-colors group/row" style={{ borderColor: 'var(--border-color)' }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>#{order.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              <CalendarDays className="w-4 h-4" /> {formatDate(order.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{order.items?.length || 0} items</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="font-extrabold text-emerald-500">₹{parseFloat(order.final_price || order.total_price).toFixed(2)}</span>
                            </div>
                            {order.gst_amount > 0 && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>+ ₹{parseFloat(order.gst_amount).toFixed(2)} GST</p>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-xs"><span className={`px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider`}>{order.payment_method || 'COD'}</span></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={status.badge}>{status.label}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setDetailOrder(order)} className="opacity-70 hover:opacity-100 transition-opacity hover:text-brand-orange" title="View"><Eye className="w-5 h-5" /></button>
                              <button onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)} className="opacity-70 hover:opacity-100 transition-opacity hover:text-brand-orange" title="Track"><Truck className="w-5 h-5" /></button>
                              {['PENDING', 'ACCEPTED'].includes(order.status) && (
                                <button onClick={() => setCancelModal(order)} className="opacity-70 hover:opacity-100 transition-opacity text-red-500" title="Cancel"><X className="w-5 h-5" /></button>
                              )}
                              {order.status === 'DELIVERED' && (
                                <button onClick={() => setReturnModal(order)} className="opacity-70 hover:opacity-100 transition-opacity text-purple-500" title="Return"><RotateCcw className="w-5 h-5" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button disabled={!pagination.previous} onClick={() => setPage(p => p - 1)} className="btn-outline text-sm py-1.5 px-4 disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button disabled={!pagination.next} onClick={() => setPage(p => p + 1)} className="btn-outline text-sm py-1.5 px-4 disabled:opacity-50">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tracker Card */}
          {selectedOrder && (
            <div className="card p-6 mt-6 border-b-4 border-brand-yellow animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Tracking Order <span className="text-brand-yellow">#{selectedOrder.id}</span></h3>
                <button onClick={() => setSelectedOrder(null)} className="btn-ghost p-1 rounded-full"><X size={20} /></button>
              </div>
              <OrderStatusTracker status={selectedOrder.status} />
              <div className="mt-8 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-6" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Delivery</p>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>{selectedOrder.delivery_address}</p>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Payment</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedOrder.payment_method}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>Status: {selectedOrder.payment_status}</p>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Total Paid</p>
                  <p className="text-2xl font-black text-emerald-500">₹{parseFloat(selectedOrder.final_price || selectedOrder.total_price).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}

      {cancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="card w-full max-w-md p-6 border-t-4 border-red-500" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/10 p-2 text-red-500 rounded-lg"><AlertTriangle size={24} /></div>
              <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Cancel Order #{cancelModal.id}</h3>
            </div>
            <p className="text-sm font-semibold mb-6" style={{ color: 'var(--text-secondary)' }}>This action cannot be undone. Items will be returned to store inventory.</p>
            <textarea
              className="input-field min-h-[100px] mb-6 resize-none"
              placeholder="Reason for cancellation (optional)..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="btn-outline flex-1 py-3 font-bold">Keep Order</button>
              <button onClick={handleCancelOrder} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg">Cancel Now</button>
            </div>
          </div>
        </div>
      )}

      {returnModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="card w-full max-w-md p-6 border-t-4 border-purple-500" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/10 p-2 text-purple-500 rounded-lg"><RotateCcw size={24} /></div>
              <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Return Order #{returnModal.id}</h3>
            </div>
            <p className="text-sm font-semibold mb-6" style={{ color: 'var(--text-secondary)' }}>Please provide a reason. Our team will review your request.</p>
            <textarea
              className="input-field min-h-[100px] mb-6 resize-none"
              placeholder="Reason for return..."
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setReturnModal(null)} className="btn-outline flex-1 py-3 font-bold">Cancel</button>
              <button onClick={handleReturnOrder} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}