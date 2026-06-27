import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getVendorProducts, deleteVendorProduct } from '../services/api'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const res = await getVendorProducts()
      setProducts(res.data?.products || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    try {
      await deleteVendorProduct(id)
      setProducts(p => p.filter(x => x.id !== id))
    } catch (err) {
      alert('Failed to delete product.')
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const statusColor = s => s === 'Active' ? 'bg-green-100 text-green-800' : s === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} products total</p>
        </div>
        <Link to="/products/add" className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ background: '#dfb743' }}>
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
        >
          {['All', 'Pending', 'Active', 'Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading products...</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No products yet</h3>
          <p className="text-slate-500 mb-6">Add your first product to start selling on MithraShoppy</p>
          <Link to="/products/add" className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: '#dfb743' }}>
            Add First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['#', 'Image', 'Product Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">IMG</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-600">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(p.status)}`} title={p.status === 'Pending' ? 'Awaiting admin approval' : ''}>
                        {p.status}
                      </span>
                      {p.rejectReason && <p className="text-xs text-red-500 mt-1">{p.rejectReason}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/products/edit/${p.id}`} className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors">Edit</Link>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    style={n === page ? { background: '#051838' } : {}}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
