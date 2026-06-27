import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  HiOutlineShoppingBag,
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrendingUp,
  HiOutlineExclamation,
  HiOutlinePlus,
} from 'react-icons/hi'
import { getVendorAnalytics } from '../services/api'

const statusColors = {
  Pending: 'badge-pending',
  Processing: 'badge-processing',
  Shipped: 'badge-shipped',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
}

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <div className="skeleton h-4 w-24 mb-3 rounded" />
    <div className="skeleton h-8 w-32 mb-2 rounded" />
    <div className="skeleton h-3 w-16 rounded" />
  </div>
)

const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = 0
    const end = parseFloat(value) || 0
    if (end === 0) return
    const duration = 1200
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {prefix}
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

const KPICard = ({ title, value, icon: Icon, colorClass, bgColor, textColor, prefix, suffix, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-5 shadow-sm card-hover border border-gray-50"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: bgColor }}>
        <Icon className="w-5 h-5" style={{ color: textColor }} />
      </div>
    </div>
    <p className="text-2xl font-bold" style={{ color: 'var(--blue-deep)' }}>
      <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
    </p>
  </motion.div>
)

const DashboardPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getVendorAnalytics()
        setData(res.data)
      } catch (err) {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const kpis = data
    ? [
        {
          title: "Today's Orders",
          value: data.todayOrders || 0,
          icon: HiOutlineShoppingBag,
          bgColor: '#dbeafe',
          textColor: '#1d4ed8',
          delay: 0,
        },
        {
          title: "Today's Revenue",
          value: data.todayRevenue || 0,
          icon: HiOutlineCurrencyRupee,
          bgColor: 'rgba(223,183,67,0.15)',
          textColor: '#b45309',
          prefix: '₹',
          delay: 0.05,
        },
        {
          title: 'Pending Orders',
          value: data.pendingOrders || 0,
          icon: HiOutlineClock,
          bgColor: '#fef3c7',
          textColor: '#d97706',
          delay: 0.1,
        },
        {
          title: 'Delivered Orders',
          value: data.deliveredOrders || 0,
          icon: HiOutlineCheckCircle,
          bgColor: '#d1fae5',
          textColor: '#059669',
          delay: 0.15,
        },
        {
          title: 'Cancelled Orders',
          value: data.cancelledOrders || 0,
          icon: HiOutlineXCircle,
          bgColor: '#fee2e2',
          textColor: '#dc2626',
          delay: 0.2,
        },
        {
          title: 'Total Revenue',
          value: data.totalRevenue || 0,
          icon: HiOutlineTrendingUp,
          bgColor: 'rgba(5,24,56,0.08)',
          textColor: 'var(--blue-deep)',
          prefix: '₹',
          delay: 0.25,
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--blue-deep)' }}>
            Overview
          </h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          to="/products/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{ background: 'var(--gold)', color: 'var(--blue-deep)' }}
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800">Sales Overview (Last 14 Days)</h3>
          </div>
          {loading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.salesChart || []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dfb743" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#dfb743" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#051838" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#051838" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => {
                    const d = new Date(v)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e7eb' }}
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN')}
                />
                <Legend
                  formatter={(v) => (v === 'revenue' ? 'Revenue' : 'Orders')}
                  iconType="circle"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#dfb743"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#051838"
                  strokeWidth={2}
                  fill="url(#ordersGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Best Selling Product */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-bold text-gray-800 mb-4">Best Selling Product</h3>
          {loading ? (
            <div>
              <div className="skeleton h-32 w-full rounded-xl mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ) : data?.bestProduct ? (
            <div>
              <div className="relative mb-4">
                {data.bestProduct.mainImage ? (
                  <img
                    src={data.bestProduct.mainImage}
                    alt={data.bestProduct.name}
                    className="w-full h-36 object-cover rounded-xl"
                  />
                ) : (
                  <div
                    className="w-full h-36 rounded-xl flex items-center justify-center text-4xl"
                    style={{ backgroundColor: 'rgba(223,183,67,0.1)' }}
                  >
                    📦
                  </div>
                )}
                <span
                  className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: 'var(--gold)', color: 'var(--blue-deep)' }}
                >
                  🏆 Best Seller
                </span>
              </div>
              <p className="font-semibold text-gray-800 text-sm mb-1">
                {data.bestProduct.name}
              </p>
              <p className="text-xs text-gray-500">{data.bestProduct.category}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Units Sold</span>
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(223,183,67,0.15)', color: '#b45309' }}
                >
                  {data.bestProduct.unitsSold || 0} units
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm text-gray-500">No sales yet.</p>
              <Link
                to="/products/add"
                className="mt-3 text-xs font-semibold"
                style={{ color: 'var(--gold)' }}
              >
                + Add your first product
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <Link
              to="/orders"
              className="text-xs font-semibold"
              style={{ color: 'var(--gold)' }}
            >
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          ) : data?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Order ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.slice(0, 6).map((order, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">
                        #{order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {order.user?.name || order.customerName || 'Customer'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-800">
                        ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'badge-pending'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">🛒</div>
              <p className="text-sm text-gray-500">No orders yet.</p>
            </div>
          )}
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Low Stock Alerts</h3>
            {data?.lowStockProducts?.length > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#fef3c7', color: '#92400e' }}
              >
                {data.lowStockProducts.length}
              </span>
            )}
          </div>
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))
            ) : data?.lowStockProducts?.length > 0 ? (
              data.lowStockProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}
                >
                  <HiOutlineExclamation className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{product.name}</p>
                    <p className="text-xs text-amber-600">Only {product.stock} left</p>
                  </div>
                  <Link
                    to={`/products/edit/${product._id}`}
                    className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0"
                  >
                    Update
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-gray-500">All products well stocked!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
