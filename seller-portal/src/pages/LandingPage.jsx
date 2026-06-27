import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineArrowRight,
  HiOutlineCloudUpload,
  HiOutlineCreditCard,
  HiOutlineTrendingUp,
  HiOutlineClipboardList,
  HiOutlineSupport,
} from 'react-icons/hi'
import { FaStar } from 'react-icons/fa'
import { getPublicStats } from '../services/api'

// FAQ items matching the reference design
const faqs = [
  {
    q: 'How to become a seller?',
    a: 'Simply click "Become a Seller" or "Start Selling", fill out our quick registration form with your business details, and upload your verification documents (PAN and Cancelled Cheque). Our onboarding team will review your application.',
  },
  {
    q: 'Is there any fee to sell?',
    a: 'Registration on MithraShoppy is completely free! We do not charge any setup or listing fees. We only charge a small category-specific referral fee (commission) on successful sales.',
  },
  {
    q: 'How payments work?',
    a: 'Payments are calculated for your completed orders and deposited directly into your linked bank account. Settle cycles are weekly, and you will receive funds on-time within 7 working days.',
  },
  {
    q: 'How long approval takes?',
    a: 'Our platform review team processes vendor submissions within 24 to 48 hours. You will receive an automated email confirmation once your account has been approved.',
  },
]

// Customer testimonials
const testimonials = [
  {
    name: 'Anjali Verma',
    business: 'Verma Apparel & Fashion',
    text: 'Switching my boutique business to MithraShoppy was the best decision. The dashboard analytics helped me double my stock efficiency and boost monthly orders by 180%!',
    rating: 5,
    location: 'New Delhi, Delhi',
  },
  {
    name: 'Vikram Shah',
    business: 'Shah Electronics Hub',
    text: 'Catalog uploads are smooth and order payouts are always on time. Their customer support team resolves any shipping issues fast, making it highly stress-free.',
    rating: 5,
    location: 'Ahmedabad, Gujarat',
  },
]

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-100/90 rounded-2xl overflow-hidden mb-4 bg-white shadow-sm transition-all hover:border-[#D4AF37]/45 duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4.5 text-left font-semibold text-[#1E3A8A] hover:bg-[#F8FAFC]/60 transition-colors"
      >
        <span className="text-sm md:text-base">{q}</span>
        <span className="flex-shrink-0 ml-4">
          {open ? (
            <HiOutlineChevronUp className="w-5 h-5 text-[#D4AF37] transition-transform duration-300" />
          ) : (
            <HiOutlineChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-300" />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4 bg-[#F8FAFC]/30">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSellers: 12,
    totalProducts: 56,
    totalRevenue: 145230,
  })

  // Fetch dynamic stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPublicStats()
        if (res.data && res.data.success) {
          setStats(res.data.stats)
        }
      } catch (e) {
        console.error('Failed to load public stats:', e)
      }
    }
    fetchStats()
  }, [])

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(stats.totalRevenue)

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased">
      
      {/* Premium Header/Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[#1E3A8A] bg-[#D4AF37]/20 shadow-sm border border-[#D4AF37]/30">
            <span className="text-lg">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#1E3A8A] font-extrabold text-lg tracking-tight leading-none">
              Mithra<span className="text-[#D4AF37]">Shoppy</span>
            </span>
            <span className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5">
              Seller Portal
            </span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
          <button
            onClick={() => scrollToSection('benefits')}
            className="hover:text-[#1E3A8A] transition-colors cursor-pointer"
          >
            Benefits
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#1E3A8A] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-[#1E3A8A] transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <Link
            to="/login"
            className="hover:text-[#1E3A8A] transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Right CTA */}
        <div>
          <Link
            to="/register"
            className="px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 hover:shadow-md transition-all cursor-pointer"
          >
            Become a Seller
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-16 bg-white relative overflow-hidden">
        {/* Soft Background Gradients */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#1E3A8A]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D4AF37]/5 blur-[90px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Content */}
            <div className="md:col-span-7 space-y-6 text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight tracking-tight"
              >
                Start Selling on <br />
                <span className="text-[#1E3A8A]">Mithra</span>
                <span className="text-[#D4AF37]">Shoppy</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-base md:text-lg text-slate-500 leading-relaxed max-w-xl"
              >
                Join our trusted marketplace and grow your business with thousands of happy customers.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link
                  to="/register"
                  className="px-7 py-3.5 text-sm font-bold rounded-xl text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 hover:scale-[1.01] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all flex items-center gap-2.5"
                >
                  Become a Seller
                </Link>
                <Link
                  to="/login"
                  className="px-7 py-3.5 text-sm font-bold rounded-xl border border-slate-200 text-[#1E3A8A] hover:bg-slate-50 transition-all"
                >
                  Login
                </Link>
              </motion.div>
            </div>

            {/* Right Column Graphic Card */}
            <div className="md:col-span-5 relative flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_20px_50px_rgba(30,58,138,0.06)] relative overflow-hidden"
              >
                {/* Total Revenue Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">
                      {formattedRevenue}
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                    <HiOutlineTrendingUp className="w-3.5 h-3.5" />
                    +12.5%
                  </div>
                </div>

                {/* Simulated Custom Premium Area Chart */}
                <div className="my-6 h-36 relative flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid line guidelines */}
                    <line x1="0" y1="30" x2="300" y2="30" stroke="#f1f5f9" strokeDasharray="3,3" />
                    <line x1="0" y1="70" x2="300" y2="70" stroke="#f1f5f9" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeDasharray="3,3" />
                    
                    {/* Shadow Area under the line */}
                    <path
                      d="M0,110 C30,90 45,100 80,60 C115,20 140,70 170,40 C200,10 240,60 270,30 C285,15 295,20 300,10 L300,120 L0,120 Z"
                      fill="url(#chartGrad)"
                    />
                    
                    {/* Main royal blue line path */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      d="M0,110 C30,90 45,100 80,60 C115,20 140,70 170,40 C200,10 240,60 270,30 C285,15 295,20 300,10"
                      fill="none"
                      stroke="#1E3A8A"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Chart markers */}
                    <circle cx="80" cy="60" r="4.5" fill="#1E3A8A" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="170" cy="40" r="4.5" fill="#D4AF37" stroke="#fff" strokeWidth="1.5" />
                    <circle cx="300" cy="10" r="4.5" fill="#1E3A8A" stroke="#fff" strokeWidth="1.5" />
                  </svg>

                  {/* Overlapping Bag Graphics */}
                  <div className="absolute right-0 bottom-4 w-12 h-12 bg-[#F8FAFC] border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-xl hover:scale-105 transition-transform duration-300">
                    🛍️
                  </div>
                </div>

                {/* Sub Stats Row */}
                <div className="border-t border-slate-50 pt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Orders
                    </p>
                    <p className="text-lg font-bold text-slate-700">320</p>
                  </div>
                  <div className="border-l border-slate-100 pl-4 space-y-0.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Products
                    </p>
                    <p className="text-lg font-bold text-slate-700">{stats.totalProducts}</p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Sell on MithraShoppy? (Benefits) Section */}
      <section id="benefits" className="py-20 md:py-24 px-6 md:px-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A]">
              Why Sell on MithraShoppy?
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: HiOutlineCloudUpload,
                title: 'Easy Product Upload',
                desc: 'Add and manage your products with ease',
                color: 'text-blue-600 bg-blue-50 border-blue-100',
              },
              {
                icon: HiOutlineCreditCard,
                title: 'Fast Payments',
                desc: 'Get secure payments on time',
                color: 'text-amber-600 bg-amber-50 border-amber-100',
              },
              {
                icon: HiOutlineTrendingUp,
                title: 'Real-Time Analytics',
                desc: 'Track your sales and performance',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              },
              {
                icon: HiOutlineClipboardList,
                title: 'Order Management',
                desc: 'Manage orders and customers easily',
                color: 'text-purple-600 bg-purple-50 border-purple-100',
              },
              {
                icon: HiOutlineSupport,
                title: '24/7 Support',
                desc: 'We are here to help you anytime',
                color: 'text-rose-600 bg-rose-50 border-rose-100',
              },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-[#1E3A8A] text-sm md:text-base leading-tight">
                    {title}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-24 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A]">
              How It Works
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Register',
                desc: 'Create your seller account',
                icon: '📝',
              },
              {
                step: '2',
                title: 'Get Approved',
                desc: 'Our team will verify and approve',
                icon: '🔑',
              },
              {
                step: '3',
                title: 'Add Products',
                desc: 'Upload your products and set prices',
                icon: '📦',
              },
              {
                step: '4',
                title: 'Start Selling',
                desc: 'Reach thousands and customers',
                icon: '🚀',
              },
            ].map(({ step, title, desc, icon }, i, arr) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#F8FAFC] border border-slate-100 p-8 rounded-3xl text-center w-full max-w-[220px] flex flex-col items-center space-y-4 shadow-sm hover:border-[#D4AF37]/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#1E3A8A] text-white relative shadow-md">
                    {step}
                    <span className="absolute -bottom-1 -right-1 text-sm bg-[#D4AF37]/90 text-[#1E3A8A] p-0.5 rounded-full w-5 h-5 flex items-center justify-center border border-white">
                      {icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#1E3A8A] text-sm md:text-base mb-1">
                      {title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                      {desc}
                    </p>
                  </div>
                </motion.div>
                {i < arr.length - 1 && (
                  <div className="hidden lg:block text-2xl text-slate-300 font-extrabold mx-4">
                    <HiOutlineArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-20 md:py-24 px-6 md:px-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A]">
              What Our Sellers Say
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map(({ name, business, text, rating, location }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, j) => (
                      <FaStar key={j} className="w-4 h-4 text-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6 font-semibold italic">
                    "{text}"
                  </p>
                </div>
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#1E3A8A] text-xs md:text-sm">{name}</p>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold mt-0.5">
                      {business} · {location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-24 px-6 md:px-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E3A8A]">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Bottom Banner */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-[#1E3A8A] via-[#051838] to-[#1E3A8A] text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Start your business today
          </h2>
          <p className="text-slate-300 text-sm md:text-base font-semibold max-w-xl mx-auto">
            Join thousands of successful sellers on MithraShoppy.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="px-8 py-4 font-bold rounded-xl text-[#1E3A8A] bg-white hover:bg-slate-50 hover:scale-[1.01] hover:shadow-xl transition-all text-sm md:text-base"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-400 py-12 px-6 md:px-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#1E3A8A] text-white">
                M
              </div>
              <span className="text-[#1E3A8A] font-extrabold text-base">
                Mithra<span className="text-[#D4AF37]">Shoppy</span>
              </span>
            </div>
            <div className="flex gap-6 flex-wrap justify-center text-xs md:text-sm font-semibold">
              {['About', 'Privacy Policy', 'Terms of Service', 'Support', 'Contact'].map((link) => (
                <a
                  key={link}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-slate-400 hover:text-[#1E3A8A] transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-50 pt-6 text-center text-[11px] font-semibold text-slate-400">
            © {new Date().getFullYear()} MithraShoppy. All rights reserved. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  )
}
