// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Loader, CheckCircle, Tag, Info, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { ordersAPI, couponAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, total, clearCart } = useCart()
  const navigate = useNavigate()
  
  if (user && user.role !== 'CUSTOMER') {
    navigate('/')
    return null
  }

  const [address, setAddress] = useState(user?.address || '')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [success, setSuccess] = useState(false)

  // Calculations
  const subtotal = total
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount_percent) / 100 : 0
  const afterDiscount = subtotal - discountAmount
  const gstAmount = afterDiscount * 0.18 // 18% GST
  const finalTotal = afterDiscount + gstAmount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await couponAPI.validate(couponCode, subtotal)
      setAppliedCoupon({
        code: res.data.code,
        discount_percent: res.data.discount_percent,
        discount_amount: res.data.discount_amount
      })
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon')
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) { toast.error('Please enter a delivery address'); return }
    if (cart.length === 0) { toast.error('Your cart is empty'); return }
    
    setLoading(true)
    try {
      const items = cart.map(i => ({ material_id: i.id, quantity: i.quantity }))
      
      const payload = {
        items,
        delivery_address: address,
        payment_method: paymentMethod,
      }
      if (appliedCoupon) {
        payload.coupon_code = appliedCoupon.code
      }

      await ordersAPI.create(payload)
      clearCart()
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
        <div className="bg-emerald-500/10 p-8 rounded-full mb-6 relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <CheckCircle size={72} className="text-emerald-500 relative z-10" />
        </div>
        <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>Order Placed Successfully!</h2>
        <p className="mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
          Thank you for choosing BuildMart. You can track your order status in your dashboard.
        </p>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Redirecting to dashboard...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h2>
        <button onClick={() => navigate('/marketplace')} className="btn-primary mt-4">Go to Marketplace</button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <h1 className="page-title mb-8">Secure Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Delivery Details */}
          <div className="card p-6">
            <h2 className="section-title flex items-center gap-2 mb-5">
              <MapPin size={20} className="text-brand-yellow" /> Delivery Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Delivery Address</label>
                <textarea
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Enter complete building site address, landmarks, and pincode..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="card p-6">
            <h2 className="section-title flex items-center gap-2 mb-5">
              <CreditCard size={20} className="text-blue-500" /> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { id: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                { id: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)', icon: '📱', desc: 'Fast & secure digital payment' },
                { id: 'CARD', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
              ].map(method => (
                <label 
                  key={method.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.id 
                      ? 'border-brand-yellow bg-brand-yellow/5' 
                      : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                  style={{ borderColor: paymentMethod === method.id ? 'var(--brand-yellow)' : 'var(--border-color)' }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{method.label}</span>
                      <span className="text-xl">{method.icon}</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          
          {/* Coupon Section */}
          <div className="card p-6">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <Tag size={18} className="text-emerald-500" /> Have a Coupon?
            </h3>
            {appliedCoupon ? (
              <div className="bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle size={14} /> '{appliedCoupon.code}' Applied
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                    {appliedCoupon.discount_percent}% off your order
                  </p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs font-semibold text-red-500 hover:text-red-600 underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME10)"
                  className="input-field uppercase"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  disabled={validatingCoupon}
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-brand-black text-white px-4 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {validatingCoupon ? <Loader size={16} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Bill Outline */}
          <div className="card p-6 box-border">
            <h2 className="section-title mb-4">Order Summary</h2>
            
            <div className="max-h-48 overflow-y-auto scrollbar-hide mb-4 space-y-3 pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{subtotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount ({appliedCoupon.discount_percent}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  GST (18%)
                  <span className="group relative cursor-help">
                    <Info size={14} />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-brand-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                      Government taxes applied to construction materials.
                    </span>
                  </span>
                </span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">+₹{gstAmount.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Total to Pay</span>
                <span className="font-extrabold text-2xl text-emerald-600">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>

            <button 
              onClick={handleOrder}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-6 text-base"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} /> Place Secure Order
                </>
              )}
            </button>
            <p className="text-center text-xs mt-3 flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              🔒 100% Safe & Secure Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
