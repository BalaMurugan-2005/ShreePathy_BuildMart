// src/pages/DeliveryDashboardPage.jsx
import { useState, useEffect } from 'react'
import { Truck, MapPin, Phone, CheckCircle, Package, Navigation, Clock, Loader } from 'lucide-react'
import { deliveryAPI } from '../services/api'
import toast from 'react-hot-toast'

const STATUS_FLOW = ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED']

export default function DeliveryDashboardPage() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const res = await deliveryAPI.getDeliveries()
      setDeliveries(res.data)
    } catch (err) {
      toast.error('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await deliveryAPI.updateStatus(id, status)
      setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status } : d))
      if (selectedDelivery?.id === id) {
        setSelectedDelivery({ ...selectedDelivery, status })
      }
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      ASSIGNED: 'badge-blue',
      PICKED_UP: 'badge-yellow',
      ON_THE_WAY: 'badge-orange',
      DELIVERED: 'badge-green'
    }
    return map[status] || 'badge-gray'
  }

  const stats = {
    assigned: deliveries.filter(d => d.status === 'ASSIGNED').length,
    inProgress: deliveries.filter(d => ['PICKED_UP', 'ON_THE_WAY'].includes(d.status)).length,
    completed: deliveries.filter(d => d.status === 'DELIVERED').length
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="page-title">Delivery Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your assigned shipments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Newly Assigned', value: stats.assigned, icon: Clock, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'In Progress', value: stats.inProgress, icon: Truck, color: 'text-orange-500 bg-orange-500/10' },
          { label: 'Deliveries Done', value: stats.completed, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`${s.color} p-3 rounded-xl`}><s.icon size={22} /></div>
            <div>
              <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="section-title flex items-center gap-2 mb-2"><Package size={18} /> Assigned Deliveries</h2>
          {loading ? (
            <div className="flex justify-center p-12"><Loader className="animate-spin text-brand-yellow" size={32} /></div>
          ) : deliveries.length === 0 ? (
            <div className="card p-12 text-center" style={{ color: 'var(--text-secondary)' }}>No deliveries assigned to you yet.</div>
          ) : (
            deliveries.map(d => (
              <div 
                key={d.id} 
                className={`card p-5 cursor-pointer transition-all border-2 ${selectedDelivery?.id === d.id ? 'border-brand-yellow shadow-lg' : 'border-transparent hover:border-brand-yellow/50'}`}
                onClick={() => setSelectedDelivery(d)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Shipment #{d.id}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Order ID: #{d.order}</p>
                  </div>
                  <span className={getStatusBadge(d.status)}>{d.status.replace('_', ' ')}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-blue-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Pickup Location</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{d.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Delivery Location</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{d.delivery_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details & Actions */}
        <div className="lg:col-span-1">
          <h2 className="section-title mb-4">Shipment Details</h2>
          {selectedDelivery ? (
            <div className="card p-6 sticky top-24 space-y-6 animate-fade-in-up">
              <div>
                <p className="text-xs font-bold uppercase mb-4" style={{ color: 'var(--text-secondary)' }}>Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedDelivery.delivery_address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary flex items-center justify-center gap-2 py-2 text-xs"
                  >
                    <Navigation size={14} /> Navigate
                  </a>
                  <button className="btn-outline flex items-center justify-center gap-2 py-2 text-xs">
                    <Phone size={14} /> Call Customer
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>Update Status</p>
                <div className="space-y-2">
                  {STATUS_FLOW.map((s, idx) => {
                    const currentIdx = STATUS_FLOW.indexOf(selectedDelivery.status)
                    const isDone = idx <= currentIdx
                    const isNext = idx === currentIdx + 1
                    
                    return (
                      <button
                        key={s}
                        disabled={!isNext || selectedDelivery.status === 'DELIVERED'}
                        onClick={() => handleStatusUpdate(selectedDelivery.id, s)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                          isDone 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                            : isNext 
                              ? 'border-brand-yellow hover:bg-brand-yellow hover:text-brand-black text-brand-black dark:text-white dark:hover:text-black' 
                              : 'opacity-40 cursor-not-allowed border-gray-100 dark:border-gray-800'
                        }`}
                        style={{ color: !isDone && !isNext ? 'var(--text-secondary)' : undefined }}
                      >
                        {s.replace('_', ' ')}
                        {isDone && <CheckCircle size={16} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-xs italic text-center" style={{ color: 'var(--text-secondary)' }}>Update status as you progress through the delivery steps.</p>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center" style={{ color: 'var(--text-secondary)' }}>Select a shipment to view details and update status.</div>
          )}
        </div>
      </div>
    </div>
  )
}
