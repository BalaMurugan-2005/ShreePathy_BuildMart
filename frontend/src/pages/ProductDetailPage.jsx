// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Package, Star, Minus, Plus, Heart } from 'lucide-react'
import { materialsAPI, wishlistAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [addingToWishlist, setAddingToWishlist] = useState(false)

  const fetchMaterial = () => {
    materialsAPI.getOne(id)
      .then(res => setMaterial(res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMaterial()
  }, [id])

  const handleAdd = () => {
    addToCart(material, qty)
    toast.success(`${material.name} × ${qty} added to cart!`)
  }

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login to add to wishlist')
    setAddingToWishlist(true)
    try {
      const res = await wishlistAPI.add(material.id)
      if (res.data.message === 'Already in wishlist') {
        toast.info('Item is already in your wishlist')
      } else {
        toast.success('Added to wishlist❤️')
        fetchMaterial() // Refresh to update wishlist_count
      }
    } catch {
      toast.error('Failed to add to wishlist')
    } finally {
      setAddingToWishlist(false)
    }
  }

  const imageUrl = material?.image
    ? (material.image.startsWith('http') ? material.image : `http://localhost:8000${material.image}`)
    : null

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="skeleton rounded-2xl h-80" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-2/3 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-8 w-1/3 rounded" />
        </div>
      </div>
    </div>
  )

  if (!material) return <div className="text-center py-24"><p style={{ color: 'var(--text-secondary)' }}>Product not found.</p></div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in-up">
      <Link to="/marketplace" className="flex items-center gap-1.5 text-sm hover:text-brand-yellow mb-6 transition-colors w-fit" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={15} /> Back to Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="card overflow-hidden h-96 flex items-center justify-center relative group" style={{ background: 'var(--bg-card)' }}>
          {imageUrl ? (
            <img src={imageUrl} alt={material.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <Package size={80} className="text-gray-300 dark:text-gray-700" />
          )}
          
          {(!user || user.role === 'CUSTOMER') && (
            <button
              onClick={handleWishlist}
              disabled={addingToWishlist}
              className="absolute top-4 right-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 hover:scale-110 transition-all shadow-lg"
              title="Add to Wishlist"
            >
              <Heart size={22} className={addingToWishlist ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="badge-yellow mb-2 inline-block">{material.category_name}</span>
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{material.name}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Supplied by <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{material.supplier_name}</span></p>
          </div>

          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={16} fill={i <= 4 ? '#F5C518' : 'none'} stroke={i <= 4 ? '#F5C518' : '#737373'} />)}
            <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>(4.0) · 24 reviews</span>
            <span className="text-sm ml-4 flex items-center gap-1 text-red-500">
              <Heart size={14} className="fill-red-500" /> {material.wishlist_count || 0} wishlisted
            </span>
          </div>

          <div className="border-t border-b py-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{parseFloat(material.price).toFixed(2)}<span className="text-lg font-normal" style={{ color: 'var(--text-secondary)' }}>/unit</span></p>
            <p className={`text-sm mt-1 font-medium ${material.stock > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500'}`}>
              {material.stock > 0 ? `✓ In Stock (${material.stock} units)` : '✗ Out of Stock'}
            </p>
          </div>

          {material.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{material.description}</p>
          )}

          {(!user || user.role === 'CUSTOMER') ? (
            <div className="pt-4">
              {/* Quantity Selector */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Quantity:</label>
                  <div className="flex items-center gap-0 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 transition-colors" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}><Minus size={14} /></button>
                    <span className="px-5 py-2 font-bold" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(material.stock, q + 1))} className="px-3 py-2 transition-colors" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}><Plus size={14} /></button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="add-to-cart-btn"
                  onClick={handleAdd}
                  disabled={material.stock === 0}
                  className="btn-primary flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  disabled={addingToWishlist || !user}
                  className="btn-outline flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50"
                >
                  <Heart size={20} /> Add to Wishlist
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>Only customer accounts can place orders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
