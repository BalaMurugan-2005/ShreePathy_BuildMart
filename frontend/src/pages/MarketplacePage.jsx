// src/pages/MarketplacePage.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Filter, X, SlidersHorizontal, Grid3x3, List,
  ChevronDown, Sparkles, TrendingUp, Star, Truck,
  Shield, Clock, Package, Heart, ArrowUpDown,
  LayoutGrid, LayoutList, Eye, ChevronLeft, ChevronRight
} from 'lucide-react'
import { materialsAPI } from '../services/api'
import MaterialCard from '../components/MaterialCard'

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'cement', name: 'Cement' },
  { id: 'sand', name: 'Sand' },
  { id: 'bricks', name: 'Bricks' },
  { id: 'steel', name: 'Steel' },
  { id: 'aggregates', name: 'Aggregates' },
  { id: 'tools', name: 'Tools' }
]

const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended Sorting' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
]

export default function MarketplacePage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true)
      try {
        const res = await materialsAPI.getAll()
        setMaterials(res.data)
      } catch (error) {
        console.error('Failed to fetch materials:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMaterials()
  }, [])

  const filteredMaterials = useMemo(() => {
    return materials
      .filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                             (m.description?.toLowerCase() || '').includes(search.toLowerCase())
        const matchesCategory = activeCategory === 'all' || 
                               (m.category_name && m.category_name.toLowerCase() === activeCategory.toLowerCase())
        const matchesPrice = (!priceRange.min || m.price >= parseFloat(priceRange.min)) &&
                            (!priceRange.max || m.price <= parseFloat(priceRange.max))
        return matchesSearch && matchesCategory && matchesPrice
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc': return parseFloat(a.price) - parseFloat(b.price)
          case 'price_desc': return parseFloat(b.price) - parseFloat(a.price)
          case 'name_asc': return a.name.localeCompare(b.name)
          case 'name_desc': return b.name.localeCompare(a.name)
          default: return 0
        }
      })
  }, [materials, search, activeCategory, sortBy, priceRange])

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stats = {
    total: materials.length,
    categories: new Set(materials.map(m => m.category_name).filter(Boolean)).size,
    inStock: materials.filter(m => m.stock > 0).length,
    newArrivals: materials.filter(m => {
      const date = new Date(m.created_at || Date.now())
      return ((Date.now() - date) / (1000 * 3600 * 24)) < 7
    }).length
  }

  const clearFilters = () => {
    setSearch('')
    setActiveCategory('all')
    setPriceRange({ min: '', max: '' })
    setSortBy('default')
    setCurrentPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-yellow rounded-xl shadow-lg">
              <Package className="w-6 h-6 text-brand-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Materials Marketplace</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>{filteredMaterials.length} products available</span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-500">
                  <Truck className="w-3 h-3" /> Delivery Ready
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Categories', value: stats.categories, icon: Grid3x3, color: 'text-purple-500 bg-purple-500/10' },
          { label: 'In Stock items', value: stats.inStock, icon: Shield, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'New Arrivals', value: stats.newArrivals, icon: Sparkles, color: 'text-orange-500 bg-orange-500/10' }
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="card p-5 flex items-center gap-4 hover:scale-105 transition-transform">
              <div className={`${stat.color} p-3 rounded-xl`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search and Filter Bar */}
      <div className="card p-5 mb-8 border-2 border-transparent focus-within:border-brand-yellow transition-all">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search materials, tools, equipment..."
              className="input-field pl-12 py-3 w-full font-semibold"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <select className="input-field py-3 min-w-[180px] font-semibold cursor-pointer" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline flex items-center gap-2 py-3 ${showFilters || priceRange.min || priceRange.max ? 'border-brand-yellow text-brand-yellow' : ''}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Advanced</span>
              {(priceRange.min || priceRange.max) && (
                <span className="w-5 h-5 bg-brand-yellow text-brand-black text-xs font-bold rounded-full flex items-center justify-center">1</span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t animate-fade-in-up" style={{ borderColor: 'var(--border-color)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Price Range (₹)</label>
                <div className="flex gap-3">
                  <input type="number" placeholder="Min ₹" className="input-field py-2" value={priceRange.min} onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))} />
                  <input type="number" placeholder="Max ₹" className="input-field py-2" value={priceRange.max} onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={clearFilters} className="btn-ghost py-2">Clear All</button>
              <button onClick={() => setShowFilters(false)} className="btn-primary py-2 px-6">Apply Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shadow-sm border-2 ${
              activeCategory === cat.id
                ? 'bg-brand-yellow border-brand-yellow text-brand-black scale-105'
                : 'border-transparent text-gray-500 hover:text-brand-yellow'
            }`}
            style={{ background: activeCategory === cat.id ? undefined : 'var(--bg-card)', color: activeCategory !== cat.id ? 'var(--text-secondary)' : undefined, borderColor: activeCategory !== cat.id ? 'var(--border-color)' : undefined }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-48 w-full" />
              <div className="p-6 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-8 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedMaterials.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in-up">
          <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No materials found</h3>
          <p className="max-w-md mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>We couldn't find any materials matching your criteria. Try adjusting your filters.</p>
          <button onClick={clearFilters} className="btn-primary inline-flex gap-2"><X size={18} /> Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 mt-6">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMaterials.length)} of {filteredMaterials.length} results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedMaterials.map(material => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between card p-4 mt-8">
              <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="btn-outline flex items-center gap-1 py-2 px-4 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="btn-outline flex items-center gap-1 py-2 px-4 disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}