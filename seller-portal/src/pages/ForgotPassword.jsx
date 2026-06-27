import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { HiOutlineMail, HiOutlineCheckCircle } from 'react-icons/hi'

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call — backend endpoint not yet confirmed
      await new Promise((res) => setTimeout(res, 1200))
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, var(--blue-deep) 0%, #0a2560 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--blue-deep)', color: 'var(--gold)' }}
          >
            M
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--blue-deep)' }}>
            Mithra<span style={{ color: 'var(--gold)' }}>Shoppy</span>
          </span>
        </div>

        {!submitted ? (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: 'rgba(223,183,67,0.12)' }}
            >
              <HiOutlineMail className="w-7 h-7" style={{ color: 'var(--gold)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--blue-deep)' }}>
              Forgot Password?
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              No worries! Enter your registered email address and we'll send you a password reset
              link.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-70"
                style={{
                  background: 'linear-gradient(135deg, var(--gold), #c9a030)',
                  color: 'var(--blue-deep)',
                  boxShadow: '0 4px 16px rgba(223,183,67,0.3)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: '#d1fae5' }}
            >
              <HiOutlineCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--blue-deep)' }}>
              Check Your Email
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              If this email is registered with MithraShoppy, you will receive a password reset
              link shortly. Please also check your spam folder.
            </p>
            <div
              className="p-4 rounded-xl text-sm text-gray-600 mb-6"
              style={{ backgroundColor: 'rgba(223,183,67,0.08)', border: '1px solid rgba(223,183,67,0.2)' }}
            >
              Didn't receive an email? Check your spam folder or{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="font-semibold underline"
                style={{ color: 'var(--gold)' }}
              >
                try again
              </button>
              .
            </div>
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'var(--gold)', color: 'var(--blue-deep)' }}
            >
              Back to Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword
