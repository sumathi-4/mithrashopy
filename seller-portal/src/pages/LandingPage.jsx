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
import { FaStar, FaQuoteRight } from 'react-icons/fa'
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
    <div className="border border-slate-200/60 rounded-2xl overflow-hidden mb-3 bg-white/70 backdrop-blur-sm shadow-sm transition-all hover:border-[#DFB743]/50 duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-[#08214D] hover:bg-[#F8FAFC]/80 transition-colors"
      >
        <span className="text-sm md:text-base tracking-tight">{q}</span>
        <span className="flex-shrink-0 ml-4">
          {open ? (
            <HiOutlineChevronUp className="w-5 h-5 text-[#DFB743] transition-transform duration-300" />
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
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4 bg-[#F8FAFC]/40 font-medium">
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm px-6 md:px-16 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[#08214D] bg-gradient-to-br from-[#DFB743] to-[#C29B27] shadow-sm border border-[#DFB743]/30">
            <span className="text-lg text-[#051838]">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#08214D] font-extrabold text-base tracking-tight leading-none">
              Mithra<span className="text-[#DFB743]">Shoppy</span>
            </span>
            <span className="text-slate-400 text-[9px] font-bold tracking-wider uppercase mt-0.5">
              Seller Portal
            </span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-xs tracking-wide text-slate-600">
          <button
            onClick={() => scrollToSection('benefits')}
            className="hover:text-[#08214D] transition-colors cursor-pointer"
          >
            BENEFITS
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-[#08214D] transition-colors cursor-pointer"
          >
            HOW IT WORKS
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-[#08214D] transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <Link
            to="/login"
            className="hover:text-[#08214D] transition-colors"
          >
            LOGIN
          </Link>
        </div>

        {/* Right CTA */}
        <div>
          <Link
            to="/register"
            className="px-5 py-2 rounded-xl text-xs font-bold text-[#051838] bg-gradient-to-r from-[#DFB743] to-[#E5C058] hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Become a Seller
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-14 md:pt-32 md:pb-16 px-6 md:px-16 bg-white relative overflow-hidden">
        {/* Soft Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1E3A8A]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#DFB743]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column Content */}
            <div className="md:col-span-7 space-y-5 text-left">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight tracking-tight"
              >
                Start Selling on <br />
                <span className="bg-gradient-to-r from-[#08214D] to-[#1E3A8A] bg-clip-text text-transparent">Mithra</span>
                <span className="bg-gradient-to-r from-[#DFB743] via-[#F5D98B] to-[#C29B27] bg-clip-text text-transparent ml-1">Shoppy</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-sm md:text-base text-slate-500 leading-relaxed max-w-xl font-medium"
              >
                Join our trusted e-commerce marketplace, manage your catalog with simple merchant APIs, and grow your sales volume with thousands of happy buyers.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link
                  to="/register"
                  className="px-6 py-3 text-xs md:text-sm font-bold rounded-xl text-[#051838] bg-gradient-to-r from-[#DFB743] to-[#E5C058] hover:scale-[1.01] shadow-lg shadow-[#DFB743]/20 hover:shadow-[#DFB743]/30 transition-all flex items-center gap-2"
                >
                  Become a Seller <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 text-xs md:text-sm font-bold rounded-xl border border-slate-200 text-[#08214D] hover:bg-slate-50/80 transition-all"
                >
                  Seller Login
                </Link>
              </motion.div>
            </div>

            {/* Right Column Graphic Card */}
            <div className="md:col-span-5 relative flex justify-center mt-6 md:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md bg-gradient-to-tr from-white to-[#F8FAFC]/60 border border-slate-200/50 rounded-3xl p-6 shadow-[0_20px_50px_rgba(8,33,77,0.06)] hover:shadow-[0_25px_60px_rgba(8,33,77,0.09)] transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Total Revenue Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black text-[#08214D] tracking-tight mt-1">
                      {formattedRevenue}
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <HiOutlineTrendingUp className="w-3.5 h-3.5" />
                    +12.5%
                  </div>
                </div>

                {/* Simulated Custom Premium Area Chart */}
                <div className="my-5 h-32 relative flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1E3A8A" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#DFB743" />
                      </linearGradient>
                    </defs>
                    {/* Grid line guidelines */}
                    <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeDasharray="3,3" />
                    <line x1="0" y1="95" x2="300" y2="95" stroke="#f1f5f9" strokeDasharray="3,3" />
                    
                    {/* Shadow Area under the line */}
                    <path
                      d="M0,110 C30,90 45,100 80,60 C115,20 140,70 170,40 C200,10 240,60 270,30 C285,15 295,20 300,10 L300,120 L0,120 Z"
                      fill="url(#chartGrad)"
                    />
                    
                    {/* Main gradient line path */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      d="M0,110 C30,90 45,100 80,60 C115,20 140,70 170,40 C200,10 240,60 270,30 C285,15 295,20 300,10"
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Chart markers */}
                    <circle cx="80" cy="60" r="5" fill="#1E3A8A" stroke="#fff" strokeWidth="2" />
                    <circle cx="170" cy="40" r="5" fill="#DFB743" stroke="#fff" strokeWidth="2" />
                    <circle cx="300" cy="10" r="5" fill="#DFB743" stroke="#fff" strokeWidth="2" />
                  </svg>

                  {/* Overlapping Bag Graphics */}
                  <div className="absolute right-0 bottom-4 w-11 h-11 bg-white border border-slate-100 rounded-2xl shadow-md flex items-center justify-center text-lg hover:scale-105 transition-transform duration-300 select-none">
                    🛍️
                  </div>
                </div>

                {/* Sub Stats Row */}
                <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Orders
                    </p>
                    <p className="text-xl font-black text-[#08214D]">320</p>
                  </div>
                  <div className="border-l border-slate-100 pl-4 space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Products
                    </p>
                    <p className="text-xl font-black text-[#08214D]">{stats.totalProducts}</p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Sell on MithraShoppy? (Benefits) Section */}
      <section id="benefits" className="py-14 md:py-16 px-6 md:px-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#08214D] tracking-tight">
              Why Sell on MithraShoppy?
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#DFB743] to-[#E5C058] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: HiOutlineCloudUpload,
                title: 'Easy Product Upload',
                desc: 'Add and manage your products with ease',
                theme: 'blue',
                color: 'text-blue-600 bg-blue-50/60 border-blue-100 hover:border-blue-400/40 hover:shadow-[0_15px_30px_rgba(59,130,246,0.06)]',
              },
              {
                icon: HiOutlineCreditCard,
                title: 'Fast Payments',
                desc: 'Get secure payments on time',
                theme: 'amber',
                color: 'text-amber-600 bg-amber-50/60 border-amber-100 hover:border-amber-400/40 hover:shadow-[0_15px_30px_rgba(245,158,11,0.06)]',
              },
              {
                icon: HiOutlineTrendingUp,
                title: 'Real-Time Analytics',
                desc: 'Track your sales and performance',
                theme: 'emerald',
                color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100 hover:border-emerald-400/40 hover:shadow-[0_15px_30px_rgba(16,185,129,0.06)]',
              },
              {
                icon: HiOutlineClipboardList,
                title: 'Order Management',
                desc: 'Manage orders and customers easily',
                theme: 'purple',
                color: 'text-purple-600 bg-purple-50/60 border-purple-100 hover:border-purple-400/40 hover:shadow-[0_15px_30px_rgba(139,92,246,0.06)]',
              },
              {
                icon: HiOutlineSupport,
                title: '24/7 Support',
                desc: 'We are here to help you anytime',
                theme: 'rose',
                color: 'text-rose-600 bg-rose-50/60 border-rose-100 hover:border-rose-400/40 hover:shadow-[0_15px_30px_rgba(244,63,94,0.06)]',
              },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`bg-white border border-slate-200/50 p-6 rounded-2xl shadow-sm transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 ${color}`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-white shadow-sm">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-[#08214D] text-sm md:text-base tracking-tight leading-tight">
                    {title}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-14 md:py-16 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#08214D] tracking-tight">
              How It Works
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#DFB743] to-[#E5C058] mx-auto rounded-full"></div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-3 max-w-5xl mx-auto">
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
                desc: 'Reach thousands of customers',
                icon: '🚀',
              },
            ].map(({ step, title, desc, icon }, i, arr) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-[#F8FAFC]/50 border border-slate-200/50 p-6.5 rounded-3xl text-center w-full max-w-[210px] flex flex-col items-center space-y-4 shadow-sm hover:border-[#DFB743]/50 hover:bg-white transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base bg-gradient-to-br from-[#08214D] to-[#1E3A8A] text-white relative shadow-md shadow-blue-900/10">
                    {step}
                    <span className="absolute -bottom-1 -right-1 text-xs bg-white/95 backdrop-blur-sm p-0.5 rounded-lg w-5.5 h-5.5 flex items-center justify-center border border-slate-100 shadow-sm select-none">
                      {icon}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-[#08214D] text-sm md:text-base tracking-tight leading-none">
                      {title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                      {desc}
                    </p>
                  </div>
                </motion.div>
                {i < arr.length - 1 && (
                  <div className="hidden lg:block text-2xl text-slate-300 font-extrabold mx-2">
                    <HiOutlineArrowRight className="w-5 h-5 text-slate-300/80" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-14 md:py-16 px-6 md:px-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#08214D] tracking-tight">
              What Our Sellers Say
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#DFB743] to-[#E5C058] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {testimonials.map(({ name, business, text, rating, location }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white p-7.5 rounded-3xl shadow-sm border border-slate-200/50 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                {/* Decorative quote icon */}
                <FaQuoteRight className="absolute top-6 right-6 w-8 h-8 text-slate-100/70" />
                
                <div className="relative z-10">
                  <div className="flex gap-1 mb-3.5">
                    {Array.from({ length: rating }).map((_, j) => (
                      <FaStar key={j} className="w-3.5 h-3.5 text-[#DFB743]" />
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6 font-semibold italic">
                    "{text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 relative z-10">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-[#08214D]/10 to-[#DFB743]/10 text-[#08214D] border border-[#08214D]/5">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#08214D] text-xs md:text-sm tracking-tight">{name}</p>
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
      <section id="faq" className="py-14 md:py-16 px-6 md:px-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#08214D] tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#DFB743] to-[#E5C058] mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-3 max-w-2xl mx-auto">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Premium Containerized CTA Bottom Banner */}
      <section className="py-14 px-6 md:px-16 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-[#08214D] via-[#051838] to-[#1E3A8A] text-center text-white py-14 px-6 md:px-12 relative shadow-xl">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          {/* Glowing Accents */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#DFB743]/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-xl mx-auto space-y-5 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Start your business today
            </h2>
            <p className="text-slate-300 text-xs md:text-sm font-semibold max-w-md mx-auto leading-relaxed">
              Register as an approved seller, verify your identity details, and scale your brand sales with MithraShoppy.
            </p>
            <div className="pt-3">
              <Link
                to="/register"
                className="inline-block px-7 py-3 font-bold rounded-xl text-[#051838] bg-gradient-to-r from-[#DFB743] to-[#E5C058] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs md:text-sm shadow-md shadow-black/10"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-400 py-10 px-6 md:px-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br from-[#DFB743] to-[#C29B27] text-[#051838]">
                M
              </div>
              <span className="text-[#08214D] font-extrabold text-base tracking-tight">
                Mithra<span className="text-[#DFB743]">Shoppy</span>
              </span>
            </div>
            <div className="flex gap-6 flex-wrap justify-center text-xs font-semibold tracking-wide">
              {['About', 'Privacy Policy', 'Terms of Service', 'Support', 'Contact'].map((link) => (
                <a
                  key={link}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-slate-400 hover:text-[#08214D] transition-colors"
                >
                  {link.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-50 pt-5 text-center text-[10px] font-bold text-slate-400 select-none">
            © {new Date().getFullYear()} MITHRASHOPPY. ALL RIGHTS RESERVED. MADE WITH ❤️ IN INDIA.
          </div>
        </div>
      </footer>
    </div>
  )
}
