import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearAuth } from '../store/authSlice'
import { HiOutlineBell, HiOutlineMenu, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'My Products',
  '/products/add': 'Add Product',
  '/orders': 'Orders',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

const TopNav = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const vendor = useSelector((state) => state.auth.vendor)
  const unreadCount = useSelector((state) => state.notifications.unreadCount)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const getTitle = () => {
    const path = location.pathname
    if (path.startsWith('/products/edit/')) return 'Edit Product'
    return pageTitles[path] || 'MithraShoppy'
  }

  const getInitials = (name) => {
    if (!name) return 'V'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className="fixed top-0 right-0 left-0 h-16 bg-white z-30 flex items-center px-4 gap-4 shadow-sm border-b border-gray-100"
      style={{ left: sidebarOpen ? '240px' : '0px', transition: 'left 0.3s ease' }}
    >
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <HiOutlineMenu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--blue-deep)' }}>
          {getTitle()}
        </h1>
        <p className="text-xs text-gray-400 hidden sm:block">
          Welcome back, {vendor?.ownerName?.split(' ')[0] || 'Vendor'}!
        </p>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notification bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <HiOutlineBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--blue-deep), var(--blue-mid))',
                color: 'var(--gold)',
              }}
            >
              {getInitials(vendor?.ownerName)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-700 leading-none">
                {vendor?.ownerName?.split(' ')[0] || 'Vendor'}
              </p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">
                {vendor?.status || 'Active'}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-700">{vendor?.ownerName}</p>
                  <p className="text-xs text-gray-400 truncate">{vendor?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <HiOutlineUser className="w-4 h-4" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default TopNav
