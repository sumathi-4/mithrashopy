import React, { useState, useEffect } from 'react'
import { getVendorOrders, updateOrderStatus } from '../services/api'
import { HiOutlineSearch, HiOutlineClock, HiOutlineUser, HiOutlineCurrencyRupee, HiOutlineTrendingUp } from 'react-icons/hi'

const STATUS_TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const badgeColors = {
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  Processing: 'bg-blue-50 text-blue-700 border-blue-100',
  Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Delivered: 'bg-green-50 text-green-700 border-green-100',
  Cancelled: 'bg-red-50 text-red-700 border-red-100'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      setError(null)
      const res = await getVendorOrders()
      setOrders(res.data?.orders || [])
    } catch (err) {
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, newStatus) {
    if (!window.confirm(`Are you sure you want to update the status to ${newStatus}?`)) return
    try {
      setUpdatingId(id)
      await updateOrderStatus(id, newStatus)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    } catch (err) {
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = orders.filter(o => {
    const matchSearch =
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase())

    const matchTab = activeTab === 'All' || o.status === activeTab
    return matchSearch && matchTab
  })

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and track your customer orders and dispatch status.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4 mb-6">
        <div className="flex gap-2 flex-wrap border-b border-slate-100 pb-3">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={activeTab === tab ? { background: '#051838' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No orders found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Once customers purchase your products, they will appear here with detail cards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(o => (
            <div key={o.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-50">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Order ID</span>
                    <h3 className="font-bold text-slate-800 text-sm">#{o.id}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColors[o.status] || 'bg-slate-100 text-slate-700'}`}>
                    {o.status}
                  </span>
                </div>

                {/* Info block */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-slate-500 text-xs gap-1.5">
                    <HiOutlineUser className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{o.customerName || 'Anonymous Customer'}</span>
                    <span className="text-slate-300">|</span>
                    <span>{o.customerPhone || 'No Phone'}</span>
                  </div>
                  <div className="flex items-center text-slate-500 text-xs gap-1.5">
                    <HiOutlineClock className="w-4 h-4 text-slate-400" />
                    <span>Ordered: {o.date ? new Date(o.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Unknown'}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-slate-50/50 rounded-xl p-3 mb-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Order Items</span>
                  <div className="space-y-1">
                    {(o.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.name}</span>
                        <span className="text-slate-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Your Share</span>
                  <div className="flex items-center font-bold text-slate-800 text-base">
                    <HiOutlineCurrencyRupee className="w-4 h-4 text-slate-500" />
                    {o.vendorAmount?.toLocaleString('en-IN') || o.totalAmount?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-400 mr-1">Update Status:</label>
                  <select
                    value={o.status}
                    disabled={updatingId === o.id || o.status === 'Delivered' || o.status === 'Cancelled'}
                    onChange={e => handleStatusChange(o.id, e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
