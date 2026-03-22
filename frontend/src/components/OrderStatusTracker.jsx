// src/components/OrderStatusTracker.jsx
import { Package, CheckCircle, Truck, Box, Clock, XCircle, RotateCcw } from 'lucide-react'

const STEPS = [
  { key: 'PENDING', label: 'Ordered', icon: Clock, desc: 'Order confirmed' },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle, desc: 'Seller accepted' },
  { key: 'PACKED', label: 'Packed', icon: Box, desc: 'Ready for pickup' },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck, desc: 'On the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: Package, desc: 'Delivered!' },
]

const STATUS_INDEX = {
  PENDING: 0, ACCEPTED: 1, PACKED: 2, SHIPPED: 3, DELIVERED: 4,
}

export default function OrderStatusTracker({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
        <XCircle size={28} className="text-red-500 shrink-0" />
        <div>
          <p className="font-bold text-red-600">Order Cancelled</p>
          <p className="text-sm text-red-400">This order has been cancelled</p>
        </div>
      </div>
    )
  }
  if (status === 'RETURN_REQUESTED' || status === 'RETURNED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
        <RotateCcw size={28} className="text-orange-500 shrink-0" />
        <div>
          <p className="font-bold text-orange-600">{status === 'RETURNED' ? 'Order Returned' : 'Return Requested'}</p>
          <p className="text-sm text-orange-400">Your return request is being processed</p>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_INDEX[status] ?? 0

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="hidden sm:block absolute top-6 left-0 right-0 h-0.5 mx-10" style={{ background: 'var(--border-color)', zIndex: 0 }}>
        <div
          className="h-full bg-brand-yellow transition-all duration-700"
          style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 relative z-10">
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          const done = idx <= currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.key} className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:flex-1">
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                done
                  ? active
                    ? 'bg-brand-yellow shadow-lg scale-110 animate-pulse-ring'
                    : 'bg-brand-yellow'
                  : ''
              }`} style={{ background: done ? undefined : 'var(--border-color)' }}>
                <Icon size={20} className={done ? 'text-brand-black' : ''} style={{ color: done ? undefined : 'var(--text-secondary)' }} />
              </div>
              <div className="sm:text-center">
                <p className={`text-sm font-bold ${done ? '' : ''}`}
                   style={{ color: done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {step.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
