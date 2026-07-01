import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  CreditCard, 
  Image as ImageIcon, 
  Layers, 
  Sliders, 
  Truck, 
  Search, 
  Plus, 
  X, 
  Upload, 
  Trash2, 
  Sparkles, 
  Star 
} from 'lucide-react';
import './ProductForm.css';

// ─── Pure Utility Helpers ──────────────────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const performCanvasCrop = (imgSrc, zoom, offsetX, offsetY, aspect, callback) => {
  const img = new Image();
  img.src = imgSrc;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const width = aspect === 0.75 ? 900 : 1000;
    const height = aspect === 0.75 ? 1200 : 1000;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const imgAspect = img.width / img.height;
    const targetAspect = width / height;

    let drawWidth = width * zoom;
    let drawHeight = height * zoom;

    if (imgAspect > targetAspect) {
      drawHeight = (width / imgAspect) * zoom;
    } else {
      drawWidth = (height * imgAspect) * zoom;
    }

    const x = (width - drawWidth) / 2 + offsetX;
    const y = (height - drawHeight) / 2 + offsetY;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    callback(canvas.toDataURL('image/jpeg', 0.9));
  };
};

const ensureArrayAttributes = (attrs) => {
  if (!attrs) return [];
  if (Array.isArray(attrs)) return attrs;
  if (typeof attrs === 'object') {
    return Object.entries(attrs).map(([key, value]) => ({ key, value }));
  }
  return [];
};

export default function ProductForm({
  initialData = {},
  onSave,
  onCancel,
  isAdmin = false,
  categoriesList = [],
  catalogues = [],
  categoryConfigService
}) {
  // ─── Form States ────────────────────────────────────────────────────────
  const [product, setProduct] = useState(() => ({
    name: '',
    category: categoriesList[0] || 'Clothing',
    subCategory: '',
    catalogue: catalogues[0]?.name || 'Catalogue A',
    price: '',
    stock: '',
    description: '',
    brand: '',
    discount: 0,
    originalPrice: '',
    badge: '',
    isNewArrival: false,
    isOffer: false,
    rating: '4.8',
    reviews: '120',
    includeInLuckyCharm: false,
    luckyStock: 0,
    status: 'Active',
    ...initialData
  }));

  const [categoryConfig, setCategoryConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Media
  const [mainImage, setMainImage] = useState(product.image || '');
  const [additionalImages, setAdditionalImages] = useState(() => {
    if (Array.isArray(product.images)) return product.images;
    if (typeof product.images === 'string') return product.images.split(',').map(s => s.trim()).filter(Boolean);
    return product.image ? [product.image] : [];
  });
  const [productVideo, setProductVideo] = useState(product.video || '');

  // Dynamic config-driven states
  const [dynamicAttributes, setDynamicAttributes] = useState({});
  const [dynamicSpecs, setDynamicSpecs] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedShipping, setSelectedShipping] = useState({});
  const decodeVariants = (rawVariants, config) => {
    if (!rawVariants || !Array.isArray(rawVariants)) return [];
    const configTypes = config?.variants || [];
    return rawVariants.map(v => {
      let baseSku = v.sku || '';
      let originalPrice = v.price;
      let lowStockAlert = 5;
      let status = 'Active';
      let weight = 0.2;
      let dimensions = '10x10x10';
      let extraVariants = {};

      if (v.sku && v.sku.includes('||')) {
        try {
          const [parsedSku, jsonStr] = v.sku.split('||');
          baseSku = parsedSku;
          const meta = JSON.parse(jsonStr);
          originalPrice = meta.originalPrice !== undefined ? meta.originalPrice : v.price;
          lowStockAlert = meta.lowStockAlert !== undefined ? meta.lowStockAlert : 5;
          status = meta.status || 'Active';
          weight = meta.weight !== undefined ? meta.weight : 0.2;
          dimensions = meta.dimensions || '10x10x10';
          extraVariants = meta.extraVariants || {};
        } catch (e) {
          console.error("Error parsing serialized variant sku:", e);
        }
      }

      const decoded = {
        ...v,
        sku: baseSku,
        originalPrice,
        lowStockAlert,
        status,
        weight,
        dimensions,
        price: v.price,
        stock: v.stock,
        image: v.image
      };

      configTypes.forEach((name, idx) => {
        if (idx === 0) decoded[name] = v.color || v[name] || '';
        else if (idx === 1) decoded[name] = v.size || v[name] || '';
        else decoded[name] = extraVariants[name] || v[name] || '';
      });

      return decoded;
    });
  };

  const [variants, setVariants] = useState([]);
  const [customAttrs, setCustomAttrs] = useState({});

  // SEO fields
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDesc, setSeoMetaDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropType, setCropType] = useState('main'); // 'main' | 'gallery'
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);

  // Bulk Variant Matrix inputs
  const [bulkInputs, setBulkInputs] = useState({});

  const prevCategoryRef = useRef(null);
  const [productLoaded, setProductLoaded] = useState(false);

  // ─── Load category config on category change ─────────────────────────────
  useEffect(() => {
    const fetchConfig = async () => {
      if (product.category) {
        const config = await categoryConfigService.getCategoryConfig(product.category);
        setCategoryConfig(config);
      }
    };
    fetchConfig();
  }, [product.category, categoryConfigService]);

  // ─── Decode product variants when categoryConfig is loaded ──────────────────
  useEffect(() => {
    if (categoryConfig && !productLoaded) {
      if (initialData.variants) {
        setVariants(decodeVariants(initialData.variants, categoryConfig));
      } else {
        setVariants([]);
      }
    }
  }, [categoryConfig, productLoaded, initialData]);

  // ─── Sync configuration properties ────────────────────────────────────────
  useEffect(() => {
    if (!categoryConfig) return;

    const isCategorySwitch = prevCategoryRef.current !== null && prevCategoryRef.current !== product.category;
    prevCategoryRef.current = product.category;

    const existingAttrsArray = ensureArrayAttributes(product.attributes || {});

    // Parse attributes on first loading of edit item
    if (!productLoaded && initialData.attributes) {
      const attrsObj = {};
      const specsObj = {};
      const customObj = {};

      const standardAttrKeys = (categoryConfig.attributes || []).map(a => a.toLowerCase());
      const standardSpecKeys = (categoryConfig.specs || []).map(s => s.toLowerCase());

      // SEO Fields
      setSeoMetaTitle(product.attributes.metaTitle || '');
      setSeoMetaDesc(product.attributes.metaDescription || '');
      setSeoKeywords(product.attributes.keywords || '');
      setShortDescription(product.attributes.shortDescription || '');

      Object.entries(product.attributes).forEach(([k, v]) => {
        const lowerK = k.toLowerCase();
        if (lowerK === 'metatitle' || lowerK === 'metadescription' || lowerK === 'keywords' || lowerK === 'shortdescription') return;

        if (standardAttrKeys.includes(lowerK)) {
          attrsObj[k] = v;
        } else if (standardSpecKeys.includes(lowerK)) {
          specsObj[k] = v;
        } else {
          customObj[k] = v;
        }
      });

      // Specifications fallback
      if (initialData.specifications) {
        Object.entries(initialData.specifications).forEach(([k, v]) => {
          specsObj[k] = v;
        });
      }

      setDynamicAttributes(attrsObj);
      setDynamicSpecs(specsObj);
      setCustomAttrs(customObj);

      // Filters
      const filtObj = {};
      if (Array.isArray(product.filters)) {
        product.filters.forEach(f => { filtObj[f] = true; });
      }
      setSelectedFilters(filtObj);

      // Shipping
      const shipObj = {};
      if (Array.isArray(product.shippingOptions)) {
        product.shippingOptions.forEach(o => { shipObj[o] = true; });
      }
      setSelectedShipping(shipObj);

      setProductLoaded(true);
      return;
    }

    if (isCategorySwitch) {
      // Actively switched category: full reset of dynamic fields
      const attrsObj = {};
      (categoryConfig.attributes || []).forEach(attrName => { attrsObj[attrName] = ''; });
      setDynamicAttributes(attrsObj);

      const specsObj = {};
      (categoryConfig.specs || []).forEach(specName => { specsObj[specName] = ''; });
      setDynamicSpecs(specsObj);

      const shipObj = {};
      (categoryConfig.shippingOptions || []).forEach(o => { shipObj[o] = true; });
      setSelectedShipping(shipObj);

      const filtObj = {};
      (categoryConfig.filters || []).forEach(f => { filtObj[f] = true; });
      setSelectedFilters(filtObj);

      setCustomAttrs({});
    } else {
      // Add mode or default initialization
      setDynamicAttributes(prev => {
        const attrsObj = {};
        (categoryConfig.attributes || []).forEach(attrName => {
          const found = existingAttrsArray.find(a => a.key.toLowerCase() === attrName.toLowerCase());
          attrsObj[attrName] = prev[attrName] !== undefined ? prev[attrName] : (found ? found.value : '');
        });
        return attrsObj;
      });

      setDynamicSpecs(prev => {
        const specsObj = {};
        (categoryConfig.specs || []).forEach(specName => {
          const found = existingAttrsArray.find(a => a.key.toLowerCase() === specName.toLowerCase());
          specsObj[specName] = prev[specName] !== undefined ? prev[specName] : (found ? found.value : '');
        });
        return specsObj;
      });

      if (Object.keys(selectedShipping).length === 0 && categoryConfig.shippingOptions) {
        const shipObj = {};
        categoryConfig.shippingOptions.forEach(o => { shipObj[o] = true; });
        setSelectedShipping(shipObj);
      }

      if (Object.keys(selectedFilters).length === 0 && categoryConfig.filters) {
        const filtObj = {};
        categoryConfig.filters.forEach(f => { filtObj[f] = true; });
        setSelectedFilters(filtObj);
      }
    }
  }, [categoryConfig, product.category]);

  // ─── Calculate Original Price Automatically ──────────────────────────────
  useEffect(() => {
    const priceNum = parseFloat(product.price);
    const discountNum = parseFloat(product.discount);
    if (!isNaN(priceNum) && !isNaN(discountNum) && discountNum > 0) {
      const orig = Math.round(priceNum / (1 - discountNum / 100));
      setProduct(prev => ({ ...prev, originalPrice: orig }));
    } else if (!isNaN(priceNum)) {
      setProduct(prev => ({ ...prev, originalPrice: priceNum }));
    }
  }, [product.price, product.discount]);

  // ─── Get Active Sections / Tabs List ──────────────────────────────────────
  const activeTabs = [
    { id: 'basic', label: 'Basic Information', desc: 'Name, brand, description', icon: <Package size={16} /> },
    { id: 'pricing', label: 'Pricing & Inventory', desc: 'Price, stock & badges', icon: <CreditCard size={16} /> },
    { id: 'media', label: 'Product Media', desc: 'Images & showcase video', icon: <ImageIcon size={16} /> }
  ];

  const hasConfig = categoryConfig && categoryConfig.categoryName;

  if (categoryConfig?.attributes && categoryConfig.attributes.length > 0) {
    activeTabs.push({ id: 'attributes', label: 'Product Attributes', desc: 'Category dynamic attributes', icon: <Sliders size={16} /> });
  }
  if (categoryConfig?.variants && categoryConfig.variants.length > 0) {
    activeTabs.push({ id: 'variants', label: 'Variants', desc: 'Sizing & bulk matrix', icon: <Layers size={16} /> });
  }
  if (categoryConfig?.specs && categoryConfig.specs.length > 0) {
    activeTabs.push({ id: 'specs', label: 'Specifications', desc: 'Technical metrics', icon: <Sliders size={16} /> });
  }
  if (categoryConfig?.shippingOptions && categoryConfig.shippingOptions.length > 0) {
    activeTabs.push({ id: 'shipping', label: 'Shipping', desc: 'Delivery fulfillment', icon: <Truck size={16} /> });
  }
  if (hasConfig && categoryConfig?.filters && categoryConfig.filters.length > 0) {
    activeTabs.push({ id: 'seo', label: 'SEO Settings', desc: 'Meta tags & filter tags', icon: <Search size={16} /> });
  }
  if (hasConfig) {
    activeTabs.push({ id: 'custom_fields', label: 'Custom Fields', desc: 'Add additional custom metrics', icon: <Plus size={16} /> });
  }

  // Ensure active tab fallback if hidden
  useEffect(() => {
    const isValid = activeTabs.some(t => t.id === activeTab);
    if (!isValid) {
      setActiveTab('basic');
    }
  }, [categoryConfig, activeTab]);

  // ─── Image & Video Handlers ──────────────────────────────────────────────
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setCropImageSrc(base64);
      setCropType('main');
      setCropZoom(1.0);
      setCropOffsetX(0);
      setCropOffsetY(0);
      setCropModalOpen(true);
    } catch {
      alert('Error reading main image file.');
    }
  };

  const handleGalleryImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    try {
      const firstBase64 = await fileToBase64(files[0]);
      setCropImageSrc(firstBase64);
      setCropType('gallery');
      setCropZoom(1.0);
      setCropOffsetX(0);
      setCropOffsetY(0);
      setCropModalOpen(true);

      if (files.length > 1) {
        const remaining = await Promise.all(files.slice(1).map(fileToBase64));
        setAdditionalImages(prev => [...prev, ...remaining]);
      }
    } catch {
      alert('Error uploading gallery files.');
    }
  };

  const handleConfirmCrop = (croppedBase64) => {
    if (cropType === 'main') {
      setMainImage(croppedBase64);
    } else {
      setAdditionalImages(prev => [...prev, croppedBase64]);
    }
    setCropModalOpen(false);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('Video file size exceeds 20MB limit.');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setProductVideo(base64);
    } catch {
      alert('Error reading video file.');
    }
  };

  // ─── Drag & Drop Ordering ────────────────────────────────────────────────
  const [draggedIndex, setDraggedIndex] = useState(null);

  const makeImagePrimary = (idx) => {
    const currentMain = mainImage;
    const targetImg = additionalImages[idx];
    setMainImage(targetImg);

    const updated = [...additionalImages];
    if (currentMain) {
      updated[idx] = currentMain;
    } else {
      updated.splice(idx, 1);
    }
    setAdditionalImages(updated);
  };

  // ─── Bulk Variants Combinations Grid Generator ──────────────────────────
  const generateBulkCombinations = () => {
    const variantNames = categoryConfig?.variants || [];
    const lists = variantNames.map(name => {
      const val = bulkInputs[name] || '';
      return val.split(',').map(s => s.trim()).filter(Boolean);
    });

    if (lists.every(list => list.length === 0)) {
      alert('Please fill in at least one option list to generate variants!');
      return;
    }

    const cartesian = (arrays) =>
      arrays.reduce((acc, curr) => {
        if (curr.length === 0) return acc;
        if (acc.length === 0) return curr.map(item => [item]);
        const next = [];
        acc.forEach(prevItems => {
          curr.forEach(item => {
            next.push([...prevItems, item]);
          });
        });
        return next;
      }, []);

    const combos = cartesian(lists);
    const generated = [];
    const prodCode = String(product.name || 'PROD').substring(0, 4).toUpperCase();

    combos.forEach((combo) => {
      const variantData = {};
      const skuParts = [prodCode];

      variantNames.forEach((name, idx) => {
        const val = combo[idx] || '';
        variantData[name] = val;
        skuParts.push(val ? val.substring(0, 3).toUpperCase() : 'DEF');
      });

      const sku = skuParts.join('-');
      const exists = variants.some(v =>
        variantNames.every(name => (v[name] || '').toLowerCase() === (variantData[name] || '').toLowerCase())
      );

      if (!exists) {
        generated.push({
          ...variantData,
          color: variantData['Color'] || variantData['Ink Color'] || '',
          size: variantData['Size'] || variantData['Age'] || variantData['Pack Size'] || '',
          style: variantData['Theme'] || '',
          price: product.price ? parseFloat(product.price) : null,
          stock: 10,
          lowStockAlert: 5,
          sku,
          weight: 0.2,
          L: 10, W: 10, H: 10,
          image: ''
        });
      }
    });

    setVariants([...variants, ...generated]);
    setBulkInputs({});
    alert(`Generated ${generated.length} variations!`);
  };

  // ─── Form Submission Handler ─────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();

    // Run dynamic config validation rules
    if (categoryConfig?.validationRules) {
      const rules = categoryConfig.validationRules;
      if (rules.name) {
        if (rules.name.required && !product.name) {
          alert('Product name is required.');
          return;
        }
        if (rules.name.minLength && product.name.length < rules.name.minLength) {
          alert(`Product name must be at least ${rules.name.minLength} characters.`);
          return;
        }
      }
      if (rules.price) {
        const pNum = parseFloat(product.price) || 0;
        if (rules.price.required && !product.price) {
          alert('Price is required.');
          return;
        }
        if (rules.price.min && pNum < rules.price.min) {
          alert(`Price must be at least ₹${rules.price.min} for category ${product.category}.`);
          return;
        }
      }
      if (rules.stock && activeTabs.some(t => t.id === 'variants')) {
        const sNum = parseInt(product.stock, 10) || 0;
        if (rules.stock.required && isNaN(sNum)) {
          alert('Opening stock is required.');
          return;
        }
        if (rules.stock.min && sNum < rules.stock.min) {
          alert(`Stock must be at least ${rules.stock.min}.`);
          return;
        }
      }
    }

    if (variants.length > 0) {
      const missingImage = variants.some(v => !v.image || !v.image.trim());
      if (missingImage) {
        alert("Each product variant must have an image uploaded! Please upload an image for all variants.");
        return;
      }
    }

    // Merge attributes, specs, SEO, and custom attributes into standard maps
    const finalAttributes = {};
    Object.entries(dynamicAttributes).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') finalAttributes[k] = v;
    });
    Object.entries(dynamicSpecs).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') finalAttributes[k] = v;
    });
    Object.entries(customAttrs).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') finalAttributes[k] = v;
    });

    // Merge SEO
    if (seoMetaTitle) finalAttributes.metaTitle = seoMetaTitle;
    if (seoMetaDesc) finalAttributes.metaDescription = seoMetaDesc;
    if (seoKeywords) finalAttributes.keywords = seoKeywords;
    if (shortDescription) finalAttributes.shortDescription = shortDescription;

    const activeFiltersList = Object.keys(selectedFilters).filter(k => selectedFilters[k]);
    const activeShippingList = Object.keys(selectedShipping).filter(k => selectedShipping[k]);

    const serializedVariants = variants.map(v => {
      const configTypes = categoryConfig?.variants || [];
      const baseSku = v.sku || 'VAR';
      
      const extraVariants = {};
      configTypes.forEach((name, idx) => {
        if (idx >= 2) {
          extraVariants[name] = v[name] || '';
        }
      });

      const meta = {
        originalPrice: v.originalPrice !== null && v.originalPrice !== undefined && v.originalPrice !== '' ? parseFloat(v.originalPrice) : null,
        lowStockAlert: v.lowStockAlert !== undefined ? parseInt(v.lowStockAlert, 10) : 5,
        status: v.status || 'Active',
        weight: v.weight !== undefined ? parseFloat(v.weight) : 0.2,
        dimensions: v.dimensions || '10x10x10',
        extraVariants
      };

      const serializedSku = `${baseSku}||${JSON.stringify(meta)}`;

      const dbVar = {
        color: v[configTypes[0]] || '',
        size: v[configTypes[1]] || '',
        stock: parseInt(v.stock, 10) || 0,
        price: v.price !== null && v.price !== undefined && v.price !== '' ? parseFloat(v.price) : null,
        sku: serializedSku,
        image: v.image
      };

      configTypes.forEach((name, idx) => {
        dbVar[name] = v[name] || '';
      });

      return dbVar;
    });

    const payload = {
      ...product,
      price: parseFloat(product.price),
      stock: variants.length > 0 ? variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0) : parseInt(product.stock, 10) || 0,
      discount: parseFloat(product.discount) || 0,
      originalPrice: parseFloat(product.originalPrice) || null,
      image: mainImage,
      images: additionalImages.length > 0 ? additionalImages : (mainImage ? [mainImage] : []),
      video: productVideo,
      attributes: finalAttributes,
      specifications: dynamicSpecs,
      filters: activeFiltersList,
      shippingOptions: activeShippingList,
      variants: serializedVariants
    };

    onSave(payload);
  };

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form-layout">
        
        {/* Left Navigation Sidebar */}
        <div className="product-form-sidebar">
          {activeTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`product-form-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <div className="tab-text">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-desc">{tab.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Scrollable Content Pane */}
        <div className="product-form-content-pane">

          {/* TAB: Basic Information */}
          {activeTab === 'basic' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <Package className="header-icon" size={18} />
                <h3>Basic Information</h3>
              </div>

              <div className="product-form-field">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="e.g. Premium Cotton Casual Shirt"
                  required
                  className="product-form-input"
                />
              </div>

              <div className="product-form-grid-2">
                <div className="product-form-field">
                  <label>Category *</label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    className="product-form-select"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="product-form-field">
                  <label>SubCategory</label>
                  <input
                    type="text"
                    value={product.subCategory}
                    onChange={(e) => setProduct({ ...product, subCategory: e.target.value })}
                    placeholder="e.g. Casual Wear"
                    className="product-form-input"
                  />
                </div>
              </div>

              <div className="product-form-grid-2">
                <div className="product-form-field">
                  <label>Catalogue</label>
                  <select
                    value={product.catalogue}
                    onChange={(e) => setProduct({ ...product, catalogue: e.target.value })}
                    className="product-form-select"
                  >
                    {catalogues.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="product-form-field">
                  <label>Brand Name</label>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                    placeholder="e.g. Mithira Collection"
                    className="product-form-input"
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="product-form-grid-3">
                  <div className="product-form-field">
                    <label>Status</label>
                    <select
                      value={product.status}
                      onChange={(e) => setProduct({ ...product, status: e.target.value })}
                      className="product-form-select"
                    >
                      <option value="Active">Active</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="product-form-field">
                    <label>Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={product.rating}
                      onChange={(e) => setProduct({ ...product, rating: e.target.value })}
                      className="product-form-input"
                    />
                  </div>
                  <div className="product-form-field">
                    <label>Reviews Count</label>
                    <input
                      type="number"
                      value={product.reviews}
                      onChange={(e) => setProduct({ ...product, reviews: e.target.value })}
                      className="product-form-input"
                    />
                  </div>
                </div>
              )}

              <div className="product-form-field">
                <label>Short Description</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Enter a brief teaser / short description for details page..."
                  className="product-form-textarea"
                />
              </div>

              <div className="product-form-field">
                <label>Description</label>
                <textarea
                  rows={4}
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  placeholder="Provide sizing instructions, quality metrics, and other details..."
                  className="product-form-textarea"
                />
              </div>
            </div>
          )}

          {/* TAB: Pricing & Inventory */}
          {activeTab === 'pricing' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <CreditCard className="header-icon" size={18} />
                <h3>Pricing & Inventory</h3>
              </div>

              <div className="product-form-grid-3">
                <div className="product-form-field">
                  <label>Price (INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    placeholder="999"
                    required
                    className="product-form-input"
                  />
                </div>
                <div className="product-form-field">
                  <label>Discount %</label>
                  <input
                    type="number"
                    value={product.discount}
                    onChange={(e) => setProduct({ ...product, discount: e.target.value })}
                    placeholder="10"
                    className="product-form-input"
                  />
                </div>
                <div className="product-form-field">
                  <label>Original Price</label>
                  <input
                    type="number"
                    value={product.originalPrice}
                    readOnly
                    placeholder="Calculated"
                    className="product-form-input"
                  />
                </div>
              </div>

              {/* Only show stock input if Variants is NOT configured */}
              {!(categoryConfig?.variants && categoryConfig.variants.length > 0) && (
                <div className="product-form-field" style={{ maxWidth: '33.33%' }}>
                  <label>Stock Inventory *</label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                    placeholder="50"
                    required
                    className="product-form-input"
                  />
                </div>
              )}

              <div className="product-form-field">
                <label>Badges & Tags</label>
                <input
                  type="text"
                  value={product.badge}
                  onChange={(e) => setProduct({ ...product, badge: e.target.value })}
                  placeholder="e.g. Selling Fast, Premium, Custom"
                  className="product-form-input"
                />
              </div>

              <div className="product-form-checkbox-group">
                <label className="product-form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={product.isNewArrival}
                    onChange={(e) => setProduct({ ...product, isNewArrival: e.target.checked })}
                    className="product-form-checkbox"
                  />
                  Flag as New Arrival
                </label>
                <label className="product-form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={product.isOffer}
                    onChange={(e) => setProduct({ ...product, isOffer: e.target.checked })}
                    className="product-form-checkbox"
                  />
                  Put on Special Offer
                </label>
              </div>

              {isAdmin && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                  <div className="product-form-card-header" style={{ paddingBottom: '8px', marginBottom: '14px', borderBottom: 'none' }}>
                    <Sparkles className="header-icon" size={16} />
                    <h3 style={{ fontSize: '0.92rem' }}>Lucky Charm Settings</h3>
                  </div>
                  <div className="product-form-grid-2">
                    <div className="product-form-field">
                      <label>Include in Lucky Charm</label>
                      <select
                        value={product.includeInLuckyCharm ? 'Yes' : 'No'}
                        onChange={(e) => setProduct({ ...product, includeInLuckyCharm: e.target.value === 'Yes' })}
                        className="product-form-select"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {product.includeInLuckyCharm && (
                      <div className="product-form-field">
                        <label>Lucky Stock</label>
                        <input
                          type="number"
                          value={product.luckyStock}
                          onChange={(e) => setProduct({ ...product, luckyStock: parseInt(e.target.value, 10) || 0 })}
                          placeholder="50"
                          className="product-form-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Product Media */}
          {activeTab === 'media' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <ImageIcon className="header-icon" size={18} />
                <h3>Product Media Gallery</h3>
              </div>

              {/* Main Image */}
              <div className="product-form-field">
                <label>Main Product Image *</label>
                {mainImage ? (
                  <div className="product-form-media-preview-box" style={{ maxWidth: '320px' }}>
                    <img src={mainImage} alt="Main Preview" />
                    <button
                      type="button"
                      onClick={() => setMainImage('')}
                      className="product-form-media-remove-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="product-form-media-upload">
                    <label className="cursor-pointer">
                      <Upload className="mx-auto text-amber-500 mb-2" size={24} />
                      <span className="block text-xs font-semibold text-slate-700">Drag or click to upload main image</span>
                      <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="product-form-field">
                <label>Gallery Images (comma separated URLs or upload below)</label>
                <input
                  type="text"
                  value={additionalImages.join(', ')}
                  onChange={(e) => setAdditionalImages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g. url1.jpg, url2.jpg"
                  className="product-form-input"
                  style={{ marginBottom: '12px' }}
                />

                {additionalImages.length > 0 && (
                  <div className="product-form-gallery-grid">
                    {additionalImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="product-form-gallery-item"
                        draggable
                        onDragStart={() => setDraggedIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedIndex === null || draggedIndex === idx) return;
                          const reordered = [...additionalImages];
                          const temp = reordered[draggedIndex];
                          reordered.splice(draggedIndex, 1);
                          reordered.splice(idx, 0, temp);
                          setAdditionalImages(reordered);
                          setDraggedIndex(null);
                        }}
                      >
                        <img src={img} alt={`Gallery ${idx}`} />
                        <button
                          type="button"
                          onClick={() => makeImagePrimary(idx)}
                          className="product-form-gallery-primary-badge"
                        >
                          Primary
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                          className="product-form-media-remove-btn"
                          style={{ top: '4px', right: '4px', width: '18px', height: '18px' }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="product-form-media-upload" style={{ padding: '16px', marginTop: '12px' }}>
                  <label className="cursor-pointer flex items-center justify-center gap-2">
                    <Plus className="text-amber-500" size={18} />
                    <span className="text-xs font-semibold text-slate-700">Add Gallery Images</span>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Product Video */}
              <div className="product-form-field">
                <label>Product Video (MP4 max 20MB)</label>
                {productVideo ? (
                  <div className="product-form-media-preview-box" style={{ maxWidth: '320px', background: '#000' }}>
                    <video src={productVideo} controls />
                    <button
                      type="button"
                      onClick={() => setProductVideo('')}
                      className="product-form-media-remove-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="product-form-media-upload" style={{ padding: '16px' }}>
                    <label className="cursor-pointer flex items-center justify-center gap-2">
                      <Upload className="text-amber-500" size={18} />
                      <span className="text-xs font-semibold text-slate-700">Upload Showcase Video</span>
                      <input type="file" accept="video/mp4" onChange={handleVideoUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* TAB: Attributes */}
          {activeTab === 'attributes' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <Sliders className="header-icon" size={18} />
                <h3>Product Attributes</h3>
              </div>

              <div className="product-form-grid-2">
                {categoryConfig?.attributes?.map(attrName => (
                  <div key={attrName} className="product-form-field">
                    <label>{attrName}</label>
                    <input
                      type="text"
                      value={dynamicAttributes[attrName] || ''}
                      onChange={(e) => setDynamicAttributes({ ...dynamicAttributes, [attrName]: e.target.value })}
                      placeholder={`Enter ${attrName}`}
                      className="product-form-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Variants */}
          {activeTab === 'variants' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <Layers className="header-icon" size={18} />
                <h3>Product Variations</h3>
              </div>

              {/* Bulk Generator */}
              <div className="product-form-bulk-generator">
                <h4 className="product-form-bulk-generator-title">⚡ Dynamic Variations Generator</h4>
                <div className="product-form-grid-3">
                  {categoryConfig?.variants?.map(varName => (
                    <div key={varName} className="product-form-field">
                      <label>{varName}s (Comma separated)</label>
                      <input
                        type="text"
                        value={bulkInputs[varName] || ''}
                        onChange={(e) => setBulkInputs({ ...bulkInputs, [varName]: e.target.value })}
                        placeholder="Red, Green, Blue"
                        className="product-form-input"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={generateBulkCombinations}
                  className="product-form-btn product-form-btn-gold"
                  style={{ width: '100%', fontSize: '0.78rem', marginTop: '12px' }}
                >
                  Generate Grid Matrix
                </button>
              </div>

              {/* Variants Grid Table */}
              <div className="product-form-table-wrap">
                <table className="product-form-table">
                  <thead>
                    <tr>
                      {categoryConfig?.variants?.map(varName => (
                        <th key={varName}>{varName}</th>
                      ))}
                      <th>SKU</th>
                      <th>Selling Price (₹)</th>
                      <th>Original Price (₹)</th>
                      <th>Stock Qty</th>
                      <th>Low Stock Alert</th>
                      <th>Status</th>
                      <th>Weight (kg)</th>
                      <th>Dimensions (LxWxH cm)</th>
                      <th>Image</th>
                      <th style={{ textAlign: 'center' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, index) => (
                      <tr key={index}>
                        {categoryConfig?.variants?.map(varName => (
                          <td key={varName}>
                            <input
                              type="text"
                              value={v[varName] || ''}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[index][varName] = e.target.value;
                                if (varName === 'Color') copy[index].color = e.target.value;
                                if (varName === 'Size') copy[index].size = e.target.value;
                                setVariants(copy);
                              }}
                              className="product-form-table-input"
                            />
                          </td>
                        ))}
                        <td>
                          <input
                            type="text"
                            value={v.sku || ''}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].sku = e.target.value;
                              setVariants(copy);
                            }}
                            className="product-form-table-input"
                            style={{ minWidth: '100px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={v.price === null || v.price === undefined ? '' : v.price}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].price = e.target.value === '' ? null : parseFloat(e.target.value);
                              setVariants(copy);
                            }}
                            placeholder="Selling"
                            className="product-form-table-input"
                            style={{ minWidth: '80px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={v.originalPrice === null || v.originalPrice === undefined ? '' : v.originalPrice}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].originalPrice = e.target.value === '' ? null : parseFloat(e.target.value);
                              setVariants(copy);
                            }}
                            placeholder="Original"
                            className="product-form-table-input"
                            style={{ minWidth: '80px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={v.stock || 0}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].stock = parseInt(e.target.value, 10) || 0;
                              setVariants(copy);
                            }}
                            className="product-form-table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={v.lowStockAlert === undefined ? 5 : v.lowStockAlert}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].lowStockAlert = parseInt(e.target.value, 10) || 0;
                              setVariants(copy);
                            }}
                            className="product-form-table-input"
                          />
                        </td>
                        <td>
                          <select
                            value={v.status || 'Active'}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].status = e.target.value;
                              setVariants(copy);
                            }}
                            className="product-form-table-select"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={v.weight === undefined ? 0.2 : v.weight}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].weight = parseFloat(e.target.value) || 0;
                              setVariants(copy);
                            }}
                            className="product-form-table-input"
                            style={{ minWidth: '60px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={v.dimensions || '10x10x10'}
                            onChange={(e) => {
                              const copy = [...variants];
                              copy[index].dimensions = e.target.value;
                              setVariants(copy);
                            }}
                            placeholder="LxWxH"
                            className="product-form-table-input"
                            style={{ minWidth: '80px' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {v.image && (
                              <img src={v.image} alt="Variant" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px' }} />
                            )}
                            <label className="cursor-pointer" style={{ padding: '4px', background: '#e2e8f0', borderRadius: '4px', display: 'inline-flex' }}>
                              <Upload size={12} />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const base64 = await fileToBase64(file);
                                    const copy = [...variants];
                                    copy[index].image = base64;
                                    setVariants(copy);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setVariants(prev => prev.filter((_, i) => i !== index))}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => {
                  const empty = {
                    sku: `VAR-${variants.length}`,
                    price: null,
                    originalPrice: null,
                    stock: 10,
                    lowStockAlert: 5,
                    status: 'Active',
                    weight: 0.2,
                    dimensions: '10x10x10',
                    image: ''
                  };
                  categoryConfig?.variants?.forEach(name => { empty[name] = ''; });
                  setVariants([...variants, empty]);
                }}
                className="product-form-btn product-form-btn-secondary"
                style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                Add Variation Row
              </button>
            </div>
          )}

          {/* TAB: Specifications */}
          {activeTab === 'specs' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <Sliders className="header-icon" size={18} />
                <h3>Specifications</h3>
              </div>

              <div className="product-form-grid-2">
                {categoryConfig?.specs?.map(specName => (
                  <div key={specName} className="product-form-field">
                    <label>{specName}</label>
                    <input
                      type="text"
                      value={dynamicSpecs[specName] || ''}
                      onChange={(e) => setDynamicSpecs({ ...dynamicSpecs, [specName]: e.target.value })}
                      placeholder={`Enter ${specName}`}
                      className="product-form-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Shipping */}
          {activeTab === 'shipping' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <Truck className="header-icon" size={18} />
                <h3>Fulfillment & Shipping Options</h3>
              </div>

              <div className="product-form-checkbox-group" style={{ flexDirection: 'column', gap: '12px' }}>
                {categoryConfig?.shippingOptions?.map(option => (
                  <label key={option} className="product-form-checkbox-label" style={{ border: '1px solid #f1f5f9', padding: '12px', borderRadius: '10px', width: '100%' }}>
                    <input
                      type="checkbox"
                      checked={selectedShipping[option] !== false}
                      onChange={(e) => setSelectedShipping({ ...selectedShipping, [option]: e.target.checked })}
                      className="product-form-checkbox"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SEO */}
          {activeTab === 'seo' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header">
                <Search className="header-icon" size={18} />
                <h3>Search Engine Optimization (SEO)</h3>
              </div>

              <div className="product-form-field">
                <label>Meta Title</label>
                <input
                  type="text"
                  value={seoMetaTitle}
                  onChange={(e) => setSeoMetaTitle(e.target.value)}
                  placeholder="Meta title for Google listings"
                  className="product-form-input"
                />
              </div>

              <div className="product-form-field">
                <label>Meta Description</label>
                <textarea
                  rows={3}
                  value={seoMetaDesc}
                  onChange={(e) => setSeoMetaDesc(e.target.value)}
                  placeholder="Meta description for search engine result snips"
                  className="product-form-textarea"
                />
              </div>

              <div className="product-form-field">
                <label>Search Keywords / Discovery Tags</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="e.g. cotton, casual, brand, wear (comma separated)"
                  className="product-form-input"
                />
              </div>

              {categoryConfig?.filters && categoryConfig.filters.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                  <div className="product-form-card-header" style={{ paddingBottom: '8px', marginBottom: '14px', borderBottom: 'none' }}>
                    <Search className="header-icon" size={16} />
                    <h3 style={{ fontSize: '0.92rem' }}>Customer Site Navigation Filters</h3>
                  </div>
                  <div className="product-form-checkbox-group">
                    {categoryConfig.filters.map(filterName => (
                      <label key={filterName} className="product-form-checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!selectedFilters[filterName]}
                          onChange={(e) => setSelectedFilters({ ...selectedFilters, [filterName]: e.target.checked })}
                          className="product-form-checkbox"
                        />
                        {filterName} Filter
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Custom Attributes */}
          {activeTab === 'custom_fields' && (
            <div className="product-form-card animate-fade-in">
              <div className="product-form-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Plus className="header-icon" size={18} />
                  <h3>Custom Specifications</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const label = prompt('Enter custom specifications key (e.g. Model, Country of Origin, Warranty):');
                    if (label && label.trim()) {
                      setCustomAttrs({ ...customAttrs, [label.trim()]: '' });
                    }
                  }}
                  className="product-form-btn product-form-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                >
                  + Add Custom Field
                </button>
              </div>

              {Object.keys(customAttrs).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.82rem', background: '#fafafa', borderRadius: '10px', border: '1px dashed #e2e8f0' }}>
                  No custom attributes added yet. Click "+ Add Custom Field" to extend specs.
                </div>
              ) : (
                <div className="product-form-grid-2">
                  {Object.keys(customAttrs).map(keyName => (
                    <div key={keyName} className="product-form-field" style={{ position: 'relative' }}>
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{keyName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = { ...customAttrs };
                            delete copy[keyName];
                            setCustomAttrs(copy);
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                        >
                          Remove
                        </button>
                      </label>
                      <input
                        type="text"
                        value={customAttrs[keyName] || ''}
                        onChange={(e) => setCustomAttrs({ ...customAttrs, [keyName]: e.target.value })}
                        placeholder={`Enter value for ${keyName}`}
                        className="product-form-input"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="product-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="product-form-btn product-form-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="product-form-btn product-form-btn-primary"
            >
              Save Product Data
            </button>
          </div>

        </div>

      </form>

      {/* Visual Canvas Cropping Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[9999]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', padding: '16px', position: 'fixed' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#051838', margin: 0 }}>Crop Product Image</h3>
              <button type="button" onClick={() => setCropModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ height: '280px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: product.category?.toLowerCase().includes('clothing') ? '170px' : '230px',
                  height: '230px',
                  border: '2px dashed #051838',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={cropImageSrc}
                    alt="Crop Preview"
                    style={{
                      transform: `scale(${cropZoom}) translate(${cropOffsetX}px, ${cropOffsetY}px)`,
                      transition: 'transform 0.05s ease-out',
                      maxWidth: 'none',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      position: 'absolute'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Zoom: {cropZoom.toFixed(1)}x</label>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#051838' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Horizontal Shift</label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={cropOffsetX}
                    onChange={(e) => setCropOffsetX(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#051838' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Vertical Shift</label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={cropOffsetY}
                    onChange={(e) => setCropOffsetY(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#051838' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="product-form-btn product-form-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="product-form-btn product-form-btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    const aspect = product.category?.toLowerCase().includes('clothing') ? 0.75 : 1.0;
                    performCanvasCrop(cropImageSrc, cropZoom, cropOffsetX, cropOffsetY, aspect, handleConfirmCrop);
                  }}
                >
                  Confirm Crop
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
