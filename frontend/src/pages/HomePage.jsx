// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import React from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Truck, 
  Shield, 
  Star, 
  Zap, 
  HardHat, 
  Building2, 
  Layers,
  Hammer,
  Ruler,
  Drill,
  Cpu,
  Factory,
  Gauge,
  Wrench,
  Hexagon,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  ChevronRight,
  Phone,
  Mail,
  Map,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Play,
  Pause
} from 'lucide-react'

// Material Cards Data
const MATERIALS = [
  { 
    id: 1, 
    name: 'Cement', 
    icon: '🏭', 
    image: 'https://images.unsplash.com/photo-1542401886-7cc17b6f798a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desc: 'Premium OPC & PPC cement for all construction needs',
    color: 'from-gray-600 to-gray-800',
    bg: 'bg-gray-900'
  },
  { 
    id: 2, 
    name: 'Steel', 
    icon: '⚙️', 
    image: 'https://images.unsplash.com/photo-1587293852726-70cd3fda9a33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desc: 'High-strength TMT bars and structural steel',
    color: 'from-slate-600 to-slate-900',
    bg: 'bg-slate-900'
  },
  { 
    id: 3, 
    name: 'Sand', 
    icon: '⛱️', 
    image: 'https://images.unsplash.com/photo-1589935447067-9e4a28ff9dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desc: 'River sand and M-sand for perfect concrete mix',
    color: 'from-amber-600 to-amber-800',
    bg: 'bg-amber-900'
  },
  { 
    id: 4, 
    name: 'Bricks', 
    icon: '🧱', 
    image: 'https://images.unsplash.com/photo-1527685609591-44b0aef2400b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desc: 'Clay bricks, fly ash bricks, and blocks',
    color: 'from-red-600 to-red-800',
    bg: 'bg-red-900'
  },
  { 
    id: 5, 
    name: 'Aggregates', 
    icon: '🪨', 
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348224?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desc: 'Crushed stone and gravel for foundations',
    color: 'from-stone-600 to-stone-800',
    bg: 'bg-stone-900'
  },
  { 
    id: 6, 
    name: 'Tools', 
    icon: '🔧', 
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    desc: 'Professional construction equipment',
    color: 'from-blue-600 to-blue-800',
    bg: 'bg-blue-900'
  },
]

// How It Works Data
const STEPS = [
  { 
    number: '01', 
    title: 'Choose Materials', 
    icon: Package,
    desc: 'Browse our catalog of premium construction materials',
    color: 'from-amber-400 to-amber-600'
  },
  { 
    number: '02', 
    title: 'Select Supplier', 
    icon: Building2,
    desc: 'Compare verified suppliers and best prices',
    color: 'from-blue-400 to-blue-600'
  },
  { 
    number: '03', 
    title: 'Fast Delivery', 
    icon: Truck,
    desc: 'Track your order in real-time to site',
    color: 'from-green-400 to-green-600'
  },
]

// Feature Cards Data
const FEATURE_CARDS = [
  { 
    icon: Gauge, 
    title: 'Real-time Price Comparison', 
    desc: 'Compare prices from multiple suppliers instantly',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    icon: MapPin, 
    title: 'Nearby Supplier Discovery', 
    desc: 'Find the closest suppliers to your site location',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    image: 'https://images.unsplash.com/photo-1577086664693-894d8405334a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    icon: Truck, 
    title: 'Instant Truck Delivery', 
    desc: 'Book trucks and schedule deliveries instantly',
    color: 'text-green-500',
    bg: 'bg-green-50',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    icon: Zap, 
    title: 'Live Delivery Tracking', 
    desc: 'Track your materials from warehouse to site',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    image: 'https://images.unsplash.com/photo-1566576912324-d4f8e9199b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    icon: Shield, 
    title: 'Secure Payments', 
    desc: 'Multiple payment options with buyer protection',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
]

// Testimonials Data
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Contractor',
    company: 'RK Constructions',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    quote: 'BuildMart has transformed how we source materials. Real-time prices and reliable delivery have saved us both time and money.',
    rating: 5
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Architect',
    company: 'Design Studio',
    image: 'https://images.unsplash.com/photo-1494790108777-78f9e4e1c899?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    quote: 'The quality of materials and supplier verification gives me complete confidence. Highly recommended for all construction needs.',
    rating: 5
  },
  {
    id: 3,
    name: 'Suresh Patel',
    role: 'Site Engineer',
    company: 'Patel Infrastructure',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    quote: 'Live tracking feature is a game-changer. We always know exactly when our materials will arrive.',
    rating: 5
  },
]

// Hero Section
const HeroSection = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        style={{ y, scale: 1.2 }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Construction Site"
          className="w-full h-full object-cover"
        />
        
        {/* Animated Overlay Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0Z' fill='%23FACC15' fill-opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 h-full flex items-center"
      >
        <div className="max-w-7xl mx-auto px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-16 bg-amber-500" />
              <span className="text-amber-400 font-mono text-sm uppercase tracking-[0.2em]">
                CONSTRUCTION MARKETPLACE
              </span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-8xl font-black leading-[1.1] mb-6"
          >
            Order Construction
            <br />
            <span className="text-amber-500 relative inline-block">
              Materials in Minutes
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute -bottom-2 left-0 right-0 h-2 bg-amber-500 origin-left"
              />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-gray-300 mb-10 max-w-xl"
          >
            Cement, Steel, Sand and Bricks delivered directly to your site. 
            Premium quality from verified suppliers.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              to="/marketplace" 
              className="group bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 hover:shadow-2xl"
            >
              <Hexagon size={20} className="fill-current" />
              Browse Materials
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/register" 
              className="border-2 border-white/30 hover:border-amber-500 text-white font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-all backdrop-blur-sm hover:bg-white/10"
            >
              <Factory size={18} />
              Become Supplier
            </Link>
          </motion.div>

          {/* Floating Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-20 left-6 right-6 max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: HardHat, value: '1000+', label: 'Suppliers' },
                { icon: Package, value: '5000+', label: 'Deliveries' },
                { icon: MapPin, value: '200+', label: 'Cities' },
                { icon: Star, value: '4.9', label: 'Rating' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                  className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/20"
                >
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <item.icon size={16} />
                    <span className="text-2xl font-black">{item.value}</span>
                  </div>
                  <p className="text-xs text-gray-300 uppercase tracking-wider">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div 
            animate={{ height: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 bg-amber-500 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Material Cards Section
const MaterialCards = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-mono text-sm tracking-[0.2em]">MATERIALS</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3">Premium Construction Materials</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Sourced directly from manufacturers, tested for quality, delivered to your site
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MATERIALS.map((material, index) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              <div className="relative h-80">
                <img 
                  src={material.image} 
                  alt={material.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${material.color} opacity-80`} />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center gap-3 mb-3"
                  >
                    <span className="text-3xl">{material.icon}</span>
                    <h3 className="text-2xl font-bold">{material.name}</h3>
                  </motion.div>
                  <p className="text-white/80 text-sm mb-4">{material.desc}</p>
                  <motion.button 
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-2 text-amber-400 font-semibold text-sm"
                  >
                    View Products <ChevronRight size={16} />
                  </motion.button>
                </div>

                {/* Price Tag */}
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="absolute top-4 right-4 bg-amber-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold"
                >
                  Starting ₹{Math.floor(Math.random() * 300 + 200)}/unit
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
const HowItWorks = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-mono text-sm tracking-[0.2em]">PROCESS</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3">How It Works</h2>
          <p className="text-gray-600 mt-4">Three simple steps to get your materials delivered</p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500 hidden lg:block origin-left"
            style={{ transform: 'translateY(-50%)' }}
          />

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-2xl p-8 shadow-xl relative z-10"
                  >
                    {/* Number Badge */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ delay: index * 0.2 + 0.3 }}
                      className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-black text-lg shadow-lg`}
                    >
                      {step.number}
                    </motion.div>

                    <div className="mb-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.desc}</p>
                    </div>

                    {/* Arrow for next step */}
                    {index < STEPS.length - 1 && (
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={isInView ? { x: 0, opacity: 1 } : {}}
                        transition={{ delay: index * 0.2 + 0.5 }}
                        className="hidden lg:block absolute -right-6 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-20"
                      >
                        <div className="bg-white p-2 rounded-full shadow-lg">
                          <ArrowRight size={24} className="text-amber-500" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// Supplier Stats Section with Parallax
const SupplierStats = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const [counts, setCounts] = useState({ suppliers: 0, deliveries: 0, cities: 0 })

  useEffect(() => {
    if (isInView) {
      const duration = 2000 // 2 seconds
      const steps = 60
      const interval = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        setCounts({
          suppliers: Math.min(1000, Math.floor(1000 * (step / steps))),
          deliveries: Math.min(5000, Math.floor(5000 * (step / steps))),
          cities: Math.min(200, Math.floor(200 * (step / steps)))
        })

        if (step >= steps) clearInterval(timer)
      }, interval)

      return () => clearInterval(timer)
    }
  }, [isInView])

  return (
    <section ref={ref} className="relative h-[500px] overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-gray-900/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1601584115196-8f6c9a9f6a9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Truck Delivery"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Thousands of Trusted Suppliers</h2>
            <p className="text-xl text-gray-300">Connected with builders across the country</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Active Suppliers', value: counts.suppliers, target: 1000, suffix: '+' },
              { label: 'Successful Deliveries', value: counts.deliveries, target: 5000, suffix: '+' },
              { label: 'Cities Covered', value: counts.cities, target: 200, suffix: '+' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-black text-amber-500 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-gray-300 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Feature Scroll Section
const FeatureScrollSection = () => {
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Scale: 0.8 -> 1.0 (zoom in), stays 1.0, then 1.0 -> 0.8 (zoom out)
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8])
  
  // Opacity: Fade in/out
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])

  // Active Index based on scroll progress (between 0.1 and 0.9)
  const activeIndex = useTransform(scrollYProgress, 
    [0.1, 0.26, 0.42, 0.58, 0.74, 0.9], 
    [0, 1, 2, 3, 4, 4]
  )

  const [currentIndex, setCurrentIndex] = useState(0)

  // Sync state with motion value for UI highlights
  useTransform(activeIndex, (v) => {
    const nextIdx = Math.round(v)
    if (nextIdx !== currentIndex) setCurrentIndex(nextIdx)
    return nextIdx
  })

  return (
    <section ref={containerRef} className="relative h-[500vh] bg-gray-900 overflow-visible">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ scale, opacity }}
          className="relative w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Text Content */}
          <div className="z-10">
            <motion.div className="mb-8">
              <span className="text-amber-500 font-mono text-sm tracking-[0.2em] block mb-2">FEATURES</span>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Everything You Need</h2>
              <p className="text-gray-400 mt-4 text-lg">Powerful features to streamline your construction material sourcing</p>
            </motion.div>

            <div className="space-y-4">
              {FEATURE_CARDS.map((feature, index) => {
                const Icon = feature.icon
                const isActive = index === currentIndex

                return (
                  <motion.div
                    key={feature.title}
                    animate={{
                      backgroundColor: isActive ? "rgb(245 158 11)" : "rgba(255, 255, 255, 0.05)",
                      x: isActive ? 20 : 0,
                      scale: isActive ? 1.05 : 1
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`p-6 rounded-2xl cursor-default transition-colors ${
                      isActive ? 'text-gray-900 shadow-2xl' : 'text-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        isActive ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        <Icon size={24} className={isActive ? 'text-white' : feature.color} />
                      </div>
                      <div>
                        <h3 className={`font-black text-xl mb-1`}>
                          {feature.title}
                        </h3>
                        <p className={isActive ? 'text-gray-900/80' : 'text-gray-400'}>
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right: Immersive Visuals */}
          <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.2, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="absolute inset-0"
              >
                <img
                  src={FEATURE_CARDS[currentIndex].image}
                  alt={FEATURE_CARDS[currentIndex].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
              </motion.div>
            </AnimatePresence>
            
            {/* Corner Decorative Element */}
            <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-amber-500 rounded-tr-3xl opacity-50" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-amber-500 rounded-bl-3xl opacity-50" />

            {/* Active Feature Label Overlay */}
            <motion.div 
              key={`label-${currentIndex}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-12 left-12 right-12 z-20"
            >
              <div className="backdrop-blur-xl bg-white/10 p-6 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    {React.createElement(FEATURE_CARDS[currentIndex].icon, { 
                      size: 20, 
                      className: "text-gray-900" 
                    })}
                  </div>
                  <h4 className="font-black text-white text-xl">{FEATURE_CARDS[currentIndex].title}</h4>
                </div>
                <p className="text-gray-300">{FEATURE_CARDS[currentIndex].desc}</p>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 z-30 flex gap-1 px-4 pt-4">
               {FEATURE_CARDS.map((_, i) => (
                 <div key={i} className="flex-1 h-full bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-amber-500"
                     initial={{ width: 0 }}
                     animate={{ width: i < currentIndex ? "100%" : i === currentIndex ? "100%" : "0%" }}
                     transition={{ duration: 0.5 }}
                   />
                 </div>
               ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Delivery Timeline Section
const DeliveryTimeline = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-mono text-sm tracking-[0.2em]">DELIVERY NETWORK</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3">From Supplier to Site</h2>
          <p className="text-gray-600 mt-4">Seamless logistics network across the country</p>
        </motion.div>

        <div className="relative">
          {/* Timeline Path */}
          <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2">
            <motion.path
              d="M 0,40 Q 300,0 600,40 T 1200,40"
              stroke="#FACC15"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8 8"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { icon: Factory, label: 'Supplier', desc: 'Verified manufacturers', color: 'text-amber-500', bg: 'bg-amber-100' },
              { icon: Truck, label: 'Logistics', desc: 'Fleet of trucks', color: 'text-blue-500', bg: 'bg-blue-100' },
              { icon: Building2, label: 'Construction Site', desc: 'Direct delivery', color: 'text-green-500', bg: 'bg-green-100' },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative z-10"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`${item.bg} w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}
                  >
                    <Icon size={40} className={item.color} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.label}</h3>
                  <p className="text-gray-600">{item.desc}</p>

                  {/* Time Estimate */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: index * 0.2 + 0.5 }}
                    className="mt-4 inline-block bg-white px-3 py-1 rounded-full text-sm font-bold text-amber-500 shadow-sm"
                  >
                    {index === 0 && '24hr dispatch'}
                    {index === 1 && '2-3 days transit'}
                    {index === 2 && 'Same day delivery'}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-amber-500 font-mono text-sm tracking-[0.2em]">TESTIMONIALS</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3">What Contractors Say</h2>
          <p className="text-gray-600 mt-4">Trusted by thousands of construction professionals</p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Auto-play Controls */}
          <div className="absolute top-0 right-0 z-10 flex gap-2">
            <button 
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-2xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <img 
                    src={TESTIMONIALS[currentIndex].image}
                    alt={TESTIMONIALS[currentIndex].name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-amber-500"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-2">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-lg md:text-xl text-gray-700 mb-4 italic">
                    "{TESTIMONIALS[currentIndex].quote}"
                  </p>
                  <h4 className="font-bold text-gray-900 text-lg">{TESTIMONIALS[currentIndex].name}</h4>
                  <p className="text-gray-600">{TESTIMONIALS[currentIndex].role} at {TESTIMONIALS[currentIndex].company}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoPlaying(false)
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-8 bg-amber-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// CTA Section
const CTASection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0Z' fill='%23000' fill-opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black mb-6"
        >
          Start Building Smarter Today
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl mb-10 max-w-2xl mx-auto text-white/90"
        >
          Join thousands of contractors and suppliers on India's fastest growing construction marketplace
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link 
            to="/marketplace" 
            className="group bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            Order Materials
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/register" 
            className="border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-all"
          >
            <Factory size={18} />
            Join as Supplier
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-500 p-2 rounded-lg">
                <HardHat size={24} className="text-gray-900" />
              </div>
              <span className="font-black text-xl">BUILD<span className="text-amber-500">MART</span></span>
            </div>
            <p className="text-gray-400 mb-4">
              India's premier construction materials marketplace. Connecting builders with trusted suppliers since 2020.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Press', 'Blog'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              {['Material Sourcing', 'Supplier Verification', 'Logistics', 'Bulk Orders'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Map size={18} className="text-amber-500 flex-shrink-0 mt-1" />
                <span className="text-gray-400">123 Business Park, Mumbai - 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-amber-500 flex-shrink-0" />
                <span className="text-gray-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-amber-500 flex-shrink-0" />
                <span className="text-gray-400">contact@buildmart.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 BuildMart Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="#" className="text-gray-500 hover:text-amber-500 transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-500 hover:text-amber-500 transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-gray-500 hover:text-amber-500 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main HomePage Component
export default function HomePage() {
  return (
    <div className="bg-white" style={{ background: 'var(--bg-primary)' }}>
      <HeroSection />
      <MaterialCards />
      <HowItWorks />
      <SupplierStats />
      <FeatureScrollSection />
      <DeliveryTimeline />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  )
}