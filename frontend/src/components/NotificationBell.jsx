// src/components/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, X, Check, CheckCheck, Package, Truck, CheckCircle, AlertCircle, Tag } from 'lucide-react'
import { notificationsAPI } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'

const typeIcons = {
  ORDER_PLACED: Package,
  ORDER_ACCEPTED: CheckCircle,
  ORDER_SHIPPED: Truck,
  ORDER_DELIVERED: CheckCircle,
  ORDER_CANCELLED: AlertCircle,
  RETURN_REQUESTED: AlertCircle,
  PROMO: Tag,
  GENERAL: Bell,
}

const typeColors = {
  ORDER_PLACED: 'text-blue-500',
  ORDER_ACCEPTED: 'text-emerald-500',
  ORDER_SHIPPED: 'text-purple-500',
  ORDER_DELIVERED: 'text-emerald-600',
  ORDER_CANCELLED: 'text-red-500',
  RETURN_REQUESTED: 'text-orange-500',
  PROMO: 'text-brand-yellow',
  GENERAL: 'text-gray-500',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll()
      setNotifications(res.data.notifications)
      setUnread(res.data.unread_count)
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnread(u => Math.max(0, u - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        id="notification-bell"
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-all"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-300" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 md:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-brand-yellow" />
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                {unread > 0 && <span className="badge-red">{unread} new</span>}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead} className="btn-ghost text-xs flex items-center gap-1" title="Mark all read">
                    <CheckCheck size={14} /> All
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="btn-ghost p-1">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }} />
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const Icon = typeIcons[n.type] || Bell
                  const iconColor = typeColors[n.type] || 'text-gray-500'
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-4 transition-colors cursor-pointer border-b last:border-b-0 ${n.is_read ? 'opacity-70' : ''}`}
                      style={{ 
                        borderColor: 'var(--border-color)',
                        background: n.is_read ? 'transparent' : 'rgba(245,197,24,0.05)'
                      }}
                      onClick={() => !n.is_read && markRead(n.id)}
                    >
                      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                        <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(n.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button onClick={(e) => { e.stopPropagation(); markRead(n.id) }} className="shrink-0 p-1 rounded-full hover:bg-brand-yellow/20 transition-colors">
                          <Check size={12} className="text-brand-yellow" />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* View All Footer */}
            <div className="border-t p-3 text-center" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
              <Link to="/notifications" onClick={() => setOpen(false)} className="text-sm font-bold text-brand-yellow hover:text-brand-orange transition-colors">
                View All Notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
