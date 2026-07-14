import React, { useState, useEffect } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp, Menu, Eye, ShoppingCart } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { apiService } from '../services/apiService';
import { categoryConfigService } from '../services/categoryConfigService';
import clothingUser1 from '../assets/clothing_user_1.jpg';
import clothingUser2 from '../assets/clothing_user_2.jpg';
import { useToast } from './ToastProvider';
import { resolveProductImage, resolveProductGallery, isRealImg } from '../utils/imageHelper';
import { COLOR_MAP, getColorHex, getValuesForFilter, getFilterOptions, applyDynamicFilters, getProductBadge, getMergedFiltersForPath } from '../utils/filterUtils';
import { loadPersistentFilters, savePersistentFilters, clearPersistentFilters } from '../utils/filterPersistence';

export default function ProductsSection({ authUser, setAuthUser }) {
  const { addToast } = useToast();
  
  // Real product data states
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(() => authUser?.wishlist || []);
  const [currentArrivalIndex, setCurrentArrivalIndex] = useState(0);

  // Left filters state matching image3/mockup design
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedShopFor, setSelectedShopFor] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [filterNewArrivals, setFilterNewArrivals] = useState(false);
  const [filterBestSellers, setFilterBestSellers] = useState(false);
  const [filterOffers, setFilterOffers] = useState(false);
  
  const [maxPrice, setMaxPrice] = useState(10000); // price slider
  const [searchQuery, setSearchQuery] = useState(''); // search products
  const [sortBy, setSortBy] = useState('relevance');
  const [isUrlParsed, setIsUrlParsed] = useState(false);
  
  // Flat Categories checklist states
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Local Quick View state variables
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalColor, setModalColor] = useState('');
  const [modalSize, setModalSize] = useState('M');
  const [modalQty, setModalQty] = useState(1);

  // Accordion Open/Closed States (Category and Shop For are default true, others false)
  const [isCategoryAccordionOpen, setIsCategoryAccordionOpen] = useState(true);
  const [isShopForAccordionOpen, setIsShopForAccordionOpen] = useState(true);
  const [isPriceAccordionOpen, setIsPriceAccordionOpen] = useState(false);
  const [isSizeAccordionOpen, setIsSizeAccordionOpen] = useState(false);
  const [isColorsAccordionOpen, setIsColorsAccordionOpen] = useState(false);
  const [isAvailabilityAccordionOpen, setIsAvailabilityAccordionOpen] = useState(false);
  const [isRatingAccordionOpen, setIsRatingAccordionOpen] = useState(false);
  const [isOffersAccordionOpen, setIsOffersAccordionOpen] = useState(false);
  const [isCollectionAccordionOpen, setIsCollectionAccordionOpen] = useState(false);

  const [categoryConfigs, setCategoryConfigs] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [openSections, setOpenSections] = useState({});

  // Categories Tree from DB
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    apiService.getCategories().then(data => {
      if (data && data.length > 0) {
        setCategoriesList(data);
      }
    }).catch(console.error);

    categoryConfigService.getCategoryConfigurations().then(confs => {
      if (confs) {
        setCategoryConfigs(confs);
      }
    }).catch(console.error);
  }, []);

  const getUnifiedCategories = () => {
    const defaultGroups = [
      { name: 'Clothing', key: 'CLOTHING' },
      { name: 'Stationery', key: 'STATIONERY' },
      { name: 'Gifts', key: 'GIFTS' },
      { name: 'Accessories', key: 'ACCESSORIES' }
    ];

    const buildTree = (parentName, parentKey) => {
      if (!categoriesList || categoriesList.length === 0) return [];
      const dbChildren = categoriesList.filter(cat => {
        if (!cat.parent) return false;
        const pName = cat.parent.toLowerCase().trim();
        const searchName = parentName.toLowerCase().trim();
        if (pName === searchName) return true;
        if (searchName === 'accessories') {
          return pName === 'accessories' || pName === 'fancy' || pName === 'accessories & fancy' || pName === 'accessories and fancy';
        }
        return false;
      });
      return dbChildren.map(cat => {
        const uniqueKey = `${parentKey}_${cat.name.toUpperCase().replace(/\s+/g, '_')}`;
        return {
          key: uniqueKey,
          dbName: cat.name,
          label: cat.name,
          children: buildTree(cat.name, uniqueKey)
        };
      });
    };

    const structure = [];
    const dbRoots = categoriesList.filter(
      cat =>
        (!cat.parent || cat.parent === '—') &&
        cat.name !== '—' &&
        cat.showInFilters !== false
    );

    defaultGroups.forEach(def => {
      const dbRoot = dbRoots.find(r => {
        const rName = r.name.toLowerCase().trim();
        const defName = def.name.toLowerCase().trim();
        if (rName === defName) return true;
        if (def.key === 'ACCESSORIES') {
          return rName === 'accessories' || rName === 'fancy' || rName === 'accessories & fancy' || rName === 'accessories and fancy';
        }
        return false;
      });
      const subcategories = dbRoot ? buildTree(dbRoot.name, def.key) : [];
      structure.push({
        name: def.name,
        key: def.key,
        subcategories
      });
    });

    return structure;
  };

  const getProductSubCategoryFallback = (p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const cat = String(p.rawCategory || p.category || '').split('>')[0].trim().toUpperCase();
    
    if (cat === 'CLOTHING') {
      if (title.includes('girl')) return 'GIRLS';
      if (title.includes('boy')) return 'BOYS';
      if (title.includes('kids') || title.includes('child')) return 'KIDS';
      if (title.includes('women') || title.includes('saree') || title.includes('frock') || title.includes('lehenga') || title.includes('anarkali') || title.includes('kurti')) return 'WOMEN';
      if (title.includes('men') || title.includes('male') || title.includes('dhoti') || title.includes('kurta') || title.includes('shirt')) return 'MEN';
      return 'WOMEN';
    }
    if (cat === 'STATIONERY') {
      if (title.includes('pen')) return 'PENS';
      if (title.includes('journal') || title.includes('planner')) return 'JOURNALS';
      if (title.includes('notebook') || title.includes('diary')) return 'NOTEBOOKS';
      return 'SCHOOL';
    }
    if (cat === 'GIFTS') {
      if (title.includes('birthday')) return 'BIRTHDAY';
      if (title.includes('wedding')) return 'WEDDING';
      if (title.includes('anniversary')) return 'ANNIVERSARY';
      return 'RETURN';
    }
    if (cat === 'ACCESSORIES') {
      if (title.includes('jewel') || title.includes('ring') || title.includes('necklace') || title.includes('choker') || title.includes('anklet')) return 'JEWELLERY';
      if (title.includes('hair') || title.includes('gajra') || title.includes('clip')) return 'HAIR';
      if (title.includes('bag') || title.includes('handbag') || title.includes('wallet')) return 'FANCY';
      return 'FASHION';
    }
    return 'ALL';
  };

  const getProductSubCategories = (p) => {
    const subs = [];
    const parts = String(p.rawCategory || p.category || '').split('>').map(s => s.trim().toUpperCase());
    if (parts.length > 1) {
      parts.slice(1).forEach(part => {
        if (part) subs.push(part);
      });
    }
    if (p.subCategory) {
      const subUpper = String(p.subCategory).trim().toUpperCase();
      if (!subs.includes(subUpper)) {
        subs.push(subUpper);
      }
    }
    if (subs.length === 0) {
      const guessed = getProductSubCategoryFallback(p);
      if (guessed && guessed !== 'ALL') {
        subs.push(guessed);
      }
    }
    return subs;
  };

  const getProductSizes = (p) => {
    if (p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0) return p.sizes;
    const idStr = String(p.id || '');
    const charCode = idStr.charCodeAt(idStr.length - 1) || 0;
    const sizes = ['S', 'M', 'L', 'XL'];
    if (charCode % 2 === 0) sizes.push('XS');
    if (charCode % 3 === 0) sizes.push('2XL');
    return sizes;
  };

  const getProductColors = (p) => {
    if (p.colors && Array.isArray(p.colors) && p.colors.length > 0) return p.colors;
    const idStr = String(p.id || '');
    const charCode = idStr.charCodeAt(idStr.length - 1) || 0;
    const colors = ['White', 'Black'];
    if (charCode % 2 === 0) colors.push('Pink');
    if (charCode % 3 === 0) colors.push('Red');
    if (charCode % 4 === 0) colors.push('Yellow');
    if (charCode % 5 === 0) colors.push('Green');
    if (charCode % 6 === 0) colors.push('Purple');
    if (charCode % 7 === 0) colors.push('Blue');
    return colors;
  };

  const isProductInStock = (p) => {
    if (p.stock !== undefined) return p.stock > 0;
    const val = p.title || p.name || '';
    return (val.length % 7 !== 0);
  };

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

  const getProductGender = (p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const cat = String(p.rawCategory || p.category || '').toLowerCase();
    const sub = String(p.subCategory || '').toLowerCase();
    
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


  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const [cart, setCart] = useState(() => {
    if (authUser) return authUser.cart || [];
    try {
      const local = localStorage.getItem('mithira_guest_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setWishlist(authUser?.wishlist || []);
    setCart(authUser?.cart || (() => {
      try {
        const local = localStorage.getItem('mithira_guest_cart');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    })());
  }, [authUser]);

  const toggleCart = (id, title, size = null, color = null) => {
    let updated;
    let updatedItems = [];
    if (cart.includes(id)) {
      updated = cart.filter(item => item !== id);
      addToast({ message: `Removed from cart`, type: 'cart' });
    } else {
      updated = [...cart, id];
      addToast({ message: `🛒 Added "${title}" to cart!`, type: 'cart' });
    }
    setCart(updated);

    const prevItems = authUser ? (authUser.cartItems || []) : (JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]'));
    const isRemoving = !updated.includes(id);

    if (isRemoving) {
      updatedItems = prevItems.filter(item => item.productId !== id);
    } else {
      const prod = productsList.find(p => p.id === id || String(p.id) === String(id));
      const selectedVariant = getSelectedVariant(prod, color, size);
      const variantId = selectedVariant ? (selectedVariant._id || selectedVariant.id || '') : null;
      const rawSku = selectedVariant ? selectedVariant.sku : null;
      const sku = rawSku && rawSku.includes('||') ? rawSku.split('||')[0] : rawSku;

      updatedItems = [...prevItems.filter(item => item.productId !== id), {
        productId: id,
        quantity: 1,
        variant: { size, color, variantId, sku }
      }];
    }

    if (authUser) {
      apiService.syncCart(updated, updatedItems).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, cart: res.cart || updated, cartItems: res.cartItems || updatedItems };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
        }
      });
    } else {
      localStorage.setItem('mithira_guest_cart', JSON.stringify(updated));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(updatedItems));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
    }
  };


  const handleProductClick = (product) => {
    sessionStorage.setItem('auto_open_product_id', String(product.id));
    handleNavigation('/Shop');
  };

  const handleQuickViewClick = (product) => {
    setActiveImageIndex(0);
    setModalColor('');
    setModalSize('M');
    setModalQty(1);
    setQuickViewProduct(product);
  };

  const toggleWishlist = (id) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
      addToast({ message: 'Removed from wishlist', type: 'wishlist' });
    } else {
      updated = [...wishlist, id];
      addToast({ message: '❤️ Added to wishlist!', type: 'wishlist' });
    }
    setWishlist(updated);
    if (authUser) {
      apiService.syncWishlist(updated).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, wishlist: res };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
        }
      });
    }
  };

  const trendingProductsFallback = [];
  const newArrivalsProducts = [];

  // Fetch real products from backend or localStorage on mount
  useEffect(() => {
    apiService.getProducts()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((p) => {
            let catUpper = (p.category || 'CLOTHING').toUpperCase();
            let cleanCategory = 'CLOTHING';

            if (p.category && p.category.includes('>')) {
              const rootCat = p.category.split('>')[0].toUpperCase();
              if (rootCat.includes('CLOTHING') || rootCat.includes('DRESS')) cleanCategory = 'CLOTHING';
              else if (rootCat.includes('STATIONERY') || rootCat.includes('PEN') || rootCat.includes('PENCIL') || rootCat.includes('NOTEBOOK') || rootCat.includes('WRITING') || rootCat.includes('PAPER')) cleanCategory = 'STATIONERY';
              else if (rootCat.includes('GIFT') || rootCat.includes('VALENTINE')) cleanCategory = 'GIFTS';
              else if (rootCat.includes('ACCESSORIES') || rootCat.includes('FANCY') || rootCat.includes('JEWEL') || rootCat.includes('WATCH')) cleanCategory = 'ACCESSORIES';
              else cleanCategory = rootCat;
            } else {
              if (catUpper.includes('CLOTHING') || catUpper.includes('DRESS')) cleanCategory = 'CLOTHING';
              else if (catUpper.includes('STATIONERY') || catUpper.includes('PEN') || catUpper.includes('PENCIL') || catUpper.includes('NOTEBOOK') || catUpper.includes('WRITING') || catUpper.includes('PAPER')) cleanCategory = 'STATIONERY';
              else if (catUpper.includes('GIFT') || catUpper.includes('VALENTINE')) cleanCategory = 'GIFTS';
              else if (catUpper.includes('ACCESSORIES') || catUpper.includes('FANCY') || catUpper.includes('JEWEL') || catUpper.includes('WATCH')) cleanCategory = 'ACCESSORIES';
              else cleanCategory = catUpper;
            }

            // Extract price formatting safely
            const rawPrice = p.price;
            const displayPrice = typeof rawPrice === 'number' ? `₹${rawPrice}` : (String(rawPrice).startsWith('₹') ? rawPrice : `₹${rawPrice}`);
            const rawOriginalPrice = p.originalPrice || '';
            const displayOriginalPrice = rawOriginalPrice ? (typeof rawOriginalPrice === 'number' ? `₹${rawOriginalPrice}` : (String(rawOriginalPrice).startsWith('₹') ? rawOriginalPrice : `₹${rawOriginalPrice}`)) : '';
            const discountStr = p.discount && p.discount !== '0' ? `${p.discount}% off` : '';

            // Handle images array or string using helper
            const imgUrl = resolveProductImage(p);

            return {
              ...p,
              id: p.id || String(Math.random()),
              title: p.name || p.title || 'Premium Item',
              category: cleanCategory,
              rawCategory: p.category || '',
              subCategory: p.subCategory || '',
              price: displayPrice,
              originalPrice: displayOriginalPrice,
              discount: discountStr,
              rating: Math.floor(parseFloat(p.rating || '4')),
              reviews: p.reviews || 75,
              image: imgUrl,
              badge: p.badge || (p.sales > 20 ? 'BEST SELLER' : ''),
              stock: p.stock,
              sizes: p.sizes,
              colors: p.colors
            };
          });
          
          // Filter to display first 12 products and all new products (ID > 116)
          const exclusiveOnly = mapped.filter((p, index) => {
            const pid = Number(p.id);
            if (index < 12) return true;
            if (pid > 116) return true;
            return false;
          });
          setProductsList(exclusiveOnly);
        } else {
          setProductsList(trendingProductsFallback);
        }
      })
      .catch(() => {
        setProductsList(trendingProductsFallback);
      })
      .finally(() => setLoading(false));
  }, []);

  // Parse query parameters on load and popstate
  useEffect(() => {
    const parseUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get('search');
      if (searchParam) {
        setSearchQuery(decodeURIComponent(searchParam));
      } else {
        setSearchQuery('');
      }

      // Check if URL contains any filter parameters
      const hasUrlFilters = Array.from(params.keys()).some(k => 
        ['search', 'price', 'instock', 'outofstock', 'rating', 'discount', 'subcategory', 'offers', 'newarrivals', 'bestsellers'].includes(k.toLowerCase())
      );

      let loaded = null;
      if (!hasUrlFilters) {
        loaded = loadPersistentFilters();
      }

      if (loaded) {
        if (loaded.priceRange !== undefined) setMaxPrice(loaded.priceRange);
        if (loaded.showInStock !== undefined) setShowInStock(loaded.showInStock);
        if (loaded.showOutOfStock !== undefined) setShowOutOfStock(loaded.showOutOfStock);
        if (loaded.selectedRatings !== undefined) setSelectedRatings(loaded.selectedRatings);
        if (loaded.selectedDiscounts !== undefined) setSelectedDiscounts(loaded.selectedDiscounts);
        if (loaded.selectedSubcategories !== undefined) setSelectedSubcategories(loaded.selectedSubcategories);
        if (loaded.filterNewArrivals !== undefined) setFilterNewArrivals(loaded.filterNewArrivals);
        if (loaded.filterBestSellers !== undefined) setFilterBestSellers(loaded.filterBestSellers);
        if (loaded.filterOffers !== undefined) setFilterOffers(loaded.filterOffers);
        if (loaded.activeFilters !== undefined) setActiveFilters(loaded.activeFilters);
      } else if (hasUrlFilters) {

        // Parse dynamic filters
        const dynamicFilters = {};
        const ignoredParams = ['search', 'price', 'instock', 'outofstock', 'rating', 'discount', 'subcategory', 'offers', 'newarrivals', 'bestsellers'];
        params.forEach((value, key) => {
          if (!ignoredParams.includes(key.toLowerCase())) {
            dynamicFilters[key] = value.split(',').map(v => decodeURIComponent(v));
          }
        });
        setActiveFilters(dynamicFilters);

        const subParam = params.get('subcategory');
        if (subParam) {
          setSelectedSubcategories(subParam.split(',').map(v => decodeURIComponent(v)));
        } else {
          setSelectedSubcategories([]);
        }

        const priceVal = params.get('price');
        if (priceVal) {
          setMaxPrice(Number(priceVal));
        } else {
          setMaxPrice(10000);
        }

        const instockVal = params.get('instock');
        if (instockVal === 'false') {
          setShowInStock(false);
        } else {
          setShowInStock(true);
        }

        const outofstockVal = params.get('outofstock');
        if (outofstockVal === 'false') {
          setShowOutOfStock(false);
        } else {
          setShowOutOfStock(true);
        }

        const ratingVal = params.get('rating');
        if (ratingVal) {
          setSelectedRatings(ratingVal.split(',').map(Number));
        } else {
          setSelectedRatings([]);
        }

        const discountVal = params.get('discount');
        if (discountVal) {
          setSelectedDiscounts(discountVal.split(',').map(Number));
        } else {
          setSelectedDiscounts([]);
        }

        const offersVal = params.get('offers');
        if (offersVal === 'true') {
          setFilterOffers(true);
        } else {
          setFilterOffers(false);
        }

        const newArrivalsVal = params.get('newarrivals');
        if (newArrivalsVal === 'true') {
          setFilterNewArrivals(true);
        } else {
          setFilterNewArrivals(false);
        }

        const bestSellersVal = params.get('bestsellers');
        if (bestSellersVal === 'true') {
          setFilterBestSellers(true);
        } else {
          setFilterBestSellers(false);
    setFilterOffers(false);
        }
      } else {
        setSearchQuery('');
        setMaxPrice(10000);
        setShowInStock(true);
        setShowOutOfStock(true);
        setSelectedRatings([]);
        setSelectedDiscounts([]);
        setSelectedSubcategories([]);
        setFilterNewArrivals(false);
        setFilterBestSellers(false);
        setFilterOffers(false);
        setActiveFilters({});
      }
      setIsUrlParsed(true);
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Sync filter state to URL query parameters
  useEffect(() => {
    if (!isUrlParsed) return;
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (maxPrice !== 10000) params.set('price', maxPrice);
    if (!showInStock) params.set('instock', 'false');
    if (!showOutOfStock) params.set('outofstock', 'false');
    if (selectedRatings.length > 0) params.set('rating', selectedRatings.join(','));
    if (selectedDiscounts.length > 0) params.set('discount', selectedDiscounts.join(','));
    if (selectedSubcategories.length > 0) params.set('subcategory', selectedSubcategories.map(v => encodeURIComponent(v)).join(','));
    if (filterOffers) params.set('offers', 'true');
    if (filterNewArrivals) params.set('newarrivals', 'true');
    if (filterBestSellers) params.set('bestsellers', 'true');
    
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        params.set(key, values.map(v => encodeURIComponent(v)).join(','));
      }
    });

    // Save to persistent filters storage
    savePersistentFilters({
      searchQuery: '',
      priceRange: maxPrice,
      showInStock,
      showOutOfStock,
      selectedRatings,
      selectedDiscounts,
      selectedSubcategories,
      filterNewArrivals,
      filterBestSellers,
      filterOffers,
      activeFilters
    });

    const queryString = params.toString();
    const newUrl = window.location.pathname + (queryString ? '?' + queryString : '');
    
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.pushState(null, '', newUrl);
    }
  }, [isUrlParsed, searchQuery, maxPrice, showInStock, showOutOfStock, selectedRatings, selectedDiscounts, selectedSubcategories, activeFilters, filterNewArrivals, filterBestSellers, filterOffers]);

    // Auto slider setup for New Arrivals
  useEffect(() => {
    if (newArrivalsProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentArrivalIndex((prev) => (prev + 1) % newArrivalsProducts.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [newArrivalsProducts.length]);

  const handleResetFilters = () => {
    setActiveFilters({});
    setOpenSections({});
    setSelectedSubcategories([]);
    setSelectedShopFor([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setShowInStock(true);
    setShowOutOfStock(true);
    setSelectedRatings([]);
    setSelectedDiscounts([]);
    setFilterNewArrivals(false);
    setFilterBestSellers(false);
    setMaxPrice(10000);
    setSearchQuery('');
    setSortBy('relevance');
    setCategorySearchQuery('');
    setShowAllCategories(false);
  };

  const getCategoryCount = (categoryKey) => {
    if (categoryKey === 'ALL') return productsList.length;
    return productsList.filter(p => p.category.toUpperCase() === categoryKey.toUpperCase()).length;
  };

  const getThemeClass = (category) => {
    switch (category) {
      case 'CLOTHING': return 'prod-theme-clothing';
      case 'GIFTS': return 'prod-theme-gifts';
      case 'STATIONERY': return 'prod-theme-stationery';
      case 'ACCESSORIES': return 'prod-theme-accessories';
      default: return '';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={13} 
        fill={i < rating ? "currentColor" : "none"} 
        className={i < rating ? "star-filled" : "star-empty"}
      />
    ));
  };

  const getCategoriesToShow = () => {
    let list = [];
    if (categoriesList && categoriesList.length > 0) {
      const namesSet = new Set();
      categoriesList.forEach(cat => {
        if (cat.name && cat.name !== '—' && cat.showInFilters !== false) {
          const nameUpper = cat.name.toUpperCase().trim();
          const parentUpper = cat.parent ? cat.parent.toUpperCase().trim() : '';
          const mainGroups = ['CLOTHING', 'STATIONERY', 'GIFTS', 'ACCESSORIES', 'FANCY'];
          if (parentUpper && parentUpper !== '—') {
            namesSet.add(cat.name.trim());
          } else if (!mainGroups.includes(nameUpper)) {
            namesSet.add(cat.name.trim());
          }
        }
      });
      list = Array.from(namesSet);
    }
    
    if (list.length === 0) {
      list = [
        'Girls', 'Boys', 'Kids', 'Women', 'Men', 
        'Pens', 'Journals', 'Notebooks', 'School', 
        'Birthday', 'Wedding', 'Anniversary', 'Return Gifts', 
        'Jewellery', 'Hair Accessories', 'Fancy Bags', 'Fashion Accessories'
      ];
    }
    
    return list.sort((a, b) => a.localeCompare(b));
  };

  const renderCategoryTree = () => {
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

  const handleToggleFilter = (filterName, value) => {
    setActiveFilters(prev => {
      const current = prev[filterName] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      const newFilters = { ...prev };
      if (updated.length > 0) {
        newFilters[filterName] = updated;
      } else {
        delete newFilters[filterName];
      }
      return newFilters;
    });
  };

  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const categoryProducts = productsList;

  // Compute merged category filters from parent + subcategory configs (case-insensitive, no duplicates)
  const categoryFilters = getMergedFiltersForPath(
    categoryConfigs,
    'ALL',
    'ALL',
    selectedSubcategories,
    categoriesList
  );

  const dynamicFilterNames = categoryFilters.filter(f => f && typeof f === 'string' && f.toLowerCase() !== 'price');

  // Apply filters: Search, Subcategories, Shop For, Price, Sizes, Colors, Availability, Ratings, Discounts, Collections
  let displayProducts = productsList;

  // 1. Search Query
  if (searchQuery.trim() !== '') {
    displayProducts = displayProducts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // 2. Subcategories Checkbox Filter
  if (selectedSubcategories.length > 0) {
    displayProducts = displayProducts.filter(p => {
      const productSubs = getProductSubCategories(p).map(s => s.toUpperCase());
      return productSubs.some(sub => selectedSubcategories.includes(sub));
    });
  }

  // 3. Dynamic Attribute and Variant Filters
  displayProducts = applyDynamicFilters(displayProducts, activeFilters);

  // 4. Price Filter
  const hasPriceFilter = categoryFilters.some(f => f && typeof f === 'string' && f.toLowerCase() === 'price') || selectedSubcategories.length === 0;
  if (hasPriceFilter) {
    displayProducts = displayProducts.filter(p => {
      const priceNum = parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
      return priceNum <= maxPrice;
    });
  }

  // 8. Ratings Filter
  if (selectedRatings.length > 0) {
    const minRating = Math.min(...selectedRatings);
    displayProducts = displayProducts.filter(p => p.rating >= minRating);
  }

  // 9. Discounts Filter
  if (selectedDiscounts.length > 0) {
    const minDiscount = Math.min(...selectedDiscounts);
    displayProducts = displayProducts.filter(p => getProductDiscount(p) >= minDiscount);
  }

  // 10. Collections Filter
  if (filterNewArrivals || filterBestSellers || filterOffers) {
    displayProducts = displayProducts.filter(p => {
      const isNew = p.badge === 'NEW' || p.badge === 'NEW ARRIVAL' || String(p.id).startsWith('n');
      const isBest = p.badge === 'BEST SELLER' || String(p.id).startsWith('t');
      const isOffer = p.isOffer || p.badge?.toUpperCase().includes('OFFER') || p.badge?.toUpperCase().includes('DEAL') || getProductDiscount(p) > 0;
      
      const matches = [];
      if (filterNewArrivals) matches.push(isNew);
      if (filterBestSellers) matches.push(isBest);
      if (filterOffers) matches.push(isOffer);
      return matches.some(Boolean);
    });
  }

  // Apply sorting
  if (sortBy === 'price-low') {
    displayProducts = [...displayProducts].sort((a, b) => {
      const pA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const pB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return pA - pB;
    });
  } else if (sortBy === 'price-high') {
    displayProducts = [...displayProducts].sort((a, b) => {
      const pA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
      const pB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
      return pB - pA;
    });
  } else if (sortBy === 'rating') {
    displayProducts = [...displayProducts].sort((a, b) => b.rating - a.rating);
  }

  const currentArrival = newArrivalsProducts[currentArrivalIndex];

  return (
    <div className="products-section-outer">
      
      {/* 1. EXCLUSIVE PRODUCTS SECTION (Full Width, Left-hand Sidebar filters matching image3) */}
      <section id="offers" className="trending-products-section full-width-section-m3">
        <div className="section-container-full-m3">
          
          <div className="section-header">
            <img src={logoImg} className="section-crown-icon" alt="Logo" style={{ objectFit: 'contain' }} />
            <h2 className="section-title">Exclusive Products</h2>
            <p className="section-subtitle">Top Trends &amp; Curated Hot Deals</p>
          </div>

          {/* Toggle Button Row for Collapsing Sidebar */}
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
            
            {/* Left Sidebar: Collapsible Filters */}
            <aside className={`exclusive-filters-sidebar ${showSidebar ? 'active-sidebar' : 'inactive-sidebar'}`}>
              


              {/* Filters Header Container with RESET button */}
              <div className="filters-header-box-m3">
                <div className="filters-title-row">
                  <span className="filters-title-m3">Filters</span>
                </div>
                <button className="filter-reset-btn" onClick={handleResetFilters}>
                  RESET
                </button>
              </div>

              {/* Search Block */}
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
                {/* 1. Category Accordion (default open) */}
                <div className="filter-card-section category-accordion">
                  <div className="section-title-row" onClick={() => setIsCategoryAccordionOpen(!isCategoryAccordionOpen)}>
                    <h3 className="section-title-text">Category</h3>
                    <ChevronDown size={14} className={`section-chevron ${isCategoryAccordionOpen ? 'rotated' : ''}`} />
                  </div>
                  {isCategoryAccordionOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      {renderCategoryTree()}
                    </div>
                  )}
                </div>

                {/* Price Range Accordion (Rendered dynamically if 'Price' filter is configured) */}
                {hasPriceFilter && (
                  <div className="filter-card-section price-accordion">
                    <div className="section-title-row" onClick={() => setIsPriceAccordionOpen(!isPriceAccordionOpen)}>
                      <h3 className="section-title-text">Price Range</h3>
                      <ChevronDown size={14} className={`section-chevron ${isPriceAccordionOpen ? 'rotated' : ''}`} />
                    </div>
                    {isPriceAccordionOpen && (
                      <div className="section-content price-slider-container" style={{ marginTop: '10px' }}>
                        <input 
                          type="range" 
                          min="100" 
                          max="15000" 
                          step="100"
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="pink-price-slider"
                        />
                        <div className="price-labels-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span>₹100</span>
                          <span>₹{maxPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Configuration-Driven Filters */}
                {dynamicFilterNames.map(filterName => {
                  const options = getFilterOptions(categoryProducts, filterName);
                  if (options.length === 0) return null; // Hide if no values

                  const isSectionOpen = openSections[filterName] !== false; // Default open
                  const selectedVals = activeFilters[filterName] || [];

                  return (
                    <div key={filterName} className="filter-card-section dynamic-accordion">
                      <div className="section-title-row" onClick={() => toggleSection(filterName)}>
                        <h3 className="section-title-text">{filterName}</h3>
                        <ChevronDown size={14} className={`section-chevron ${isSectionOpen ? 'rotated' : ''}`} />
                      </div>
                      {isSectionOpen && (
                        <div className="section-content" style={{ marginTop: '10px' }}>
                          {/* Special case: Color circle bubbles */}
                          {(filterName.toLowerCase() === 'color' || filterName.toLowerCase() === 'colors') ? (
                            <div className="color-circles-list">
                              {options.map(colorName => {
                                const isChecked = selectedVals.includes(colorName);
                                const colorVal = COLOR_MAP[colorName.toLowerCase()] || colorName;
                                const borderStyle = colorName.toLowerCase() === 'white' ? '1px solid #ddd' : 'none';
                                return (
                                  <button 
                                    key={colorName}
                                    className={`color-bubble ${isChecked ? 'active' : ''}`}
                                    style={{ backgroundColor: colorVal, border: borderStyle }}
                                    onClick={() => handleToggleFilter(filterName, colorName)}
                                    title={colorName}
                                  />
                                );
                              })}
                            </div>
                          ) : /* Special case: Size button grid */
                          (filterName.toLowerCase() === 'size' || filterName.toLowerCase() === 'sizes') ? (
                            <div className="size-buttons-grid">
                              {options.map(sizeName => {
                                const isChecked = selectedVals.includes(sizeName);
                                return (
                                  <button 
                                    key={sizeName}
                                    className={`size-btn ${isChecked ? 'active' : ''}`}
                                    onClick={() => handleToggleFilter(filterName, sizeName)}
                                  >
                                    {sizeName}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            /* Standard check-box list */
                            options.map(val => {
                              const isChecked = selectedVals.includes(val);
                              return (
                                <label key={val} className="checkbox-filter-row">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleFilter(filterName, val)}
                                  />
                                  <span>{val}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 7. Rating Accordion */}
                <div className="filter-card-section rating-accordion">
                  <div className="section-title-row" onClick={() => setIsRatingAccordionOpen(!isRatingAccordionOpen)}>
                    <h3 className="section-title-text">Rating</h3>
                    <ChevronDown size={14} className={`section-chevron ${isRatingAccordionOpen ? 'rotated' : ''}`} />
                  </div>
                  {isRatingAccordionOpen && (
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

                {/* 9. Bestsellers & New Arrivals Accordion */}
                <div className="filter-card-section collections-accordion">
                  <div className="section-title-row" onClick={() => setIsCollectionAccordionOpen(!isCollectionAccordionOpen)}>
                    <h3 className="section-title-text">Collections</h3>
                    <ChevronDown size={14} className={`section-chevron ${isCollectionAccordionOpen ? 'rotated' : ''}`} />
                  </div>
                  {isCollectionAccordionOpen && (
                    <div className="section-content" style={{ marginTop: '10px' }}>
                      <label className="checkbox-filter-row">
                        <input 
                          type="checkbox"
                          checked={filterNewArrivals}
                          onChange={(e) => setFilterNewArrivals(e.target.checked)}
                        />
                        <span>New Arrivals</span>
                      </label>
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

            {/* Right Side: Redesigned 4-Column Product Grid */}
            <main className="exclusive-products-content">
              {/* Premium Sort Bar (Matches Image 2) */}
              <div className="premium-sort-bar-m2">
                <div className="showing-products-count">
                  Showing <span className="gold-count">{displayProducts.length}</span> premium products
                </div>
                <div className="sort-by-container">
                  <span className="sort-by-label">SORT BY:</span>
                  <select 
                    className="premium-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
              {loading ? (
                <div className="products-grid exclusive-four-grid">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="product-card premium-four-card card-skeleton" style={{ height: '380px', background: '#f5f5f5' }} />
                  ))}
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="no-products-found">
                  <p>No products match your selected filters.</p>
                  <button className="reset-filters-btn" onClick={handleResetFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="products-grid exclusive-four-grid">
                  {displayProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);
                    const isInCart = cart.includes(product.id);
                    
                    const originalPriceNum = product.originalPrice ? parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, '')) : 0;
                    const priceNum = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
                    const discountPercentage = (originalPriceNum && originalPriceNum > priceNum) 
                      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
                      : (product.discount && parseFloat(String(product.discount)) <= 100 
                          ? Math.round(parseFloat(String(product.discount))) 
                          : 0);
                    
                    const brandName = product.brand || 'Mithira Collection';
                    const inStock = product.stock !== undefined ? product.stock > 0 : true;

                    return (
                      <div 
                        key={product.id} 
                        className="clothing-product-card theme-clothing animate-fade-in-up"
                        onClick={() => handleProductClick(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}>
                          {/* Badge Logic */}
                          {(() => {
                            const badgeInfo = getProductBadge(product, discountPercentage);
                            if (!badgeInfo) return null;
                            if (badgeInfo.type === 'NEW') {
                              return <div className="clothing-new-badge" style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#e91e63', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', zIndex: 2 }}>NEW</div>;
                            } else if (badgeInfo.type === 'DISCOUNT') {
                              return <div className="clothing-discount-badge">{badgeInfo.text}</div>;
                            }
                            return null;
                          })()}
                          
                          {/* Wishlist float button (top-right of image) */}
                          <button 
                            className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                            aria-label="Add to Wishlist"
                          >
                            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                          </button>

                          <img src={product.image} alt={product.title} className="clothing-img" />

                          {/* Image Hover Overlay */}
                          <div className="clothing-hover-overlay">
                            <button 
                              className={`clothing-hover-action-btn hover-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                              title="Add to Wishlist"
                            >
                              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                            <button 
                              className="clothing-hover-action-btn hover-quickview-btn"
                              onClick={(e) => { e.stopPropagation(); handleQuickViewClick(product); }}
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className={`clothing-hover-action-btn hover-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(product.id, product.title); }}
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
                              {inStock ? (
                                <span className="stock-status-in">In Stock</span>
                              ) : (
                                <span className="stock-status-out">Out of Stock</span>
                              )}
                            </div>
                          </div>

                          <h4 className="clothing-product-title" onClick={() => handleProductClick(product)}>
                            {product.title}
                          </h4>

                          <div className="clothing-rating-badge-container">
                            <div className="clothing-rating-pill-green">
                              <span>{(product.rating || 5).toFixed(1)}</span>
                              <span className="rating-star-icon">★</span>
                              <span className="rating-divider">|</span>
                              <span className="rating-count">{product.reviews || 0}</span>
                            </div>
                          </div>

                          <div className="clothing-price-and-action">
                            <div className="clothing-price-box">
                              <span className="clothing-selling-price">
                                {String(product.price).startsWith('₹') ? product.price : `₹${product.price}`}
                              </span>
                              {product.originalPrice && (
                                <span className="clothing-original-price">
                                  {String(product.originalPrice).startsWith('₹') ? product.originalPrice : `₹${product.originalPrice}`}
                                </span>
                              )}
                            </div>
                            <button 
                              className={`clothing-card-add-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(product.id, product.title); }}
                            >
                              {isInCart ? "IN CART" : "ADD TO CART"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="section-footer-btn">
                <button 
                  className="view-all-btn exclusive-view-all-btn flex-center"
                  onClick={() => handleNavigation('/Shop')}
                >
                  View All Products
                </button>
              </div>
            </main>
          </div>

        </div>
      </section>

      {/* 2. NEW ARRIVALS (Full-width layout with auto-scroll marquee/carousel themed in premium gold and royal blue) */}
      <section id="new-arrivals" className="new-arrivals-section full-width-arrivals-section theme-gold-blue">

        <div className="section-container full-width-container">

          <div className="section-header">
            <svg className="section-star-icon" viewBox="0 0 40 40" style={{ width: '40px', height: '40px', fill: 'var(--gold-accent)', marginBottom: '10px' }}>
              <path d="M 20,0 L 25,15 L 40,20 L 25,25 L 20,40 L 15,25 L 0,20 L 15,15 Z" />
            </svg>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Exhibition of Brighter Premium Collections</p>
          </div>

          {/* Infinite Marquee Slider Layout */}
          <div className="new-arrivals-carousel-container">
            <div className="new-arrivals-carousel-viewport">
              <div className="new-arrivals-carousel-track">
                {(() => {
                  const dbNewArrivals = productsList.filter(p => p.isNewArrival);
                  const finalNewArrivals = dbNewArrivals;
                  // Duplicate the array 3 times to ensure infinite smooth marquee scrolling across all screen widths
                  const marqueeItems = [...finalNewArrivals, ...finalNewArrivals, ...finalNewArrivals];
                  
                  return marqueeItems.map((product, idx) => {
                    const isWishlisted = wishlist.includes(product.id);
                    const isInCart = cart.includes(product.id);
                    
                    const originalPriceNum = product.originalPrice ? parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, '')) : 0;
                    const priceNum = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
                    const discountPercentage = (originalPriceNum && originalPriceNum > priceNum) 
                      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
                      : (product.discount && parseFloat(String(product.discount)) <= 100 
                          ? Math.round(parseFloat(String(product.discount))) 
                          : 0);
                    
                    const brandName = product.brand || 'Mithira Collection';
                    const inStock = product.stock !== undefined ? product.stock > 0 : true;

                    return (
                      <div 
                        key={`${product.id}-${idx}`} 
                        className="clothing-product-card theme-clothing new-arrival-card animate-fade-in-up"
                        onClick={() => handleProductClick(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="clothing-img-wrapper" onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}>
                          {/* Badge Logic */}
                          {(() => {
                            const badgeInfo = getProductBadge(product, discountPercentage);
                            if (!badgeInfo) return null;
                            if (badgeInfo.type === 'NEW') {
                              return <div className="clothing-new-badge">NEW</div>;
                            } else if (badgeInfo.type === 'DISCOUNT') {
                              return <div className="clothing-discount-badge">{badgeInfo.text}</div>;
                            }
                            return null;
                          })()}
                          
                          {/* Wishlist float button (top-right of image) */}
                          <button 
                            className={`clothing-wishlist-float-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                            aria-label="Add to Wishlist"
                          >
                            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                          </button>

                          <img src={product.image} alt={product.title} className="clothing-img" />

                          {/* Image Hover Overlay */}
                          <div className="clothing-hover-overlay">
                            <button 
                              className={`clothing-hover-action-btn hover-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                              title="Add to Wishlist"
                            >
                              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                            <button 
                              className="clothing-hover-action-btn hover-quickview-btn"
                              onClick={(e) => { e.stopPropagation(); handleQuickViewClick(product); }}
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className={`clothing-hover-action-btn hover-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(product.id, product.title); }}
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
                              {inStock ? (
                                <span className="stock-status-in">In Stock</span>
                              ) : (
                                <span className="stock-status-out">Out of Stock</span>
                              )}
                            </div>
                          </div>

                          <h4 className="clothing-product-title" onClick={() => handleProductClick(product)}>
                            {product.title}
                          </h4>

                          <div className="clothing-rating-badge-container">
                            <div className="clothing-rating-pill-green">
                              <span>{(product.rating || 5).toFixed(1)}</span>
                              <span className="rating-star-icon">★</span>
                              <span className="rating-divider">|</span>
                              <span className="rating-count">{product.reviews || 0}</span>
                            </div>
                          </div>

                          <div className="clothing-price-and-action">
                            <div className="clothing-price-box">
                              <span className="clothing-selling-price">
                                {String(product.price).startsWith('₹') ? product.price : `₹${product.price}`}
                              </span>
                              {product.originalPrice && (
                                <span className="clothing-original-price">
                                  {String(product.originalPrice).startsWith('₹') ? product.originalPrice : `₹${product.originalPrice}`}
                                </span>
                              )}
                            </div>
                            <button 
                              className={`clothing-card-add-cart-btn ${isInCart ? 'in-cart' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleCart(product.id, product.title); }}
                            >
                              {isInCart ? "IN CART" : "ADD TO CART"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          <div className="section-footer-btn">
            <button 
              className="view-all-btn flex-center"
              onClick={() => handleNavigation('/NewArrivals')}
            >
              View All Products
            </button>
          </div>

      {quickViewProduct && (() => {
        const images = getAllProductImages(quickViewProduct, modalColor);
        const colors = getProductThemedColors(quickViewProduct);

        // Find selected variant matching active modalColor and modalSize
        const selectedVariant = getSelectedVariant(quickViewProduct, modalColor, modalSize);
        const displayPrice = (selectedVariant && selectedVariant.price !== null && selectedVariant.price !== undefined) 
          ? selectedVariant.price 
          : quickViewProduct.price;
        
        const displayStock = selectedVariant ? selectedVariant.stock : quickViewProduct.stock;
        const isOutOfStock = displayStock <= 0;
        
        const mainImageUrl = images[activeImageIndex] || resolveProductImage(quickViewProduct);

        const handlePrevThumbnail = () => {
          setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
        };
        const handleNextThumbnail = () => {
          setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
        };

        const priceNum = typeof displayPrice === 'number' ? displayPrice : parseFloat(String(displayPrice).replace(/[^0-9.]/g, '')) || 0;
        const displayPriceStr = `₹${priceNum.toLocaleString()}`;

        const origPrice = quickViewProduct.originalPrice || '';
        const origPriceNum = origPrice ? (typeof origPrice === 'number' ? origPrice : parseFloat(String(origPrice).replace(/[^0-9.]/g, '')) || 0) : Math.round(priceNum * 1.5);
        const displayOriginalPriceStr = `₹${origPriceNum.toLocaleString()}`;

        const discountVal = getProductDiscount(quickViewProduct);

        return (
          <div className={`modal-overlay quickview-split-overlay animate-fade-in ${getCategoryThemeClass(quickViewProduct.category)}`} onClick={() => setQuickViewProduct(null)}>
            <div className="quickview-split-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Top Header Bar */}
              <div className="quickview-modal-header">
                <span className="quickview-modal-title-top">Quick View</span>
                <button className="modal-close-btn" onClick={() => setQuickViewProduct(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="quickview-split-layout">
                {/* Left Pane: Gallery Section */}
                <div className="quickview-split-gallery-pane">
                  {/* Thumbnails column with Nav Chevrons */}
                  {images.length > 1 ? (
                    <div className="quickview-thumbnails-nav-wrapper">
                      <button className="thumbnail-nav-arrow up" onClick={handlePrevThumbnail}>
                        <ChevronUp size={14} />
                      </button>
                      <div className="quickview-gallery-thumbnails">
                        {(() => {
                          const hasVariantImages = quickViewProduct.variants && quickViewProduct.variants.some(v => v.image && isRealImg(v.image));
                          return images.map((img, idx) => (
                            <div 
                              key={idx}
                              className={`quickview-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                              onClick={() => {
                                setActiveImageIndex(idx);
                                if (hasVariantImages && colors && colors[idx]) {
                                  setModalColor(colors[idx].name);
                                  const matchVar = quickViewProduct.variants.find(v => v.color?.toLowerCase() === colors[idx].name.toLowerCase());
                                  if (matchVar && matchVar.size) {
                                    setModalSize(matchVar.size);
                                  }
                                }
                              }}
                            >
                              <img src={img} alt={`thumb-${idx}`} className="quickview-thumbnail-img" />
                            </div>
                          ));
                        })()}
                      </div>
                      <button className="thumbnail-nav-arrow down" onClick={handleNextThumbnail}>
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  ) : null}
                  
                  {/* Main Image display */}
                  <div className="quickview-main-image-wrapper">
                    <img 
                      src={mainImageUrl} 
                      alt={quickViewProduct.title} 
                      className="quickview-split-img" 
                    />
                  </div>
                </div>

                {/* Right Pane: Info & Selector Controls */}
                <div className="quickview-split-info-pane">
                  <h2 className="modal-title">{quickViewProduct.title}</h2>
                  
                  {/* Ratings */}
                  <div className="modal-rating-row">
                    <span className="modal-stars" style={{ color: '#ffb300' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={15} fill={i < (quickViewProduct.rating || 5) ? '#ffb300' : 'none'} color="#ffb300" style={{ display: 'inline-block', marginRight: '2px' }} />
                      ))}
                    </span>
                    <span className="modal-reviews-count">({quickViewProduct.reviews || "48"} Reviews)</span>
                  </div>

                  <div className="modal-price-row">
                    <span className="modal-price">{displayPriceStr}</span>
                    <span className="modal-original-price">{displayOriginalPriceStr}</span>
                    {discountVal > 0 && (
                      <span className="modal-discount-badge" style={{ background: '#e53935', color: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '0.78rem', fontWeight: 700, marginLeft: '8px' }}>
                        {discountVal}% OFF
                      </span>
                    )}
                  </div>

                  <div className="modal-availability-row">
                    <span className="availability-label">Availability:</span>
                    <span className={`availability-status ${isOutOfStock ? 'out-of-stock-status' : ''}`} style={{ color: isOutOfStock ? '#ff3333' : '#43a047' }}>{isOutOfStock ? "Out of Stock" : "In Stock"}</span>
                  </div>

                  <p className="modal-desc">
                    {quickViewProduct.description || "Elegant and premium collection item designed to complement your cultural roots. Crafted with pure fabric and detailed quality finishes."}
                  </p>

                  {/* Category-specific Selectors */}
                  {renderCategorySelectors(quickViewProduct, modalSize, setModalSize, modalColor, setModalColor, activeImageIndex, setActiveImageIndex, images, colors, modalQty, setModalQty)}

                  {/* Quantity Block */}
                  <div className="modal-section-block quantity-section">
                    <span className="modal-section-title">Quantity:</span>
                    <div className="modal-quantity-selector">
                      <button className="qty-btn" onClick={() => setModalQty(Math.max(1, modalQty - 1))}>-</button>
                      <span className="qty-value">{modalQty}</span>
                      <button className="qty-btn" onClick={() => setModalQty(modalQty + 1)}>+</button>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="modal-actions-buttons-row">
                    <button 
                      className="modal-primary-action-btn"
                      onClick={() => {
                        toggleCart(quickViewProduct.id, quickViewProduct.title, modalSize, modalColor);
                      }}
                    >
                      {cart.includes(quickViewProduct.id) ? "Remove from Cart" : "Add to Cart"}
                    </button>
                    <button 
                      className="modal-secondary-action-btn"
                      onClick={() => {
                        sessionStorage.setItem('auto_open_product_id', String(quickViewProduct.id));
                        setQuickViewProduct(null);
                        handleNavigation('/Shop');
                      }}
                    >
                      Go to Product
                    </button>
                  </div>

                  {/* Wishlist Link */}
                  <div className="modal-wishlist-row">
                    <button 
                      className={`modal-wishlist-btn-bottom ${wishlist.includes(quickViewProduct.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(quickViewProduct.id)}
                    >
                      <Heart size={15} fill={wishlist.includes(quickViewProduct.id) ? "currentColor" : "none"} style={{ display: 'inline-block', marginRight: '5px', verticalAlign: 'middle' }} />
                      {wishlist.includes(quickViewProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        );
      })()}

        </div>
      </section>

    </div>
  );
}


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

const getProductThemedColors = (prod) => {
  if (!prod) return [];
  if (prod.variants && prod.variants.length > 0) {
    const uniqueColors = [];
    const seenColors = new Set();
    for (const v of prod.variants) {
      if (v.color) {
        const norm = v.color.trim().toLowerCase();
        if (norm && !seenColors.has(norm)) {
          seenColors.add(norm);
          uniqueColors.push(v.color.trim());
        }
      }
    }
    if (uniqueColors.length > 0) {
      return uniqueColors.map(colorName => ({
        name: colorName,
        hex: getColorHex(colorName)
      }));
    }
  }
  return [];
};

const getAllProductImages = (prod, selectedColor = '') => {
  return resolveProductGallery(prod, selectedColor);
};

const getCategoryThemeClass = (category) => {
  const cat = String(category).toUpperCase();
  if (cat.includes('CLOTHING') || cat.includes('DRESS')) return 'theme-clothing';
  if (cat.includes('STATIONERY') || cat.includes('PEN') || cat.includes('PENCIL') || cat.includes('NOTEBOOK') || cat.includes('OFFICE') || cat.includes('PAPER') || cat.includes('WRITING')) return 'theme-stationery';
  if (cat.includes('GIFT') || cat.includes('VALENTINE')) return 'theme-gifts';
  if (cat.includes('ACCESSORIES') || cat.includes('FANCY') || cat.includes('JEWEL') || cat.includes('WATCH')) return 'theme-accessories';
  return 'theme-clothing';
};

const handleColorChange = (colorName, prod, setModalColor, setActiveImageIndex, setModalSize) => {
  setModalColor(colorName);
  if (prod && prod.variants) {
    const hasVariantImages = prod.variants.some(v => v.image && isRealImg(v.image));
    if (hasVariantImages) {
      const colors = getProductThemedColors(prod);
      const colorIdx = colors.findIndex(c => c.name.toLowerCase() === colorName.toLowerCase());
      if (colorIdx !== -1) {
        setActiveImageIndex(colorIdx);
      }
    } else {
      const matchVar = prod.variants.find(v => v.color?.toLowerCase() === colorName.toLowerCase());
      if (matchVar) {
        const isImgValid = matchVar.image && isRealImg(matchVar.image);
        if (isImgValid) {
          setActiveImageIndex(0);
        }
      }
    }
    const matchVar = prod.variants.find(v => v.color?.toLowerCase() === colorName.toLowerCase());
    if (matchVar && matchVar.size) {
      setModalSize(matchVar.size);
    }
  }
};

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
                  key={idx}
                  className={`modal-color-dot ${modalColor === c.name ? 'active' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => {
                    handleColorChange(c.name, prod, setModalColor, setActiveImageIndex, setModalSize);
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {uniqueSizes.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title">Select Size</span>
            <div className="modal-size-pills">
              {uniqueSizes.map((sz) => (
                <button 
                  key={sz}
                  className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                  onClick={() => setModalSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  const category = String(prod.category).toUpperCase();

  if (category.includes('CLOTHING') || category.includes('DRESS')) {
    const sizeOptions = prod.attributes?.size 
      ? prod.attributes.size.split(',').map(s => s.trim()).filter(Boolean) 
      : (prod.subCategory === 'KIDS' ? ['2y', '4y', '6y', '8y'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    return (
      <>
        {colors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title">Color: <span className="color-name">{colors[activeImageIndex]?.name || colors[0]?.name || ""}</span></span>
            <div className="modal-color-dots">
              {colors.map((c, idx) => (
                <button 
                  key={idx}
                  className={`modal-color-dot ${activeImageIndex === idx ? 'active' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => {
                    if (idx < images.length) {
                      setActiveImageIndex(idx);
                    }
                    setModalColor(c.name);
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        <div className="modal-section-block">
          <span className="modal-section-title">Select Size</span>
          <div className="modal-size-pills">
            {sizeOptions.map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                onClick={() => setModalSize(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (category.includes('STATIONERY')) {
    const packs = ['Pack of 1', 'Pack of 3', 'Pack of 5', 'Pack of 10'];
    const packSize = modalSize.includes('Pack') ? modalSize : 'Pack of 3';
    return (
      <>
        <div className="modal-section-block">
          <span className="modal-section-title">Ink Color: {modalColor || "Blue"}</span>
          <div className="modal-color-dots">
            {[
              { name: 'Blue', hex: '#051838' },
              { name: 'Black', hex: '#212121' },
              { name: 'Red', hex: '#b71c1c' }
            ].map((c, idx) => (
              <button 
                key={idx}
                className={`modal-color-dot ${modalColor === c.name ? 'active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setModalColor(c.name)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="modal-section-block">
          <span className="modal-section-title">Pack Size</span>
          <div className="modal-size-pills">
            {packs.map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${packSize === sz ? 'active' : ''}`}
                onClick={() => setModalSize(sz)}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem' }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (category.includes('GIFT')) {
    const wrapThemes = ['Classic Red', 'Mystic Violet', 'Minimalist White', 'Premium Gold'];
    const selectedTheme = modalColor.includes('Classic') || modalColor.includes('Mystic') || modalColor.includes('Minimal') || modalColor.includes('Premium') ? modalColor : 'Classic Red';
    return (
      <>
        <div className="modal-section-block">
          <span className="modal-section-title">Occasion Theme: {modalSize || "Birthday"}</span>
          <div className="modal-size-pills">
            {['Birthday', 'Anniversary', 'Wedding', 'Corporate'].map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                onClick={() => setModalSize(sz)}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {prod.attributes?.personalization && prod.attributes.personalization !== 'No' && (
          <div className="modal-section-block">
            <span className="modal-section-title">Personalization Details:</span>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Enter name or message to print..." 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eae6df', marginTop: '6px', outline: 'none' }}
            />
          </div>
        )}

        <div className="modal-section-block">
          <span className="modal-section-title">Gift Wrapping Theme</span>
          <div className="modal-size-pills">
            {wrapThemes.map((sz) => (
              <button 
                key={sz}
                className={`modal-size-btn ${selectedTheme === sz ? 'active' : ''}`}
                onClick={() => setModalColor(sz)}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem' }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (category.includes('ACCESSORIES') || category.includes('FANCY')) {
    return (
      <>
        {colors.length > 0 && (
          <div className="modal-section-block">
            <span className="modal-section-title">Metal Plating: {colors[activeImageIndex]?.name || colors[0]?.name || "Default"}</span>
            <div className="modal-color-dots">
              {colors.map((c, idx) => (
                <button 
                  key={idx}
                  className={`modal-color-dot ${activeImageIndex === idx ? 'active' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => {
                    if (idx < images.length) {
                      setActiveImageIndex(idx);
                    }
                    setModalColor(c.name);
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        <div className="modal-section-block">
          <span className="modal-section-title">Size:</span>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'inherit', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' }}>
            One Size (Adjustable)
          </div>
        </div>
      </>
    );
  }

  return null;
};
