// src/pages/WishlistPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import { wishlistAPI } from '../services/api'
import { useCart } from '../hooks/useCart'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.getAll()
      setItems(res.data)
    } catch {
      toast.error('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemove = async (id) => {
    try {
      await wishlistAPI.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-2xl">
          <Heart size={28} className="text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="page-title">My Wishlist</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 card">
          <Heart size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your wishlist is empty</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Browse the marketplace to find materials you need.</p>
          <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2">
            <Package size={18} /> Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.id} className="card overflow-hidden group flex flex-col h-full">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {item.material_image ? (
                  <img src={item.material_image} alt={item.material_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                    <Package size={40} className="text-gray-400" />
                  </div>
                )}
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <Link to={`/materials/${item.material}`} className="block font-bold text-lg mb-1 hover:text-brand-yellow transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                  {item.material_name}
                </Link>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Price</p>
                    <p className="font-extrabold text-lg text-emerald-600">₹{parseFloat(item.material_price).toFixed(2)}</p>
                  </div>
                  {item.material_stock > 0 ? (
                    <button
                      onClick={() => addToCart({ id: item.material, name: item.material_name, price: item.material_price })}
                      className="btn-primary flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      <ShoppingCart size={16} /> Add
                    </button>
                  ) : (
                    <span className="badge-red">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
