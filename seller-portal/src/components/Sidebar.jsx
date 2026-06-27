import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { clearAuth } from '../store/authSlice'
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/products', label: 'Products', icon: HiOutlineCube },
  { path: '/orders', label: 'Orders', icon: HiOutlineShoppingCart },
  { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { path: '/notifications', label: 'Notifications', icon: HiOutlineBell, hasbadge: true },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog },
]

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const vendor = useSelector((state) => state.auth.vendor)
  const unreadCount = useSelector((state) => state.notifications.unreadCount)

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/login')
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="sidebar"
          initial={{ x: -240 }}
          animate={{ x: 0 }}
          exit={{ x: -240 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-full w-60 flex flex-col z-40 shadow-2xl sidebar-scroll overflow-y-auto"
          style={{ backgroundColor: 'var(--blue-deep)', borderRight: '1px solid rgba(223,183,67,0.15)' }}
        >
          {/* Logo */}
          <div className="px-5 pt-6 pb-5 border-b border-white border-opacity-10">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, var(--gold), #f5d98b)' }}
              >
                <span style={{ color: 'var(--blue-deep)' }}>M</span>
              </div>
              <div>
                <span className="text-white font-bold text-sm leading-none block">MithraShoppy</span>
                <span className="text-xs leading-none" style={{ color: 'var(--gold)' }}>
                  Vendor Portal
                </span>
              </div>
            </div>

            {/* Vendor info */}
            <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(223,183,67,0.08)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--gold), #c9a030)', color: 'var(--blue-deep)' }}
              >
                {getInitials(vendor?.ownerName || vendor?.businessName)}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">
                  {vendor?.ownerName || 'Vendor'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--gold)', opacity: 0.8 }}>
                  {vendor?.businessName || 'Business'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navLinks.map(({ path, label, icon: Icon, hasbadge }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                    isActive
                      ? 'text-yellow-400'
                      : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-5'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: 'rgba(223,183,67,0.12)',
                        borderLeft: '3px solid var(--gold)',
                        paddingLeft: '9px',
                      }
                    : {}
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
                {hasbadge && unreadCount > 0 && (
                  <span
                    className="ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ backgroundColor: '#ef4444', color: '#fff' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-3 pb-6 border-t border-white border-opacity-10 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500 hover:bg-opacity-10 transition-all duration-200"
            >
              <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
