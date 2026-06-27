import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
  HiOutlineBell,
} from 'react-icons/hi'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api'
import { setNotifications, markRead, markAllRead } from '../store/notificationsSlice'

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const notifications = useSelector(state => state.notifications.list)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      setLoading(true)
      setError(null)
      const res = await getNotifications()
      dispatch(setNotifications(res.data?.notifications || res.data || []))
    } catch (err) {
      setError('Failed to fetch notifications.')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id, isRead) {
    if (isRead) return
    try {
      await markNotificationRead(id)
      dispatch(markRead(id))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      dispatch(markAllRead())
    } catch (err) {
      alert('Failed to mark all as read.')
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'vendor_approved':
        return <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
      case 'vendor_rejected':
        return <HiOutlineXCircle className="w-6 h-6 text-red-600" />
      case 'product_approved':
        return <HiOutlineCube className="w-6 h-6 text-green-600" />
      case 'product_rejected':
        return <HiOutlineCube className="w-6 h-6 text-red-600" />
      case 'new_order':
        return <HiOutlineShoppingCart className="w-6 h-6 text-blue-600" />
      case 'low_stock':
        return <HiOutlineExclamation className="w-6 h-6 text-yellow-600" />
      default:
        return <HiOutlineInformationCircle className="w-6 h-6 text-slate-600" />
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'vendor_approved':
      case 'product_approved':
        return 'bg-green-50'
      case 'vendor_rejected':
      case 'product_rejected':
        return 'bg-red-50'
      case 'new_order':
        return 'bg-blue-50'
      case 'low_stock':
        return 'bg-yellow-50'
      default:
        return 'bg-slate-50'
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated with approvals, order placements and system alerts.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <HiOutlineBell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">All caught up!</h3>
          <p className="text-slate-400 text-sm">No new notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => handleMarkRead(n._id, n.isRead)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                n.isRead
                  ? 'bg-white border-slate-100 hover:bg-slate-50/50'
                  : 'bg-amber-50/20 border-yellow-200/50 hover:bg-amber-50/30'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${getBg(n.type)}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`text-sm font-bold text-slate-800 ${!n.isRead && 'text-yellow-900'}`}>{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    }) : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.metadata?.rejectReason && (
                  <div className="mt-2 text-xs bg-red-50 border border-red-100 text-red-700 p-2 rounded-lg font-medium">
                    Rejection Reason: {n.metadata.rejectReason}
                  </div>
                )}
              </div>
              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
