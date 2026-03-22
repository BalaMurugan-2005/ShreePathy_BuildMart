// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { CartProvider } from './hooks/useCart'
import { ThemeProvider } from './hooks/useTheme'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MarketplacePage from './pages/MarketplacePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'
import SupplierDashboardPage from './pages/SupplierDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import DeliveryDashboardPage from './pages/DeliveryDashboardPage'
import ProfilePage from './pages/ProfilePage'
import WishlistPage from './pages/WishlistPage'
import NotificationsPage from './pages/NotificationsPage'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-center" toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
              duration: 3000,
            }} />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Layout-wrapped Routes */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
              <Route path="/materials/:id" element={<Layout><ProductDetailPage /></Layout>} />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />

              {/* Protected Routes */}
              <Route path="/checkout" element={
                <Layout>
                  <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/dashboard" element={
                <Layout>
                  <ProtectedRoute role="CUSTOMER"><CustomerDashboardPage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/wishlist" element={
                <Layout>
                  <ProtectedRoute role="CUSTOMER"><WishlistPage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/profile" element={
                <Layout>
                  <ProtectedRoute><ProfilePage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/notifications" element={
                <Layout>
                  <ProtectedRoute><NotificationsPage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/supplier" element={
                <Layout>
                  <ProtectedRoute role="SUPPLIER"><SupplierDashboardPage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/admin" element={
                <Layout>
                  <ProtectedRoute role="ADMIN"><AdminDashboardPage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/delivery" element={
                <Layout>
                  <ProtectedRoute role="DELIVERY"><DeliveryDashboardPage /></ProtectedRoute>
                </Layout>
              } />

              {/* 404 */}
              <Route path="*" element={
                <Layout>
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in-up">
                    <p className="text-8xl font-extrabold text-brand-yellow mb-4 filter drop-shadow-md">404</p>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h1>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </Layout>
              } />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
