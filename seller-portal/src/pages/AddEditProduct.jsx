import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { HiOutlineChevronLeft, HiOutlineUpload, HiOutlineX, HiOutlinePlus } from 'react-icons/hi'
import { createVendorProduct, updateVendorProduct, getVendorProducts } from '../services/api'

const CATEGORIES = [
  'Clothing > Men',
  'Clothing > Women',
  'Clothing > Kids',
  'Electronics > Mobile',
  'Electronics > Laptop',
  'Electronics > Accessories',
  'Home & Living > Kitchen',
  'Home & Living > Decor',
  'Stationery',
  'Gifts',
  'Accessories',
  'Other'
]

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

export default function AddEditProduct() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [error, setError] = useState(null)
  
  const [mainImage, setMainImage] = useState('')
  const [additionalImages, setAdditionalImages] = useState([])
  const [attributes, setAttributes] = useState([])
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      category: 'Clothing > Men',
      subCategory: '',
      catalogue: 'Catalogue A',
      price: '',
      stock: '',
      description: '',
      brand: '',
      discount: 0,
      originalPrice: '',
      badge: '',
      isNewArrival: false,
      isOffer: false,
    }
  })

  const watchPrice = watch('price')
  const watchDiscount = watch('discount')

  // Calculate originalPrice automatically if price and discount are provided
  useEffect(() => {
    const priceNum = parseFloat(watchPrice)
    const discountNum = parseFloat(watchDiscount)
    if (!isNaN(priceNum) && !isNaN(discountNum) && discountNum > 0) {
      const orig = Math.round(priceNum / (1 - discountNum / 100))
      setValue('originalPrice', orig)
    } else if (!isNaN(priceNum)) {
      setValue('originalPrice', priceNum)
    }
  }, [watchPrice, watchDiscount, setValue])

  useEffect(() => {
    if (isEdit) {
      fetchProductDetails()
    }
  }, [id])

  async function fetchProductDetails() {
    try {
      setInitialLoading(true)
      const res = await getVendorProducts()
      const products = res.data?.products || res.data || []
      const prod = products.find(p => p.id == id)
      
      if (!prod) {
        setError('Product not found or access denied.')
        return
      }

      // Populate form
      setValue('name', prod.name || '')
      setValue('category', prod.category || 'Clothing > Men')
      setValue('subCategory', prod.subCategory || '')
      setValue('catalogue', prod.catalogue || 'Catalogue A')
      setValue('price', prod.price || '')
      setValue('stock', prod.stock || '')
      setValue('description', prod.description || '')
      setValue('brand', prod.brand || '')
      setValue('discount', prod.discount || 0)
      setValue('originalPrice', prod.originalPrice || '')
      setValue('badge', prod.badge || '')
      setValue('isNewArrival', !!prod.isNewArrival)
      setValue('isOffer', !!prod.isOffer)
      
      setMainImage(prod.image || '')
      setAdditionalImages(prod.images || [])
      setAttributes(prod.attributes || [])
    } catch (err) {
      setError('Failed to fetch product details.')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const base64 = await fileToBase64(file)
      setMainImage(base64)
    } catch (err) {
      alert('Error reading image file.')
    }
  }

  const handleAddImagesChange = async (e) => {
    const files = Array.from(e.target.files)
    try {
      const base64Array = await Promise.all(files.map(fileToBase64))
      setAdditionalImages(prev => [...prev, ...base64Array])
    } catch (err) {
      alert('Error reading image files.')
    }
  }

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  const addAttribute = () => {
    if (!attrKey.trim() || !attrValue.trim()) return
    setAttributes(prev => [...prev, { key: attrKey.trim(), value: attrValue.trim() }])
    setAttrKey('')
    setAttrValue('')
  }

  const removeAttribute = (index) => {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock, 10),
        discount: parseFloat(data.discount) || 0,
        originalPrice: parseFloat(data.originalPrice) || null,
        image: mainImage,
        images: additionalImages.length > 0 ? additionalImages : (mainImage ? [mainImage] : []),
        attributes
      }

      if (isEdit) {
        await updateVendorProduct(id, payload)
      } else {
        await createVendorProduct(payload)
      }
      navigate('/products')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-slate-400">Loading product info...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back button */}
      <Link to="/products" className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-6 font-medium text-sm gap-1.5 transition-colors">
        <HiOutlineChevronLeft className="w-5 h-5" />
        Back to Products
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-slate-500 text-sm mt-1">Products require administrator approval before going live on MithraShoppy.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Form Fields */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">Product Specifications</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Cotton Casual Shirt"
                  {...register('name', { required: 'Product name is required' })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    {...register('category', { required: true })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sub Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Slim Fit"
                    {...register('subCategory')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price (INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="999"
                    {...register('price', { required: 'Price is required', min: { value: 1, message: 'Price must be positive' } })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Discount %</label>
                  <input
                    type="number"
                    placeholder="10"
                    {...register('discount', { min: 0, max: 90 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Original Price</label>
                  <input
                    type="number"
                    placeholder="Calculated"
                    readOnly
                    {...register('originalPrice')}
                    className="w-full px-4 py-2.5 border border-slate-100 bg-slate-50 text-slate-500 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stock Inventory *</label>
                  <input
                    type="number"
                    placeholder="50"
                    {...register('stock', { required: 'Stock count is required', min: { value: 0, message: 'Stock cannot be negative' } })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Zara"
                    {...register('brand')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Tell customers details about sizing, quality, materials..."
                  {...register('description')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>
            </div>

            {/* Attributes Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">Technical Attributes</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. Material)"
                  value={attrKey}
                  onChange={e => setAttrKey(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 100% Cotton)"
                  value={attrValue}
                  onChange={e => setAttrValue(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  onClick={addAttribute}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>

              {attributes.length > 0 && (
                <div className="divide-y divide-slate-50 bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-2">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <span className="font-semibold text-slate-600">{attr.key}: <span className="font-normal text-slate-500">{attr.value}</span></span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(idx)}
                        className="text-red-500 hover:text-red-700 p-1 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Images & Options */}
          <div className="space-y-6">
            {/* Image Uploads */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">Product Media</h2>

              {/* Main Image */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Product Image *</label>
                {mainImage ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200">
                    <img src={mainImage} alt="Main Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMainImage('')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-yellow-400 cursor-pointer transition-colors text-slate-400">
                    <HiOutlineUpload className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold text-slate-500">Upload main image</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Additional Gallery Images</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-100 aspect-square">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                      >
                        <HiOutlineX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center justify-center border border-dashed border-slate-200 rounded-xl py-3 hover:border-yellow-400 cursor-pointer transition-colors text-slate-500 text-xs font-semibold gap-1.5">
                  <HiOutlinePlus className="w-4 h-4" />
                  Upload Gallery Images
                  <input type="file" accept="image/*" multiple onChange={handleAddImagesChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Styling/Badging options */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">Badges & Options</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Product Tag / Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Hot, New, Selling Fast"
                  {...register('badge')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('isNewArrival')}
                    className="w-4.5 h-4.5 text-yellow-500 border-slate-300 rounded focus:ring-yellow-400"
                  />
                  <span className="text-sm font-semibold text-slate-700">Flag as New Arrival</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('isOffer')}
                    className="w-4.5 h-4.5 text-yellow-500 border-slate-300 rounded focus:ring-yellow-400"
                  />
                  <span className="text-sm font-semibold text-slate-700">Put on Special Offer</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                to="/products"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-center font-bold text-slate-600 hover:bg-slate-50 text-sm transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white text-sm transition-all text-center flex items-center justify-center"
                style={{ background: 'var(--blue-deep)' }}
              >
                {loading ? 'Saving...' : 'Submit Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
