import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Eye, X, ShoppingCart, Heart, ArrowRight, ArrowLeft, 
  ChevronDown, ChevronUp, Menu, Star, Shirt, BookOpen, Gift, Crown, Check
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import clothingUser1 from '../assets/clothing_user_1.jpg';
import clothingUser2 from '../assets/clothing_user_2.jpg';
import { apiService } from '../services/apiService';
import { resolveProductImage, resolveProductGallery, isRealImg } from '../utils/imageHelper';
import { useToast } from './ToastProvider';

import imgClothing from '../assets/hero_clothing_banner.jpg';
import imgStationery from '../assets/hero_stationery.jpg';
import imgGifts from '../assets/hero_gifts.jpg';
import imgAccessories from '../assets/hero_accessories.jpg';

// Helper to get hex colors for bullets
const getColorHex = (name) => {
  if (!name) return '#cccccc';
  const colors = {
    'white': '#ffffff',
    'black': '#111111',
    'pink': '#ff80ab',
    'red': '#e53935',
    'yellow': '#fdd835',
    'green': '#43a047',
    'purple': '#8e24aa',
    'blue': 'hsla(225, 75%, 45%, 1)',
    'darkred': '#b71c1c',
    'crimson red': '#b32142',
    'champagne gold': '#D4AF37',
    'midnight black': '#111111',
    'lavender': '#ce93d8',
    'soft pink': '#f8bbd0',
    'plum': '#4a148c',
    'sage': '#81c784',
    'grey': '#9e9e9e',
    'peach': '#ffcc80',
    'cream': '#fff9c4',
    'aqua': '#80deea',
    'navy': '#051838',
    'olive': '#2e7d32'
  };
  const key = name.toLowerCase().trim();
  return colors[key] || name.trim() || '#cccccc';
};

// Helper to check stock status
const isProductInStock = (p) => {
  if (p.stock !== undefined) return p.stock > 0;
  const val = p.title || p.name || '';
  return (val.length % 7 !== 0);
};

// Helper to generate sizes fallback
const getProductSizes = (p) => {
  const idStr = String(p.id || '');
  const charCode = idStr.charCodeAt(idStr.length - 1) || 0;
  const sizes = ['S', 'M', 'L', 'XL'];
  if (charCode % 2 === 0) sizes.push('XS');
  if (charCode % 3 === 0) sizes.push('2XL');
  if (charCode % 4 === 0) sizes.push('3XL');
  if (charCode % 5 === 0) sizes.push('4XL');
  return sizes;
};

// Helper to generate colors fallback
const getProductColors = (p) => {
  const idStr = String(p.id || '');
  const charCode = idStr.charCodeAt(idStr.length - 1) || 0;
  const colors = ['White', 'Black'];
  if (charCode % 2 === 0) colors.push('Pink');
  if (charCode % 3 === 0) colors.push('Red');
  if (charCode % 4 === 0) colors.push('Yellow');
  if (charCode % 5 === 0) colors.push('Green');
  if (charCode % 6 === 0) colors.push('Purple');
  if (charCode % 7 === 0) colors.push('Blue');
  if (charCode % 8 === 0) colors.push('DarkRed');
  return colors;
};

// Helper to resolve colors as array of objects
const getProductThemedColors = (prod) => {
  if (!prod) return [];
  if (prod.variants && prod.variants.length > 0) {
    const uniqueColors = [...new Set(prod.variants.map(v => v.color).filter(Boolean))];
    if (uniqueColors.length > 0) {
      return uniqueColors.map(colorName => ({
        name: colorName,
        hex: getColorHex(colorName)
      }));
    }
  }
  return getProductColors(prod).map(c => ({
    name: c,
    hex: getColorHex(c)
  }));
};

// Retrieve list of unique color names
const getProductColorsList = (p) => {
  const colors = [];
  if (p.variants && p.variants.length > 0) {
    p.variants.forEach(v => {
      if (v.color && !colors.includes(v.color.toLowerCase())) {
        colors.push(v.color.toLowerCase());
      }
    });
  }
  if (colors.length === 0) {
    const fallbackColors = getProductColors(p);
    fallbackColors.forEach(c => colors.push(c.toLowerCase()));
  }
  return colors;
};

// Helper to get matching variant
const getSelectedVariant = (prod, color, size) => {
  if (!prod || !prod.variants || prod.variants.length === 0) return null;
  let matched = prod.variants.find(v => 
    (color && v.color && String(v.color).toLowerCase() === String(color).toLowerCase()) &&
    (size && v.size && String(v.size).toLowerCase() === String(size).toLowerCase())
  );
  if (!matched && color) {
    matched = prod.variants.find(v => v.color && String(v.color).toLowerCase() === String(color).toLowerCase());
  }
  return matched;
};

// Helper to check discount percentages
const getProductDiscount = (p) => {
  if (!p) return 0;
  const originalPriceNum = p.originalPrice ? parseFloat(String(p.originalPrice).replace(/[^0-9.]/g, '')) : 0;
  const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
  if (originalPriceNum && originalPriceNum > priceNum) {
    return Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
  }
  if (p.discount) {
    const dVal = parseFloat(String(p.discount).replace(/[^0-9.]/g, ''));
    if (!isNaN(dVal) && dVal <= 100) {
      return Math.round(dVal);
    }
  }
  return 0;
};

// Helper to guess gender
const getProductGender = (p) => {
  const title = (p.title || p.name || '').toLowerCase();
  const cat = String(p.category || '').toLowerCase();
  if (title.includes('women') || title.includes('girl') || title.includes('lady') || title.includes('ladies') || title.includes('saree') || title.includes('kurti') || title.includes('lehenga') || title.includes('frock') || title.includes('anarkali') || cat.includes('women') || cat.includes('girl')) {
    return 'Women';
  }
  if (title.includes('men') || title.includes('boy') || title.includes('gent') || title.includes('gents') || title.includes('dhoti') || title.includes('kurta') || title.includes('shirt') || cat.includes('men') || cat.includes('boy')) {
    return 'Men';
  }
  if (title.includes('kids') || title.includes('child') || title.includes('baby') || cat.includes('kids') || cat.includes('child')) {
    return 'Kids';
  }
  return 'Other';
};

// Helper to get catalogue
const getProductCatalogue = (p) => {
  if (p.catalogue) {
    if (p.catalogue.toUpperCase().includes('B')) return 'B';
    return 'A';
  }
  return 'A';
};

// Render Variant Selectors inside Detail/QuickView
const renderCategorySelectors = (prod, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty) => {
  if (!prod) return null;
  
  if (prod.variants && prod.variants.length > 0) {
    const varColors = getProductThemedColors(prod);
    const activeColor = modalColor || (varColors[0] ? varColors[0].name : '');
    const availableSizes = prod.variants
      .filter(v => !activeColor || v.color?.toLowerCase() === activeColor.toLowerCase())
      .map(v => v.size)
      .filter(Boolean);
    const uniqueSizes = [...new Set(availableSizes)];
    
    return (
      <>
        {varColors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title">Color: <span className="color-name">{modalColor || varColors[0]?.name || ""}</span></span>
            <div className="modal-color-dots">
              {varColors.map((c, idx) => (
                <button
                  key={c.name}
                  className={`color-dot ${activeColor.toLowerCase() === c.name.toLowerCase() ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    setModalColor(c.name);
                    const hasVariantImages = prod.variants.some(v => v.image && isRealImg(v.image));
                    if (hasVariantImages) {
                      const cIdx = varColors.findIndex(color => color.name.toLowerCase() === c.name.toLowerCase());
                      if (cIdx !== -1) setActiveImageIndex(cIdx);
                    }
                    const matchVar = prod.variants.find(v => v.color?.toLowerCase() === c.name.toLowerCase());
                    if (matchVar && matchVar.size) setModalSize(matchVar.size);
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {uniqueSizes.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title">Size:</span>
            <div className="modal-size-options">
              {uniqueSizes.map(size => (
                <button
                  key={size}
                  className={`size-option-btn ${modalSize === size ? 'active' : ''}`}
                  onClick={() => setModalSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for flat products
  const flatSizes = getProductSizes(prod);
  const flatColors = getProductThemedColors(prod);

  return (
    <>
      {flatColors.length > 0 && (
        <div className="modal-section-block">
          <span className="modal-section-title">Color: <span className="color-name">{modalColor || flatColors[0]?.name}</span></span>
          <div className="modal-color-dots">
            {flatColors.map(c => (
              <button
                key={c.name}
                className={`color-dot ${ (modalColor || flatColors[0]?.name).toLowerCase() === c.name.toLowerCase() ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setModalColor(c.name)}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {flatSizes.length > 0 && (
        <div className="modal-section-block">
          <span className="modal-section-title">Size:</span>
          <div className="modal-size-options">
            {flatSizes.map(size => (
              <button
                key={size}
                className={`size-option-btn ${modalSize === size ? 'active' : ''}`}
                onClick={() => setModalSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Dynamic Category Class Resolver
const getCategoryThemeClass = (category) => {
  const cat = String(category).toUpperCase();
  if (cat.includes('CLOTHING') || cat.includes('DRESS')) return 'theme-clothing';
  if (cat.includes('STATIONERY') || cat.includes('PEN') || cat.includes('NOTEBOOK')) return 'theme-stationery';
  if (cat.includes('GIFT') || cat.includes('VALENTINE')) return 'theme-gifts';
  if (cat.includes('ACCESSORIES') || cat.includes('JEWEL') || cat.includes('WATCH')) return 'theme-accessories';
  return 'theme-clothing';
};

// Similarity Matching Algorithm (Weighted scoring, fully dynamic)
const getSimilarProductsForNewArrivals = (currentProd, allProds) => {
  if (!currentProd) return [];
  
  const currentId = String(currentProd.id || currentProd._id || '');
  const currentCategory = String(currentProd.category || '').split('>')[0].trim().toUpperCase();
  const currentSubcategory = String(currentProd.subCategory || '').trim().toUpperCase();

  const candidates = allProds.filter(p => {
    const pId = String(p.id || p._id || '');
    return pId !== currentId;
  });

  const scored = candidates.map(p => {
    let score = 0;
    const pCategory = String(p.category || '').split('>')[0].trim().toUpperCase();
    const pSubcategory = String(p.subCategory || '').trim().toUpperCase();
    
    // 1. Same Category (Weight: 100)
    if (pCategory === currentCategory) {
      score += 100;
    }
    
    // 2. Same Subcategory (Weight: 50)
    if (pSubcategory && currentSubcategory && pSubcategory === currentSubcategory) {
      score += 50;
    }

    // 3. Same ProductType (Weight: 30)
    if (p.productType && currentProd.productType && String(p.productType).toLowerCase() === String(currentProd.productType).toLowerCase()) {
      score += 30;
    }

    // 4. Matching Tags (Weight: 15 per tag)
    if (p.tags && currentProd.tags) {
      const currTags = Array.isArray(currentProd.tags) ? currentProd.tags : String(currentProd.tags).split(',').map(t => t.trim().toLowerCase());
      const candTags = Array.isArray(p.tags) ? p.tags : String(p.tags).split(',').map(t => t.trim().toLowerCase());
      const commonTags = currTags.filter(t => candTags.includes(t));
      score += commonTags.length * 15;
    }

    // 5. Matching Attributes (Weight: 10 per attribute)
    const currAttrs = currentProd.attributes || {};
    const candAttrs = p.attributes || {};
    Object.keys(currAttrs).forEach(key => {
      if (currAttrs[key] && candAttrs[key] && String(currAttrs[key]).toLowerCase() === String(candAttrs[key]).toLowerCase()) {
        score += 10;
      }
    });

    // 6. Similar Colors (Weight: 5 per color)
    const currentColors = getProductColorsList(currentProd);
    const candidateColors = getProductColorsList(p);
    const commonColors = currentColors.filter(c => candidateColors.includes(c));
    score += commonColors.length * 5;

    // 7. Similar Style (Weight: 8)
    if (p.style && currentProd.style && String(p.style).toLowerCase() === String(currentProd.style).toLowerCase()) {
      score += 8;
    }

    // 8. Similar Brand (Weight: 5)
    if (p.brand && currentProd.brand && String(p.brand).toLowerCase() === String(currentProd.brand).toLowerCase()) {
      score += 5;
    }

    return { product: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.product);
};

const fallbackNewArrivals = [
  {
    id: 'n1',
    title: "Floral Frock Dress",
    category: "CLOTHING",
    price: 1499,
    originalPrice: 2249,
    rating: 5,
    reviews: 42,
    image: clothingUser1,
    badge: "NEW",
    isNewArrival: true,
    description: "Vibrant traditional children's frock crafted in premium south cotton, featuring bright ethnic accents and details."
  },
  {
    id: 'n2',
    title: "Blue School Kit",
    category: "STATIONERY",
    price: 899,
    originalPrice: 1349,
    rating: 4.5,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=1000&q=80",
    badge: "NEW",
    isNewArrival: true,
    description: "An all-in-one premium study organizer set featuring pastel blue binders, designer pencils, and note kits."
  },
  {
    id: 'n3',
    title: "Birthday Gift Box",
    category: "GIFTS",
    price: 1099,
    originalPrice: 1649,
    rating: 4.8,
    reviews: 35,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
    badge: "NEW",
    isNewArrival: true,
    description: "Thoughtfully curated celebration bundle containing custom premium boxes, ribbons, and hampers."
  },
  {
    id: 'n4',
    title: "Traditional Jhumka",
    category: "ACCESSORIES",
    price: 1799,
    originalPrice: 2699,
    rating: 5,
    reviews: 58,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
    badge: "NEW",
    isNewArrival: true,
    description: "Exquisite gold-plated jhumka earrings featuring premium micro-filigree beads and traditional temple design."
  },
  {
    id: 'n5',
    title: "Premium Notebook",
    category: "STATIONERY",
    price: 399,
    originalPrice: 599,
    rating: 4.2,
    reviews: 14,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1000&q=80",
    badge: "NEW",
    isNewArrival: true,
    description: "Soft-bound luxury journal containing acid-free pages, ideal for sketching, calligraphy, and planning."
  },
  {
    id: 'n6',
    title: "Cotton Kurta Set",
    category: "CLOTHING",
    price: 1299,
    originalPrice: 1949,
    rating: 4.9,
    reviews: 64,
    image: clothingUser2,
    badge: "NEW",
    isNewArrival: true,
    description: "Premium organic cotton kurta paired with a matching dupatta, reflecting heritage ethnic motifs."
  }
];

export default function NewArrivalsView() {
  const [allProducts, setAllProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLookbookTab, setActiveLookbookTab] = useState('ethnic');
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const { addToast } = useToast();

  // Navigation states
  const [fullDetailProduct, setFullDetailProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Filtering States (Dynamic and Database Driven)
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [catalogue, setCatalogue] = useState('A');
  const [priceRange, setPriceRange] = useState(15000);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedShopFor, setSelectedShopFor] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [filterBestSellers, setFilterBestSellers] = useState(false);
  const [filterOffers, setFilterOffers] = useState(false);

  // Accordion Expand/Collapse States
  const [isRootCategoriesOpen, setIsRootCategoriesOpen] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isGenderOpen, setIsGenderOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorsOpen, setIsColorsOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isRatingsOpen, setIsRatingsOpen] = useState(false);
  const [isOffersOpenAccordion, setIsOffersOpenAccordion] = useState(false);
  const [isBestSellersOpen, setIsBestSellersOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);

  const [showSidebar, setShowSidebar] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal selector states
  const [modalSize, setModalSize] = useState('M');
  const [modalColor, setModalColor] = useState('');
  const [modalQty, setModalQty] = useState(1);

  // Load wishlist, cart, products, and categories dynamically
  useEffect(() => {
    const storedUser = localStorage.getItem('mithira_auth_user');
    let initialWishlist = [];
    let initialCart = [];
    if (storedUser) {
      const user = JSON.parse(storedUser);
      initialWishlist = user.wishlist || [];
      initialCart = user.cart || [];
    } else {
      initialWishlist = JSON.parse(localStorage.getItem('mithira_guest_wishlist') || '[]');
      initialCart = JSON.parse(localStorage.getItem('mithira_guest_cart') || '[]');
    }
    setWishlist(initialWishlist);
    setCart(initialCart);

    // Fetch all products
    setLoading(true);
    apiService.getProducts()
      .then(data => {
        setAllProducts(data);
      })
      .catch(err => console.error('Error fetching products:', err))
      .finally(() => setLoading(false));

    // Fetch all categories
    apiService.getCategories()
      .then(cats => {
        setCategoriesList(cats);
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSubTab, searchQuery, catalogue, priceRange, showInStock, showOutOfStock, selectedRatings, selectedSubcategories, selectedShopFor, selectedSizes, selectedColors, selectedDiscounts, filterBestSellers, filterOffers]);

  // Wishlist handler
  const toggleWishlist = (id) => {
    let updated;
    const storedUser = localStorage.getItem('mithira_auth_user');
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
      addToast({ message: 'Removed from wishlist', type: 'wishlist' });
    } else {
      updated = [...wishlist, id];
      addToast({ message: '❤️ Added to wishlist!', type: 'wishlist' });
    }
    setWishlist(updated);

    if (storedUser) {
      apiService.syncWishlist(updated).then(res => {
        if (res) {
          const user = JSON.parse(storedUser);
          user.wishlist = res;
          localStorage.setItem('mithira_auth_user', JSON.stringify(user));
        }
      });
    } else {
      localStorage.setItem('mithira_guest_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
    }
  };

  // Cart handler
  const toggleCart = (id, title, size = null, color = null) => {
    let updated;
    let updatedItems = [];
    const storedUser = localStorage.getItem('mithira_auth_user');
    if (cart.includes(id)) {
      updated = cart.filter(item => item !== id);
      addToast({ message: 'Removed from cart', type: 'cart' });
    } else {
      updated = [...cart, id];
      addToast({ message: `🛒 Added "${title}" to cart!`, type: 'cart' });
    }
    setCart(updated);

    const prevItems = storedUser 
      ? (JSON.parse(storedUser).cartItems || []) 
      : (JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]'));
    const isRemoving = !updated.includes(id);

    if (isRemoving) {
      updatedItems = prevItems.filter(item => item.productId !== id);
    } else {
      updatedItems = [...prevItems.filter(item => item.productId !== id), {
        productId: id,
        quantity: modalQty,
        variant: { size, color, variantId: null, sku: null }
      }];
    }

    if (storedUser) {
      apiService.syncCart(updated, updatedItems).then(res => {
        if (res) {
          const user = JSON.parse(storedUser);
          user.cart = res.cart || updated;
          user.cartItems = res.cartItems || updatedItems;
          localStorage.setItem('mithira_auth_user', JSON.stringify(user));
        }
      });
    } else {
      localStorage.setItem('mithira_guest_cart', JSON.stringify(updated));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
    }
  };

  // Helper to trace and get subcategory database names recursively
  const getProductSubCategories = (p) => {
    const subs = [];
    const parts = String(p.category || '').split('>').map(s => s.trim().toUpperCase());
    if (parts.length > 1) {
      parts.slice(1).forEach(part => {
        if (part) subs.push(part);
      });
    }
    if (p.subCategory) {
      const subUpper = p.subCategory.trim().toUpperCase();
      if (!subs.includes(subUpper)) {
        subs.push(subUpper);
      }
    }
    return subs;
  };

  // Build dynamic tree hierarchy
  const getDynamicCategoriesTree = () => {
    const dbRoots = categoriesList.filter(
      cat => (!cat.parent || cat.parent === '—') && cat.name !== '—' && cat.showInFilters !== false
    );

    const buildTree = (parentName, parentKey) => {
      const children = categoriesList.filter(
        cat => cat.parent && cat.parent.toLowerCase().trim() === parentName.toLowerCase().trim()
      );
      return children.map(cat => {
        const uniqueKey = `${parentKey}_${cat.name.toUpperCase().replace(/\s+/g, '_')}`;
        return {
          key: uniqueKey,
          dbName: cat.name,
          label: cat.name,
          children: buildTree(cat.name, uniqueKey)
        };
      });
    };

    return dbRoots.map(root => {
      const key = root.name.toUpperCase().replace(/\s+/g, '_');
      return {
        name: root.name,
        key: key,
        icon: <Shirt size={14} />,
        subcategories: buildTree(root.name, key)
      };
    });
  };

  // Retrieve subcategory keys recursively
  const getAllSubcategoryKeysUnder = (subCategoryDbName) => {
    if (!subCategoryDbName || subCategoryDbName === 'ALL') return [];
    const unified = getDynamicCategoriesTree();
    
    const collectDbNames = (node) => {
      let names = [node.dbName.toUpperCase()];
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          names = [...names, ...collectDbNames(child)];
        });
      }
      return names;
    };

    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.dbName.toUpperCase() === subCategoryDbName.toUpperCase()) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const group of unified) {
      const found = findNode(group.subcategories);
      if (found) {
        return collectDbNames(found);
      }
    }
    return [subCategoryDbName.toUpperCase()];
  };

  // Category list filter resolver
  const getCategoriesToShow = () => {
    let list = [];
    if (categoriesList && categoriesList.length > 0) {
      const namesSet = new Set();
      const rootNames = categoriesList
        .filter(c => (!c.parent || c.parent === '—') && c.name !== '—' && c.showInFilters !== false)
        .map(c => c.name.toUpperCase().trim());

      categoriesList.forEach(cat => {
        if (cat.name && cat.name !== '—' && cat.showInFilters !== false) {
          const nameUpper = cat.name.toUpperCase().trim();
          const parentUpper = cat.parent ? cat.parent.toUpperCase().trim() : '';
          
          let include = false;
          if (activeTab === 'ALL') {
            if (parentUpper && parentUpper !== '—') {
              include = true;
            } else if (!rootNames.includes(nameUpper)) {
              include = true;
            }
          } else {
            if (parentUpper === activeTab.toUpperCase()) {
              include = true;
            }
            if (!include && parentUpper) {
              const parentCat = categoriesList.find(c => c.name.toUpperCase().trim() === parentUpper);
              if (parentCat && parentCat.parent) {
                const grandParentUpper = parentCat.parent.toUpperCase().trim();
                if (grandParentUpper === activeTab.toUpperCase()) {
                  include = true;
                }
              }
            }
          }
          
          if (include) {
            namesSet.add(cat.name.trim());
          }
        }
      });
      list = Array.from(namesSet);
    }
    return list.sort((a, b) => a.localeCompare(b));
  };

  // Reset all sidebar filters
  const handleClearAllFilters = () => {
    setCatalogue('A');
    setPriceRange(15000);
    setShowInStock(true);
    setShowOutOfStock(true);
    setSelectedRatings([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedSubcategories([]);
    setSelectedShopFor([]);
    setSelectedDiscounts([]);
    setFilterBestSellers(false);
    setFilterOffers(false);
    setActiveTab('ALL');
    setActiveSubTab('ALL');
    setSearchQuery('');
    setCategorySearchQuery('');
    setShowAllCategories(false);
  };

  const renderDynamicCategoriesFilter = () => {
    const allCategories = getCategoriesToShow();
    const filtered = allCategories.filter(cat => 
      cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
    const displayed = showAllCategories ? filtered : filtered.slice(0, 8);
    
    return (
      <div className="flat-category-checklist-container">
        <input 
          type="text"
          className="category-list-search"
          placeholder="Search categories..."
          value={categorySearchQuery}
          onChange={(e) => setCategorySearchQuery(e.target.value)}
        />
        
        <div className="filter-category-list-m3">
          {displayed.length > 0 ? (
            displayed.map(catName => {
              const catUpper = catName.toUpperCase();
              const isChecked = selectedSubcategories.includes(catUpper);
              return (
                <label key={catName} className="checkbox-filter-row">
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedSubcategories(selectedSubcategories.filter(s => s !== catUpper));
                      } else {
                        setSelectedSubcategories([...selectedSubcategories, catUpper]);
                      }
                    }}
                  />
                  <span>{catName}</span>
                </label>
              );
            })
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', padding: '4px 0' }}>
              No categories found
            </div>
          )}
        </div>
        
        {filtered.length > 8 && (
          <button 
            type="button"
            className="show-more-toggle-btn"
            onClick={() => setShowAllCategories(!showAllCategories)}
          >
            {showAllCategories ? 'Show Less ▴' : 'Show More ▾'}
          </button>
        )}
      </div>
    );
  };

  // PRE-FILTER: STRICTLY show products where isNewArrival === true, with fallback to mock products if database has none
  const newArrivalsDbOnly = allProducts.filter(p => p.isNewArrival === true);
  const finalNewArrivals = newArrivalsDbOnly.length > 0 ? newArrivalsDbOnly : fallbackNewArrivals;

  // Apply all filter systems dynamically
  let filteredProducts = finalNewArrivals;

  // 1. Root Category filter (activeTab)
  if (activeTab !== 'ALL') {
    filteredProducts = filteredProducts.filter(p => {
      const rootCat = String(p.category || '').split('>')[0].trim().toUpperCase();
      return rootCat === activeTab;
    });
  }

  // 2. Active Subcategory filter (activeSubTab)
  if (activeSubTab !== 'ALL') {
    filteredProducts = filteredProducts.filter(p => {
      const subKeys = getAllSubcategoryKeysUnder(activeSubTab).map(k => k.toUpperCase());
      const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
      return productSubs.some(subName => subKeys.includes(subName) || subName === activeSubTab.toUpperCase());
    });
  }

  // 3. Search Query
  if (searchQuery.trim() !== '') {
    filteredProducts = filteredProducts.filter(p => 
      (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // 4. Subcategories Checkbox Filter
  if (selectedSubcategories.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
      return productSubs.some(sub => selectedSubcategories.includes(sub));
    });
  }

  // 5. Shop For (Gender) Filter
  if (selectedShopFor.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const gender = getProductGender(p);
      return selectedShopFor.includes(gender);
    });
  }

  // 6. Price Filter
  filteredProducts = filteredProducts.filter(p => {
    const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
    return priceNum <= priceRange;
  });

  // 7. Sizes Filter
  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const pSizes = getProductSizes(p);
      return pSizes.some(size => selectedSizes.includes(size));
    });
  }

  // 8. Colors Filter
  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const pColors = getProductColors(p);
      return pColors.some(color => selectedColors.includes(color));
    });
  }

  // 9. Availability Filter
  filteredProducts = filteredProducts.filter(p => {
    const inStock = isProductInStock(p);
    if (showInStock && showOutOfStock) return true;
    if (showInStock) return inStock;
    if (showOutOfStock) return !inStock;
    return false;
  });

  // 10. Ratings Filter
  if (selectedRatings.length > 0) {
    const minRating = Math.min(...selectedRatings);
    filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
  }

  // 11. Discounts Filter
  if (selectedDiscounts.length > 0) {
    const minDiscount = Math.min(...selectedDiscounts);
    filteredProducts = filteredProducts.filter(p => getProductDiscount(p) >= minDiscount);
  }

  // 12. Collections Filter (Best Sellers & Offers)
  if (filterBestSellers || filterOffers) {
    filteredProducts = filteredProducts.filter(p => {
      const isBest = p.badge === 'BEST SELLER' || p.sales > 20 || String(p.id).startsWith('t');
      const isOffer = p.isOffer || p.badge?.toUpperCase().includes('OFFER') || p.badge?.toUpperCase().includes('DEAL') || p.discount > 0;
      
      if (filterBestSellers && filterOffers) return isBest || isOffer;
      if (filterBestSellers) return isBest;
      if (filterOffers) return isOffer;
      return true;
    });
  }

  // Apply sorting
  if (sortBy === 'DEFAULT' || sortBy === 'newest-first') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const idA = String(a.id || a._id || '');
      const idB = String(b.id || b._id || '');
      return idB.localeCompare(idA);
    });
  } else if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const pA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const pB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return pA - pB;
    });
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const pA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const pB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return pB - pA;
    });
  } else if (sortBy === 'best-selling') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.sales || 0) - (a.sales || 0));
  } else if (sortBy === 'top-rated') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'highest-discount') {
    filteredProducts = [...filteredProducts].sort((a, b) => getProductDiscount(b) - getProductDiscount(a));
  }

  // Pagination constants
  const productsPerPage = 24;
  const totalProductsCount = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(totalProductsCount / productsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Dynamic root categories tabs list (fully database-driven)
  const rootCategoryTabs = ['ALL', ...categoriesList
    .filter(c => (!c.parent || c.parent === '—') && c.name !== '—' && c.showInFilters !== false)
    .map(c => c.name.toUpperCase())
  ];

  const lookbooks = {
    ethnic: {
      title: "Royal Ethnic Splendor",
      desc: "Traditional silhouettes reimagined with subtle modern borders, handwoven textures, and premium threads.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      quote: "Bridging cultural heritage and contemporary beauty."
    },
    stationery: {
      title: "Gold-Leaf Writers Edit",
      desc: "Lined and unlined archival-grade paper journals decorated with vintage borders, matching ink sets, and classic designs.",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      quote: "Pour your thoughts onto timeless premium sheets."
    },
    gifts: {
      title: "Golden Occasion Hampers",
      desc: "Custom-curated gift boxes packed with premium accessories, cultural items, gourmet sweets, and rose petal aromas.",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
      quote: "The art of gifting, defined by elegant care."
    }
  };

  // Full Details Page View rendering
  if (fullDetailProduct) {
    const catTheme = getCategoryThemeClass(fullDetailProduct.category);
    const images = resolveProductGallery(fullDetailProduct, modalColor);
    const colors = getProductThemedColors(fullDetailProduct);

    const selectedVariant = getSelectedVariant(fullDetailProduct, modalColor, modalSize);
    const displayPrice = (selectedVariant && selectedVariant.price !== null && selectedVariant.price !== undefined) 
      ? selectedVariant.price 
      : fullDetailProduct.price;
    
    const displayStock = selectedVariant ? selectedVariant.stock : fullDetailProduct.stock;
    const isOutOfStock = displayStock <= 0;
    const mainImageUrl = images[activeImageIndex] || resolveProductImage(fullDetailProduct);

    return (
      <div className={`shop-view-page shop-product-detail-page-view ${catTheme}`}>
        <div className="shop-content-container">
          
          <div className="product-detail-nav">
            <button className="back-to-shop-btn" onClick={() => { setFullDetailProduct(null); setModalQty(1); }}>
              <ArrowLeft size={18} />
              <span>Back to New Arrivals</span>
            </button>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-category" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab(fullDetailProduct.category.toUpperCase()); setFullDetailProduct(null); }}>
              {fullDetailProduct.category}
            </span>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-title">{fullDetailProduct.title}</span>
          </div>

          <div className="product-detail-grid-layout">
            <div className="product-detail-gallery-col">
              <div className="product-detail-gallery-container">
                {images.length > 1 && (
                  <div className="product-detail-thumbnails">
                    {images.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`product-detail-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                        onClick={() => {
                          setActiveImageIndex(idx);
                          if (colors && colors[idx]) {
                            setModalColor(colors[idx].name);
                            const matchVar = fullDetailProduct.variants?.find(v => v.color?.toLowerCase() === colors[idx].name.toLowerCase());
                            if (matchVar && matchVar.size) setModalSize(matchVar.size);
                          }
                        }}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="product-detail-thumbnail-img" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="product-detail-main-image-wrapper">
                  <img src={mainImageUrl} alt={fullDetailProduct.title} className="product-detail-main-img" />
                  {images.length > 1 && (
                    <>
                      <button 
                        type="button"
                        className="gallery-nav-arrow arrow-left" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                        }}
                      >
                        ‹
                      </button>
                      <button 
                        type="button"
                        className="gallery-nav-arrow arrow-right" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                  <div className="product-detail-badge-pill">NEW</div>
                </div>
              </div>
            </div>

            <div className="product-detail-info-col">
              <div className="product-detail-category-tag">
                {fullDetailProduct.category} {fullDetailProduct.subCategory ? `| ${fullDetailProduct.subCategory}` : ''}
              </div>
              <h1 className="product-detail-title">{fullDetailProduct.title}</h1>
              <p className="product-detail-tagline">{fullDetailProduct.attributes?.shortDescription || fullDetailProduct.shortDescription || "Newly arrived premium selection, designed with elegance for this season."}</p>

              <div className="product-detail-rating-row">
                <span className="product-detail-rating-stars">★ {fullDetailProduct.rating || "4.8"}</span>
                <span className="product-detail-reviews">({fullDetailProduct.reviews || "120"} reviews)</span>
              </div>

              <div className="product-detail-price-row">
                <span className="product-detail-price-label">Price:</span>
                <span className="product-detail-price-value">₹{displayPrice.toLocaleString()}</span>
                {(fullDetailProduct.originalPrice || getProductDiscount(fullDetailProduct) > 0) && (
                  <>
                    <span className="product-detail-original-price">₹{(fullDetailProduct.originalPrice || Math.round(displayPrice * 1.5)).toLocaleString()}</span>
                    <span className="product-detail-discount-badge">
                      {getProductDiscount(fullDetailProduct)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="product-detail-availability-row" style={{ margin: '12px 0 16px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="product-detail-availability-label" style={{ fontWeight: 600, color: '#555' }}>Availability:</span>
                <span className={`product-detail-availability-status ${isOutOfStock ? 'out-of-stock-status' : ''}`} style={{ color: isOutOfStock ? '#ff3333' : '#D4AF37', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: isOutOfStock ? '#ffebee' : '#FDFBF7', fontSize: '0.82rem' }}>
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
              </div>

              {renderCategorySelectors(fullDetailProduct, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty)}

              <div className="product-detail-section-block qty-block">
                <span className="product-detail-section-title">Quantity</span>
                <div className="product-detail-qty-control">
                  <button onClick={() => setModalQty(prev => Math.max(1, prev - 1))}>-</button>
                  <span>{modalQty}</span>
                  <button onClick={() => setModalQty(prev => prev + 1)}>+</button>
                </div>
              </div>

              <div className="product-detail-actions-buttons" style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                <button 
                  className={`product-detail-primary-btn ${cart.includes(fullDetailProduct.id) ? 'in-cart' : ''}`}
                  onClick={() => toggleCart(fullDetailProduct.id, fullDetailProduct.title, modalSize, modalColor)}
                  disabled={isOutOfStock}
                  style={{ flex: 2 }}
                >
                  <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                  <span>{cart.includes(fullDetailProduct.id) ? "REMOVE FROM CART" : "ADD TO CART"}</span>
                </button>
                <button 
                  className={`product-detail-secondary-btn ${wishlist.includes(fullDetailProduct.id) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(fullDetailProduct.id)}
                  style={{ flex: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Heart size={20} fill={wishlist.includes(fullDetailProduct.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="product-detail-trust-badges">
                <div className="trust-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Secure Payment</span>
                </div>
                <div className="trust-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
                  <span>Easy Returns</span>
                </div>
                <div className="trust-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <span>Free Shipping</span>
                </div>
              </div>

              <div className="product-detail-tabs-section" style={{ marginTop: '40px' }}>
                <div className="detail-tabs-header" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <button className="active-tab-btn" style={{ background: 'none', border: 'none', fontWeight: 600, color: '#b89047', borderBottom: '2px solid #b89047', paddingBottom: '8px' }}>Description</button>
                </div>
                <div className="detail-tab-pane" style={{ paddingTop: '15px', color: '#666', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  <p>{fullDetailProduct.description || "Indulge in this beautifully designed premium item, crafted specifically to complement your style. Built using the finest materials and strict quality checks."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fully Dynamic Similarity Recommendations Grid */}
          <div className="product-detail-similar-section">
            <div className="similar-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', width: '100%' }}>
              <h3 className="similar-title" style={{ margin: 0 }}>Similar Products</h3>
              <span className="similar-view-all" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#dfb743' }} onClick={() => setFullDetailProduct(null)}>
                View All &gt;
              </span>
            </div>
            <div className="similar-products-grid">
              {getSimilarProductsForNewArrivals(fullDetailProduct, allProducts.length > 0 ? allProducts : fallbackNewArrivals)
                .slice(0, 6)
                .map((simProd) => {
                  const isSimWishlisted = wishlist.includes(simProd.id);
                  const isSimInCart = cart.includes(simProd.id);
                  const simInStock = isProductInStock(simProd);
                  const simOriginalPriceNum = simProd.originalPrice ? parseFloat(String(simProd.originalPrice).replace(/[^0-9.]/g, '')) : 0;
                  const simPriceNum = typeof simProd.price === 'number' ? simProd.price : parseFloat(String(simProd.price).replace(/[^0-9.]/g, '')) || 0;
                  const simDiscountPercentage = (simOriginalPriceNum && simOriginalPriceNum > simPriceNum) 
                    ? Math.round(((simOriginalPriceNum - simPriceNum) / simOriginalPriceNum) * 100)
                    : (simProd.discount && parseFloat(String(simProd.discount)) <= 100 
                        ? Math.round(parseFloat(String(simProd.discount))) 
                        : 0);
                  const simBrandName = simProd.brand || 'Mithira Collection';

                  return (
                    <div 
                      key={simProd.id} 
                      className="clothing-product-card theme-clothing animate-fade-in-up"
                      onClick={() => {
                        setFullDetailProduct(simProd);
                        setModalQty(1);
                        setModalColor('');
                        setActiveImageIndex(0);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); setFullDetailProduct(simProd); setModalQty(1); setModalColor(''); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        {simProd.isNewArrival ? (
                          <div className="arrival-new-badge">NEW</div>
                        ) : (
                          simDiscountPercentage > 0 && (
                            <div className="clothing-discount-badge">{simDiscountPercentage}% OFF</div>
                          )
                        )}
                        
                        <button 
                          className={`clothing-wishlist-float-btn ${isSimWishlisted ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(simProd.id); }}
                        >
                          <Heart size={15} fill={isSimWishlisted ? "currentColor" : "none"} />
                        </button>

                        <img src={resolveProductImage(simProd)} alt={simProd.title} className="clothing-img" />

                        <div className="clothing-hover-overlay">
                          <button 
                            className={`clothing-hover-action-btn hover-wishlist-btn ${isSimWishlisted ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(simProd.id); }}
                          >
                            <Heart size={16} fill={isSimWishlisted ? "currentColor" : "none"} />
                          </button>
                          <button 
                            className="clothing-hover-action-btn hover-quickview-btn"
                            onClick={(e) => { e.stopPropagation(); setActiveImageIndex(0); setModalColor(''); setModalSize('M'); setQuickViewProduct(simProd); }}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className={`clothing-hover-action-btn hover-cart-btn ${isSimInCart ? 'in-cart' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleCart(simProd.id, simProd.title); }}
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="clothing-info-section">
                        <div className="clothing-brand-row">
                          <span className="clothing-brand-name">{simBrandName}</span>
                          <div className="clothing-stock-badge">
                            <span className={simInStock ? 'stock-status-in' : 'stock-status-out'}>{simInStock ? 'In Stock' : 'Out of Stock'}</span>
                          </div>
                        </div>

                        <h4 className="clothing-product-title">{simProd.title}</h4>

                        <div className="clothing-rating-badge-container">
                          <div className="clothing-rating-pill-green">
                            <span>{(simProd.rating || 5).toFixed(1)}</span>
                            <span className="rating-star-icon">★</span>
                            <span className="rating-divider">|</span>
                            <span className="rating-count">{simProd.reviews || 0}</span>
                          </div>
                        </div>

                        <div className="clothing-price-and-action">
                          <div className="clothing-price-box">
                            <span className="clothing-selling-price">₹{simPriceNum.toLocaleString()}</span>
                            {simOriginalPriceNum > simPriceNum && (
                              <span className="clothing-original-price">₹{simOriginalPriceNum.toLocaleString()}</span>
                            )}
                          </div>
                          <button 
                            className={`clothing-card-add-cart-btn ${isSimInCart ? 'in-cart' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleCart(simProd.id, simProd.title); }}
                          >
                            {isSimInCart ? "IN CART" : "ADD TO CART"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="new-arrivals-view-page">
      <div className="arrivals-container">
        
        {/* Header Section */}
        <div className="arrivals-header-section">
          <div className="arrivals-crown-icon">
            <img src={logoImg} className="arrivals-crown-svg" alt="Logo" style={{ objectFit: 'contain' }} />
          </div>
          <h1 className="arrivals-main-title">The Fresh Edit</h1>
          <p className="arrivals-subtitle">Explore our newly launched, premium additions crafted for this season</p>
        </div>

        {/* Dynamic Category Tabs */}
        {rootCategoryTabs.length > 1 && (
          <div className="new-arrivals-category-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '35px', flexWrap: 'wrap' }}>
            {rootCategoryTabs.map(cat => (
              <button
                key={cat}
                className={`lookbook-tab-btn ${activeTab === cat ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(cat);
                  setActiveSubTab('ALL');
                  setCurrentPage(1);
                }}
                style={{ padding: '8px 20px', borderRadius: '30px', fontSize: '0.95rem' }}
              >
                {cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}



        {/* Sidebar + Products Grid Main layout */}
        <div className="shop-content-container" style={{ padding: 0 }}>
          
          <div className="filters-toggle-row-m3" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <button 
              className={`exclusive-filters-toggle-btn ${showSidebar ? 'active' : ''}`}
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <X size={16} /> : <Menu size={16} />}
              <span>{showSidebar ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          <div className={`exclusive-products-layout ${!showSidebar ? 'filters-hidden' : ''}`}>
            
            {/* Left Sidebar */}
            <aside className={`exclusive-filters-sidebar ${showSidebar ? 'active-sidebar' : 'inactive-sidebar'}`}>
              <div className="filters-header-box-m3">
                <div className="filters-title-row">
                  <span className="filters-title-m3">Filters</span>
                </div>
                <button className="filter-reset-btn" onClick={handleClearAllFilters}>
                  RESET
                </button>
              </div>

              <div className="filter-block-m3">
                <span className="filter-label-m3">SEARCH</span>
                <div className="filter-search-box-m3">
                  <span className="search-icon-m3">🔍</span>
                  <input
                    type="text"
                    className="filter-search-input-m3"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="unified-filters-card">
                
                {/* Categories Accordion */}
                <div className="filter-card-section root-category-accordion">
                  <div className="section-title-row" onClick={() => setIsRootCategoriesOpen(!isRootCategoriesOpen)}>
                    <h3 className="section-title-text">Categories</h3>
                    <ChevronDown size={14} className={`section-chevron ${isRootCategoriesOpen ? 'rotated' : ''}`} />
                  </div>
                  {isRootCategoriesOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      {rootCategoryTabs.map(cat => {
                        const isSelected = activeTab === cat;
                        return (
                          <label key={cat} className="radio-filter-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                            <input 
                              type="radio"
                              name="root-category-radio"
                              checked={isSelected}
                              onChange={() => {
                                setActiveTab(cat);
                                setActiveSubTab('ALL');
                                setSelectedSubcategories([]);
                              }}
                            />
                            <span>{cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Subcategories Accordion */}
                <div className="filter-card-section category-accordion">
                  <div className="section-title-row" onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}>
                    <h3 className="section-title-text">Subcategories</h3>
                    <ChevronDown size={14} className={`section-chevron ${isCategoriesOpen ? 'rotated' : ''}`} />
                  </div>
                  {isCategoriesOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      {renderDynamicCategoriesFilter()}
                    </div>
                  )}
                </div>

                {/* Shop For Accordion */}
                <div className="filter-card-section shop-for-accordion">
                  <div className="section-title-row" onClick={() => setIsGenderOpen(!isGenderOpen)}>
                    <h3 className="section-title-text">Shop For</h3>
                    <ChevronDown size={14} className={`section-chevron ${isGenderOpen ? 'rotated' : ''}`} />
                  </div>
                  {isGenderOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      {['Men', 'Women', 'Kids', 'Other'].map(gender => {
                        const isChecked = selectedShopFor.includes(gender);
                        return (
                          <label key={gender} className="checkbox-filter-row">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedShopFor(selectedShopFor.filter(g => g !== gender));
                                } else {
                                  setSelectedShopFor([...selectedShopFor, gender]);
                                }
                              }}
                            />
                            <span>{gender}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Price Range Accordion */}
                <div className="filter-card-section price-accordion">
                  <div className="section-title-row" onClick={() => setIsPriceOpen(!isPriceOpen)}>
                    <h3 className="section-title-text">Price Range</h3>
                    <ChevronDown size={14} className={`section-chevron ${isPriceOpen ? 'rotated' : ''}`} />
                  </div>
                  {isPriceOpen && (
                    <div className="section-content price-slider-container" style={{ marginTop: '10px' }}>
                      <input 
                        type="range" 
                        min="100" 
                        max="15000" 
                        step="100"
                        value={priceRange} 
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="pink-price-slider"
                      />
                      <div className="price-labels-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>₹100</span>
                        <span>₹{priceRange.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sizes Accordion */}
                <div className="filter-card-section size-accordion">
                  <div className="section-title-row" onClick={() => setIsSizeOpen(!isSizeOpen)}>
                    <h3 className="section-title-text">Size</h3>
                    <ChevronDown size={14} className={`section-chevron ${isSizeOpen ? 'rotated' : ''}`} />
                  </div>
                  {isSizeOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      <div className="size-buttons-grid">
                        {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map(size => {
                          const isChecked = selectedSizes.includes(size);
                          return (
                            <button 
                              key={size}
                              className={`size-btn ${isChecked ? 'active' : ''}`}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedSizes(selectedSizes.filter(s => s !== size));
                                } else {
                                  setSelectedSizes([...selectedSizes, size]);
                                }
                              }}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Colors Accordion */}
                <div className="filter-card-section color-accordion">
                  <div className="section-title-row" onClick={() => setIsColorsOpen(!isColorsOpen)}>
                    <h3 className="section-title-text">Colors</h3>
                    <ChevronDown size={14} className={`section-chevron ${isColorsOpen ? 'rotated' : ''}`} />
                  </div>
                  {isColorsOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      <div className="color-circles-list">
                        {[
                          { name: 'Pink', value: '#E94FA8' },
                          { name: 'Red', value: '#FF0000' },
                          { name: 'Yellow', value: '#FFCC00' },
                          { name: 'Green', value: '#00CC66' },
                          { name: 'Purple', value: '#8A2BE2' },
                          { name: 'Black', value: '#000000' },
                          { name: 'White', value: '#FFFFFF', border: '1px solid #ddd' },
                          { name: 'Blue', value: '#051838' }
                        ].map(color => {
                          const isChecked = selectedColors.includes(color.name);
                          return (
                            <button 
                              key={color.name}
                              className={`color-bubble ${isChecked ? 'active' : ''}`}
                              style={{ backgroundColor: color.value, border: color.border || 'none' }}
                              onClick={() => {
                                  if (isChecked) {
                                    setSelectedColors(selectedColors.filter(c => c !== color.name));
                                  } else {
                                    setSelectedColors([...selectedColors, color.name]);
                                  }
                              }}
                              title={color.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Availability Accordion */}
                <div className="filter-card-section availability-accordion">
                  <div className="section-title-row" onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}>
                    <h3 className="section-title-text">Availability</h3>
                    <ChevronDown size={14} className={`section-chevron ${isAvailabilityOpen ? 'rotated' : ''}`} />
                  </div>
                  {isAvailabilityOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      <label className="checkbox-filter-row">
                        <input 
                          type="checkbox"
                          checked={showInStock}
                          onChange={(e) => setShowInStock(e.target.checked)}
                        />
                        <span>In Stock</span>
                      </label>
                      <label className="checkbox-filter-row">
                        <input 
                          type="checkbox"
                          checked={showOutOfStock}
                          onChange={(e) => setShowOutOfStock(e.target.checked)}
                        />
                        <span>Out of Stock</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Rating Accordion */}
                <div className="filter-card-section rating-accordion">
                  <div className="section-title-row" onClick={() => setIsRatingsOpen(!isRatingsOpen)}>
                    <h3 className="section-title-text">Rating</h3>
                    <ChevronDown size={14} className={`section-chevron ${isRatingsOpen ? 'rotated' : ''}`} />
                  </div>
                  {isRatingsOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      {[5, 4, 3, 2, 1].map(stars => {
                        const isChecked = selectedRatings.includes(stars);
                        return (
                          <label key={stars} className="checkbox-filter-row">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedRatings(selectedRatings.filter(r => r !== stars));
                                } else {
                                  setSelectedRatings([...selectedRatings, stars]);
                                }
                              }}
                            />
                            <span>{stars}★ & above</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Discount & Offers Accordion */}
                <div className="filter-card-section offers-accordion">
                  <div className="section-title-row" onClick={() => setIsOffersOpenAccordion(!isOffersOpenAccordion)}>
                    <h3 className="section-title-text">Discount & Offers</h3>
                    <ChevronDown size={14} className={`section-chevron ${isOffersOpenAccordion ? 'rotated' : ''}`} />
                  </div>
                  {isOffersOpenAccordion && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      {[10, 20, 30, 40].map(pct => {
                        const isChecked = selectedDiscounts.includes(pct);
                        return (
                          <label key={pct} className="checkbox-filter-row">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedDiscounts(selectedDiscounts.filter(d => d !== pct));
                                } else {
                                  setSelectedDiscounts([...selectedDiscounts, pct]);
                                }
                              }}
                            />
                            <span>{pct}% and above</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Collections Accordion */}
                <div className="filter-card-section collections-accordion">
                  <div className="section-title-row" onClick={() => setIsBestSellersOpen(!isBestSellersOpen)}>
                    <h3 className="section-title-text">Collections</h3>
                    <ChevronDown size={14} className={`section-chevron ${isBestSellersOpen ? 'rotated' : ''}`} />
                  </div>
                  {isBestSellersOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      <label className="checkbox-filter-row">
                        <input 
                          type="checkbox"
                          checked={filterBestSellers}
                          onChange={(e) => setFilterBestSellers(e.target.checked)}
                        />
                        <span>Best Sellers</span>
                      </label>
                      <label className="checkbox-filter-row">
                        <input 
                          type="checkbox"
                          checked={filterOffers}
                          onChange={(e) => setFilterOffers(e.target.checked)}
                        />
                        <span>Offers</span>
                      </label>
                    </div>
                  )}
                </div>

              </div>
            </aside>

            {/* Right Products Content */}
            <main className="exclusive-products-content" style={{ flex: 1 }}>
              
              {/* Premium Sort Bar */}
              <div className="premium-sort-bar-m2">
                <div className="showing-products-count">
                  Showing <span className="gold-count">{filteredProducts.length}</span> new arrivals
                </div>
                <div className="sort-by-container">
                  <span className="sort-by-label">SORT BY:</span>
                  <select 
                    className="premium-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="DEFAULT">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="top-rated">Top Rated</option>
                    <option value="highest-discount">Highest Discount</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20" style={{ fontSize: '1.2rem', color: '#666' }}>
                  <div className="shimmer-card" style={{ height: '300px', borderRadius: '12px' }}></div>
                  <p style={{ marginTop: '15px' }}>Loading the fresh collection...</p>
                </div>
              ) : currentProducts.length === 0 ? (
                <div className="text-center py-20" style={{ fontSize: '1.2rem', color: '#666' }}>
                  No new arrivals match your selected filter criteria.
                </div>
              ) : (
                <>
                  <div className="shop-products-grid animate-fade-in-up">
                    {currentProducts.map((prod) => {
                      const isWishlisted = wishlist.includes(prod.id);
                      const isInCart = cart.includes(prod.id);
                      const inStock = isProductInStock(prod);

                      const originalPriceNum = prod.originalPrice ? parseFloat(String(prod.originalPrice).replace(/[^0-9.]/g, '')) : 0;
                      const priceNum = typeof prod.price === 'number' ? prod.price : parseFloat(String(prod.price).replace(/[^0-9.]/g, '')) || 0;
                      const discountPercentage = (originalPriceNum && originalPriceNum > priceNum) 
                        ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
                        : (prod.discount && parseFloat(String(prod.discount)) <= 100 
                            ? Math.round(parseFloat(String(prod.discount))) 
                            : 0);
                      const brandName = prod.brand || 'Mithira Collection';

                      return (
                        <div 
                          key={prod.id} 
                          className="clothing-product-card theme-clothing animate-fade-in-up"
                          onClick={() => {
                            setFullDetailProduct(prod);
                            setModalQty(1);
                            setModalColor('');
                            setActiveImageIndex(0);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); setFullDetailProduct(prod); setModalQty(1); setModalColor(''); setActiveImageIndex(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                            {/* Dedicated NEW Badge */}
                            {prod.isNewArrival ? (
                              <div className="arrival-new-badge">NEW</div>
                            ) : (
                              discountPercentage > 0 && (
                                <div className="clothing-discount-badge">{discountPercentage}% OFF</div>
                              )
                            )}
                            
                            <button 
                              className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                              aria-label="Add to Wishlist"
                            >
                              <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>

                            <img src={resolveProductImage(prod)} alt={prod.title} className="clothing-img" />

                            <div className="clothing-hover-overlay">
                              <button 
                                className={`clothing-hover-action-btn hover-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                title="Add to Wishlist"
                              >
                                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                              </button>
                              <button 
                                className="clothing-hover-action-btn hover-quickview-btn"
                                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(0); setModalColor(''); setModalSize('M'); setQuickViewProduct(prod); }}
                                title="Quick View"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                className={`clothing-hover-action-btn hover-cart-btn ${isInCart ? 'in-cart' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                                title="Add to Cart"
                              >
                                <ShoppingCart size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="clothing-info-section">
                            <div className="clothing-brand-row">
                              <span className="clothing-brand-name">{brandName}</span>
                              <div className="clothing-stock-badge">
                                <span className={inStock ? 'stock-status-in' : 'stock-status-out'}>
                                  {inStock ? "In Stock" : "Out of Stock"}
                                </span>
                              </div>
                            </div>

                            <h4 className="clothing-product-title">{prod.title}</h4>

                            <div className="clothing-rating-badge-container">
                              <div className="clothing-rating-pill-green">
                                <span>{(prod.rating || 5).toFixed(1)}</span>
                                <span className="rating-star-icon">★</span>
                                <span className="rating-divider">|</span>
                                <span className="rating-count">{prod.reviews || 0}</span>
                              </div>
                            </div>

                            <div className="clothing-price-and-action">
                              <div className="clothing-price-box">
                                <span className="clothing-selling-price">₹{priceNum.toLocaleString()}</span>
                                {originalPriceNum > priceNum && (
                                  <span className="clothing-original-price">₹{originalPriceNum.toLocaleString()}</span>
                                )}
                              </div>
                              <button 
                                className={`clothing-card-add-cart-btn ${isInCart ? 'in-cart' : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                              >
                                {isInCart ? "IN CART" : "ADD TO CART"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="exclusive-pagination-row" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', gap: '8px' }}>
                      <button 
                        className="page-nav-arrow-btn"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        ◀
                      </button>
                      {pageNumbers.map(num => (
                        <button 
                          key={num}
                          className={`page-num-btn ${currentPage === num ? 'active' : ''}`}
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </button>
                      ))}
                      <button 
                        className="page-nav-arrow-btn"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        ▶
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (() => {
        const images = resolveProductGallery(quickViewProduct, modalColor);
        const colors = getProductThemedColors(quickViewProduct);

        const selectedVariant = getSelectedVariant(quickViewProduct, modalColor, modalSize);
        const displayPrice = (selectedVariant && selectedVariant.price !== null && selectedVariant.price !== undefined) 
          ? selectedVariant.price 
          : quickViewProduct.price;
        
        const displayStock = selectedVariant ? selectedVariant.stock : quickViewProduct.stock;
        const isOutOfStock = displayStock <= 0;
        const mainImageUrl = images[activeImageIndex] || resolveProductImage(quickViewProduct);

        const handlePrevThumbnail = () => {
          setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        };
        const handleNextThumbnail = () => {
          setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        };

        return (
          <div className="modal-overlay quickview-modal-overlay animate-fade-in" onClick={() => setQuickViewProduct(null)}>
            <div className="quickview-modal-card split-layout-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
              
              <div className="quickview-modal-header">
                <span className="quickview-modal-title-top">Quick View</span>
                <button className="modal-close-btn" onClick={() => setQuickViewProduct(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="quickview-split-layout">
                <div className="quickview-split-gallery-pane">
                  {images.length > 1 ? (
                    <div className="quickview-thumbnails-nav-wrapper">
                      <button className="thumbnail-nav-arrow up" onClick={handlePrevThumbnail}>
                        <ChevronUp size={14} />
                      </button>
                      <div className="quickview-gallery-thumbnails">
                        {images.map((img, idx) => (
                          <div 
                            key={idx}
                            className={`quickview-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                            onClick={() => {
                              setActiveImageIndex(idx);
                              if (colors && colors[idx]) {
                                setModalColor(colors[idx].name);
                                const matchVar = quickViewProduct.variants?.find(v => v.color?.toLowerCase() === colors[idx].name.toLowerCase());
                                if (matchVar && matchVar.size) setModalSize(matchVar.size);
                              }
                            }}
                          >
                            <img src={img} alt={`thumb-${idx}`} className="quickview-thumbnail-img" />
                          </div>
                        ))}
                      </div>
                      <button className="thumbnail-nav-arrow down" onClick={handleNextThumbnail}>
                        <ChevronUp size={14} style={{ transform: 'rotate(180deg)' }} />
                      </button>
                    </div>
                  ) : null}
                  
                  <div className="quickview-main-image-wrapper">
                    <img src={mainImageUrl} alt={quickViewProduct.title} className="quickview-split-img" />
                  </div>
                </div>

                <div className="quickview-split-info-pane">
                  <h2 className="modal-title">{quickViewProduct.title}</h2>
                  
                  <div className="modal-rating-row">
                    <span className="modal-stars" style={{ color: '#ffb300' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={15} fill={i < (quickViewProduct.rating || 5) ? '#ffb300' : 'none'} color="#ffb300" style={{ display: 'inline-block', marginRight: '2px' }} />
                      ))}
                    </span>
                    <span className="modal-reviews-count">({quickViewProduct.reviews || "48"} Reviews)</span>
                  </div>

                  <div className="modal-price-row">
                    <span className="modal-price">₹{displayPrice.toLocaleString()}</span>
                    {(quickViewProduct.originalPrice || getProductDiscount(quickViewProduct) > 0) && (
                      <>
                        <span className="modal-original-price">₹{(quickViewProduct.originalPrice || Math.round(displayPrice * 1.5)).toLocaleString()}</span>
                        <span className="modal-discount-badge" style={{ background: '#e53935', color: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '0.78rem', fontWeight: 700, marginLeft: '8px' }}>
                          {getProductDiscount(quickViewProduct)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="modal-availability-row">
                    <span className="availability-label">Availability:</span>
                    <span className={`availability-status ${isOutOfStock ? 'out-of-stock-status' : ''}`} style={{ color: isOutOfStock ? '#ff3333' : '#43a047' }}>{isOutOfStock ? "Out of Stock" : "In Stock"}</span>
                  </div>

                  <p className="modal-desc">
                    {quickViewProduct.description || "Elegant and premium collection item designed to complement your cultural roots. Crafted with pure fabric and detailed quality finishes."}
                  </p>

                  {renderCategorySelectors(quickViewProduct, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty)}

                  <div className="modal-section-block quantity-section">
                    <span className="modal-section-title">Quantity:</span>
                    <div className="modal-quantity-selector">
                      <button className="qty-btn" onClick={() => setModalQty(Math.max(1, modalQty - 1))}>-</button>
                      <span className="qty-value">{modalQty}</span>
                      <button className="qty-btn" onClick={() => setModalQty(modalQty + 1)}>+</button>
                    </div>
                  </div>

                  <div className="modal-actions-buttons-row">
                    <button 
                      className="modal-primary-action-btn"
                      onClick={() => {
                        toggleCart(quickViewProduct.id, quickViewProduct.title, modalSize, modalColor);
                        setQuickViewProduct(null);
                      }}
                      disabled={isOutOfStock}
                    >
                      {cart.includes(quickViewProduct.id) ? "Remove from Cart" : "Add to Cart"}
                    </button>
                    <button 
                      className="modal-secondary-action-btn"
                      onClick={() => {
                        setFullDetailProduct(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                    >
                      Go to Product
                    </button>
                  </div>
                  
                  <div className="modal-extra-links-row">
                    <button 
                      className={`modal-extra-link-btn ${wishlist.includes(quickViewProduct.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                    >
                      <Heart size={16} fill={wishlist.includes(quickViewProduct.id) ? "currentColor" : "none"} style={{ marginRight: '6px' }} />
                      <span>{wishlist.includes(quickViewProduct.id) ? "Added to Wishlist" : "Add to Wishlist"}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
