// src/components/OrderDetailModal.jsx
import { X, MapPin, CreditCard, Tag, Package, Calendar, Hash, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { generateInvoicePDF } from '../utils/invoice'

const statusColors = {
  PENDING: '#F5C518', ACCEPTED: '#3B82F6', PACKED: '#8B5CF6',
  SHIPPED: '#F97316', DELIVERED: '#10B981', CANCELLED: '#EF4444',
  RETURN_REQUESTED: '#F97316', RETURNED: '#EF4444',
}

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null

  const subtotal = parseFloat(order.total_price || 0)
  const gst = parseFloat(order.gst_amount || 0)
  const discount = parseFloat(order.discount_amount || 0)
  const final = parseFloat(order.final_price || order.total_price || 0)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Order #{order.id}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: statusColors[order.status] || '#F5C518' }}>
                {order.status}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateInvoicePDF(order)}
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
            >
              <Download size={14} /> Invoice
            </button>
            <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Package size={16} className="text-brand-yellow" /> Items Ordered
            </h3>
            <div className="space-y-2">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.material_name || 'Product'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>₹{parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
                  </div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>💰 Price Breakdown</h3>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ color: 'var(--text-primary)' }}>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 flex items-center gap-1"><Tag size={12} /> Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                <span className="text-emerald-600">-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-orange-500">GST (18%)</span>
              <span className="text-orange-500">+₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <span style={{ color: 'var(--text-primary)' }}>Total Paid</span>
              <span className="text-emerald-600">₹{final.toFixed(2)}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs font-semibold uppercase mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <MapPin size={12} /> Delivery Address
              </p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.delivery_address}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs font-semibold uppercase mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <CreditCard size={12} /> Payment Info
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{order.payment_method || 'COD'}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.payment_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          {/* Delivery Info */}
          {order.delivery && (
            <div className="p-4 rounded-xl border-l-4 border-brand-yellow" style={{ background: 'var(--bg-primary)' }}>
              <p className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>🚚 Delivery Status: {order.delivery.status}</p>
              {order.delivery.tracking_number && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tracking: {order.delivery.tracking_number}</p>
              )}
              {order.delivery.driver_name && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Driver: {order.delivery.driver_name}</p>
              )}
            </div>
          )}

          {/* Cancel reason */}
          {order.cancel_reason && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-600 mb-1">Cancellation Reason</p>
              <p className="text-sm text-red-700 dark:text-red-400">{order.cancel_reason}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
