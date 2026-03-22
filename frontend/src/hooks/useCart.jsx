// src/hooks/useCart.js
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (material, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === material.id)
      if (existing) {
        return prev.map((i) => i.id === material.id ? { ...i, quantity: i.quantity + qty } : i)
      }
      return [...prev, { ...material, quantity: qty }]
    })
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const updateQuantity = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i))
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
