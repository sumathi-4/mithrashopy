import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { setVendor, setToken } from '../store/authSlice'
import { vendorLogin } from '../services/api'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineExclamationCircle } from 'react-icons/hi'
import { FaStore } from 'react-icons/fa'

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setAlertInfo(null)
    try {
      const res = await vendorLogin(data)
      const { token, vendor } = res.data
      dispatch(setToken(token))
      dispatch(setVendor(vendor))
      navigate('/dashboard')
    } catch (err) {
      const status = err?.response?.status
      const message = err?.response?.data?.message || 'Login failed. Please try again.'
      const vendorStatus = err?.response?.data?.status

      if (status === 403) {
        if (vendorStatus === 'Pending') {
          setAlertInfo({
            type: 'warning',
            message: 'Your application is under review. We will notify you once approved.',
          })
        } else if (vendorStatus === 'Rejected') {
          const reason = err?.response?.data?.rejectionReason || 'No reason provided.'
          setAlertInfo({
            type: 'error',
            message: `Your application was rejected. Reason: ${reason}`,
          })
        } else {
          setAlertInfo({ type: 'error', message })
        }
      } else {
        setAlertInfo({ type: 'error', message })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, var(--blue-deep) 0%, #0a2560 60%, #0d2f78 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
            style={{ background: 'var(--gold)', color: 'var(--blue-deep)' }}
          >
            M
          </div>
          <span className="text-white font-bold text-xl">
            Mithra<span style={{ color: 'var(--gold)' }}>Shoppy</span>
          </span>
        </div>

        <div className="text-white">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: 'rgba(223,183,67,0.15)' }}
          >
            <FaStore className="w-8 h-8" style={{ color: 'var(--gold)' }} />
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Welcome Back,<br />
            <span style={{ color: 'var(--gold)' }}>Seller!</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md">
            Access your vendor dashboard to manage products, track orders, and grow your business.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: '10K+', sub: 'Sellers' },
              { label: '50K+', sub: 'Products' },
              { label: '₹10Cr+', sub: 'Monthly Sales' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p className="text-xl font-bold" style={{ color: 'var(--gold)' }}>
                  {stat.label}
                </p>
                <p className="text-gray-400 text-xs mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} MithraShoppy. All rights reserved.
        </p>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-6 bg-white"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: 'var(--gold)', color: 'var(--blue-deep)' }}
            >
              M
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--blue-deep)' }}>
              Mithra<span style={{ color: 'var(--gold)' }}>Shoppy</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--blue-deep)' }}>
            Sign in to your account
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--gold)' }}>
              Register as Vendor
            </Link>
          </p>

          {/* Alerts */}
          {alertInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-4 rounded-xl mb-6 text-sm ${
                alertInfo.type === 'warning'
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{alertInfo.message}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium"
                  style={{ color: 'var(--gold)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm transition-all ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-4 h-4" />
                  ) : (
                    <HiOutlineEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading
                  ? 'rgba(223,183,67,0.6)'
                  : 'linear-gradient(135deg, var(--gold), #c9a030)',
                color: 'var(--blue-deep)',
                boxShadow: '0 4px 16px rgba(223,183,67,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            By signing in, you agree to our{' '}
            <a href="#" className="underline">Terms of Service</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
