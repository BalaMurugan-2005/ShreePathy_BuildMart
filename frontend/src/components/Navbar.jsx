// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, HardHat, User, LogOut, LayoutDashboard, Moon, Sun, Heart } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useTheme } from '../hooks/useTheme'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const dropRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardPath = () => {
    if (!user) return '/login'
    if (user.role === 'ADMIN') return '/admin'
    if (user.role === 'SUPPLIER') return '/supplier'
    if (user.role === 'DELIVERY') return '/delivery'
    return '/dashboard'
  }

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ background: 'var(--nav-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-yellow p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <HardHat size={20} className="text-brand-black" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Build<span className="text-brand-yellow">Mart</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-brand-yellow transition-colors text-sm font-medium">Home</Link>
            <Link to="/marketplace" className="text-gray-300 hover:text-brand-yellow transition-colors text-sm font-medium">Marketplace</Link>
            {user?.role === 'CUSTOMER' && (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-brand-yellow transition-colors text-sm font-medium">My Orders</Link>
                <Link to="/wishlist" className="text-gray-300 hover:text-brand-yellow transition-colors text-sm font-medium">Wishlist</Link>
              </>
            )}
            {user?.role === 'SUPPLIER' && (
              <Link to="/supplier" className="text-gray-300 hover:text-brand-yellow transition-colors text-sm font-medium">My Shop</Link>
            )}
            {user?.role === 'DELIVERY' && (
              <Link to="/delivery" className="text-gray-300 hover:text-brand-yellow transition-colors text-sm font-medium">Delivery Tasks</Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-gray-300 hover:text-brand-yellow transition-colors text-sm font-medium">Admin Panel</Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-white/10 transition-all"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} className="text-gray-300" />}
            </button>

            {/* Cart - Only for Customers or Guests */}
            {(!user || user.role === 'CUSTOMER') && (
              <Link to="/cart" className="relative p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Cart">
                <ShoppingCart size={20} className="text-gray-300" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell (for logged-in users) */}
            {user && <NotificationBell />}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={dropRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setDropdown(!dropdown)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors text-sm text-white"
                >
                  <span className="text-base">{user.avatar || '🧑'}</span>
                  <span className="hidden sm:block font-medium">{user.username}</span>
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl py-2 z-50 animate-fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Signed in as</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                      <span className="badge-yellow text-xs mt-1 inline-block">{user.role}</span>
                    </div>
                    <Link
                      to={dashboardPath()}
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-brand-yellow/10"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-brand-yellow/10"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <User size={15} /> My Profile
                    </Link>
                    {user.role === 'CUSTOMER' && (
                      <Link
                        to="/wishlist"
                        onClick={() => setDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-brand-yellow/10"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <Heart size={15} /> Wishlist
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2">Sign In</Link>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white" onClick={() => setOpen(!open)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-1 animate-fade-in-up">
            <Link to="/" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow transition-colors">Home</Link>
            <Link to="/marketplace" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow transition-colors">Marketplace</Link>
            {(!user || user.role === 'CUSTOMER') && (
              <Link to="/cart" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow transition-colors">Cart ({itemCount})</Link>
            )}
            {user?.role === 'CUSTOMER' && (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow">My Orders</Link>
                <Link to="/wishlist" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow">Wishlist</Link>
              </>
            )}
            {user?.role === 'SUPPLIER' && (
              <Link to="/supplier" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow">My Shop</Link>
            )}
            {user?.role === 'DELIVERY' && (
              <Link to="/delivery" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow">Delivery Tasks</Link>
            )}
            {user && <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-brand-yellow">Profile</Link>}
          </div>
        )}
      </div>
    </nav>
  )
}
