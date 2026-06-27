import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { vendorRegister } from '../services/api'
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineUpload,
  HiOutlineExclamationCircle,
} from 'react-icons/hi'

const CATEGORIES = [
  'Clothing',
  'Electronics',
  'Home & Living',
  'Stationery',
  'Gifts',
  'Accessories',
  'Other',
]

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

const RegisterPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [step1Data, setStep1Data] = useState(null)

  // Logo preview
  const [logoPreview, setLogoPreview] = useState(null)
  const [panPreview, setPanPreview] = useState(null)
  const [chequePreview, setChequePreview] = useState(null)

  const form1 = useForm()
  const form2 = useForm()

  const handleStep1 = (data) => {
    if (data.password !== data.confirmPassword) {
      form1.setError('confirmPassword', { message: 'Passwords do not match' })
      return
    }
    setStep1Data(data)
    setStep(2)
  }

  const handleStep2 = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        businessName: step1Data.businessName,
        ownerName: step1Data.ownerName,
        email: step1Data.email,
        phone: step1Data.phone,
        password: step1Data.password,
        businessCategory: data.businessCategory,
        businessDescription: data.businessDescription,
        gstin: data.gstin || '',
        panNumber: data.panNumber || '',
      }

      if (data.businessLogo && data.businessLogo[0]) {
        payload.businessLogo = await fileToBase64(data.businessLogo[0])
      }
      if (data.panDocument && data.panDocument[0]) {
        payload.panDocument = await fileToBase64(data.panDocument[0])
      }
      if (data.cancelledCheque && data.cancelledCheque[0]) {
        payload.cancelledCheque = await fileToBase64(data.cancelledCheque[0])
      }

      await vendorRegister(payload)
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const b64 = await fileToBase64(file)
      setLogoPreview(b64)
    }
  }

  const handlePanChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const b64 = await fileToBase64(file)
      setPanPreview(b64)
    }
  }

  const handleChequeChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const b64 = await fileToBase64(file)
      setChequePreview(b64)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#d1fae5' }}
          >
            <HiOutlineCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--blue-deep)' }}>
            Application Submitted!
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Thank you for registering with MithraShoppy! Our team will review your application within
            <strong className="text-gray-700"> 24-48 hours</strong>. You'll receive an email
            notification once your account is approved.
          </p>
          <div
            className="p-4 rounded-xl mb-6 text-left"
            style={{ backgroundColor: 'rgba(223,183,67,0.08)', border: '1px solid rgba(223,183,67,0.2)' }}
          >
            <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--blue-deep)' }}>
              What happens next?
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Application received and under review</li>
              <li>📧 Check your email for updates</li>
              <li>⏱ Review takes 24-48 business hours</li>
              <li>🚀 Start listing products once approved</li>
            </ul>
          </div>
          <Link
            to="/login"
            className="inline-block w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'var(--gold)', color: 'var(--blue-deep)' }}
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{ background: 'var(--blue-deep)', color: 'var(--gold)' }}
            >
              M
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--blue-deep)' }}>
              MithraShoppy
            </span>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--blue-deep)' }}>
            Vendor Registration
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)' }} className="font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all`}
                  style={{
                    backgroundColor: step >= s ? 'var(--blue-deep)' : '#e5e7eb',
                    color: step >= s ? 'var(--gold)' : '#9ca3af',
                  }}
                >
                  {step > s ? <HiOutlineCheckCircle className="w-5 h-5" /> : s}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    step >= s ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {s === 1 ? 'Basic Info' : 'Business Details'}
                </span>
              </div>
              {s < 2 && (
                <div
                  className="w-16 h-0.5 mx-3"
                  style={{ backgroundColor: step > 1 ? 'var(--gold)' : '#e5e7eb' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 1 ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--blue-deep)' }}>
                Basic Information
              </h2>
              <p className="text-gray-500 text-sm mb-6">Tell us about yourself and your business</p>

              <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your Business Name"
                      {...form1.register('businessName', { required: 'Business name is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                    {form1.formState.errors.businessName && (
                      <p className="text-red-500 text-xs mt-1">
                        {form1.formState.errors.businessName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Owner Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      {...form1.register('ownerName', { required: 'Owner name is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                    {form1.formState.errors.ownerName && (
                      <p className="text-red-500 text-xs mt-1">
                        {form1.formState.errors.ownerName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...form1.register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                    {form1.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {form1.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      {...form1.register('phone', {
                        required: 'Phone is required',
                        pattern: { value: /^[0-9+\s-]{10,15}$/, message: 'Invalid phone number' },
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                    {form1.formState.errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {form1.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 8 characters"
                      {...form1.register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Minimum 8 characters' },
                      })}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff className="w-4 h-4" />
                      ) : (
                        <HiOutlineEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {form1.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {form1.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      {...form1.register('confirmPassword', { required: 'Please confirm password' })}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirm ? (
                        <HiOutlineEyeOff className="w-4 h-4" />
                      ) : (
                        <HiOutlineEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {form1.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {form1.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm mt-2 transition-all hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold), #c9a030)',
                    color: 'var(--blue-deep)',
                    boxShadow: '0 4px 16px rgba(223,183,67,0.35)',
                  }}
                >
                  Continue to Business Details →
                </button>
              </form>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--blue-deep)' }}>
                Business Details
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Help us understand your business better
              </p>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl mb-5 bg-red-50 border border-red-200 text-red-700 text-sm">
                  <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Business Category *
                  </label>
                  <select
                    {...form2.register('businessCategory', { required: 'Category is required' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {form2.formState.errors.businessCategory && (
                    <p className="text-red-500 text-xs mt-1">
                      {form2.formState.errors.businessCategory.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Business Description *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your business..."
                    {...form2.register('businessDescription', { required: 'Description is required' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none"
                  />
                  {form2.formState.errors.businessDescription && (
                    <p className="text-red-500 text-xs mt-1">
                      {form2.formState.errors.businessDescription.message}
                    </p>
                  )}
                </div>

                {/* Business Logo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Business Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-16 h-16 rounded-xl object-cover border"
                      />
                    )}
                    <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-amber-300 transition-colors text-sm text-gray-500">
                      <HiOutlineUpload className="w-4 h-4" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        {...form2.register('businessLogo')}
                        onChange={(e) => {
                          form2.setValue('businessLogo', e.target.files)
                          handleLogoChange(e)
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      {...form2.register('gstin')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      PAN Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      {...form2.register('panNumber')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      PAN Document (Optional)
                    </label>
                    <label className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-amber-300 transition-colors">
                      {panPreview ? (
                        <img src={panPreview} alt="PAN" className="h-16 object-contain rounded" />
                      ) : (
                        <>
                          <HiOutlineUpload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-400 text-center">
                            Upload PAN Document
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        {...form2.register('panDocument')}
                        onChange={(e) => {
                          form2.setValue('panDocument', e.target.files)
                          handlePanChange(e)
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Cancelled Cheque (Optional)
                    </label>
                    <label className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-amber-300 transition-colors">
                      {chequePreview ? (
                        <img
                          src={chequePreview}
                          alt="Cheque"
                          className="h-16 object-contain rounded"
                        />
                      ) : (
                        <>
                          <HiOutlineUpload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-400 text-center">
                            Upload Cancelled Cheque
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        {...form2.register('cancelledCheque')}
                        onChange={(e) => {
                          form2.setValue('cancelledCheque', e.target.files)
                          handleChequeChange(e)
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold), #c9a030)',
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
                        Submitting...
                      </span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
