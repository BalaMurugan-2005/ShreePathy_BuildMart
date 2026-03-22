// src/pages/NotificationsPage.jsx
import { useState, useEffect } from 'react'
import { 
  Bell, Check, CheckCheck, Package, Truck, CheckCircle, 
  AlertCircle, Tag, RotateCcw, ShieldCheck, Mail
} from 'lucide-react'
import { notificationsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

const typeIcons = {
  ORDER_PLACED: Package,
  ORDER_ACCEPTED: CheckCircle,
  ORDER_SHIPPED: Truck,
  ORDER_DELIVERED: CheckCircle,
  ORDER_CANCELLED: AlertCircle,
  RETURN_REQUESTED: RotateCcw,
  PROMO: Tag,
  GENERAL: Bell,
}

const typeColors = {
  ORDER_PLACED: 'text-blue-500 bg-blue-500/10',
  ORDER_ACCEPTED: 'text-emerald-500 bg-emerald-500/10',
  ORDER_SHIPPED: 'text-purple-500 bg-purple-500/10',
  ORDER_DELIVERED: 'text-emerald-600 bg-emerald-600/10 border-emerald-500/20',
  ORDER_CANCELLED: 'text-red-500 bg-red-500/10',
  RETURN_REQUESTED: 'text-orange-500 bg-orange-500/10',
  PROMO: 'text-brand-orange bg-brand-yellow/10',
  GENERAL: 'text-gray-500 bg-gray-500/10',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationsAPI.getAll()
      setNotifications(res.data.notifications || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-brand-yellow rounded-xl shadow-lg shrink-0">
            <Bell className="w-6 h-6 text-brand-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>Notifications Center</h1>
            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>
              You have <span className="text-brand-orange font-bold">{unreadCount}</span> unread messages
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllRead} 
            className="btn-outline flex items-center gap-2 font-bold px-5 py-2 whitespace-nowrap"
            style={{ background: 'var(--bg-card)' }}
          >
            <CheckCheck size={18} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
          <Mail size={18} className="text-brand-yellow" />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center animate-fade-in-up">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-brand-yellow/50" />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>You're all caught up!</h3>
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {notifications.map(n => {
              const Icon = typeIcons[n.type] || Bell
              const iconStyles = typeColors[n.type] || typeColors.GENERAL

              return (
                <div 
                  key={n.id} 
                  className={`p-6 flex flex-col sm:flex-row sm:items-start gap-4 transition-all duration-300 ${!n.is_read ? '' : 'opacity-60 grayscale-[30%]'}`}
                  style={{ background: !n.is_read ? 'rgba(245, 197, 24, 0.03)' : 'transparent' }}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  <div className={`p-3 rounded-2xl shrink-0 self-start ${iconStyles}`}>
                    <Icon size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{n.title}</h3>
                      <span className="text-xs font-bold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(n.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {n.message}
                    </p>
                  </div>

                  {!n.is_read && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markRead(n.id) }} 
                      className="shrink-0 p-2 rounded-full self-start hover:bg-brand-yellow/20 transition-all focus:ring-2 focus:ring-brand-yellow"
                      title="Mark as Read"
                    >
                      <Check size={20} className="text-brand-yellow" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
