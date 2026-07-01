import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiOutlineChevronLeft } from 'react-icons/hi';
import { createVendorProduct, updateVendorProduct, getVendorProducts } from '../services/api';
import { categoryConfigService } from '../services/categoryConfigService';
import ProductForm from '../components/ProductForm';

export default function AddEditProduct() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categoriesList, setCategoriesList] = useState([]);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const cataloguesList = [
    { name: 'Catalogue A' },
    { name: 'Catalogue B' }
  ];

  // Load categories list on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catsList = await categoryConfigService.getCategories();
        const activeCats = catsList.filter(c => c.status === 'Active');
        const getPath = (catName) => {
          const cat = catsList.find(c => c.name === catName);
          if (!cat) return catName;
          if (!cat.parent || cat.parent === '—') return cat.name;
          return `${getPath(cat.parent)} > ${cat.name}`;
        };
        const paths = activeCats.map(c => getPath(c.name));
        setCategoriesList(paths);
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    };
    loadCategories();
  }, []);

  // Load product details if editing
  useEffect(() => {
    if (isEdit) {
      const fetchProductDetails = async () => {
        try {
          setInitialLoading(true);
          const res = await getVendorProducts();
          const products = res.data?.products || res.data || [];
          const prod = products.find(p => p.id == id);
          
          if (!prod) {
            setError('Product not found or access denied.');
            return;
          }
          setProductData(prod);
        } catch (err) {
          setError('Failed to fetch product details.');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchProductDetails();
    }
  }, [id, isEdit]);

  const handleSave = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await updateVendorProduct(id, payload);
      } else {
        await createVendorProduct(payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-slate-400">Loading product info...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
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

      {loading && (
        <div className="bg-blue-50 text-blue-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span>⏳</span> Saving product data, please wait...
        </div>
      )}

      <ProductForm
        initialData={productData || {}}
        onSave={handleSave}
        onCancel={handleCancel}
        isAdmin={false}
        categoriesList={categoriesList}
        catalogues={cataloguesList}
        categoryConfigService={categoryConfigService}
      />
    </div>
  );
}
