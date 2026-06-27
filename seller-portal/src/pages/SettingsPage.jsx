import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { changeVendorPassword } from '../services/api'
import { HiOutlineKey, HiOutlineShieldCheck, HiOutlineTrash } from 'react-icons/hi'

export default function SettingsPage() {
  const vendor = useSelector(state => state.auth.vendor) || {}
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match' })
      return
    }

    try {
      setLoading(true)
      await changeVendorPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      showToast('Password changed successfully!')
      reset()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to change password.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage authentication credentials, status badges and account deletion.</p>
      </div>

      {toast && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Account Info Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <HiOutlineShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Account Credentials</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div>
            <span>Login Email</span>
            <p className="font-bold text-slate-800 lowercase text-sm mt-1.5">{vendor.email || 'N/A'}</p>
          </div>
          <div>
            <span>Account Status</span>
            <div className="mt-1.5">
              <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-bold">
                {vendor.status || 'Active'}
              </span>
            </div>
          </div>
          <div>
            <span>Joined Date</span>
            <p className="font-bold text-slate-800 text-sm mt-1.5">
              {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'June 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <HiOutlineKey className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('currentPassword', { required: 'Current password is required' })}
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', { required: 'Please confirm your new password' })}
              className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold text-white text-xs shadow-sm transition-all"
            style={{ background: 'var(--blue-deep)' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* Danger Zone Section */}
      <div className="bg-red-50/20 border border-red-100 p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 border-b border-red-50 pb-3">
          <div className="p-2 bg-red-100/50 rounded-xl">
            <HiOutlineTrash className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-base font-bold text-red-800">Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Delete Account Permanently</h4>
            <p className="text-slate-500 text-xs mt-1">This will delete your business details, catalogs, product collections, and invoices.</p>
          </div>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-red-100 text-red-400 text-xs font-bold rounded-xl cursor-not-allowed border border-red-200"
          >
            Contact support to delete
          </button>
        </div>
      </div>
    </div>
  )
}
