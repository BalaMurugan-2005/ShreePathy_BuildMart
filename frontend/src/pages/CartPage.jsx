// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total, itemCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!user) { toast.error('Please sign in to checkout'); navigate('/login'); return }
    if (user.role !== 'CUSTOMER') { toast.error('Only customers can place orders'); return }
    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-extrabold text-brand-black mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some materials to get started.</p>
        <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2">
          Browse Marketplace <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="page-title mb-8">Your Cart <span className="text-brand-orange">({itemCount} items)</span></h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-2xl">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brand-black text-sm leading-tight">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.supplier_name}</p>
                <p className="text-brand-orange font-bold mt-1">₹{parseFloat(item.price).toFixed(2)}/unit</p>
              </div>
              <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-sm"><Minus size={12} /></button>
                <span className="px-3 py-1.5 font-bold text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-sm"><Plus size={12} /></button>
              </div>
              <p className="font-bold text-brand-black w-20 text-right text-sm">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
              <button onClick={() => { removeFromCart(item.id); toast.success('Item removed') }} className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-24 space-y-4">
          <h2 className="section-title">Order Summary</h2>
          <hr />
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate mr-2">{item.name} × {item.quantity}</span>
              <span className="font-semibold shrink-0">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between font-extrabold text-base">
            <span>Total</span>
            <span className="text-brand-orange">₹{total.toFixed(2)}</span>
          </div>
          <button id="checkout-btn" onClick={handleCheckout} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
            <ShoppingBag size={18} /> Proceed to Checkout
          </button>
          <Link to="/marketplace" className="block text-center text-sm text-gray-500 hover:text-brand-black transition-colors mt-2">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
