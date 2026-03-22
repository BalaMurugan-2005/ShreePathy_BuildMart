// src/components/MaterialCard.jsx
import { ShoppingCart, Star, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import toast from 'react-hot-toast'

export default function MaterialCard({ material }) {
  const { user } = useAuth()
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(material, 1)
    toast.success(`${material.name} added to cart!`)
  }

  const imageUrl = material.image
    ? (material.image.startsWith('http') ? material.image : `http://127.0.0.1:8000${material.image}`)
    : null

  return (
    <Link to={`/materials/${material.id}`} className="card group flex flex-col overflow-hidden animate-fade-in-up">
      {/* Image */}
      <div className="relative h-44 overflow-hidden flex items-center justify-center group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors" style={{ background: 'var(--bg-primary)' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={material.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-300" />
          </div>
        )}
        {material.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="badge-yellow">{material.category_name || 'Material'}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-base leading-tight group-hover:text-brand-orange transition-colors line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {material.name}
        </h3>
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>by {material.supplier_name}</p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={12} fill={i <= 4 ? '#F5C518' : 'none'} stroke={i <= 4 ? '#F5C518' : '#ccc'} />
          ))}
          <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>(4.0)</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{parseFloat(material.price).toFixed(2)}</span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>/{material.unit || 'unit'}</span>
          </div>
          {(!user || user.role === 'CUSTOMER') && (
            <button
              onClick={handleAddToCart}
              disabled={material.stock === 0}
              className="flex items-center gap-1.5 bg-brand-yellow hover:bg-brand-orange text-brand-black font-bold text-xs px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={14} />
              Add
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400">Stock: {material.stock} units</p>
      </div>
    </Link>
  )
}
