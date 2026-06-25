import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  BookOpen, 
  ShoppingCart, 
  Users, 
  Tag, 
  TrendingUp, 
  Star, 
  Settings, 
  User, 
  LogOut, 
  Search, 
  Bell, 
  MessageSquare, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  TrendingDown, 
  Lock,
  ArrowRight,
  Filter,
  Eye,
  Mail,
  Megaphone,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Share2,
  Globe,
  Sparkles
} from 'lucide-react';
import logoImg from '../../../src/assets/logo.png';
import { resolveProductImage, isRealImg } from '../utils/imageHelper';
import kidsDressImg from '../../../src/assets/kids_tq_110.jpg';
import handbagImg from '../../../src/assets/hero_accessories.jpg';
import heroKidsImg from '../../../src/assets/hero_kids.jpg';
import heroGiftsImg from '../../../src/assets/hero_gifts.jpg';
import heroClothingImg from '../../../src/assets/hero_clothing.jpg';
import heroAccessoriesImg from '../../../src/assets/hero_accessories.jpg';
import heroStationeryImg from '../../../src/assets/hero_stationery.jpg';
import celebKidImg from '../../../src/assets/celeb_kid.jpg';
import celebKeerthyImg from '../../../src/assets/celeb_keerthy.jpg';
import celebDulquerImg from '../../../src/assets/celeb_dulquer.jpg';
import celebCoupleImg from '../../../src/assets/celeb_couple.jpg';

const generateSKUForCategory = (categoryName) => {
  if (!categoryName) return '';
  const parts = categoryName.split('>').map(x => x.trim());
  const root = parts[0].toLowerCase();
  let prefix = 'ORG';
  if (root.includes('clothing')) prefix = 'CLO';
  else if (root.includes('stationery')) prefix = 'STA';
  else if (root.includes('gift')) prefix = 'GIF';
  else if (root.includes('accessories') || root.includes('fancy')) prefix = 'ACC';
  else prefix = root.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase() || 'ORG';
  
  const randNum = Math.floor(1000 + Math.random() * 9000).toString();
  return `MITH-${prefix}-${randNum}`;
};

export default function AdminDashboard({ authUser, setAuthUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic features states
  const [featuresList, setFeaturesList] = useState([]);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureSubtitle, setNewFeatureSubtitle] = useState('');
  const [editFeatureItem, setEditFeatureItem] = useState(null);
  
  // Interactive UI Dropdowns
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('May 28, 2025 - Jun 28, 2025');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Profile Section Sub-tab States
  const [profileSubTab, setProfileSubTab] = useState('profile-info');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginAlerts: true,
  });
  const [loginHistory, setLoginHistory] = useState([
    { device: 'Windows PC', browser: 'Chrome', ip: '103.21.244.12', location: 'Coimbatore, IN', date: 'Jun 16, 2025 10:30 AM', status: 'Success' },
    { device: 'Android Phone', browser: 'Chrome', ip: '103.21.244.12', location: 'Coimbatore, IN', date: 'Jun 15, 2025 08:15 PM', status: 'Success' },
    { device: 'Windows PC', browser: 'Firefox', ip: '103.21.244.12', location: 'Coimbatore, IN', date: 'Jun 14, 2025 09:20 AM', status: 'Success' },
    { device: 'MacBook', browser: 'Safari', ip: '103.21.244.12', location: 'Coimbatore, IN', date: 'Jun 13, 2025 07:45 PM', status: 'Failed' },
    { device: 'Android Phone', browser: 'Chrome', ip: '103.21.244.12', location: 'Coimbatore, IN', date: 'Jun 13, 2025 06:30 PM', status: 'Success' },
  ]);

  const handleChangePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New Password and Confirm Password do not match.');
      return;
    }
    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleFeatureStatus = async (featureId) => {
    const feat = featuresList.find(f => f.id === featureId);
    if (!feat) return;
    const newStatus = feat.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiService.updateFeature(featureId, { status: newStatus });
      setFeaturesList(prev => prev.map(f => f.id === featureId ? { ...f, status: newStatus } : f));
      window.dispatchEvent(new Event('mithira_features_update'));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle feature status.');
    }
  };

  const handleMoveFeature = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === featuresList.length - 1) return;

    const newList = [...featuresList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    const updatedList = newList.map((f, idx) => ({ ...f, order: idx + 1 }));

    try {
      setFeaturesList(updatedList);
      for (const f of updatedList) {
        await apiService.updateFeature(f.id, { order: f.order });
      }
      window.dispatchEvent(new Event('mithira_features_update'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFeatureSubmit = async (e) => {
    e.preventDefault();
    if (!newFeatureName || !newFeatureKey) {
      alert('Name and Key are required.');
      return;
    }

    const cleanKey = newFeatureKey.trim().toLowerCase().replace(/\s+/g, '_');
    if (featuresList.some(f => f.key === cleanKey)) {
      alert('A feature with this key already exists.');
      return;
    }

    const nextOrder = featuresList.length + 1;
    const featObj = {
      name: newFeatureName.trim(),
      key: cleanKey,
      title: newFeatureTitle.trim(),
      subtitle: newFeatureSubtitle.trim(),
      status: 'Active',
      order: nextOrder
    };

    try {
      const saved = await apiService.createFeature(featObj);
      setFeaturesList(prev => [...prev, saved].sort((a,b) => a.order - b.order));
      window.dispatchEvent(new Event('mithira_features_update'));
      setShowAddFeatureModal(false);
      setNewFeatureName('');
      setNewFeatureKey('');
      setNewFeatureTitle('');
      setNewFeatureSubtitle('');
    } catch (err) {
      console.error(err);
      alert('Failed to add custom feature.');
    }
  };

  const handleEditFeatureSubmit = async (e) => {
    e.preventDefault();
    if (!editFeatureItem.name) {
      alert('Name is required.');
      return;
    }

    try {
      await apiService.updateFeature(editFeatureItem.id, {
        name: editFeatureItem.name.trim(),
        title: editFeatureItem.title.trim(),
        subtitle: editFeatureItem.subtitle.trim()
      });
      setFeaturesList(prev => prev.map(f => f.id === editFeatureItem.id ? { ...f, ...editFeatureItem } : f));
      window.dispatchEvent(new Event('mithira_features_update'));
      setEditFeatureItem(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update feature.');
    }
  };

  const handleDeleteFeature = async (featureId) => {
    const feat = featuresList.find(f => f.id === featureId);
    if (!feat) return;

    const coreKeys = ['hero', 'trust_bar', 'categories', 'video_showcase', 'exclusive_products', 'celebrity_collection', 'why_choose_us'];
    if (coreKeys.includes(feat.key)) {
      alert('Core website features cannot be deleted. You can deactivate them instead.');
      return;
    }

    if (confirm(`Are you sure you want to delete the custom section "${feat.name}"?`)) {
      try {
        await apiService.deleteFeature(featureId);
        setFeaturesList(prev => prev.filter(f => f.id !== featureId).map((f, idx) => ({ ...f, order: idx + 1 })));
        window.dispatchEvent(new Event('mithira_features_update'));
      } catch (err) {
        console.error(err);
        alert('Failed to delete feature.');
      }
    }
  };

  // Settings Sub-tab States
  const [settingsSubTab, setSettingsSubTab] = useState('store');
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'MithiraShoppy Official',
    supportEmail: 'support@mithirashoppy.com',
    taxPercentage: '18',
    defaultCurrency: 'INR',
  });
  const [shippingInfoLines, setShippingInfoLines] = useState([
    "Free shipping on all orders above ₹999.",
    "Standard delivery takes 3–5 business days depending on location.",
    "Cash on Delivery (COD) is available on all eligible postal addresses.",
    "We offer easy 7-day hassle-free returns and exchanges."
  ]);
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingAbove: '999',
    standardCharge: '80',
    expressCharge: '150',
    codCharges: '50',
    enableCod: true,
    enableExpress: true,
    enableInternational: false,
  });
  const [paymentSettings, setPaymentSettings] = useState({
    cod: true,
    razorpay: true,
    upi: true,
    stripe: false,
    bankTransfer: true,
  });
  const [socialMediaSettings, setSocialMediaSettings] = useState({
    instagram: 'https://instagram.com/mithrashopy',
    facebook: 'https://facebook.com/mithrashopy',
    whatsapp: '+91 98765 43210',
    youtube: 'https://youtube.com/@mithrashopy',
    twitter: 'https://twitter.com/mithrashopy',
  });
  const [emailSettings, setEmailSettings] = useState({
    senderName: 'Mithra Shopy',
    senderEmail: 'info@mithrashopy.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'info@mithrashopy.com',
    smtpPassword: '••••••••••••••••',
  });
  const [websiteSettings, setWebsiteSettings] = useState({
    websiteTitle: 'Mithra Shopy - Kids, Gifts & More',
    metaDescription: 'Mithra Shopy offers the best kids collections, gifts, stationery and accessories.',
    metaKeywords: 'kids, gifts, stationery, accessories, clothing',
    footerText: '© 2025 Mithra Shopy. All Rights Reserved.',
  });
  
  // Tooltip & Filter states
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [viewProductItem, setViewProductItem] = useState(null);
  const [editProductItem, setEditProductItem] = useState(null);
  const [addProductActiveTab, setAddProductActiveTab] = useState('basic');
  const [editProductActiveTab, setEditProductActiveTab] = useState('basic');

  // Products filtering & pagination states
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodCatalogueFilter, setProdCatalogueFilter] = useState('All Catalogues');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('All Categories');
  const [prodStatusFilter, setProdStatusFilter] = useState('Status');
  const [prodCurrentPage, setProdCurrentPage] = useState(1);

  // --- Core Mock States (Stored in localStorage or state) ---
  const [products, setProducts] = useState(() => {
    const clearedFlag = localStorage.getItem('mithra_products_cleared_v2');
    let rawProducts = [];
    if (clearedFlag) {
      const local = localStorage.getItem('mithra_admin_products');
      if (local) {
        try {
          rawProducts = JSON.parse(local);
        } catch (e) {
          // Fallback
        }
      }
    } else {
      rawProducts = [
        { id: 2, name: 'Women Kurti', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 899, stock: 40, sales: 48, status: 'Active', image: kidsDressImg }
      ];
      localStorage.setItem('mithra_admin_products', JSON.stringify(rawProducts));
      localStorage.setItem('mithra_products_cleared_v2', 'true');
    }
    
    if (!rawProducts || rawProducts.length === 0) {
      rawProducts = [
        { id: 2, name: 'Women Kurti', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 899, stock: 40, sales: 48, status: 'Active', image: kidsDressImg }
      ];
    }
    
    return rawProducts.map(p => {
      let cat = p.category || 'Clothing > Kids';
      // Auto-heal old subcategory formats
      if (cat === 'Clothing > Girls') cat = 'Clothing > Kids';
      if (cat === 'Stationery > Pens') cat = 'Stationery';
      if (cat === 'Gifts > Birthday') cat = 'Gifts';
      if (cat === 'Accessories > Bags') cat = 'Accessories';
      
      return {
        ...p,
        catalogue: p.catalogue || 'Catalogue A',
        category: cat,
        status: p.status || 'Active'
      };
    });
  });

  const [orders, setOrders] = useState(() => {
    const local = localStorage.getItem('mithra_admin_orders');
    let rawOrders = [];
    if (local) {
      try {
        rawOrders = JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    
    if (!rawOrders || rawOrders.length === 0) {
      rawOrders = [
        { id: '#ORD1234', customer: 'Sumathi R', product: 'Gold Necklace Set', amount: '₹2,499', payment: 'Razorpay', status: 'Delivered', date: 'Jun 28, 2025' },
        { id: '#ORD1233', customer: 'Priya M', product: 'Kids Party Dress', amount: '₹1,299', payment: 'UPI', status: 'Shipped', date: 'Jun 27, 2025' },
        { id: '#ORD1232', customer: 'Arjun K', product: 'Surprise Balloon Box', amount: '₹899', payment: 'COD', status: 'Processing', date: 'Jun 27, 2025' },
        { id: '#ORD1231', customer: 'Nandhini S', product: 'Silk Anarkali Suit', amount: '₹3,199', payment: 'Razorpay', status: 'Pending', date: 'Jun 26, 2025' },
        { id: '#ORD1230', customer: 'Vijay P', product: 'Cotton Daily Wear Kurti', amount: '₹599', payment: 'UPI', status: 'Cancelled', date: 'Jun 26, 2025' }
      ];
    }
    
    return rawOrders.map(o => ({
      ...o,
      payment: o.payment || 'Razorpay',
      product: o.product || 'Kids Party Dress',
      status: o.status || 'Active'
    }));
  });

  const getDynamicStats = () => {
    let totalRevenue = 0;
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        let amtStr = String(order.amount || '0');
        amtStr = amtStr.replace(/[₹,]/g, '').trim();
        const amt = parseFloat(amtStr);
        if (!isNaN(amt)) {
          totalRevenue += amt;
        }
      }
    });
    return {
      revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
      ordersCount: orders.length
    };
  };

  const stats = getDynamicStats();

  const [coupons, setCoupons] = useState(() => {
    const local = localStorage.getItem('mithra_admin_coupons');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { code: 'WELCOME10', discount: '10% OFF', type: 'Percentage', minCart: '₹499', expiry: 'Jun 30, 2025', usage: '120/500', status: 'Active' },
      { code: 'SUMMER30', discount: '20% OFF', type: 'Percentage', minCart: '₹999', expiry: 'Jul 15, 2025', usage: '85/300', status: 'Active' },
      { code: 'FESTIVE50', discount: '50% OFF', type: 'Percentage', minCart: '₹1499', expiry: 'Aug 10, 2025', usage: '25/200', status: 'Active' },
      { code: 'FREESHIP', discount: 'Free Shipping', type: 'Free Shipping', minCart: '₹0', expiry: 'Jun 30, 2025', usage: '230/500', status: 'Active' },
      { code: 'NEWUSERS', discount: '5% OFF', type: 'Percentage', minCart: '₹299', expiry: 'Jul 05, 2025', usage: '60/200', status: 'Inactive' }
    ];
  });

  const [activeCouponSubTab, setActiveCouponSubTab] = useState('Coupons');
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [editCouponItem, setEditCouponItem] = useState(null);

  // --- Marketing View States ---
  const [activeMarketingSubTab, setActiveMarketingSubTab] = useState('Newsletter');
  
  // Lucky Charm States
  const [luckyRewards, setLuckyRewards] = useState([]);
  const [luckyStats, setLuckyStats] = useState({
    totalSpins: 0,
    todaysSpins: 0,
    rewardsGiven: 0,
    activeRewards: 0,
    revenueGenerated: 0,
    conversionRate: 0,
    repeatPlayers: 0,
    topWonProducts: [],
    topWonCoupons: []
  });
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({
    rewardName: '',
    rewardType: 'product',
    productId: '',
    couponId: '',
    chancePercentage: '',
    luckyStock: '',
    luckyPrice: '',
    status: 'Active',
    startDate: '',
    endDate: ''
  });
  const [editRewardItem, setEditRewardItem] = useState(null);
  const [luckyCharmSubTab, setLuckyCharmSubTab] = useState('Dashboard');
  
  // Newsletter States
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [subscribers, setSubscribers] = useState(() => {
    const local = localStorage.getItem('mithra_admin_subscribers');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return [
      { email: 'revathi@gmail.com', date: 'May 28, 2025', avatar: 'celebKeerthy' },
      { email: 'kavya@gmail.com', date: 'May 27, 2025', avatar: 'celebKid' },
      { email: 'harini@gmail.com', date: 'May 17, 2025', avatar: 'celebDulquer' },
      { email: 'deepa@gmail.com', date: 'May 25, 2025', avatar: 'celebCouple' }
    ];
  });
  const [totalSubscribersCount, setTotalSubscribersCount] = useState(() => {
    const local = localStorage.getItem('mithra_total_subscribers_count');
    return local ? parseInt(local, 10) : 356;
  });
  const [thisMonthSubscribersCount, setThisMonthSubscribersCount] = useState(() => {
    const local = localStorage.getItem('mithra_this_month_subscribers_count');
    return local ? parseInt(local, 10) : 23;
  });
  
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');

  // Banners States
  const [banners, setBanners] = useState(() => {
    const local = localStorage.getItem('mithra_admin_banners');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return [
      { id: 1, title: 'Summer Sale', slot: 'Hero Banner', page: 'Home Page', image: 'Clothing', status: 'Active' },
      { id: 2, title: 'Kids Collection', slot: 'Category Banner', page: 'Shop Page', image: 'Kids', status: 'Active' },
      { id: 3, title: 'Festival Offer', slot: 'Offer Banner', page: 'Home Page', image: 'Lifestyle', status: 'Active' },
      { id: 4, title: 'Wedding Collection', slot: 'Hero Banner', page: 'Home Page', image: 'Clothing', status: 'Inactive' },
      { id: 5, title: 'Free Shipping', slot: 'Info Banner', page: 'All Pages', image: 'Accessories', status: 'Active' }
    ];
  });
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', slot: 'Hero Banner', page: 'Home Page', image: 'Kids', status: 'Active' });

  // Announcements States
  const [announcements, setAnnouncements] = useState(() => {
    const local = localStorage.getItem('mithra_admin_announcements');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return [
      { id: 1, title: 'Free Shipping Above ₹999', text: 'Get FREE shipping on orders above ₹999', startDate: 'May 21, 2025', expiry: 'Jun 25, 2025', status: 'Active' },
      { id: 2, title: 'Festival Sale Live', text: 'Big discounts on all products. Shop now!', startDate: 'May 21, 2025', expiry: 'Jun 20, 2025', status: 'Active' },
      { id: 3, title: 'New Arrivals Available', text: 'Check out our new arrivals in Catalogue B', startDate: 'May 18, 2025', expiry: 'Jun 30, 2025', status: 'Active' },
      { id: 4, title: 'Catalogue B Updated', text: 'More exciting products added in Catalogue B', startDate: 'May 15, 2025', expiry: 'Jun 15, 2025', status: 'Inactive' },
      { id: 5, title: 'Kids Collection Sale', text: 'Flat 20% off on all kids products', startDate: 'May 10, 2025', expiry: 'May 25, 2025', status: 'Expired' }
    ];
  });
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', text: '', startDate: 'May 21, 2025', expiry: 'Jun 25, 2025', status: 'Active' });

  // Contact Queries States
  const [contactQueries, setContactQueries] = useState(() => {
    const local = localStorage.getItem('mithra_admin_contact_queries');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return [
      { id: 1, name: 'Karthik R', email: 'karthik@gmail.com', subject: 'Product Inquiry', message: 'Please provide more details about...', date: 'May 28, 2025', status: 'New' },
      { id: 2, name: 'Divya S', email: 'divya@gmail.com', subject: 'Order Tracking', message: "I haven't received my order yet.", date: 'May 27, 2025', status: 'In Progress' },
      { id: 3, name: 'Ramesh P', email: 'ramesh@gmail.com', subject: 'Return Request', message: 'I want to return the product.', date: 'May 26, 2025', status: 'Resolved' },
      { id: 4, name: 'Anitha M', email: 'anitha@gmail.com', subject: 'Payment Issue', message: 'Payment failed but amount deducted.', date: 'May 25, 2025', status: 'In Progress' },
      { id: 5, name: 'Suresh K', email: 'suresh@gmail.com', subject: 'General Query', message: 'How can I get bulk discounts?', date: 'May 24, 2025', status: 'Resolved' }
    ];
  });
  const [viewQueryItem, setViewQueryItem] = useState(null);
  const [showReplyQueryModal, setShowReplyQueryModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [querySearchFilter, setQuerySearchFilter] = useState('All');

  // Categories & Hierarchical State
  const [categories, setCategories] = useState(() => {
    const local = localStorage.getItem('mithra_admin_categories');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { name: 'Clothing', parent: '—', count: 58, status: 'Active' },
      { name: 'Women', parent: 'Clothing', count: 18, status: 'Active' },
      { name: 'Kurti', parent: 'Women', count: 8, status: 'Active' },
      { name: 'Saree', parent: 'Women', count: 6, status: 'Active' },
      { name: 'Men', parent: 'Clothing', count: 15, status: 'Active' },
      { name: 'Kids', parent: 'Clothing', count: 12, status: 'Active' },
      { name: 'Stationery', parent: '—', count: 25, status: 'Active' },
      { name: 'Gifts', parent: '—', count: 20, status: 'Active' },
      { name: 'Accessories', parent: '—', count: 15, status: 'Active' }
    ];
  });

  const [expandedCategories, setExpandedCategories] = useState(() => {
    const local = localStorage.getItem('mithra_expanded_categories');
    return local ? JSON.parse(local) : { Clothing: true, Women: true };
  });

  const [catalogues, setCatalogues] = useState(() => {
    const local = localStorage.getItem('mithra_admin_catalogues');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { name: 'Catalogue A', subtitle: 'Kids Collection', count: 45, status: 'Active', revenue: '₹85,000', image: 'Kids' },
      { name: 'Catalogue B', subtitle: 'Lifestyle Collection', count: 63, status: 'Active', revenue: '₹1,60,000', image: 'Lifestyle' }
    ];
  });

  const [reviews, setReviews] = useState(() => {
    const local = localStorage.getItem('mithra_admin_reviews');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return [
      { id: 1, productName: 'Kids Party Dress', productImage: kidsDressImg, customerName: 'Sumathi R', rating: 5, comment: 'Excellent quality!', date: 'Jun 28, 2025', status: 'Approved', reply: '' },
      { id: 2, productName: 'Women Kurti', productImage: kidsDressImg, customerName: 'Priya M', rating: 4, comment: 'Good product', date: 'Jun 27, 2025', status: 'Approved', reply: '' },
      { id: 3, productName: 'Stylish Handbag', productImage: handbagImg, customerName: 'Nandhini S', rating: 5, comment: 'Very nice handbag', date: 'Jun 26, 2025', status: 'Pending', reply: '' },
      { id: 4, productName: 'Premium Pen Set', productImage: kidsDressImg, customerName: 'Arjun K', rating: 3, comment: 'Average', date: 'Jun 24, 2025', status: 'Rejected', reply: '' }
    ];
  });

  const [activeReviewsSubTab, setActiveReviewsSubTab] = useState('All Reviews');
  const [showReplyReviewModal, setShowReplyReviewModal] = useState(false);
  const [replyReviewItem, setReplyReviewItem] = useState(null);
  const [reviewReplyText, setReviewReplyText] = useState('');


  // Form states & Modals states
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Clothing > Kids', subCategory: '', catalogue: 'Catalogue A', price: '', stock: '', status: 'Active', description: '', images: '', variants: [], brand: '', rating: '4.8', reviews: '120', discount: '0', originalPrice: '', badge: '', isNewArrival: false, isOffer: false });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'Percentage', minCart: '', expiry: '', usageLimit: '500' });
  
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editCategoryItem, setEditCategoryItem] = useState(null);
  const [viewCategoryItem, setViewCategoryItem] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', parent: '—', count: 0, status: 'Active', image: '', showInNavbar: true, showInCategories: true, showInFilters: true });

  const [showAddCatalogueModal, setShowAddCatalogueModal] = useState(false);
  const [editCatalogueItem, setEditCatalogueItem] = useState(null);
  const [viewCatalogueItem, setViewCatalogueItem] = useState(null);
  const [newCatalogue, setNewCatalogue] = useState({ name: '', subtitle: '', count: 0, status: 'Active', revenue: '₹0', image: 'Kids' });

  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editOrderItem, setEditOrderItem] = useState(null);
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [viewOrderItem, setViewOrderItem] = useState(null);

  const [customers, setCustomers] = useState(() => {
    const local = localStorage.getItem('mithra_admin_customers');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 1, name: 'Sumathi R', email: 'sumathi@gmail.com', phone: '9904567890', ordersCount: 12, joinedDate: 'May 20, 2025', status: 'Active', avatarType: 'celebKeerthy' },
      { id: 2, name: 'Priya M', email: 'priya@gmail.com', phone: '9786543210', ordersCount: 8, joinedDate: 'May 18, 2025', status: 'Active', avatarType: 'celebKid' },
      { id: 3, name: 'Arjun K', email: 'arjunk@gmail.com', phone: '9153034780', ordersCount: 5, joinedDate: 'May 15, 2025', status: 'Active', avatarType: 'celebDulquer' },
      { id: 4, name: 'Nandhini S', email: 'nandu@gmail.com', phone: '9087654321', ordersCount: 3, joinedDate: 'May 10, 2025', status: 'Inactive', avatarType: 'celebCouple' },
      { id: 5, name: 'Vijay P', email: 'vijay@gmail.com', phone: '9991122334', ordersCount: 7, joinedDate: 'May 05, 2025', status: 'Active', avatarType: 'celebDulquer' }
    ];
  });

  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [custStatusFilter, setCustStatusFilter] = useState('All');
  
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editCustomerItem, setEditCustomerItem] = useState(null);

  const getCategoryProductCount = (catName) => {
    const getSubCategoryNames = (name) => {
      let list = [name];
      const directSubs = categories.filter(c => c.parent === name);
      directSubs.forEach(sub => {
        list = list.concat(getSubCategoryNames(sub.name));
      });
      return list;
    };
    const targetCategories = getSubCategoryNames(catName);
    return products.filter(p => {
      if (!p.category) return false;
      const parts = p.category.split('>').map(s => s.trim());
      return parts.some(part => targetCategories.includes(part));
    }).length;
  };

  // Lucky Charm Hooks & Handlers
  useEffect(() => {
    if (activeMarketingSubTab === 'Lucky Charm') {
      fetchLuckyStats();
      fetchLuckyRewards();
    }
  }, [activeMarketingSubTab]);

  const fetchLuckyStats = async () => {
    try {
      const res = await apiService.getLuckyStats();
      if (res && res.success) {
        setLuckyStats(res.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLuckyRewards = async () => {
    try {
      const res = await apiService.getLuckyRewards();
      if (res && res.success) {
        setLuckyRewards(res.rewards);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddLuckyRewardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.createLuckyReward(newReward);
      if (res && res.success) {
        setLuckyRewards(prev => [...prev, res.reward]);
        setShowAddRewardModal(false);
        setNewReward({
          rewardName: '',
          rewardType: 'product',
          productId: '',
          couponId: '',
          chancePercentage: '',
          luckyStock: '',
          luckyPrice: '',
          status: 'Active',
          startDate: '',
          endDate: ''
        });
        fetchLuckyStats();
      }
    } catch (err) {
      alert('Error creating reward: ' + err.message);
    }
  };

  const handleEditLuckyRewardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.updateLuckyReward(editRewardItem._id, editRewardItem);
      if (res && res.success) {
        setLuckyRewards(prev => prev.map(r => r._id === editRewardItem._id ? res.reward : r));
        setEditRewardItem(null);
        fetchLuckyStats();
      }
    } catch (err) {
      alert('Error updating reward: ' + err.message);
    }
  };

  const deleteLuckyReward = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lucky reward?')) return;
    try {
      const res = await apiService.deleteLuckyReward(id);
      if (res && res.success) {
        setLuckyRewards(prev => prev.filter(r => r._id !== id));
        fetchLuckyStats();
      }
    } catch (err) {
      alert('Error deleting reward: ' + err.message);
    }
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mithra_admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mithra_expanded_categories', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_catalogues', JSON.stringify(catalogues));
  }, [catalogues]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  useEffect(() => {
    localStorage.setItem('mithra_total_subscribers_count', totalSubscribersCount.toString());
  }, [totalSubscribersCount]);

  useEffect(() => {
    localStorage.setItem('mithra_this_month_subscribers_count', thisMonthSubscribersCount.toString());
  }, [thisMonthSubscribersCount]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_contact_queries', JSON.stringify(contactQueries));
  }, [contactQueries]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('mithra_admin_features', JSON.stringify(featuresList));
  }, [featuresList]);

  // Sync state with backend database on mount
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const prodData = await apiService.getProducts();
        if (prodData && prodData.length > 0) setProducts(prodData);
        
        const catData = await apiService.getCategories();
        if (catData && catData.length > 0) {
          setCategories(catData);
        } else {
          setCategories([
            { name: 'Clothing', parent: '—', count: 58, status: 'Active' },
            { name: 'Women', parent: 'Clothing', count: 18, status: 'Active' },
            { name: 'Kurti', parent: 'Women', count: 8, status: 'Active' },
            { name: 'Saree', parent: 'Women', count: 6, status: 'Active' },
            { name: 'Men', parent: 'Clothing', count: 15, status: 'Active' },
            { name: 'Kids', parent: 'Clothing', count: 12, status: 'Active' },
            { name: 'Stationery', parent: '—', count: 25, status: 'Active' },
            { name: 'Gifts', parent: '—', count: 20, status: 'Active' },
            { name: 'Accessories', parent: '—', count: 15, status: 'Active' }
          ]);
        }
        
        const catalogueData = await apiService.getCatalogues();
        if (catalogueData && catalogueData.length > 0) setCatalogues(catalogueData);
        
        const ordersData = await apiService.getOrders();
        if (ordersData && ordersData.length > 0) setOrders(ordersData);
        
        const couponsData = await apiService.getCoupons();
        if (couponsData && couponsData.length > 0) setCoupons(couponsData);
        
        const reviewsData = await apiService.getReviews();
        if (reviewsData && reviewsData.length > 0) setReviews(reviewsData);
        
        const bannersData = await apiService.getBanners();
        if (bannersData && bannersData.length > 0) setBanners(bannersData);
        
        const annData = await apiService.getAnnouncements();
        if (annData && annData.length > 0) setAnnouncements(annData);
        
        const queriesData = await apiService.getContactQueries();
        if (queriesData && queriesData.length > 0) setContactQueries(queriesData);

        try {
          const featuresData = await apiService.getFeatures();
          if (featuresData && featuresData.length > 0) setFeaturesList(featuresData);
        } catch (featErr) {
          console.error('Error fetching features:', featErr);
        }

        try {
          const settingsData = await apiService.getSettings();
          if (settingsData) {
            setGeneralSettings({
              storeName: settingsData.storeName || 'MithiraShoppy Official',
              supportEmail: settingsData.supportEmail || 'support@mithirashoppy.com',
              taxPercentage: settingsData.taxPercentage !== undefined ? String(settingsData.taxPercentage) : '18',
              defaultCurrency: settingsData.defaultCurrency || 'INR',
            });
            if (settingsData.shippingInfoLines && settingsData.shippingInfoLines.length > 0) {
              setShippingInfoLines(settingsData.shippingInfoLines);
            }
            setShippingSettings({
              freeShippingAbove: settingsData.freeShippingAbove !== undefined ? String(settingsData.freeShippingAbove) : '999',
              standardCharge: settingsData.standardCharge !== undefined ? String(settingsData.standardCharge) : '80',
              expressCharge: settingsData.expressCharge !== undefined ? String(settingsData.expressCharge) : '150',
              codCharges: settingsData.codCharges !== undefined ? String(settingsData.codCharges) : '50',
              enableCod: settingsData.enableCod !== undefined ? settingsData.enableCod : true,
              enableExpress: settingsData.enableExpress !== undefined ? settingsData.enableExpress : true,
              enableInternational: settingsData.enableInternational !== undefined ? settingsData.enableInternational : false,
            });
          }
        } catch (settingsErr) {
          console.error('Error fetching settings:', settingsErr);
        }
      } catch (e) {
        console.error('Error syncing backend data:', e);
      }
    };
    syncBackendData();
  }, []);

  // Reset product page number when filters change
  useEffect(() => {
    setProdCurrentPage(1);
  }, [prodSearchQuery, prodCatalogueFilter, prodCategoryFilter, prodStatusFilter]);

  const handleSaveSettings = async (updatedFields) => {
    try {
      const response = await apiService.updateSettings(updatedFields);
      if (response) {
        alert('Settings saved successfully!');
        if (response.storeName) {
          setGeneralSettings({
            storeName: response.storeName,
            supportEmail: response.supportEmail,
            taxPercentage: String(response.taxPercentage),
            defaultCurrency: response.defaultCurrency,
          });
        }
        if (response.shippingInfoLines) {
          setShippingInfoLines(response.shippingInfoLines);
        }
        if (response.freeShippingAbove !== undefined) {
          setShippingSettings({
            freeShippingAbove: String(response.freeShippingAbove),
            standardCharge: String(response.standardCharge),
            expressCharge: String(response.expressCharge),
            codCharges: String(response.codCharges),
            enableCod: response.enableCod,
            enableExpress: response.enableExpress,
            enableInternational: response.enableInternational,
          });
        }
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings: ' + err.message);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    onNavigate('/');
  };

  // --- Category helpers ---
  const getCategoryPath = (catName) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return catName;
    if (!cat.parent || cat.parent === '—') return cat.name;
    return `${getCategoryPath(cat.parent)} > ${cat.name}`;
  };

  const getProductSKU = (product) => {
    if (product.variants && product.variants.length > 0) {
      const firstWithSku = product.variants.find(v => v.sku);
      if (firstWithSku && firstWithSku.sku) {
        return firstWithSku.sku;
      }
    }
    const prefix = product.category ? product.category.split('>')[0].trim().substring(0, 3).toUpperCase() : 'GEN';
    return `MITH-${prefix}-${product.id}`;
  };

  const getHierarchicalCategories = () => {
    const result = [];
    const visit = (name, depth) => {
      const cat = categories.find(c => c.name === name);
      if (cat) {
        result.push({ ...cat, depth });
        const children = categories.filter(c => c.parent === name);
        children.forEach(child => visit(child.name, depth + 1));
      }
    };
    const topLevels = categories.filter(c => !c.parent || c.parent === '—' || !categories.some(parent => parent.name === c.parent));
    topLevels.forEach(c => visit(c.name, 0));
    return result;
  };

  const getCategoryPathsList = () => {
    return getHierarchicalCategories().map(cat => getCategoryPath(cat.name));
  };

  const isCategoryVisible = (cat) => {
    let current = cat;
    while (current.parent && current.parent !== '—') {
      const parentName = current.parent;
      const parentObj = categories.find(c => c.name === parentName);
      if (!parentObj) break;
      if (!expandedCategories[parentName]) {
        return false;
      }
      current = parentObj;
    }
    return true;
  };

  const isDescendant = (parentName, childName) => {
    if (!childName || childName === '—') return false;
    const child = categories.find(c => c.name === childName);
    if (!child) return false;
    if (child.parent === parentName) return true;
    return isDescendant(parentName, child.parent);
  };

  const getValidParentOptions = (catName) => {
    return categories.filter(c => c.name !== catName && !isDescendant(catName, c.name));
  };

  // --- Category CRUD handlers ---
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name) return;

    if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
      alert('A category with this name already exists.');
      return;
    }

    const catToAdd = {
      name: newCategory.name.trim(),
      parent: newCategory.parent,
      count: parseInt(newCategory.count, 10) || 0,
      status: newCategory.status,
      image: newCategory.image || '',
      showInNavbar:     newCategory.showInNavbar     !== false,
      showInCategories: newCategory.showInCategories !== false,
      showInFilters:    newCategory.showInFilters    !== false,
    };

    try {
      const saved = await apiService.createCategory(catToAdd);
      setCategories([...categories, saved]);
    } catch (err) {
      setCategories([...categories, catToAdd]);
    }
    setShowAddCategoryModal(false);
    setNewCategory({ name: '', parent: '—', count: 0, status: 'Active', image: '', showInNavbar: true, showInCategories: true, showInFilters: true });
  };

  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editCategoryItem.name) return;

    if (categories.some(c => c.name.toLowerCase() === editCategoryItem.name.toLowerCase() && c.name !== editCategoryItem.originalName)) {
      alert('A category with this name already exists.');
      return;
    }

    try {
      await apiService.updateCategory(editCategoryItem.originalName, editCategoryItem);
      setCategories(categories.map(c => {
        if (c.name === editCategoryItem.originalName) {
          return {
            name: editCategoryItem.name.trim(),
            parent: editCategoryItem.parent,
            count: parseInt(editCategoryItem.count, 10) || 0,
            status: editCategoryItem.status,
            image: editCategoryItem.image || ''
          };
        }
        if (c.parent === editCategoryItem.originalName) {
          return {
            ...c,
            parent: editCategoryItem.name.trim()
          };
        }
        return c;
      }));
    } catch (err) {
      setCategories(categories.map(c => {
        if (c.name === editCategoryItem.originalName) {
          return {
            name: editCategoryItem.name.trim(),
            parent: editCategoryItem.parent,
            count: parseInt(editCategoryItem.count, 10) || 0,
            status: editCategoryItem.status,
            image: editCategoryItem.image || ''
          };
        }
        if (c.parent === editCategoryItem.originalName) {
          return {
            ...c,
            parent: editCategoryItem.name.trim()
          };
        }
        return c;
      }));
    }

    const oldPath = getCategoryPath(editCategoryItem.originalName);
    const newPath = getCategoryPath(editCategoryItem.name.trim());
    setProducts(products.map(p => {
      if (p.category === oldPath) {
        return { ...p, category: newPath };
      } else if (p.category.startsWith(oldPath + ' > ')) {
        return { ...p, category: p.category.replace(oldPath + ' > ', newPath + ' > ') };
      }
      return p;
    }));

    setEditCategoryItem(null);
  };

  const deleteCategory = async (catName) => {
    if (confirm(`Are you sure you want to delete the category "${catName}"? Any subcategories will be reassigned to its parent.`)) {
      try {
        await apiService.deleteCategory(catName);
      } catch (err) {}
      const catToDelete = categories.find(c => c.name === catName);
      const parentOfDeleted = catToDelete ? catToDelete.parent : '—';

      setCategories(categories
        .filter(c => c.name !== catName)
        .map(c => {
          if (c.parent === catName) {
            return { ...c, parent: parentOfDeleted };
          }
          return c;
        })
      );
    }
  };

  // Title header text helper
  const getPageTitle = () => {
    if (activeTab === 'Dashboard') return '1. Dashboard';
    if (activeTab === 'Products') return '2. Products';
    if (activeTab === 'Categories') return '3. Categories';
    if (activeTab === 'Catalogues') return '4. Catalogues';
    if (activeTab === 'Orders') return '5. Orders';
    if (activeTab === 'Customers') return '6. Customers';
    if (activeTab === 'Offers & Coupons') return '7. Offers & Coupons';
    if (activeTab === 'Marketing') return '8. Marketing';
    if (activeTab === 'Reviews') return '9. Reviews';
    if (activeTab === 'Settings') return '10. Settings';
    if (activeTab === 'Manage Features') return '11. Manage Features';
    if (activeTab === 'Profile') return '12. Profile';
    if (activeTab === 'Logout') return '13. Logout';
    return activeTab;
  };

  // --- Catalogue Helpers ---
  const getCatalogueImage = (imgName) => {
    if (imgName === 'Kids') return heroKidsImg;
    if (imgName === 'Lifestyle') return heroGiftsImg;
    if (imgName === 'Clothing') return heroClothingImg;
    if (imgName === 'Accessories') return heroAccessoriesImg;
    if (imgName === 'Stationery') return heroStationeryImg;
    return handbagImg;
  };

  // --- Catalogue CRUD Handlers ---
  const handleAddCatalogueSubmit = async (e) => {
    e.preventDefault();
    if (!newCatalogue.name) return;

    if (catalogues.some(c => c.name.toLowerCase() === newCatalogue.name.toLowerCase())) {
      alert('A catalogue with this name already exists.');
      return;
    }

    const catToAdd = {
      name: newCatalogue.name.trim(),
      subtitle: newCatalogue.subtitle.trim() || 'Custom Collection',
      count: parseInt(newCatalogue.count, 10) || 0,
      status: newCatalogue.status,
      revenue: newCatalogue.revenue || '₹0',
      image: newCatalogue.image
    };

    try {
      const saved = await apiService.createCatalogue(catToAdd);
      setCatalogues([...catalogues, saved]);
    } catch (err) {
      setCatalogues([...catalogues, catToAdd]);
    }
    setShowAddCatalogueModal(false);
    setNewCatalogue({ name: '', subtitle: '', count: 0, status: 'Active', revenue: '₹0', image: 'Kids' });
  };

  const handleEditCatalogueSubmit = async (e) => {
    e.preventDefault();
    if (!editCatalogueItem.name) return;

    if (catalogues.some(c => c.name.toLowerCase() === editCatalogueItem.name.toLowerCase() && c.name !== editCatalogueItem.originalName)) {
      alert('A catalogue with this name already exists.');
      return;
    }

    try {
      const saved = await apiService.updateCatalogue(editCatalogueItem.originalName, editCatalogueItem);
      setCatalogues(catalogues.map(c => c.name === editCatalogueItem.originalName ? saved : c));
    } catch (err) {
      setCatalogues(catalogues.map(c => {
        if (c.name === editCatalogueItem.originalName) {
          return {
            name: editCatalogueItem.name.trim(),
            subtitle: editCatalogueItem.subtitle.trim(),
            count: parseInt(editCatalogueItem.count, 10) || 0,
            status: editCatalogueItem.status,
            revenue: editCatalogueItem.revenue,
            image: editCatalogueItem.image
          };
        }
        return c;
      }));
    }

    setProducts(products.map(p => {
      if (p.catalogue === editCatalogueItem.originalName) {
        return { ...p, catalogue: editCatalogueItem.name.trim() };
      }
      return p;
    }));

    setEditCatalogueItem(null);
  };

  const deleteCatalogue = async (catName) => {
    if (confirm(`Are you sure you want to delete the catalogue "${catName}"?`)) {
      try {
        await apiService.deleteCatalogue(catName);
      } catch (err) {}
      setCatalogues(catalogues.filter(c => c.name !== catName));
    }
  };

  // --- Dynamic chart helper configurations ---
  const chartDataOptions = {
    'May 28, 2025 - Jun 28, 2025': [
      { date: 'May 28', value: 110000 },
      { date: 'Jun 2', value: 135000 },
      { date: 'Jun 7', value: 120000 },
      { date: 'Jun 12', value: 145000 },
      { date: 'Jun 17', value: 130000 },
      { date: 'Jun 22', value: 180000 },
      { date: 'Jun 27', value: 245000 }
    ],
    'Last 7 Days': [
      { date: 'Jun 21', value: 195000 },
      { date: 'Jun 22', value: 180000 },
      { date: 'Jun 23', value: 210000 },
      { date: 'Jun 24', value: 220000 },
      { date: 'Jun 25', value: 205000 },
      { date: 'Jun 26', value: 235000 },
      { date: 'Jun 27', value: 245000 }
    ],
    'This Month': [
      { date: 'Jun 1', value: 100000 },
      { date: 'Jun 5', value: 125000 },
      { date: 'Jun 10', value: 140000 },
      { date: 'Jun 15', value: 135000 },
      { date: 'Jun 20', value: 170000 },
      { date: 'Jun 25', value: 210000 },
      { date: 'Jun 28', value: 245000 }
    ]
  };

  const chartPoints = chartDataOptions[dateRange] || chartDataOptions['May 28, 2025 - Jun 28, 2025'];

  // Donut chart calculations
  const orderBreakdown = {
    Pending: orders.filter(o => o.status === 'Pending').length * 25 + 75,
    Processing: orders.filter(o => o.status === 'Processing').length * 30 + 102,
    Shipped: orders.filter(o => o.status === 'Shipped').length * 40 + 155,
    Delivered: orders.filter(o => o.status === 'Delivered').length * 20 + 70,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length * 10 + 15
  };
  
  const totalOrdersCount = Object.values(orderBreakdown).reduce((a, b) => a + b, 0);

  const renderCategorySpecificFields = (item, setItem) => {
    const category = item.category || '';
    const lower = category.toLowerCase();
    const attrs = item.attributes || {};

    const updateAttr = (key, val) => {
      setItem({
        ...item,
        attributes: {
          ...attrs,
          [key]: val
        }
      });
    };

    const removeAttr = (key) => {
      const copy = { ...attrs };
      delete copy[key];
      setItem({ ...item, attributes: copy });
    };

    const renderCustomAttrs = () => {
      const standardKeys = [
        'size', 'fabric', 'fit', 'sleeve', 
        'pages', 'material', 'binding', 'paperType', 
        'occasion', 'personalization', 'giftWrap', 
        'warranty', 'type', 'theme', 'usage', 'component'
      ];
      const customKeys = Object.keys(attrs).filter(k => !standardKeys.includes(k));

      return (
        <div style={{ marginTop: '20px', borderTop: '1px dashed rgba(0, 0, 0, 0.08)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#555' }}>Additional Custom Specifications</span>
            <button 
              type="button" 
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#e2ebd5', color: '#D4AF37', border: '1px solid #D4AF37', borderRadius: '6px', fontWeight: 600 }} 
              onClick={() => {
                const key = prompt('Enter custom specification label (e.g. Weight, Material, Model):');
                if (key) {
                  const cleaned = key.trim();
                  if (cleaned) {
                    updateAttr(cleaned, '');
                  }
                }
              }}
            >
              + Add Custom Field
            </button>
          </div>
          {customKeys.map(k => (
            <div className="form-field-row" key={k} style={{ marginBottom: '12px', alignItems: 'center', gap: '12px' }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label style={{ textTransform: 'capitalize', fontWeight: 600 }}>{k}</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  value={attrs[k] || ''} 
                  onChange={(e) => updateAttr(k, e.target.value)} 
                  placeholder={`Enter value for ${k}`} 
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeAttr(k)} 
                className="admin-variant-remove-btn"
                title="Remove Custom Field"
                style={{ 
                  marginTop: '22px',
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      );
    };

    let specTitle = "General Specifications";
    let specFields = null;

    if (lower.includes('clothing')) {
      specTitle = "Clothing Custom Specifications";
      specFields = (
        <>
          <div className="form-field-row">
            <div className="form-field">
              <label>Sizes (e.g. XS, S, M, L, XL)</label>
              <input type="text" className="modal-input" value={attrs.size || ''} onChange={(e) => updateAttr('size', e.target.value)} placeholder="XS, S, M, L, XL" />
            </div>
            <div className="form-field">
              <label>Fabric</label>
              <input type="text" className="modal-input" value={attrs.fabric || ''} onChange={(e) => updateAttr('fabric', e.target.value)} placeholder="e.g. Cotton, Georgette" />
            </div>
          </div>
          <div className="form-field-row" style={{ marginTop: '10px' }}>
            <div className="form-field">
              <label>Fit</label>
              <input type="text" className="modal-input" value={attrs.fit || ''} onChange={(e) => updateAttr('fit', e.target.value)} placeholder="e.g. Regular Fit, Slim" />
            </div>
            <div className="form-field">
              <label>Sleeve</label>
              <input type="text" className="modal-input" value={attrs.sleeve || ''} onChange={(e) => updateAttr('sleeve', e.target.value)} placeholder="e.g. Sleeveless, Full Sleeve" />
            </div>
          </div>
        </>
      );
    } else if (lower.includes('stationery')) {
      specTitle = "Stationery Custom Specifications";
      specFields = (
        <>
          <div className="form-field-row">
            <div className="form-field">
              <label>Page Count</label>
              <input type="text" className="modal-input" value={attrs.pages || ''} onChange={(e) => updateAttr('pages', e.target.value)} placeholder="e.g. 160 Pages" />
            </div>
            <div className="form-field">
              <label>Material</label>
              <input type="text" className="modal-input" value={attrs.material || ''} onChange={(e) => updateAttr('material', e.target.value)} placeholder="e.g. Acid-free Paper" />
            </div>
          </div>
          <div className="form-field-row" style={{ marginTop: '10px' }}>
            <div className="form-field">
              <label>Binding</label>
              <input type="text" className="modal-input" value={attrs.binding || ''} onChange={(e) => updateAttr('binding', e.target.value)} placeholder="e.g. Hardbound, Spiral" />
            </div>
            <div className="form-field">
              <label>Paper Type</label>
              <input type="text" className="modal-input" value={attrs.paperType || ''} onChange={(e) => updateAttr('paperType', e.target.value)} placeholder="e.g. Ruled, Dotted" />
            </div>
          </div>
        </>
      );
    } else if (lower.includes('gift')) {
      specTitle = "Gifts Custom Specifications";
      specFields = (
        <>
          <div className="form-field-row">
            <div className="form-field">
              <label>Occasion</label>
              <input type="text" className="modal-input" value={attrs.occasion || ''} onChange={(e) => updateAttr('occasion', e.target.value)} placeholder="e.g. Birthday, Anniversary" />
            </div>
            <div className="form-field">
              <label>Personalization Options</label>
              <select className="modal-input" value={attrs.personalization || 'No'} onChange={(e) => updateAttr('personalization', e.target.value)}>
                <option value="No">No Personalization</option>
                <option value="Yes (Name Only)">Yes (Name Only)</option>
                <option value="Yes (Custom Text/Message)">Yes (Custom Text/Message)</option>
              </select>
            </div>
          </div>
          <div className="form-field-row" style={{ marginTop: '10px' }}>
            <div className="form-field">
              <label>Gift Wrap Available</label>
              <select className="modal-input" value={attrs.giftWrap || 'Yes'} onChange={(e) => updateAttr('giftWrap', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </>
      );
    } else if (lower.includes('accessor')) {
      specTitle = "Accessories Custom Specifications";
      specFields = (
        <>
          <div className="form-field-row">
            <div className="form-field">
              <label>Material</label>
              <input type="text" className="modal-input" value={attrs.material || ''} onChange={(e) => updateAttr('material', e.target.value)} placeholder="e.g. PU Leather, Stainless Steel" />
            </div>
            <div className="form-field">
              <label>Warranty</label>
              <input type="text" className="modal-input" value={attrs.warranty || ''} onChange={(e) => updateAttr('warranty', e.target.value)} placeholder="e.g. 6 Months, 1 Year" />
            </div>
          </div>
          <div className="form-field-row" style={{ marginTop: '10px' }}>
            <div className="form-field">
              <label>Accessories Type</label>
              <input type="text" className="modal-input" value={attrs.type || ''} onChange={(e) => updateAttr('type', e.target.value)} placeholder="e.g. Handbag, Wallet, Belt" />
            </div>
          </div>
        </>
      );
    } else if (lower.includes('fancy') || lower.includes('item')) {
      specTitle = "Fancy Items Custom Specifications";
      specFields = (
        <>
          <div className="form-field-row">
            <div className="form-field">
              <label>Theme</label>
              <input type="text" className="modal-input" value={attrs.theme || ''} onChange={(e) => updateAttr('theme', e.target.value)} placeholder="e.g. Traditional, Quirky" />
            </div>
            <div className="form-field">
              <label>Usage</label>
              <input type="text" className="modal-input" value={attrs.usage || ''} onChange={(e) => updateAttr('usage', e.target.value)} placeholder="e.g. Party Wear, Gift" />
            </div>
          </div>
          <div className="form-field-row" style={{ marginTop: '10px' }}>
            <div className="form-field">
              <label>Main Component</label>
              <input type="text" className="modal-input" value={attrs.component || ''} onChange={(e) => updateAttr('component', e.target.value)} placeholder="e.g. Beads, Alloy, Stones" />
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="admin-modal-section-card">
        <div className="admin-modal-section-header">
          <Layers size={16} />
          <h4>{specTitle}</h4>
        </div>
        <div className="admin-modal-section-body" style={{ marginTop: '16px' }}>
          {specFields}
          {renderCustomAttrs()}
        </div>
      </div>
    );
  };

  const renderVariantManager = (item, setItem) => {
    const variants = item.variants || [];

    const addVariant = () => {
      const generatedSku = generateSKUForCategory(item.category);
      setItem({
        ...item,
        variants: [
          ...variants,
          { size: '', color: '', stock: 0, price: null, sku: generatedSku, image: '' }
        ]
      });
    };

    const updateVariantField = (index, field, value) => {
      const variantsCopy = [...variants];
      variantsCopy[index] = {
        ...variantsCopy[index],
        [field]: value
      };
      setItem({
        ...item,
        variants: variantsCopy
      });
    };

    const removeVariant = (index) => {
      setItem({
        ...item,
        variants: variants.filter((_, idx) => idx !== index)
      });
    };

    return (
      <div className="admin-modal-section-card">
        <div className="admin-modal-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} />
            <h4 style={{ margin: 0 }}>Product & Color Variants</h4>
          </div>
          <button 
            type="button" 
            className="btn-primary" 
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.8rem', 
              backgroundColor: 'var(--primary-rose)', 
              color: '#ffffff', 
              border: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} 
            onClick={addVariant}
          >
            + Add Variant Row
          </button>
        </div>
        
        <div className="admin-modal-section-body" style={{ marginTop: '16px' }}>
          {variants.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '10px 0' }}>No variants added yet. Products will use base price, image, and stock unless variants are defined.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-variant-table">
                <thead>
                  <tr>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Price (INR)</th>
                    <th>Stock</th>
                    <th>SKU</th>
                    <th>Variant Image</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, index) => (
                    <tr key={index}>
                      <td>
                        <input 
                          type="text" 
                          placeholder="e.g. Red" 
                          value={v.color || ''} 
                          onChange={(e) => updateVariantField(index, 'color', e.target.value)}
                          className="admin-table-input"
                          style={{ minWidth: '95px' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          placeholder="e.g. M" 
                          value={v.size || ''} 
                          onChange={(e) => updateVariantField(index, 'size', e.target.value)}
                          className="admin-table-input"
                          style={{ minWidth: '70px' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          placeholder="Base price" 
                          value={v.price === null || v.price === undefined ? '' : v.price} 
                          onChange={(e) => updateVariantField(index, 'price', e.target.value === '' ? null : parseFloat(e.target.value))}
                          className="admin-table-input"
                          style={{ minWidth: '100px' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={v.stock || 0} 
                          onChange={(e) => updateVariantField(index, 'stock', parseInt(e.target.value, 10) || 0)}
                          className="admin-table-input"
                          style={{ minWidth: '70px' }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          placeholder="SKU" 
                          value={v.sku || ''} 
                          onChange={(e) => updateVariantField(index, 'sku', e.target.value)}
                          className="admin-table-input"
                          style={{ minWidth: '110px' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {v.image && (
                            <img src={v.image} alt="variant" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                          )}
                          <label htmlFor={`var-file-upload-${index}`} className="admin-variant-image-upload-btn">
                            Upload
                          </label>
                          <input 
                            type="file" 
                            id={`var-file-upload-${index}`} 
                            style={{ display: 'none' }} 
                            accept="image/*" 
                            onChange={(e) => handleVariantImageUpload(e, item, setItem, index)} 
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" className="admin-variant-remove-btn" onClick={() => removeVariant(index)} title="Remove Variant">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleLocalImageUpload = async (e, item, setItem) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const uploadedUrl = await apiService.uploadImage(file.name, reader.result);
        if (uploadedUrl) {
          const currentVal = Array.isArray(item.images) 
            ? item.images.join(', ') 
            : (item.images || '');
          let currentImages = (currentVal ? currentVal.split(',') : [])
            .map(img => img.trim())
            .filter(img => img && isRealImg(img));
          
          // Fallback to item.image if it's a real image URL and we have no gallery images yet
          if (currentImages.length === 0 && item.image && isRealImg(item.image)) {
            currentImages = [item.image];
          }

          setItem({
            ...item,
            images: [...currentImages, uploadedUrl].join(', ')
          });
          alert('Image uploaded successfully and added to product gallery!');
        }
      } catch (err) {
        console.error('Image upload failed', err);
        alert('Failed to upload image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryImageUpload = async (e, item, setItem) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const uploadedUrl = await apiService.uploadImage(file.name, reader.result);
        if (uploadedUrl) {
          setItem({
            ...item,
            image: uploadedUrl
          });
          alert('Category cover image uploaded successfully!');
        }
      } catch (err) {
        console.error('Category image upload failed', err);
        alert('Failed to upload category image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVariantImageUpload = async (e, item, setItem, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const uploadedUrl = await apiService.uploadImage(file.name, reader.result);
        if (uploadedUrl) {
          const variantsCopy = [...(item.variants || [])];
          variantsCopy[index] = {
            ...variantsCopy[index],
            image: uploadedUrl
          };
          setItem({
            ...item,
            variants: variantsCopy
          });
          alert('Variant image uploaded successfully!');
        }
      } catch (err) {
        console.error('Variant image upload failed', err);
        alert('Failed to upload variant image. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handlers for Add/Edit/Delete Product Operations
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;

    if (newProduct.variants && newProduct.variants.length > 0) {
      const missingImage = newProduct.variants.some(v => !v.image || !v.image.trim());
      if (missingImage) {
        alert("Each product variant must have an image uploaded! Please upload an image for all variants.");
        return;
      }
    }
    
    const imagesArray = newProduct.images ? newProduct.images.split(',').map(img => img.trim()).filter(Boolean) : [];
    const mainImg = imagesArray[0] || (newProduct.category.includes('Clothing') ? 'Kids' : 'Accessories');

    const productToAdd = {
      name: newProduct.name,
      category: newProduct.category,
      subCategory: newProduct.subCategory,
      catalogue: newProduct.catalogue,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10),
      sales: 0,
      status: newProduct.status,
      image: mainImg,
      images: imagesArray.length > 0 ? imagesArray : [mainImg],
      description: newProduct.description,
      attributes: newProduct.attributes || {},
      variants: newProduct.variants || [],
      brand: newProduct.brand || '',
      rating: newProduct.rating ? parseFloat(newProduct.rating) : 4.8,
      reviews: newProduct.reviews ? parseInt(newProduct.reviews, 10) : 120,
      discount: newProduct.discount ? parseInt(newProduct.discount, 10) : 0,
      originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : null,
      badge: newProduct.badge || '',
      isNewArrival: newProduct.isNewArrival || false,
      isOffer: newProduct.isOffer || false
    };

    try {
      const saved = await apiService.createProduct(productToAdd);
      setProducts([saved, ...products]);
    } catch (err) {
      setProducts([{ ...productToAdd, id: Date.now() }, ...products]);
    }
    setShowAddProductModal(false);
    setNewProduct({ name: '', category: 'Clothing > Kids', subCategory: '', catalogue: 'Catalogue A', price: '', stock: '', status: 'Active', description: '', images: '', attributes: {}, variants: [], brand: '', rating: '4.8', reviews: '120', discount: '0', originalPrice: '', badge: '', isNewArrival: false, isOffer: false });
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editProductItem.name || !editProductItem.price || !editProductItem.stock) return;

    if (editProductItem.variants && editProductItem.variants.length > 0) {
      const missingImage = editProductItem.variants.some(v => !v.image || !v.image.trim());
      if (missingImage) {
        alert("Each product variant must have an image uploaded! Please upload an image for all variants.");
        return;
      }
    }

    const imagesArray = typeof editProductItem.images === 'string' 
      ? editProductItem.images.split(',').map(img => img.trim()).filter(Boolean) 
      : (Array.isArray(editProductItem.images) ? editProductItem.images : []);

    const updatedData = {
      ...editProductItem,
      price: parseFloat(editProductItem.price),
      stock: parseInt(editProductItem.stock, 10),
      image: imagesArray[0] || editProductItem.image,
      images: imagesArray.length > 0 ? imagesArray : (editProductItem.image ? [editProductItem.image] : []),
      variants: editProductItem.variants || [],
      brand: editProductItem.brand || '',
      rating: editProductItem.rating ? parseFloat(editProductItem.rating) : 4.8,
      reviews: editProductItem.reviews ? parseInt(editProductItem.reviews, 10) : 120,
      discount: editProductItem.discount ? parseInt(editProductItem.discount, 10) : 0,
      originalPrice: editProductItem.originalPrice ? parseFloat(editProductItem.originalPrice) : null,
      badge: editProductItem.badge || '',
      isNewArrival: editProductItem.isNewArrival || false,
      isOffer: editProductItem.isOffer || false
    };

    try {
      const saved = await apiService.updateProduct(updatedData.id, updatedData);
      setProducts(products.map(p => p.id === updatedData.id ? saved : p));
    } catch (err) {
      setProducts(products.map(p => p.id === updatedData.id ? updatedData : p));
    }

    setEditProductItem(null);
  };

  const handleAddCouponSubmit = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount || !newCoupon.expiry) return;
    
    const minOrderVal = newCoupon.minCart.startsWith('₹') ? newCoupon.minCart : `₹${newCoupon.minCart}`;
    const couponToAdd = {
      code: newCoupon.code.trim().toUpperCase(),
      discount: newCoupon.discount,
      type: newCoupon.type,
      minCart: minOrderVal,
      expiry: newCoupon.expiry,
      usageLimit: newCoupon.usageLimit || '500'
    };

    try {
      const saved = await apiService.createCoupon(couponToAdd);
      setCoupons([saved, ...coupons]);
    } catch (err) {
      setCoupons([{ ...couponToAdd, usage: `0/${couponToAdd.usageLimit}`, status: 'Active' }, ...coupons]);
    }
    setShowAddCouponModal(false);
    setNewCoupon({ code: '', discount: '', type: 'Percentage', minCart: '', expiry: '', usageLimit: '500' });
  };

  const handleEditCouponSubmit = async (e) => {
    e.preventDefault();
    if (!editCouponItem.code || !editCouponItem.discount || !editCouponItem.expiry) return;
    
    const minCartVal = editCouponItem.minCart.startsWith('₹') ? editCouponItem.minCart : `₹${editCouponItem.minCart}`;
    try {
      const saved = await apiService.updateCoupon(editCouponItem.originalCode, {
        code: editCouponItem.code.trim().toUpperCase(),
        discount: editCouponItem.discount.trim(),
        type: editCouponItem.type,
        minCart: minCartVal,
        expiry: editCouponItem.expiry,
        usage: editCouponItem.usage,
        status: editCouponItem.status
      });
      setCoupons(coupons.map(c => c.code === editCouponItem.originalCode ? saved : c));
    } catch (err) {
      setCoupons(coupons.map(c => c.code === editCouponItem.originalCode ? {
        code: editCouponItem.code.trim().toUpperCase(),
        discount: editCouponItem.discount.trim(),
        type: editCouponItem.type,
        minCart: minCartVal,
        expiry: editCouponItem.expiry,
        usage: editCouponItem.usage,
        status: editCouponItem.status
      } : c));
    }
    
    setShowEditCouponModal(false);
    setEditCouponItem(null);
  };

  const deleteCoupon = async (code) => {
    if (confirm(`Are you sure you want to delete coupon ${code}?`)) {
      try {
        await apiService.deleteCoupon(code);
      } catch (err) {}
      setCoupons(coupons.filter(c => c.code !== code));
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(id);
      } catch (err) {}
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const saved = await apiService.updateOrderStatus(orderId, newStatus);
      if (saved) {
        setOrders(orders.map(o => o.id === orderId ? saved : o));
        return;
      }
    } catch (err) {}
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleEditOrderSubmit = async (e) => {
    e.preventDefault();
    if (!editOrderItem.customer || !editOrderItem.amount || !editOrderItem.payment) return;
    
    try {
      const saved = await apiService.updateOrderStatus(editOrderItem.id, editOrderItem.status);
    } catch (err) {}

    setOrders(orders.map(o => o.id === editOrderItem.id ? {
      ...o,
      customer: editOrderItem.customer.trim(),
      amount: editOrderItem.amount.startsWith('₹') ? editOrderItem.amount : `₹${editOrderItem.amount}`,
      payment: editOrderItem.payment.trim(),
      status: editOrderItem.status,
      date: editOrderItem.date
    } : o));
    
    setShowEditOrderModal(false);
    setEditOrderItem(null);
  };
  
  const deleteOrder = async (id) => {
    if (confirm(`Are you sure you want to delete order ${id}?`)) {
      try {
        await apiService.deleteOrder(id);
      } catch (err) {}
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleEditCustomerSubmit = (e) => {
    e.preventDefault();
    if (!editCustomerItem.name || !editCustomerItem.email || !editCustomerItem.phone) return;
    
    setCustomers(customers.map(c => c.id === editCustomerItem.id ? {
      ...c,
      name: editCustomerItem.name.trim(),
      email: editCustomerItem.email.trim(),
      phone: editCustomerItem.phone.trim(),
      ordersCount: parseInt(editCustomerItem.ordersCount, 10) || 0,
      joinedDate: editCustomerItem.joinedDate,
      status: editCustomerItem.status
    } : c));
    
    setShowEditCustomerModal(false);
    setEditCustomerItem(null);
  };
  
  const deleteCustomer = (id) => {
    if (confirm('Are you sure you want to delete this customer record?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const getCustomerAvatar = (avatarType) => {
    if (avatarType === 'celebKid') return celebKidImg;
    if (avatarType === 'celebKeerthy') return celebKeerthyImg;
    if (avatarType === 'celebDulquer') return celebDulquerImg;
    if (avatarType === 'celebCouple') return celebCoupleImg;
    return null;
  };

  // Products filters calculations
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(prodSearchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(prodSearchQuery.toLowerCase());
    const matchesCatalogue = prodCatalogueFilter === 'All Catalogues' || product.catalogue === prodCatalogueFilter;
    const matchesCategory = prodCategoryFilter === 'All Categories' || product.category === prodCategoryFilter;
    const matchesStatus = prodStatusFilter === 'Status' || product.status === prodStatusFilter;
    return matchesSearch && matchesCatalogue && matchesCategory && matchesStatus;
  });

  // Products pagination calculations
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (prodCurrentPage - 1) * itemsPerPage,
    prodCurrentPage * itemsPerPage
  );

  // Nav Items
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Products', icon: <Package size={18} /> },
    { label: 'Categories', icon: <Layers size={18} /> },
    { label: 'Catalogues', icon: <BookOpen size={18} /> },
    { label: 'Orders', icon: <ShoppingCart size={18} /> },
    { label: 'Customers', icon: <Users size={18} /> },
    { label: 'Offers & Coupons', icon: <Tag size={18} /> },
    { label: 'Marketing', icon: <TrendingUp size={18} /> },
    { label: 'Reviews', icon: <Star size={18} /> },
    { label: 'Manage Features', icon: <Globe size={18} /> },
    { label: 'Settings', icon: <Settings size={18} /> },
    { label: 'Profile', icon: <User size={18} /> }
  ];

  return (
    <div className="admin-app-layout">
      {/* Sidebar - Perfectly matching the image style (White background, light borders, orange active, green brand logo text) */}
      <aside className="admin-re-sidebar">
        <div className="admin-re-brand">
          <img src={logoImg} alt="MithiraShoppy Logo" className="admin-re-brand-logo" />
          <div className="admin-re-brand-name">
            <span className="brand-mithira">Mithira</span>
            <span className="brand-shoppy">Shoppy</span>
          </div>
        </div>

        <nav className="admin-re-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`admin-re-nav-item ${activeTab === item.label ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.label);
                setSearchQuery('');
              }}
            >
              {item.icon}
              <span className="admin-re-nav-label">{item.label}</span>
            </button>
          ))}
          
          <button 
            className={`admin-re-nav-item admin-re-logout ${activeTab === 'Logout' ? 'active' : ''}`} 
            onClick={() => setActiveTab('Logout')}
          >
            <LogOut size={18} />
            <span className="admin-re-nav-label">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Container */}
      <div className="admin-re-main-container">
        
        {/* Topbar - 1. Dashboard, search bar, notification bells & user avatar super admin with dropdown */}
        <header className="admin-re-topbar">
          <div className="admin-re-topbar-left">
            <h1 className="admin-re-page-title">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="admin-re-topbar-right">
            {/* Search Pill Input */}
            <div className="admin-re-search-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder={activeTab === 'Customers' ? "Search customers..." : "Search anything..."} 
                value={activeTab === 'Customers' ? custSearchQuery : searchQuery}
                onChange={(e) => {
                  if (activeTab === 'Customers') {
                    setCustSearchQuery(e.target.value);
                  } else {
                    setSearchQuery(e.target.value);
                  }
                }}
                className="admin-re-search-input"
              />
            </div>

            {/* Notification Bell */}
            <div className="admin-re-icon-badge-btn" onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); setShowProfileMenu(false); }}>
              <Bell size={20} />
              <span className="badge-dot" />
              {showNotifications && (
                <div className="admin-dropdown-box notifications-dropdown">
                  <div className="dropdown-hdr">Notifications</div>
                  <div className="dropdown-body">
                    <div className="dropdown-item-row unread">
                      <div className="row-title">New Order Received!</div>
                      <div className="row-time">Just now • ORD-542</div>
                    </div>
                    <div className="dropdown-item-row unread">
                      <div className="row-title">Low Stock Alert: Stylish Handbag</div>
                      <div className="row-time">15 mins ago • Only 5 items left</div>
                    </div>
                    <div className="dropdown-item-row">
                      <div className="row-title">Review Added for Gold Necklace</div>
                      <div className="row-time">2 hours ago</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="admin-re-icon-badge-btn" onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); setShowProfileMenu(false); }}>
              <MessageSquare size={20} />
              <span className="badge-number">0</span>
              {showMessages && (
                <div className="admin-dropdown-box messages-dropdown">
                  <div className="dropdown-hdr">Messages</div>
                  <div className="dropdown-body empty">
                    <MessageSquare size={28} className="empty-icon" />
                    <span>No unread messages from customers</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Super Admin Caret */}
            <div className="admin-re-profile-trigger" onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); setShowMessages(false); }}>
              <div className="avatar-wrapper">
                {authUser?.avatar ? (
                  <img src={authUser.avatar} alt="Admin" className="avatar-img" />
                ) : (
                  <div className="avatar-fallback">{authUser?.name?.slice(0, 2).toUpperCase() || 'AD'}</div>
                )}
              </div>
              <div className="profile-details">
                <div className="profile-name">{authUser?.name || 'Admin'}</div>
                <div className="profile-role">Super Admin</div>
              </div>
              <ChevronDown size={14} className="caret-icon" />
              
              {showProfileMenu && (
                <div className="admin-dropdown-box profile-dropdown">
                  <button className="dropdown-btn-item" onClick={() => setActiveTab('Profile')}>
                    <User size={14} /> My Profile
                  </button>
                  <button className="dropdown-btn-item" onClick={() => setActiveTab('Settings')}>
                    <Settings size={14} /> Settings
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-btn-item logout" onClick={handleLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <main className="admin-re-content">
          
          {/* TAB 1: DASHBOARD VIEW (IMAGE COMPILATION REPLICAS) */}
          {activeTab === 'Dashboard' && (
            <div className="dashboard-view-wrapper">
              
              {/* Welcome Back & Date Dropdown Row */}
              <div className="welcome-banner-row">
                <div className="welcome-banner-left">
                  <h2 className="welcome-title">Welcome back, {authUser?.name || 'Admin'} 👋</h2>
                  <p className="welcome-subtitle">Here's what's happening with your store today.</p>
                </div>
                <div className="welcome-banner-right">
                  <div className="date-picker-re-dropdown">
                    <button className="date-picker-btn" onClick={() => setShowDateDropdown(!showDateDropdown)}>
                      <span>{dateRange}</span>
                      <ChevronDown size={14} />
                    </button>
                    {showDateDropdown && (
                      <div className="date-dropdown-menu">
                        <button className="date-opt" onClick={() => { setDateRange('May 28, 2025 - Jun 28, 2025'); setShowDateDropdown(false); }}>May 28, 2025 - Jun 28, 2025</button>
                        <button className="date-opt" onClick={() => { setDateRange('Last 7 Days'); setShowDateDropdown(false); }}>Last 7 Days</button>
                        <button className="date-opt" onClick={() => { setDateRange('This Month'); setShowDateDropdown(false); }}>This Month</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards Row */}
              <div className="stats-row-grid">
                <div className="re-stat-card">
                  <div className="stat-card-left">
                    <span className="stat-lbl">Total Revenue</span>
                    <h3 className="stat-val">{stats.revenue}</h3>
                    <span className="stat-trend positive">▲ 12.5% vs last month</span>
                  </div>
                  <div className="stat-card-right red-badge">
                    <TrendingUp size={20} />
                  </div>
                </div>
                
                <div className="re-stat-card">
                  <div className="stat-card-left">
                    <span className="stat-lbl">Total Orders</span>
                    <h3 className="stat-val">{stats.ordersCount}</h3>
                    <span className="stat-trend positive">▲ 8.3% vs last month</span>
                  </div>
                  <div className="stat-card-right green-badge">
                    <ShoppingCart size={20} />
                  </div>
                </div>

                <div className="re-stat-card">
                  <div className="stat-card-left">
                    <span className="stat-lbl">Total Customers</span>
                    <h3 className="stat-val">{184 + customers.length}</h3>
                    <span className="stat-trend positive">▲ 15.2% vs last month</span>
                  </div>
                  <div className="stat-card-right purple-badge">
                    <Users size={20} />
                  </div>
                </div>

                <div className="re-stat-card">
                  <div className="stat-card-left">
                    <span className="stat-lbl">Total Products</span>
                    <h3 className="stat-val">{products.length}</h3>
                    <span className="stat-trend positive">▲ 6.2% vs last month</span>
                  </div>
                  <div className="stat-card-right lightgreen-badge">
                    <Package size={20} />
                  </div>
                </div>
              </div>

              {/* Main Graphs Grid Row */}
              <div className="graphs-row-grid">
                
                {/* Sales Overview Chart (Custom SVG Line chart with rich styling & tooltips) */}
                <div className="graph-panel sales-overview">
                  <div className="panel-header">
                    <h3 className="panel-title">Sales Overview</h3>
                  </div>
                  <div className="panel-body svg-chart-container">
                    <svg viewBox="0 0 600 220" className="sales-svg-chart">
                      {/* Grid Lines */}
                      <line x1="50" y1="20" x2="560" y2="20" className="chart-grid-line" />
                      <line x1="50" y1="52" x2="560" y2="52" className="chart-grid-line" />
                      <line x1="50" y1="84" x2="560" y2="84" className="chart-grid-line" />
                      <line x1="50" y1="116" x2="560" y2="116" className="chart-grid-line" />
                      <line x1="50" y1="148" x2="560" y2="148" className="chart-grid-line" />
                      <line x1="50" y1="180" x2="560" y2="180" className="chart-grid-line" />

                      {/* Y-Axis Labels */}
                      <text x="15" y="24" className="y-axis-lbl">250k</text>
                      <text x="15" y="56" className="y-axis-lbl">200k</text>
                      <text x="15" y="88" className="y-axis-lbl">150k</text>
                      <text x="15" y="120" className="y-axis-lbl">120k</text>
                      <text x="15" y="152" className="y-axis-lbl">100k</text>
                      <text x="15" y="184" className="y-axis-lbl">50k</text>

                      {/* Gradient Defs */}
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C59B6C" stopOpacity="0.45"/>
                          <stop offset="100%" stopColor="#C59B6C" stopOpacity="0.00"/>
                        </linearGradient>
                      </defs>

                      {/* Area Under Curve */}
                      <path 
                        d={`M 50 180 
                            L 50 ${180 - (chartPoints[0].value / 250000) * 160} 
                            L 135 ${180 - (chartPoints[1].value / 250000) * 160} 
                            L 220 ${180 - (chartPoints[2].value / 250000) * 160} 
                            L 305 ${180 - (chartPoints[3].value / 250000) * 160} 
                            L 390 ${180 - (chartPoints[4].value / 250000) * 160} 
                            L 475 ${180 - (chartPoints[5].value / 250000) * 160} 
                            L 560 ${180 - (chartPoints[6].value / 250000) * 160} 
                            L 560 180 Z`}
                        fill="url(#chartGlow)"
                      />

                      {/* Spline Path */}
                      <path 
                        d={`M 50 ${180 - (chartPoints[0].value / 250000) * 160} 
                            C 92.5 ${180 - (chartPoints[0].value / 250000) * 160}, 92.5 ${180 - (chartPoints[1].value / 250000) * 160}, 135 ${180 - (chartPoints[1].value / 250000) * 160} 
                            C 177.5 ${180 - (chartPoints[1].value / 250000) * 160}, 177.5 ${180 - (chartPoints[2].value / 250000) * 160}, 220 ${180 - (chartPoints[2].value / 250000) * 160} 
                            C 262.5 ${180 - (chartPoints[2].value / 250000) * 160}, 262.5 ${180 - (chartPoints[3].value / 250000) * 160}, 305 ${180 - (chartPoints[3].value / 250000) * 160} 
                            C 347.5 ${180 - (chartPoints[3].value / 250000) * 160}, 347.5 ${180 - (chartPoints[4].value / 250000) * 160}, 390 ${180 - (chartPoints[4].value / 250000) * 160} 
                            C 432.5 ${180 - (chartPoints[4].value / 250000) * 160}, 432.5 ${180 - (chartPoints[5].value / 250000) * 160}, 475 ${180 - (chartPoints[5].value / 250000) * 160} 
                            C 517.5 ${180 - (chartPoints[5].value / 250000) * 160}, 517.5 ${180 - (chartPoints[6].value / 250000) * 160}, 560 ${180 - (chartPoints[6].value / 250000) * 160}`}
                        fill="none" 
                        stroke="#C59B6C" 
                        strokeWidth="3.5"
                      />

                      {/* Interactive Dot Triggers */}
                      {chartPoints.map((pt, i) => {
                        const cx = 50 + i * 85;
                        const cy = 180 - (pt.value / 250000) * 160;
                        return (
                          <g key={pt.date} onMouseEnter={() => setHoveredPoint({ idx: i, cx, cy, label: pt.date, val: pt.value })} onMouseLeave={() => setHoveredPoint(null)}>
                            <circle cx={cx} cy={cy} r="5" fill="#fff" stroke="#C59B6C" strokeWidth="3.5" className="chart-dot" />
                            <circle cx={cx} cy={cy} r="15" fill="transparent" style={{ cursor: 'pointer' }} />
                          </g>
                        );
                      })}

                      {/* X-Axis Labels */}
                      <text x="50" y="205" textAnchor="middle" className="x-axis-lbl">{chartPoints[0].date}</text>
                      <text x="135" y="205" textAnchor="middle" className="x-axis-lbl">{chartPoints[1].date}</text>
                      <text x="220" y="205" textAnchor="middle" className="x-axis-lbl">{chartPoints[2].date}</text>
                      <text x="305" y="205" textAnchor="middle" className="x-axis-lbl">{chartPoints[3].date}</text>
                      <text x="390" y="205" textAnchor="middle" className="x-axis-lbl">{chartPoints[4].date}</text>
                      <text x="475" y="205" textAnchor="middle" className="x-axis-lbl">{chartPoints[5].date}</text>
                      <text x="560" y="205" textAnchor="middle" className="x-axis-lbl">{chartPoints[6].date}</text>

                      {/* Tooltip Overlay */}
                      {hoveredPoint && (
                        <g>
                          <line x1={hoveredPoint.cx} y1="20" x2={hoveredPoint.cx} y2="180" stroke="#ccc" strokeDasharray="3,3" />
                          <circle cx={hoveredPoint.cx} cy={hoveredPoint.cy} r="8" fill="#C59B6C" opacity="0.3" />
                          <rect 
                            x={hoveredPoint.cx > 450 ? hoveredPoint.cx - 130 : hoveredPoint.cx + 10} 
                            y={hoveredPoint.cy - 35} 
                            width="120" 
                            height="50" 
                            rx="6" 
                            fill="#fff" 
                            stroke="#C59B6C" 
                            strokeWidth="1"
                            className="chart-tooltip-bg"
                          />
                          <text 
                            x={hoveredPoint.cx > 450 ? hoveredPoint.cx - 120 : hoveredPoint.cx + 20} 
                            y={hoveredPoint.cy - 20} 
                            className="tooltip-date"
                          >
                            {hoveredPoint.label}
                          </text>
                          <text 
                            x={hoveredPoint.cx > 450 ? hoveredPoint.cx - 120 : hoveredPoint.cx + 20} 
                            y={hoveredPoint.cy - 4} 
                            className="tooltip-val"
                          >
                            ₹{hoveredPoint.val.toLocaleString()}
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Order Status Donut Chart Panel */}
                <div className="graph-panel order-status-donut">
                  <div className="panel-header">
                    <h3 className="panel-title">Order Status</h3>
                  </div>
                  <div className="panel-body donut-chart-layout">
                    {/* SVG Donut */}
                    <div className="donut-chart-svg-wrap">
                      <svg viewBox="0 0 160 160" width="100%" height="100%">
                        {/* Pending Segment (100) -> 18.5% */}
                        <circle cx="80" cy="80" r="55" fill="none" stroke="#F39C12" strokeWidth="16" strokeDasharray="63.9 345.5" strokeDashoffset="0" />
                        {/* Processing Segment (132) -> 24.3% */}
                        <circle cx="80" cy="80" r="55" fill="none" stroke="#3498DB" strokeWidth="16" strokeDasharray="84.2 345.5" strokeDashoffset="-63.9" />
                        {/* Shipped Segment (195) -> 36.0% */}
                        <circle cx="80" cy="80" r="55" fill="none" stroke="#2ECC71" strokeWidth="16" strokeDasharray="124.4 345.5" strokeDashoffset="-148.1" />
                        {/* Delivered Segment (90) -> 16.6% */}
                        <circle cx="80" cy="80" r="55" fill="none" stroke="#1ABC9C" strokeWidth="16" strokeDasharray="57.4 345.5" strokeDashoffset="-272.5" />
                        {/* Cancelled Segment (25) -> 4.6% */}
                        <circle cx="80" cy="80" r="55" fill="none" stroke="#E74C3C" strokeWidth="16" strokeDasharray="16.0 345.5" strokeDashoffset="-329.9" />
                      </svg>
                      
                      {/* Donut Center text */}
                      <div className="donut-center-overlay">
                        <span className="count-num">{totalOrdersCount}</span>
                        <span className="count-lbl">Total Orders</span>
                      </div>
                    </div>

                    {/* Donut Legend with direct filter actions */}
                    <div className="donut-legend-list">
                      <div className={`legend-item ${orderStatusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setOrderStatusFilter(orderStatusFilter === 'Pending' ? 'All' : 'Pending')}>
                        <span className="dot pending" />
                        <span className="lbl">Pending</span>
                        <span className="val">{orderBreakdown.Pending}</span>
                      </div>
                      <div className={`legend-item ${orderStatusFilter === 'Processing' ? 'active' : ''}`} onClick={() => setOrderStatusFilter(orderStatusFilter === 'Processing' ? 'All' : 'Processing')}>
                        <span className="dot processing" />
                        <span className="lbl">Processing</span>
                        <span className="val">{orderBreakdown.Processing}</span>
                      </div>
                      <div className={`legend-item ${orderStatusFilter === 'Shipped' ? 'active' : ''}`} onClick={() => setOrderStatusFilter(orderStatusFilter === 'Shipped' ? 'All' : 'Shipped')}>
                        <span className="dot shipped" />
                        <span className="lbl">Shipped</span>
                        <span className="val">{orderBreakdown.Shipped}</span>
                      </div>
                      <div className={`legend-item ${orderStatusFilter === 'Delivered' ? 'active' : ''}`} onClick={() => setOrderStatusFilter(orderStatusFilter === 'Delivered' ? 'All' : 'Delivered')}>
                        <span className="dot delivered" />
                        <span className="lbl">Delivered</span>
                        <span className="val">{orderBreakdown.Delivered}</span>
                      </div>
                      <div className={`legend-item ${orderStatusFilter === 'Cancelled' ? 'active' : ''}`} onClick={() => setOrderStatusFilter(orderStatusFilter === 'Cancelled' ? 'All' : 'Cancelled')}>
                        <span className="dot cancelled" />
                        <span className="lbl">Cancelled</span>
                        <span className="val">{orderBreakdown.Cancelled}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Multi-Widgets Row Grid */}
              <div className="bottom-widgets-row-grid">
                
                {/* 1. Top Selling Product */}
                <div className="bottom-widget-card top-selling-widget">
                  <h4 className="widget-title">Top Selling Product</h4>
                  <div className="product-summary-card">
                    <img src={kidsDressImg} alt="Dress" className="product-thumb" />
                    <div className="product-details">
                      <div className="prod-name">Kids Party Dress</div>
                      <div className="prod-price">₹12,480</div>
                      <div className="prod-badge">120 Orders</div>
                    </div>
                  </div>
                </div>

                {/* 2. Low Stock Alert */}
                <div className="bottom-widget-card low-stock-widget">
                  <h4 className="widget-title">Low Stock Alert</h4>
                  <div className="product-summary-card">
                    <img src={handbagImg} alt="Handbag" className="product-thumb alert-border" />
                    <div className="product-details">
                      <div className="prod-name">Stylish Handbag</div>
                      <div className="prod-status red">5 in stock</div>
                    </div>
                  </div>
                </div>

                {/* 3. New Customers Metric */}
                <div className="bottom-widget-card number-metric-card">
                  <h4 className="widget-title">New Customers</h4>
                  <div className="metric-body">
                    <span className="metric-val">23</span>
                    <span className="metric-trend positive">▲ 18% vs last month</span>
                  </div>
                </div>

                {/* 4. Revenue This Month */}
                <div className="bottom-widget-card number-metric-card">
                  <h4 className="widget-title">Revenue This Month</h4>
                  <div className="metric-body">
                    <span className="metric-val">{stats.revenue}</span>
                    <span className="metric-trend positive">▲ 12.5%</span>
                  </div>
                </div>

              </div>

              {/* Recent Orders - Integrated at bottom of Dashboard for immediate utility */}
              <div className="admin-re-section-card">
                <div className="admin-re-section-header">
                  <h3 className="admin-re-section-title">Recent Orders {orderStatusFilter !== 'All' ? `(${orderStatusFilter})` : ''}</h3>
                  <button className="view-all-tab-btn" onClick={() => { setActiveTab('Orders'); setOrderStatusFilter('All'); }}>View All Orders</button>
                </div>
                <div className="admin-re-table-wrapper">
                  <table className="admin-re-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter)
                        .slice(0, 5)
                        .map((order) => (
                          <tr key={order.id}>
                            <td className="bold-order-id">{order.id}</td>
                            <td>{order.customer}</td>
                            <td>{order.product}</td>
                            <td className="amount-cell">{order.amount}</td>
                            <td className="date-cell">{order.date}</td>
                            <td>
                              <span className={`status-badge-re ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <select 
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="order-status-mini-select"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}

          {/* TAB 2: PRODUCTS VIEW (REPLICATES SCREENSHOT) */}
          {activeTab === 'Products' && (
            <div className="admin-view-tab-content">
              {/* Main title & Add Product Row */}
              <div className="products-re-header-row">
                <h2 className="products-re-main-title">Products</h2>
                <button className="products-re-add-btn" onClick={() => setShowAddProductModal(true)}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {/* Filters row: Search input + 3 Select Dropdowns */}
              <div className="products-re-filters-row">
                <div className="products-re-search-input-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={prodSearchQuery}
                    onChange={(e) => setProdSearchQuery(e.target.value)}
                    className="products-re-search-field"
                  />
                </div>
                
                <div className="products-re-dropdown-wrap">
                  <select
                    value={prodCatalogueFilter}
                    onChange={(e) => setProdCatalogueFilter(e.target.value)}
                    className="products-re-select"
                  >
                    <option value="All Catalogues">All Catalogues</option>
                    {catalogues.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="products-re-dropdown-wrap">
                  <select
                    value={prodCategoryFilter}
                    onChange={(e) => setProdCategoryFilter(e.target.value)}
                    className="products-re-select"
                  >
                    <option value="All Categories">All Categories</option>
                    {getCategoryPathsList().map(path => (
                      <option key={path} value={path}>{path}</option>
                    ))}
                  </select>
                </div>

                <div className="products-re-dropdown-wrap">
                  <select
                    value={prodStatusFilter}
                    onChange={(e) => setProdStatusFilter(e.target.value)}
                    className="products-re-select"
                  >
                    <option value="Status">Status</option>
                    <option value="Active">Active</option>
                    <option value="Low Stock">Low Stock</option>
                  </select>
                </div>
              </div>

              {/* Table section */}
              <div className="admin-re-section-card products-table-section">
                <div className="admin-re-table-wrapper">
                  <table className="admin-re-table products-table-re">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Catalogue</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => (
                          <tr key={product.id}>
                            <td className="prod-img-cell">
                              <img src={resolveProductImage(product)} alt={product.name} className="table-prod-img" />
                            </td>
                            <td className="bold text-black">{product.name}</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#555', fontSize: '0.85rem' }}>{getProductSKU(product)}</td>
                            <td className="text-gray">{product.catalogue}</td>
                            <td className="text-gray">{product.category}</td>
                            <td className="bold text-black">₹{product.price.toLocaleString()}</td>
                            <td className="text-gray">{product.stock}</td>
                            <td>
                              <span className={`status-badge-re ${product.status.toLowerCase().replace(' ', '-')}`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="action-cell">
                              <div className="action-buttons-wrap">
                                <button className="table-act-btn edit" title="Edit" onClick={() => setEditProductItem(product)}>
                                  <Edit3 size={15} />
                                </button>
                                <button className="table-act-btn view" title="View details" onClick={() => setViewProductItem(product)}>
                                  <Eye size={15} />
                                </button>
                                <button className="table-act-btn delete" title="Delete" onClick={() => deleteProduct(product.id)}>
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="empty-table-cell">No products found matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="products-re-pagination">
                  <button 
                    className="pagination-arrow" 
                    onClick={() => setProdCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={prodCurrentPage === 1}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      className={`pagination-num ${prodCurrentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setProdCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    className="pagination-arrow" 
                    onClick={() => setProdCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={prodCurrentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES VIEW */}
          {activeTab === 'Categories' && (
            <div className="admin-view-tab-content">
              {/* Header Row */}
              <div className="categories-re-header-row">
                <h2 className="categories-re-main-title">Categories</h2>
                <button 
                  className="categories-re-add-btn" 
                  onClick={() => {
                    setNewCategory({ name: '', parent: '—', count: 0, status: 'Active', showInNavbar: true, showInCategories: true, showInFilters: true });
                    setShowAddCategoryModal(true);
                  }}
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>

              {/* Tree Grid Card Container */}
              <div className="admin-re-section-card categories-table-section">
                <div className="admin-re-table-wrapper">
                  <table className="admin-re-table categories-table-re">
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Parent Category</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getHierarchicalCategories().map((cat) => {
                        const isVisible = isCategoryVisible(cat);
                        if (!isVisible) return null;

                        const hasChildren = categories.some(c => c.parent === cat.name);
                        const isExpanded = expandedCategories[cat.name];
                        const depth = cat.depth || 0;

                        return (
                          <tr key={cat.name} className={`category-row depth-${depth}`}>
                            <td className="cat-name-cell" style={{ paddingLeft: `${depth * 28 + 16}px` }}>
                              <div className="cat-name-wrapper">
                                {hasChildren ? (
                                  <button 
                                    type="button" 
                                    className={`cat-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                                    onClick={() => setExpandedCategories({
                                      ...expandedCategories,
                                      [cat.name]: !isExpanded
                                    })}
                                  >
                                    <ChevronDown size={14} className="toggle-chevron-icon" />
                                  </button>
                                ) : (
                                  <span className="cat-toggle-spacer">
                                    {depth > 0 && <span className="cat-branch-connector">↳</span>}
                                  </span>
                                )}
                                <span className="cat-name-text">{cat.name}</span>
                              </div>
                            </td>
                            <td className="text-gray">{cat.parent || '—'}</td>
                            <td className="text-gray font-semibold">{getCategoryProductCount(cat.name)}</td>
                            <td>
                              <span className={`status-badge-re ${cat.status.toLowerCase()}`}>
                                {cat.status}
                              </span>
                            </td>
                            <td className="action-cell">
                              <div className="action-buttons-wrap">
                                <button 
                                  className="table-act-btn edit" 
                                  title="Edit category" 
                                  onClick={() => setEditCategoryItem({
                                    originalName: cat.name,
                                    name: cat.name,
                                    parent: cat.parent,
                                    count: getCategoryProductCount(cat.name),
                                    status: cat.status,
                                    image: cat.image || '',
                                    showInNavbar:     cat.showInNavbar     !== false,
                                    showInCategories: cat.showInCategories !== false,
                                    showInFilters:    cat.showInFilters    !== false,
                                  })}
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button 
                                  className="table-act-btn view" 
                                  title="View details" 
                                  onClick={() => setViewCategoryItem(cat)}
                                >
                                  <Eye size={15} />
                                </button>
                                <button 
                                  className="table-act-btn delete" 
                                  title="Delete category" 
                                  onClick={() => deleteCategory(cat.name)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATALOGUES VIEW */}
          {activeTab === 'Catalogues' && (
            <div className="admin-view-tab-content">
              {/* Header Row */}
              <div className="catalogues-re-header-row">
                <h2 className="catalogues-re-main-title">Catalogues</h2>
                <button 
                  className="catalogues-re-add-btn" 
                  onClick={() => {
                    setNewCatalogue({ name: '', subtitle: '', count: 0, status: 'Active', revenue: '₹0', image: 'Kids' });
                    setShowAddCatalogueModal(true);
                  }}
                >
                  <Plus size={16} /> Add Catalogue
                </button>
              </div>

              {/* Catalogues Cards Grid */}
              <div className="catalogues-re-grid">
                {catalogues.map((cat) => (
                  <div className="catalogue-card-re" key={cat.name}>
                    {/* Top Section */}
                    <div className="card-top-content">
                      {/* Left Side: Details */}
                      <div className="card-details-left">
                        <div className="card-header-actions">
                          <h3 className="cat-card-title">{cat.name}</h3>
                          <div className="card-hover-actions">
                            <button 
                              className="cat-card-act-btn edit" 
                              title="Edit Catalogue"
                              onClick={() => setEditCatalogueItem({
                                originalName: cat.name,
                                name: cat.name,
                                subtitle: cat.subtitle,
                                count: products.filter(p => p.catalogue === cat.name).length,
                                status: cat.status,
                                revenue: cat.revenue,
                                image: cat.image
                              })}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button 
                              className="cat-card-act-btn delete" 
                              title="Delete Catalogue"
                              onClick={() => deleteCatalogue(cat.name)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="cat-card-subtitle">{cat.subtitle}</p>
                        
                        <div className="cat-meta-info">
                          <p className="cat-products-count">{products.filter(p => p.catalogue === cat.name).length} Products</p>
                          <div className="cat-status-wrap">
                            <span className={`cat-status-dot ${cat.status.toLowerCase()}`}></span>
                            <span className="cat-status-text">{cat.status}</span>
                          </div>
                          <p className="cat-revenue-text">
                            Revenue: <span className="bold">{cat.revenue}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Image */}
                      <div className="card-image-right">
                        <img 
                          src={getCatalogueImage(cat.image)} 
                          alt={cat.name} 
                          className="cat-thumb" 
                        />
                      </div>
                    </div>

                    {/* Bottom Outlined Button */}
                    <button 
                      className="catalogue-view-btn"
                      onClick={() => setViewCatalogueItem(cat)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS VIEW */}
          {activeTab === 'Orders' && (
            <div className="admin-view-tab-content">
              {/* Header Row - Matches Screenshot */}
              <div className="orders-re-header-row">
                <h2 className="orders-re-main-title">Orders</h2>
                <div className="orders-re-filters-right">
                  <select 
                    value={orderStatusFilter} 
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="orders-re-select-dropdown"
                  >
                    <option value="All">All Status</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Processing">Processing</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select 
                    value={orderTypeFilter} 
                    onChange={(e) => setOrderTypeFilter(e.target.value)}
                    className="orders-re-select-dropdown"
                  >
                    <option value="All">All Orders</option>
                    <option value="Normal">Normal Orders</option>
                    <option value="Lucky">Lucky Charm Orders</option>
                  </select>
                  
                  <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    className="orders-re-select-dropdown"
                  >
                    <option value="May 28, 2025 - Jun 28, 2025">May 28, 2025 - Jun 28, 2025</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="This Month">This Month</option>
                  </select>
                </div>
              </div>

              {/* Table section */}
              <div className="admin-re-section-card orders-table-section">
                <div className="admin-re-table-wrapper">
                  <table className="admin-re-table orders-table-re">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => {
                          const matchesQuery = o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                               (o.product && o.product.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                               o.id.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
                          
                          let matchesType = true;
                          if (orderTypeFilter === 'Normal') {
                            matchesType = !o.isLuckyCharmOrder;
                          } else if (orderTypeFilter === 'Lucky') {
                            matchesType = !!o.isLuckyCharmOrder;
                          }

                          return matchesQuery && matchesStatus && matchesType;
                        })
                        .map((order) => (
                          <tr key={order.id}>
                            <td className="bold-order-id">
                              {order.id}
                              {order.isLuckyCharmOrder && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  ⭐ Lucky Charm
                                </span>
                              )}
                            </td>
                            <td className="text-gray">{order.customer}</td>
                            <td className="bold text-black">{order.amount}</td>
                            <td className="text-gray">{order.payment}</td>
                            <td>
                              <span className={`orders-status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="text-gray">{order.date}</td>
                            <td className="action-cell">
                              <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
                                <button 
                                  className="table-act-btn edit" 
                                  title="Edit Order" 
                                  onClick={() => {
                                    setEditOrderItem({ ...order });
                                    setShowEditOrderModal(true);
                                  }}
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button 
                                  className="table-act-btn view" 
                                  title="View details" 
                                  onClick={() => {
                                    setViewOrderItem(order);
                                    setShowViewOrderModal(true);
                                  }}
                                >
                                  <Eye size={15} />
                                </button>
                                <button 
                                  className="table-act-btn delete" 
                                  title="Delete Order" 
                                  onClick={() => deleteOrder(order.id)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {orders.filter(o => {
                        const matchesQuery = o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                             (o.product && o.product.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                             o.id.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
                        
                        let matchesType = true;
                        if (orderTypeFilter === 'Normal') {
                          matchesType = !o.isLuckyCharmOrder;
                        } else if (orderTypeFilter === 'Lucky') {
                          matchesType = !!o.isLuckyCharmOrder;
                        }

                        return matchesQuery && matchesStatus && matchesType;
                      }).length === 0 && (
                        <tr>
                          <td colSpan="7" className="empty-table-cell">No orders found matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS VIEW */}
          {activeTab === 'Customers' && (
            <div className="admin-view-tab-content">
              {/* Filters row inside the tab content - Matches screenshot */}
              <div className="customers-re-filters-row">
                <div className="customers-re-search-input-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={custSearchQuery}
                    onChange={(e) => setCustSearchQuery(e.target.value)}
                    className="customers-re-search-field"
                  />
                </div>
                
                <select
                  value={custStatusFilter}
                  onChange={(e) => setCustStatusFilter(e.target.value)}
                  className="orders-re-select-dropdown"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Table section */}
              <div className="admin-re-section-card customers-table-section">
                <div className="admin-re-table-wrapper">
                  <table className="admin-re-table customers-table-re">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Orders</th>
                        <th>Joined Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers
                        .filter(c => {
                          const matchesQuery = c.name.toLowerCase().includes(custSearchQuery.toLowerCase()) || 
                                               c.email.toLowerCase().includes(custSearchQuery.toLowerCase()) ||
                                               c.phone.toLowerCase().includes(custSearchQuery.toLowerCase());
                          const matchesStatus = custStatusFilter === 'All' || c.status === custStatusFilter;
                          return matchesQuery && matchesStatus;
                        })
                        .map((c) => (
                          <tr key={c.id}>
                            <td className="cust-profile-cell">
                              <div className="cust-profile-wrap">
                                <div className="cust-avatar-circle">
                                  {getCustomerAvatar(c.avatarType) ? (
                                    <img src={getCustomerAvatar(c.avatarType)} alt={c.name} className="cust-avatar-img" />
                                  ) : (
                                    <span className="cust-avatar-fallback">
                                      {c.name.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <span className="cust-name-bold">{c.name}</span>
                              </div>
                            </td>
                            <td className="text-gray">{c.email}</td>
                            <td className="text-gray">{c.phone}</td>
                            <td className="text-gray">{c.ordersCount}</td>
                            <td className="text-gray">{c.joinedDate}</td>
                            <td>
                              <span className={`cust-status-badge ${c.status.toLowerCase()}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="action-cell">
                              <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
                                <button 
                                  className="table-act-btn edit" 
                                  title="Edit Customer" 
                                  onClick={() => {
                                    setEditCustomerItem({ ...c });
                                    setShowEditCustomerModal(true);
                                  }}
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button 
                                  className="table-act-btn delete" 
                                  title="Delete Customer" 
                                  onClick={() => deleteCustomer(c.id)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {customers.filter(c => {
                        const matchesQuery = c.name.toLowerCase().includes(custSearchQuery.toLowerCase()) || 
                                             c.email.toLowerCase().includes(custSearchQuery.toLowerCase()) ||
                                             c.phone.toLowerCase().includes(custSearchQuery.toLowerCase());
                        const matchesStatus = custStatusFilter === 'All' || c.status === custStatusFilter;
                        return matchesQuery && matchesStatus;
                      }).length === 0 && (
                        <tr>
                          <td colSpan="7" className="empty-table-cell">No customers found matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: OFFERS & COUPONS VIEW */}
          {activeTab === 'Offers & Coupons' && (
            <div className="admin-view-tab-content">
              {/* Header actions with sub-tab buttons on left and Add Coupon on right */}
              <div className="coupons-re-header-row">
                <div className="coupon-sub-tabs-wrap">
                  <button 
                    className={`coupon-sub-tab-btn ${activeCouponSubTab === 'Coupons' ? 'active' : ''}`}
                    onClick={() => setActiveCouponSubTab('Coupons')}
                  >
                    Coupons
                  </button>
                  <button 
                    className={`coupon-sub-tab-btn ${activeCouponSubTab === 'Offers' ? 'active' : ''}`}
                    onClick={() => setActiveCouponSubTab('Offers')}
                  >
                    Offers
                  </button>
                </div>
                
                {activeCouponSubTab === 'Coupons' ? (
                  <button 
                    className="admin-btn-primary orange-add-btn" 
                    onClick={() => {
                      setNewCoupon({ code: '', discount: '', type: 'Percentage', minCart: '', expiry: '', usageLimit: '500' });
                      setShowAddCouponModal(true);
                    }}
                  >
                    <Plus size={16} /> Add Coupon
                  </button>
                ) : (
                  <button 
                    className="admin-btn-primary orange-add-btn" 
                    onClick={() => alert('Adding new marketing campaigns is managed under the Marketing tab.')}
                  >
                    <Plus size={16} /> Create Campaign
                  </button>
                )}
              </div>

              {activeCouponSubTab === 'Coupons' ? (
                /* Coupons List Table - Replicates Screenshot */
                <div className="admin-re-section-card coupons-table-section">
                  <div className="admin-re-table-wrapper">
                    <table className="admin-re-table coupons-table-re">
                      <thead>
                        <tr>
                          <th>Coupon Code</th>
                          <th>Discount</th>
                          <th>Min. Order</th>
                          <th>Valid Till</th>
                          <th>Usage</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((coupon) => (
                          <tr key={coupon.code}>
                            <td className="bold text-black">{coupon.code}</td>
                            <td className="text-gray">{coupon.discount}</td>
                            <td className="text-gray">{coupon.minCart}</td>
                            <td className="text-gray">{coupon.expiry}</td>
                            <td className="text-gray">{coupon.usage || '0/500'}</td>
                            <td>
                              <span className={`orders-status-badge ${coupon.status.toLowerCase()}`}>
                                {coupon.status}
                              </span>
                            </td>
                            <td className="action-cell">
                              <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
                                <button 
                                  className="table-act-btn edit" 
                                  title="Edit Coupon" 
                                  onClick={() => {
                                    setEditCouponItem({ 
                                      originalCode: coupon.code,
                                      code: coupon.code,
                                      discount: coupon.discount,
                                      type: coupon.type || 'Percentage',
                                      minCart: coupon.minCart,
                                      expiry: coupon.expiry,
                                      usage: coupon.usage || '0/500',
                                      status: coupon.status 
                                    });
                                    setShowEditCouponModal(true);
                                  }}
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button 
                                  className="table-act-btn delete" 
                                  title="Delete Coupon" 
                                  onClick={() => deleteCoupon(coupon.code)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {coupons.length === 0 && (
                          <tr>
                            <td colSpan="7" className="empty-table-cell">No coupons registered yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Mock Campaigns List Table */
                <div className="admin-re-section-card coupons-table-section">
                  <div className="admin-re-table-wrapper">
                    <table className="admin-re-table coupons-table-re">
                      <thead>
                        <tr>
                          <th>Campaign Name</th>
                          <th>Focus / Category</th>
                          <th>Discount Details</th>
                          <th>Valid Till</th>
                          <th>Priority</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="user-row">
                          <td className="bold text-black">Festive Saree Sale</td>
                          <td className="text-gray">Clothing &gt; Saree</td>
                          <td className="text-gray">Flat 20% Off on Premium Silks</td>
                          <td className="text-gray">Jun 30, 2026</td>
                          <td className="text-gray"><span className="role-chip gold">High</span></td>
                          <td><span className="orders-status-badge delivered">Active</span></td>
                        </tr>
                        <tr className="user-row">
                          <td className="bold text-black">Kids Summer Lookbook</td>
                          <td className="text-gray">Clothing &gt; Kids</td>
                          <td className="text-gray">Free Gift Box on orders over ₹1500</td>
                          <td className="text-gray">Jul 15, 2026</td>
                          <td className="text-gray"><span className="role-chip regular">Medium</span></td>
                          <td><span className="orders-status-badge delivered">Active</span></td>
                        </tr>
                        <tr className="user-row">
                          <td className="bold text-black">Anklets Clearance Launch</td>
                          <td className="text-gray">Accessories</td>
                          <td className="text-gray">Save flat ₹100 using code WELCOME100</td>
                          <td className="text-gray">Aug 01, 2026</td>
                          <td className="text-gray"><span className="role-chip regular">Low</span></td>
                          <td><span className="orders-status-badge delivered">Active</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: MARKETING VIEW */}
          {activeTab === 'Marketing' && (
            <div className="marketing-tab-layout">
              {/* Marketing Sub-Sidebar */}
              <aside className="marketing-sub-sidebar">
                <button 
                  className={`marketing-sub-nav-btn ${activeMarketingSubTab === 'Newsletter' ? 'active' : ''}`}
                  onClick={() => setActiveMarketingSubTab('Newsletter')}
                >
                  <Mail size={16} />
                  <span>Newsletter</span>
                </button>
                <button 
                  className={`marketing-sub-nav-btn ${activeMarketingSubTab === 'Banners' ? 'active' : ''}`}
                  onClick={() => setActiveMarketingSubTab('Banners')}
                >
                  <ImageIcon size={16} />
                  <span>Banners</span>
                </button>
                <button 
                  className={`marketing-sub-nav-btn ${activeMarketingSubTab === 'Announcements' ? 'active' : ''}`}
                  onClick={() => setActiveMarketingSubTab('Announcements')}
                >
                  <Megaphone size={16} />
                  <span>Announcements</span>
                </button>
                <button 
                  className={`marketing-sub-nav-btn ${activeMarketingSubTab === 'Contact Queries' ? 'active' : ''}`}
                  onClick={() => setActiveMarketingSubTab('Contact Queries')}
                >
                  <MessageSquare size={16} />
                  <span>Contact Queries</span>
                </button>
                <button 
                  className={`marketing-sub-nav-btn ${activeMarketingSubTab === 'Lucky Charm' ? 'active' : ''}`}
                  onClick={() => { setActiveMarketingSubTab('Lucky Charm'); setLuckyCharmSubTab('Dashboard'); }}
                >
                  <Sparkles size={16} />
                  <span>Lucky Charm</span>
                </button>
              </aside>

              {/* Marketing Main content area */}
              <div className="marketing-sub-content">
                {activeMarketingSubTab === 'Newsletter' && (
                  <div className="newsletter-view-wrap">
                    {/* Left Column: Stats & Subscribers */}
                    <div className="newsletter-info-col">
                      <h3 className="marketing-section-title">Newsletter Subscribers</h3>
                      
                      {/* Green Tinted Subscribers Counter */}
                      <div className="newsletter-stats-card">
                        <div className="stat-box-inner">
                          <span className="stat-lbl">Total Subscribers</span>
                          <span className="stat-num">{totalSubscribersCount}</span>
                        </div>
                        <div className="stat-box-inner">
                          <span className="stat-lbl">This Month</span>
                          <span className="stat-num">{thisMonthSubscribersCount}</span>
                        </div>
                      </div>

                      {/* Recent Subscribers List */}
                      <div className="recent-subs-container">
                        <div className="recent-subs-hdr">
                          <h4>Recent Subscribers</h4>
                          <button className="view-all-sub-btn" onClick={() => setShowSubscribersModal(true)}>View All</button>
                        </div>

                        <div className="recent-subs-list">
                          {subscribers.slice(0, 4).map((sub, idx) => (
                            <div className="subscriber-row-item" key={idx}>
                              <div className="sub-profile-avatar">
                                {getCustomerAvatar(sub.avatar) ? (
                                  <img src={getCustomerAvatar(sub.avatar)} alt={sub.email} className="sub-avatar-img" />
                                ) : (
                                  <span className="sub-avatar-fallback">{sub.email.slice(0,2).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="sub-email-details">
                                <span className="sub-email-text">{sub.email}</span>
                                <span className="sub-date-text">{sub.date}</span>
                              </div>
                            </div>
                          ))}
                          {subscribers.length === 0 && (
                            <p className="empty-sub-msg">No newsletter subscribers yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Send Form */}
                    <div className="newsletter-send-col">
                      <h3 className="marketing-section-title">Send Newsletter</h3>
                      
                      <form 
                        className="newsletter-send-form" 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newsletterSubject || !newsletterMessage) return;
                          alert(`Newsletter Campaign sent successfully!\nSubject: ${newsletterSubject}\nRecipients: ${totalSubscribersCount} active subscribers.`);
                          setNewsletterSubject('');
                          setNewsletterMessage('');
                        }}
                      >
                        <div className="form-field-marketing">
                          <label>Subject</label>
                          <input 
                            type="text" 
                            placeholder="Enter subject" 
                            value={newsletterSubject}
                            onChange={(e) => setNewsletterSubject(e.target.value)}
                            required
                            className="marketing-input-field-re"
                          />
                        </div>
                        
                        <div className="form-field-marketing">
                          <label>Message</label>
                          <textarea 
                            placeholder="Write your message..." 
                            value={newsletterMessage}
                            onChange={(e) => setNewsletterMessage(e.target.value)}
                            required
                            rows="6"
                            className="marketing-textarea-field-re"
                          />
                        </div>

                        <button type="submit" className="marketing-orange-btn">
                          Send Newsletter
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeMarketingSubTab === 'Banners' && (
                  <div className="banners-view-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                          <ImageIcon size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Banners</h3>
                          <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Manage banners displayed on your website</p>
                        </div>
                      </div>
                      <button className="settings-save-btn" style={{ margin: 0, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddBannerModal(true)}>
                        <Plus size={16} /> Add Banner
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid #eae6df', borderRadius: '16px', backgroundColor: '#fff' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #eae6df', color: '#666', backgroundColor: '#faf9f6' }}>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Banner Preview</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Title</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Position</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Page</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {banners.map((banner, idx) => (
                            <tr key={banner.id} style={{ borderBottom: idx !== banners.length - 1 ? '1px solid #eae6df' : 'none', color: '#2b2b2b' }}>
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ width: '120px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eae6df' }}>
                                  <img src={getCatalogueImage(banner.image)} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              </td>
                              <td style={{ padding: '16px 20px', fontWeight: 700 }}>{banner.title}</td>
                              <td style={{ padding: '16px 20px', color: '#555' }}>{banner.slot}</td>
                              <td style={{ padding: '16px 20px', color: '#555' }}>{banner.page || 'Home Page'}</td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: banner.status === 'Active' ? '#eef6e6' : '#fdebeb',
                                  color: banner.status === 'Active' ? '#D4AF37' : '#ea4335'
                                }}>
                                  {banner.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                  <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => {
                                    setBanners(banners.map(b => b.id === banner.id ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b));
                                  }}><Edit3 size={16} /></button>
                                  <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }}><Eye size={16} /></button>
                                  <button style={{ border: 'none', background: 'transparent', color: '#ea4335', cursor: 'pointer' }} onClick={() => {
                                    if (confirm(`Delete banner "${banner.title}"?`)) {
                                      setBanners(banners.filter(b => b.id !== banner.id));
                                    }
                                  }}><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination control */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                      <span style={{ cursor: 'pointer', color: '#999' }}>&lt;</span>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef0e6', color: '#C59B6C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>1</span>
                      <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>2</span>
                      <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>3</span>
                      <span style={{ cursor: 'pointer', color: '#999' }}>&gt;</span>
                    </div>
                  </div>
                )}

                {activeMarketingSubTab === 'Announcements' && (
                  <div className="announcements-view-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                          <Megaphone size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Announcements</h3>
                          <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Create and manage announcements for your customers</p>
                        </div>
                      </div>
                      <button className="settings-save-btn" style={{ margin: 0, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddAnnouncementModal(true)}>
                        <Plus size={16} /> New Announcement
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid #eae6df', borderRadius: '16px', backgroundColor: '#fff' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #eae6df', color: '#666', backgroundColor: '#faf9f6' }}>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Title</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Message</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Start Date</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>End Date</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {announcements.map((ann, idx) => (
                            <tr key={ann.id} style={{ borderBottom: idx !== announcements.length - 1 ? '1px solid #eae6df' : 'none', color: '#2b2b2b' }}>
                              <td style={{ padding: '16px 20px', fontWeight: 700 }}>{ann.title}</td>
                              <td style={{ padding: '16px 20px', color: '#555' }}>{ann.text}</td>
                              <td style={{ padding: '16px 20px', color: '#555' }}>{ann.startDate || 'May 21, 2025'}</td>
                              <td style={{ padding: '16px 20px', color: '#555' }}>{ann.expiry}</td>
                              <td style={{ padding: '16px 20px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: ann.status === 'Active' ? '#eef6e6' : ann.status === 'Expired' ? '#fdebeb' : '#f5f5f5',
                                  color: ann.status === 'Active' ? '#D4AF37' : ann.status === 'Expired' ? '#ea4335' : '#777'
                                }}>
                                  {ann.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                  <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => {
                                    setAnnouncements(announcements.map(a => a.id === ann.id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a));
                                  }}><Edit3 size={16} /></button>
                                  <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }}><Eye size={16} /></button>
                                  <button style={{ border: 'none', background: 'transparent', color: '#ea4335', cursor: 'pointer' }} onClick={() => {
                                    if (confirm(`Delete announcement "${ann.title}"?`)) {
                                      setAnnouncements(announcements.filter(a => a.id !== ann.id));
                                    }
                                  }}><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination control */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                      <span style={{ cursor: 'pointer', color: '#999' }}>&lt;</span>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef0e6', color: '#C59B6C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>1</span>
                      <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>2</span>
                      <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>3</span>
                      <span style={{ cursor: 'pointer', color: '#999' }}>&gt;</span>
                    </div>
                  </div>
                )}

                {activeMarketingSubTab === 'Contact Queries' && (
                  <div className="contact-queries-view-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                          <MessageSquare size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Contact Queries</h3>
                          <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>View and manage customer queries</p>
                        </div>
                      </div>
                      <div className="query-filters-right">
                        <select 
                          value={querySearchFilter}
                          onChange={(e) => setQuerySearchFilter(e.target.value)}
                          className="orders-re-select-dropdown"
                          style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #eae6df', outline: 'none', backgroundColor: '#fff', fontSize: '0.88rem' }}
                        >
                          <option value="All">All Status</option>
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid #eae6df', borderRadius: '16px', backgroundColor: '#fff' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #eae6df', color: '#666', backgroundColor: '#faf9f6' }}>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Name</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Email</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Subject</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Message</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactQueries
                            .filter(q => querySearchFilter === 'All' || q.status === querySearchFilter)
                            .map((q, idx) => (
                              <tr key={q.id} style={{ borderBottom: idx !== contactQueries.length - 1 ? '1px solid #eae6df' : 'none', color: '#2b2b2b' }}>
                                <td style={{ padding: '16px 20px', fontWeight: 700 }}>{q.name}</td>
                                <td style={{ padding: '16px 20px' }}>{q.email}</td>
                                <td style={{ padding: '16px 20px', fontWeight: 600 }}>{q.subject || 'General Inquiry'}</td>
                                <td style={{ padding: '16px 20px', color: '#555' }}>{q.message}</td>
                                <td style={{ padding: '16px 20px', color: '#555' }}>{q.date}</td>
                                <td style={{ padding: '16px 20px' }}>
                                  <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    backgroundColor: q.status === 'Resolved' ? '#eef6e6' : q.status === 'In Progress' ? '#fdf5e6' : '#eef2fd',
                                    color: q.status === 'Resolved' ? '#D4AF37' : q.status === 'In Progress' ? '#C59B6C' : '#2b87e3'
                                  }}>
                                    {q.status}
                                  </span>
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => {
                                      setViewQueryItem(q);
                                      setReplyMessage('');
                                      setShowReplyQueryModal(true);
                                    }}><MessageSquare size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination control */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ cursor: 'pointer', color: '#999' }}>&lt;</span>
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef0e6', color: '#C59B6C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>1</span>
                        <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>2</span>
                        <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>3</span>
                        <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>4</span>
                        <span style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}>5</span>
                        <span style={{ cursor: 'pointer', color: '#999' }}>&gt;</span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#777' }}>Showing 1 to 5 of 68</span>
                    </div>
                  </div>
                )}

                {activeMarketingSubTab === 'Lucky Charm' && (
                  <div className="lucky-charm-view-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Lucky Charm</h3>
                          <p style={{ fontSize: '0.82rem', color: '#666', margin: '2px 0 0 0' }}>Manage spin rewards, products, and orders</p>
                        </div>
                      </div>
                      {luckyCharmSubTab === 'Reward Management' && (
                        <button
                          onClick={() => setShowAddRewardModal(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#051838', color: '#D4AF37', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
                        >
                          <Plus size={15} /> Add Reward
                        </button>
                      )}
                    </div>

                    {/* Lucky Charm Sub-Tab Navigation */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #eae6df', paddingBottom: '0' }}>
                      {['Dashboard', 'Reward Management', 'Product Management', 'Orders Integration'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setLuckyCharmSubTab(tab)}
                          style={{
                            padding: '10px 18px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: luckyCharmSubTab === tab ? '#D4AF37' : '#666',
                            borderBottom: luckyCharmSubTab === tab ? '2px solid #D4AF37' : '2px solid transparent',
                            marginBottom: '-2px',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* ─── SUB-TAB: DASHBOARD ─── */}
                    {luckyCharmSubTab === 'Dashboard' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Statistics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                          {[
                            { label: 'Total Spins',     value: luckyStats.totalSpins    || 0,              color: '#8A72F6', bg: '#f3f0ff' },
                            { label: "Today's Spins",   value: luckyStats.todaysSpins   || 0,              color: '#E94FA8', bg: '#fff0f7' },
                            { label: 'Rewards Given',   value: luckyStats.rewardsGiven  || 0,              color: '#F2994A', bg: '#fff7ee' },
                            { label: 'Active Rewards',  value: luckyStats.activeRewards || 0,              color: '#16a34a', bg: '#eef6e6' },
                            { label: 'Revenue (Lucky)', value: `₹${luckyStats.revenueGenerated || 0}`,    color: '#2b87e3', bg: '#eef2fd' },
                            { label: 'Conversion Rate', value: `${luckyStats.conversionRate || 0}%`,      color: '#D4AF37', bg: '#fdf9ee' },
                            { label: 'Repeat Players',  value: luckyStats.repeatPlayers || 0,             color: '#555',    bg: '#f5f5f5' },
                          ].map((stat, i) => (
                            <div key={i} style={{ padding: '18px', backgroundColor: stat.bg, border: `1px solid ${stat.color}22`, borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '0.78rem', color: '#777', fontWeight: 600 }}>{stat.label}</span>
                              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Analytics split */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #eae6df', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#051838' }}>Most Won Products</h4>
                            {luckyStats.topWonProducts?.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {luckyStats.topWonProducts.map((p, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f5f5f5' }}>
                                    <span style={{ fontWeight: 600, color: '#333', fontSize: '0.88rem' }}>{p.name}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#eef2fd', color: '#2b87e3', fontSize: '0.78rem', fontWeight: 700 }}>{p.count} wins</span>
                                  </div>
                                ))}
                              </div>
                            ) : <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No data yet</p>}
                          </div>
                          <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #eae6df', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#051838' }}>Most Won Coupons</h4>
                            {luckyStats.topWonCoupons?.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {luckyStats.topWonCoupons.map((c, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f5f5f5' }}>
                                    <span style={{ fontWeight: 700, color: '#D4AF37', fontSize: '0.88rem' }}>{c.code}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#fdf2f2', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>{c.count} won</span>
                                  </div>
                                ))}
                              </div>
                            ) : <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No data yet</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ─── SUB-TAB: REWARD MANAGEMENT ─── */}
                    {luckyCharmSubTab === 'Reward Management' && (
                      <div style={{ backgroundColor: '#fff', border: '1px solid #eae6df', borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.87rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #eae6df', backgroundColor: '#faf9f6' }}>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Reward Name</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Type</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Product / Coupon</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Chance %</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Stock</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Lucky Price</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Status</th>
                                <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444', textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {luckyRewards.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>No rewards yet. Click "Add Reward" to create one.</td></tr>
                              ) : luckyRewards.map((r) => (
                                <tr key={r._id} style={{ borderBottom: '1px solid #f0f0f0', color: '#2b2b2b' }}>
                                  <td style={{ padding: '13px 18px', fontWeight: 700 }}>{r.rewardName}</td>
                                  <td style={{ padding: '13px 18px', textTransform: 'capitalize' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: r.rewardType === 'product' ? '#eef2fd' : '#fdf9ee', color: r.rewardType === 'product' ? '#2b87e3' : '#D4AF37' }}>{r.rewardType}</span>
                                  </td>
                                  <td style={{ padding: '13px 18px', color: '#666' }}>{r.rewardType === 'product' ? `ID: ${r.productId}` : r.couponId || '—'}</td>
                                  <td style={{ padding: '13px 18px', fontWeight: 700, color: '#16a34a' }}>{r.chancePercentage}%</td>
                                  <td style={{ padding: '13px 18px' }}>{r.luckyStock}</td>
                                  <td style={{ padding: '13px 18px', fontWeight: 600 }}>₹{r.luckyPrice || 0}</td>
                                  <td style={{ padding: '13px 18px' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: r.status === 'Active' ? '#eef6e6' : '#fdf2f2', color: r.status === 'Active' ? '#16a34a' : '#ef4444' }}>{r.status}</span>
                                  </td>
                                  <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button style={{ border: 'none', background: '#eef2fd', color: '#2b87e3', cursor: 'pointer', borderRadius: '8px', padding: '6px 10px' }} onClick={() => setEditRewardItem({ ...r })} title="Edit"><Edit3 size={14} /></button>
                                      <button style={{ border: 'none', background: '#fdf2f2', color: '#ef4444', cursor: 'pointer', borderRadius: '8px', padding: '6px 10px' }} onClick={() => deleteLuckyReward(r._id)} title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ─── SUB-TAB: PRODUCT MANAGEMENT ─── */}
                    {luckyCharmSubTab === 'Product Management' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '14px 18px', backgroundColor: '#fdf9ee', border: '1px solid #D4AF3733', borderRadius: '10px', fontSize: '0.87rem', color: '#7a6020' }}>
                          ℹ️ Products listed below are enabled for the Lucky Charm wheel. To add more, edit a product and enable the "Include in Lucky Charm" toggle.
                        </div>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #eae6df', borderRadius: '14px', overflow: 'hidden' }}>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.87rem' }}>
                              <thead>
                                <tr style={{ borderBottom: '2px solid #eae6df', backgroundColor: '#faf9f6' }}>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Product</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Category</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Original Price</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Lucky Price</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Lucky Stock</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Chance %</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {products.filter(p => p.includeInLuckyCharm).length === 0 ? (
                                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>No products enabled for Lucky Charm yet. Edit products to enable them.</td></tr>
                                ) : products.filter(p => p.includeInLuckyCharm).map((p) => (
                                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', color: '#2b2b2b' }}>
                                    <td style={{ padding: '13px 18px', fontWeight: 700 }}>{p.name}</td>
                                    <td style={{ padding: '13px 18px', color: '#666' }}>{p.category}</td>
                                    <td style={{ padding: '13px 18px' }}>₹{p.price}</td>
                                    <td style={{ padding: '13px 18px', fontWeight: 600, color: '#D4AF37' }}>₹{p.luckyPrice || p.price}</td>
                                    <td style={{ padding: '13px 18px' }}>{p.luckyStock || 0}</td>
                                    <td style={{ padding: '13px 18px', color: '#16a34a', fontWeight: 700 }}>{p.luckyChancePercentage || 0}%</td>
                                    <td style={{ padding: '13px 18px' }}>
                                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: p.luckyActive ? '#eef6e6' : '#f5f5f5', color: p.luckyActive ? '#16a34a' : '#aaa' }}>{p.luckyActive ? 'Active' : 'Inactive'}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ─── SUB-TAB: ORDERS INTEGRATION ─── */}
                    {luckyCharmSubTab === 'Orders Integration' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '14px 18px', backgroundColor: '#eef6e6', border: '1px solid #16a34a33', borderRadius: '10px', fontSize: '0.87rem', color: '#166534' }}>
                          ✅ Showing all orders that were placed through the Lucky Charm feature.
                        </div>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #eae6df', borderRadius: '14px', overflow: 'hidden' }}>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.87rem' }}>
                              <thead>
                                <tr style={{ borderBottom: '2px solid #eae6df', backgroundColor: '#faf9f6' }}>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Order ID</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Customer</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Product</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Amount</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Payment</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Date</th>
                                  <th style={{ padding: '14px 18px', fontWeight: 700, color: '#444' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orders.filter(o => o.isLuckyCharmOrder).length === 0 ? (
                                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>No Lucky Charm orders yet. Orders placed through Lucky Charm will appear here.</td></tr>
                                ) : orders.filter(o => o.isLuckyCharmOrder).map((o) => (
                                  <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0', color: '#2b2b2b' }}>
                                    <td style={{ padding: '13px 18px', fontWeight: 700, color: '#2b87e3' }}>{o.id}</td>
                                    <td style={{ padding: '13px 18px' }}>{o.customer}</td>
                                    <td style={{ padding: '13px 18px', color: '#666' }}>{o.product}</td>
                                    <td style={{ padding: '13px 18px', fontWeight: 700 }}>{o.amount}</td>
                                    <td style={{ padding: '13px 18px', color: '#666' }}>{o.payment}</td>
                                    <td style={{ padding: '13px 18px', color: '#666' }}>{o.date}</td>
                                    <td style={{ padding: '13px 18px' }}>
                                      <span style={{
                                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                        backgroundColor: o.status === 'Delivered' ? '#eef6e6' : o.status === 'Shipped' ? '#eef2fd' : o.status === 'Cancelled' ? '#fdf2f2' : '#fff7ee',
                                        color: o.status === 'Delivered' ? '#16a34a' : o.status === 'Shipped' ? '#2b87e3' : o.status === 'Cancelled' ? '#ef4444' : '#D4AF37'
                                      }}>{o.status}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: REVIEWS VIEW */}
          {activeTab === 'Reviews' && (
            <div className="admin-view-tab-content">
              {/* Header actions with sub-tab buttons on left */}
              <div className="coupons-re-header-row">
                <div className="coupon-sub-tabs-wrap">
                  {['All Reviews', 'Pending', 'Approved', 'Rejected'].map((subtab) => (
                    <button 
                      key={subtab}
                      className={`coupon-sub-tab-btn ${activeReviewsSubTab === subtab ? 'active' : ''}`}
                      onClick={() => setActiveReviewsSubTab(subtab)}
                    >
                      {subtab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews List Table */}
              <div className="admin-re-section-card reviews-table-section">
                <div className="admin-re-table-wrapper">
                  <table className="admin-re-table reviews-table-re">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews
                        .filter((rev) => activeReviewsSubTab === 'All Reviews' || rev.status === activeReviewsSubTab)
                        .map((rev) => (
                          <tr key={rev.id}>
                            <td className="rev-product-cell">
                              <div className="rev-product-wrap">
                                <div className="rev-thumb-box">
                                  <img src={rev.productImage} alt={rev.productName} className="rev-thumb-img" />
                                </div>
                                <span className="bold text-black">{rev.productName}</span>
                              </div>
                            </td>
                            <td className="text-gray">{rev.customerName}</td>
                            <td>
                              <div className="stars-row" style={{ display: 'flex', gap: '2px' }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    fill={i < rev.rating ? '#C59B6C' : 'none'} 
                                    stroke={i < rev.rating ? '#C59B6C' : '#ccc'} 
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="text-gray review-comment-cell">
                              <div className="comment-text-wrap">
                                <span className="comment-main">"{rev.comment}"</span>
                                {rev.reply && (
                                  <div className="store-reply-badge">
                                    <span className="reply-lbl">Store Reply:</span>
                                    <span className="reply-val">"{rev.reply}"</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="text-gray">{rev.date}</td>
                            <td>
                              <span className={`orders-status-badge ${rev.status.toLowerCase()}`}>
                                {rev.status}
                              </span>
                            </td>
                            <td className="action-cell">
                              <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
                                <button 
                                  className="table-act-btn edit" 
                                  title="Approve Review" 
                                  onClick={() => {
                                    apiService.moderateReview(rev.id, { status: 'Approved' }).then((updatedReview) => {
                                      setReviews(reviews.map(r => r.id === rev.id ? (updatedReview || { ...r, status: 'Approved' }) : r));
                                    });
                                  }}
                                  disabled={rev.status === 'Approved'}
                                  style={{ opacity: rev.status === 'Approved' ? 0.4 : 1 }}
                                >
                                  <CheckCircle2 size={15} />
                                </button>
                                <button 
                                  className="table-act-btn edit" 
                                  title="Reject Review" 
                                  onClick={() => {
                                    apiService.moderateReview(rev.id, { status: 'Rejected' }).then((updatedReview) => {
                                      setReviews(reviews.map(r => r.id === rev.id ? (updatedReview || { ...r, status: 'Rejected' }) : r));
                                    });
                                  }}
                                  disabled={rev.status === 'Rejected'}
                                  style={{ opacity: rev.status === 'Rejected' ? 0.4 : 1 }}
                                >
                                  <XCircle size={15} />
                                </button>
                                <button 
                                  className="table-act-btn edit" 
                                  title="Reply to Review" 
                                  onClick={() => {
                                    setReplyReviewItem(rev);
                                    setReviewReplyText(rev.reply || '');
                                    setShowReplyReviewModal(true);
                                  }}
                                >
                                  <MessageSquare size={15} />
                                </button>
                                <button 
                                  className="table-act-btn delete" 
                                  title="Delete Review" 
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this review?')) {
                                      apiService.deleteReview(rev.id).then(() => {
                                        setReviews(reviews.filter(r => r.id !== rev.id));
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {reviews.filter((rev) => activeReviewsSubTab === 'All Reviews' || rev.status === activeReviewsSubTab).length === 0 && (
                        <tr>
                          <td colSpan="7" className="empty-table-cell">No reviews registered under this filter.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS VIEW */}
          {activeTab === 'Settings' && (
            <div className="admin-view-tab-content settings-tab-container">
              <div className="settings-layout-wrapper">
                
                {/* Inner Sidebar Submenu */}
                <aside className="settings-inner-sidebar">
                  <button 
                    className={`settings-sub-nav-item ${settingsSubTab === 'store' ? 'active' : ''}`}
                    onClick={() => setSettingsSubTab('store')}
                  >
                    <Settings size={16} />
                    <span>Store Settings</span>
                  </button>
                  <button 
                    className={`settings-sub-nav-item ${settingsSubTab === 'shipping' ? 'active' : ''}`}
                    onClick={() => setSettingsSubTab('shipping')}
                  >
                    <Truck size={16} />
                    <span>Shipping Settings</span>
                  </button>
                  <button 
                    className={`settings-sub-nav-item ${settingsSubTab === 'payment' ? 'active' : ''}`}
                    onClick={() => setSettingsSubTab('payment')}
                  >
                    <CreditCard size={16} />
                    <span>Payment Settings</span>
                  </button>
                  <button 
                    className={`settings-sub-nav-item ${settingsSubTab === 'social' ? 'active' : ''}`}
                    onClick={() => setSettingsSubTab('social')}
                  >
                    <Share2 size={16} />
                    <span>Social Media</span>
                  </button>
                  <button 
                    className={`settings-sub-nav-item ${settingsSubTab === 'email' ? 'active' : ''}`}
                    onClick={() => setSettingsSubTab('email')}
                  >
                    <Mail size={16} />
                    <span>Email Settings</span>
                  </button>
                  <button 
                    className={`settings-sub-nav-item ${settingsSubTab === 'website' ? 'active' : ''}`}
                    onClick={() => setSettingsSubTab('website')}
                  >
                    <Globe size={16} />
                    <span>Website Settings</span>
                  </button>
                </aside>

                {/* Settings Form Content */}
                {settingsSubTab === 'store' && (
                  <div className="settings-form-content">
                    <h3 className="settings-content-title">Store Settings</h3>
                    
                    <div className="settings-grid-fields">
                      <div className="settings-field-box">
                        <label>Store Name</label>
                        <input 
                          type="text" 
                          value={generalSettings.storeName} 
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeName: e.target.value }))}
                          className="form-input-re" 
                        />
                      </div>
                      <div className="settings-field-box">
                        <label>Support Email</label>
                        <input 
                          type="email" 
                          value={generalSettings.supportEmail} 
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                          className="form-input-re" 
                        />
                      </div>
                      <div className="settings-field-box">
                        <label>Tax Percentage (%)</label>
                        <input 
                          type="number" 
                          value={generalSettings.taxPercentage} 
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, taxPercentage: e.target.value }))}
                          className="form-input-re" 
                        />
                      </div>
                      <div className="settings-field-box">
                        <label>Default Currency</label>
                        <input 
                          type="text" 
                          value={generalSettings.defaultCurrency} 
                          onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                          className="form-input-re" 
                        />
                      </div>
                    </div>

                    <div className="settings-action-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                      <button className="settings-save-btn" onClick={() => handleSaveSettings({
                        storeName: generalSettings.storeName,
                        supportEmail: generalSettings.supportEmail,
                        taxPercentage: parseInt(generalSettings.taxPercentage, 10) || 0,
                        defaultCurrency: generalSettings.defaultCurrency
                      })}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'shipping' && (
                  <div className="settings-form-content" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <Truck size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Shipping Settings</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Configure shipping methods and charges</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Free Shipping Above (₹)</label>
                        <input 
                          type="text" 
                          value={shippingSettings.freeShippingAbove} 
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, freeShippingAbove: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px', textAlign: 'center' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Standard Shipping Charge (₹)</label>
                        <input 
                          type="text" 
                          value={shippingSettings.standardCharge} 
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, standardCharge: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px', textAlign: 'center' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Express Shipping Charge (₹)</label>
                        <input 
                          type="text" 
                          value={shippingSettings.expressCharge} 
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, expressCharge: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px', textAlign: 'center' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>COD Charges (₹)</label>
                        <input 
                          type="text" 
                          value={shippingSettings.codCharges} 
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, codCharges: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px', textAlign: 'center' }}
                        />
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid #eae6df', margin: '10px 0' }} />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Enable Cash On Delivery (COD)</label>
                        <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                          <input 
                            type="checkbox" 
                            checked={shippingSettings.enableCod} 
                            onChange={(e) => setShippingSettings(prev => ({ ...prev, enableCod: e.target.checked }))} 
                            style={{ opacity: 0, width: 0, height: 0 }} 
                          />
                          <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: shippingSettings.enableCod ? '#D4AF37' : '#ccc',
                            transition: '0.3s', borderRadius: '34px',
                          }}>
                            <span style={{
                              position: 'absolute', content: '""', height: '18px', width: '18px', left: shippingSettings.enableCod ? '26px' : '4px', bottom: '4px',
                              backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                            }}></span>
                          </span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Enable Express Delivery</label>
                        <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                          <input 
                            type="checkbox" 
                            checked={shippingSettings.enableExpress} 
                            onChange={(e) => setShippingSettings(prev => ({ ...prev, enableExpress: e.target.checked }))} 
                            style={{ opacity: 0, width: 0, height: 0 }} 
                          />
                          <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: shippingSettings.enableExpress ? '#D4AF37' : '#ccc',
                            transition: '0.3s', borderRadius: '34px',
                          }}>
                            <span style={{
                              position: 'absolute', content: '""', height: '18px', width: '18px', left: shippingSettings.enableExpress ? '26px' : '4px', bottom: '4px',
                              backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                            }}></span>
                          </span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Enable International Shipping</label>
                        <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                          <input 
                            type="checkbox" 
                            checked={shippingSettings.enableInternational} 
                            onChange={(e) => setShippingSettings(prev => ({ ...prev, enableInternational: e.target.checked }))} 
                            style={{ opacity: 0, width: 0, height: 0 }} 
                          />
                          <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: shippingSettings.enableInternational ? '#D4AF37' : '#ccc',
                            transition: '0.3s', borderRadius: '34px',
                          }}>
                            <span style={{
                              position: 'absolute', content: '""', height: '18px', width: '18px', left: shippingSettings.enableInternational ? '26px' : '4px', bottom: '4px',
                              backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                            }}></span>
                          </span>
                        </label>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid #eae6df', margin: '15px 0' }} />

                      <div>
                        <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', display: 'block', marginBottom: '8px' }}>Storefront Shipping Policy Info</label>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '12px' }}>
                          Add, edit, or remove the bullet points displayed in the Shipping Info tab on the product details page.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                          {shippingInfoLines.map((line, index) => (
                            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.9rem', color: '#666', minWidth: '16px' }}>•</span>
                              <input 
                                type="text"
                                value={line}
                                onChange={(e) => {
                                  const updated = [...shippingInfoLines];
                                  updated[index] = e.target.value;
                                  setShippingInfoLines(updated);
                                }}
                                className="form-input-re"
                                style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '8px', padding: '6px 12px' }}
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const updated = shippingInfoLines.filter((_, idx) => idx !== index);
                                  setShippingInfoLines(updated);
                                }}
                                style={{ border: 'none', background: 'transparent', color: '#e74c3c', cursor: 'pointer', padding: '4px' }}
                                title="Remove Line"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text"
                            placeholder="Add a new shipping info policy line..."
                            id="new-shipping-policy-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.target.value.trim();
                                if (val) {
                                  setShippingInfoLines([...shippingInfoLines, val]);
                                  e.target.value = '';
                                }
                              }
                            }}
                            className="form-input-re"
                            style={{ flex: 1, backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '8px', padding: '8px 12px' }}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('new-shipping-policy-input');
                              if (input && input.value.trim()) {
                                setShippingInfoLines([...shippingInfoLines, input.value.trim()]);
                                input.value = '';
                              }
                            }}
                            className="settings-save-btn"
                            style={{ margin: 0, padding: '8px 16px', fontSize: '0.85rem' }}
                          >
                            Add Line
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="profile-change-photo-btn" onClick={async () => {
                          const settingsData = await apiService.getSettings();
                          if (settingsData) {
                            setShippingSettings({
                              freeShippingAbove: String(settingsData.freeShippingAbove || '999'),
                              standardCharge: String(settingsData.standardCharge || '0'),
                              expressCharge: String(settingsData.expressCharge || '150'),
                              codCharges: String(settingsData.codCharges || '50'),
                              enableCod: settingsData.enableCod !== false,
                              enableExpress: settingsData.enableExpress !== false,
                              enableInternational: !!settingsData.enableInternational,
                            });
                            if (settingsData.shippingInfoLines) {
                              setShippingInfoLines(settingsData.shippingInfoLines);
                            }
                          }
                        }}>Cancel</button>
                        <button 
                          className="settings-save-btn" 
                          style={{ margin: 0 }} 
                          onClick={() => handleSaveSettings({
                            freeShippingAbove: parseFloat(shippingSettings.freeShippingAbove) || 0,
                            standardCharge: parseFloat(shippingSettings.standardCharge) || 0,
                            expressCharge: parseFloat(shippingSettings.expressCharge) || 0,
                            codCharges: parseFloat(shippingSettings.codCharges) || 0,
                            enableCod: !!shippingSettings.enableCod,
                            enableExpress: !!shippingSettings.enableExpress,
                            enableInternational: !!shippingSettings.enableInternational,
                            shippingInfoLines: shippingInfoLines
                          })}
                        >Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'payment' && (
                  <div className="settings-form-content" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <CreditCard size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Payment Settings</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Manage payment gateway configurations</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* COD toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0f9eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                            <Truck size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Cash On Delivery (COD)</h4>
                            <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Allow customers to pay on delivery</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                            <input 
                              type="checkbox" 
                              checked={paymentSettings.cod} 
                              onChange={(e) => setPaymentSettings(prev => ({ ...prev, cod: e.target.checked }))} 
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: paymentSettings.cod ? '#D4AF37' : '#ccc',
                              transition: '0.3s', borderRadius: '34px',
                            }}>
                              <span style={{
                                position: 'absolute', content: '""', height: '18px', width: '18px', left: paymentSettings.cod ? '26px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                              }}></span>
                            </span>
                          </label>
                          <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => alert('COD Config trigger')}><Settings size={18} /></button>
                        </div>
                      </div>

                      {/* Razorpay toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#eef6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2b87e3' }}>
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Razorpay</h4>
                            <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Accept payments via Razorpay</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                            <input 
                              type="checkbox" 
                              checked={paymentSettings.razorpay} 
                              onChange={(e) => setPaymentSettings(prev => ({ ...prev, razorpay: e.target.checked }))} 
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: paymentSettings.razorpay ? '#D4AF37' : '#ccc',
                              transition: '0.3s', borderRadius: '34px',
                            }}>
                              <span style={{
                                position: 'absolute', content: '""', height: '18px', width: '18px', left: paymentSettings.razorpay ? '26px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                              }}></span>
                            </span>
                          </label>
                          <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => alert('Razorpay Config trigger')}><Settings size={18} /></button>
                        </div>
                      </div>

                      {/* UPI Payments */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#faf2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9c27b0' }}>
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>UPI Payments</h4>
                            <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Accept UPI payments</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                            <input 
                              type="checkbox" 
                              checked={paymentSettings.upi} 
                              onChange={(e) => setPaymentSettings(prev => ({ ...prev, upi: e.target.checked }))} 
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: paymentSettings.upi ? '#D4AF37' : '#ccc',
                              transition: '0.3s', borderRadius: '34px',
                            }}>
                              <span style={{
                                position: 'absolute', content: '""', height: '18px', width: '18px', left: paymentSettings.upi ? '26px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                              }}></span>
                            </span>
                          </label>
                          <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => alert('UPI Config trigger')}><Settings size={18} /></button>
                        </div>
                      </div>

                      {/* Stripe toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#e8faf7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00af91' }}>
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Stripe</h4>
                            <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Accept international payments via Stripe</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                            <input 
                              type="checkbox" 
                              checked={paymentSettings.stripe} 
                              onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripe: e.target.checked }))} 
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: paymentSettings.stripe ? '#D4AF37' : '#ccc',
                              transition: '0.3s', borderRadius: '34px',
                            }}>
                              <span style={{
                                position: 'absolute', content: '""', height: '18px', width: '18px', left: paymentSettings.stripe ? '26px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                              }}></span>
                            </span>
                          </label>
                          <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => alert('Stripe Config trigger')}><Settings size={18} /></button>
                        </div>
                      </div>

                      {/* Bank Transfer toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff5ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C59B6C' }}>
                            <Globe size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Bank Transfer</h4>
                            <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Allow payments via bank transfer</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                            <input 
                              type="checkbox" 
                              checked={paymentSettings.bankTransfer} 
                              onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankTransfer: e.target.checked }))} 
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: paymentSettings.bankTransfer ? '#D4AF37' : '#ccc',
                              transition: '0.3s', borderRadius: '34px',
                            }}>
                              <span style={{
                                position: 'absolute', content: '""', height: '18px', width: '18px', left: paymentSettings.bankTransfer ? '26px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                              }}></span>
                            </span>
                          </label>
                          <button style={{ border: 'none', background: 'transparent', color: '#666', cursor: 'pointer' }} onClick={() => alert('Bank Config trigger')}><Settings size={18} /></button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="profile-change-photo-btn" onClick={() => alert('Cancel trigger')}>Cancel</button>
                        <button className="settings-save-btn" style={{ margin: 0 }} onClick={() => alert('Payment Settings Saved successfully!')}>Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'social' && (
                  <div className="settings-form-content" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <Share2 size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Social Media Settings</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Update your social media links</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ border: '1px solid #eae6df', borderRadius: '16px', padding: '16px 20px', backgroundColor: '#faf9f6' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '20px' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>Instagram URL</label>
                          <input 
                            type="text" 
                            value={socialMediaSettings.instagram} 
                            onChange={(e) => setSocialMediaSettings(prev => ({ ...prev, instagram: e.target.value }))}
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      <div style={{ border: '1px solid #eae6df', borderRadius: '16px', padding: '16px 20px', backgroundColor: '#faf9f6' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '20px' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>Facebook URL</label>
                          <input 
                            type="text" 
                            value={socialMediaSettings.facebook} 
                            onChange={(e) => setSocialMediaSettings(prev => ({ ...prev, facebook: e.target.value }))}
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      <div style={{ border: '1px solid #eae6df', borderRadius: '16px', padding: '16px 20px', backgroundColor: '#faf9f6' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '20px' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>WhatsApp Number</label>
                          <input 
                            type="text" 
                            value={socialMediaSettings.whatsapp} 
                            onChange={(e) => setSocialMediaSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      <div style={{ border: '1px solid #eae6df', borderRadius: '16px', padding: '16px 20px', backgroundColor: '#faf9f6' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '20px' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>YouTube URL</label>
                          <input 
                            type="text" 
                            value={socialMediaSettings.youtube} 
                            onChange={(e) => setSocialMediaSettings(prev => ({ ...prev, youtube: e.target.value }))}
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      <div style={{ border: '1px solid #eae6df', borderRadius: '16px', padding: '16px 20px', backgroundColor: '#faf9f6' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '20px' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>Twitter URL</label>
                          <input 
                            type="text" 
                            value={socialMediaSettings.twitter} 
                            onChange={(e) => setSocialMediaSettings(prev => ({ ...prev, twitter: e.target.value }))}
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="profile-change-photo-btn" onClick={() => alert('Cancel trigger')}>Cancel</button>
                        <button className="settings-save-btn" style={{ margin: 0 }} onClick={() => alert('Social Links Saved successfully!')}>Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'email' && (
                  <div className="settings-form-content" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <Mail size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Email Settings</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Configure email and SMTP settings</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>Sender Name</label>
                        <input 
                          type="text" 
                          value={emailSettings.senderName} 
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, senderName: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>Sender Email</label>
                        <input 
                          type="email" 
                          value={emailSettings.senderEmail} 
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>SMTP Host</label>
                        <input 
                          type="text" 
                          value={emailSettings.smtpHost} 
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>SMTP Port</label>
                        <input 
                          type="text" 
                          value={emailSettings.smtpPort} 
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>SMTP Username</label>
                        <input 
                          type="text" 
                          value={emailSettings.smtpUsername} 
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: '20px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>SMTP Password</label>
                        <input 
                          type="password" 
                          value={emailSettings.smtpPassword} 
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                        <button 
                          className="profile-save-btn" 
                          style={{ backgroundColor: '#D4AF37', color: '#fff', margin: 0 }}
                          onClick={() => alert('Test email sent to ' + emailSettings.senderEmail)}
                        >
                          Send Test Email
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="profile-change-photo-btn" onClick={() => alert('Cancel trigger')}>Cancel</button>
                        <button className="settings-save-btn" style={{ margin: 0 }} onClick={() => alert('Email Settings Saved successfully!')}>Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'website' && (
                  <div className="settings-form-content" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(122, 193, 66, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                        <Globe size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Website Settings</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Manage website appearance and SEO</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="profile-input-box">
                        <label style={{ fontWeight: 700, color: '#2b2b2b' }}>Website Title</label>
                        <input 
                          type="text" 
                          value={websiteSettings.websiteTitle} 
                          onChange={(e) => setWebsiteSettings(prev => ({ ...prev, websiteTitle: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div className="profile-input-box">
                        <label style={{ fontWeight: 700, color: '#2b2b2b' }}>Meta Description</label>
                        <textarea 
                          value={websiteSettings.metaDescription} 
                          onChange={(e) => setWebsiteSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                          rows="4" 
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px', width: '100%', padding: '12px 16px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div className="profile-input-box">
                        <label style={{ fontWeight: 700, color: '#2b2b2b' }}>Meta Keywords</label>
                        <textarea 
                          value={websiteSettings.metaKeywords} 
                          onChange={(e) => setWebsiteSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                          rows="3" 
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px', width: '100%', padding: '12px 16px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div className="profile-input-box">
                        <label style={{ fontWeight: 700, color: '#2b2b2b' }}>Footer Text</label>
                        <input 
                          type="text" 
                          value={websiteSettings.footerText} 
                          onChange={(e) => setWebsiteSettings(prev => ({ ...prev, footerText: e.target.value }))}
                          className="form-input-re" 
                          style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="profile-change-photo-btn" onClick={() => alert('Cancel trigger')}>Cancel</button>
                        <button className="settings-save-btn" style={{ margin: 0 }} onClick={() => alert('Website Settings Saved successfully!')}>Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MANAGE FEATURES VIEW */}
          {activeTab === 'Manage Features' && (
            <div className="admin-view-tab-content features-tab-container" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#051838', marginBottom: '4px' }}>Homepage Functionalities</h3>
                  <p style={{ fontSize: '0.88rem', color: '#666' }}>Toggle sections on/off, re-arrange their order, or create new custom sections.</p>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#051838', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setShowAddFeatureModal(true)}
                >
                  <Plus size={16} /> Add Custom Section
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {featuresList && featuresList.length > 0 ? (
                  featuresList.map((feat, index) => (
                    <div 
                      key={feat.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '16px 24px', 
                        background: '#FAF6EE', 
                        border: '1px solid rgba(160, 140, 110, 0.25)', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      {/* Reorder Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '24px', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleMoveFeature(index, 'up')}
                          disabled={index === 0}
                          style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#ccc' : '#D4AF37' }}
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#051838' }}>{index + 1}</span>
                        <button 
                          onClick={() => handleMoveFeature(index, 'down')}
                          disabled={index === featuresList.length - 1}
                          style={{ background: 'none', border: 'none', cursor: index === featuresList.length - 1 ? 'not-allowed' : 'pointer', color: index === featuresList.length - 1 ? '#ccc' : '#D4AF37' }}
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Feature Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#051838', margin: 0 }}>{feat.name}</h4>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#eae6df', color: '#666', borderRadius: '4px', fontFamily: 'monospace' }}>
                            key: {feat.key}
                          </span>
                          {!['hero', 'trust_bar', 'categories', 'video_showcase', 'exclusive_products', 'celebrity_collection', 'why_choose_us'].includes(feat.key) && (
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#e0ebd5', color: '#8CC63F', borderRadius: '4px', fontWeight: 'bold' }}>
                              Custom
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.88rem', color: '#555' }}>
                          {feat.title && <div><strong>Title:</strong> {feat.title}</div>}
                          {feat.subtitle && <div><strong>Subtitle:</strong> {feat.subtitle}</div>}
                        </div>
                      </div>

                      {/* Status Toggle & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Status Switch */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: feat.status === 'Active' ? '#8CC63F' : '#e53935' }}>
                            {feat.status.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleToggleFeatureStatus(feat.id)}
                            style={{
                              width: '44px',
                              height: '24px',
                              borderRadius: '12px',
                              background: feat.status === 'Active' ? '#8CC63F' : '#ccc',
                              border: 'none',
                              cursor: 'pointer',
                              position: 'relative',
                              padding: 0,
                              transition: 'background 0.2s'
                            }}
                          >
                            <span style={{
                              display: 'block',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: '3px',
                              left: feat.status === 'Active' ? '23px' : '3px',
                              transition: 'left 0.2s'
                            }} />
                          </button>
                        </div>

                        {/* Edit Action */}
                        <button
                          onClick={() => setEditFeatureItem(feat)}
                          style={{
                            background: 'none',
                            border: '1px solid #D4AF37',
                            borderRadius: '6px',
                            color: '#D4AF37',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit3 size={12} /> Edit
                        </button>

                        {/* Delete Action (only custom features) */}
                        {!['hero', 'trust_bar', 'categories', 'video_showcase', 'exclusive_products', 'celebrity_collection', 'why_choose_us'].includes(feat.key) ? (
                          <button
                            onClick={() => handleDeleteFeature(feat.id)}
                            style={{
                              background: 'none',
                              border: '1px solid #e53935',
                              borderRadius: '6px',
                              color: '#e53935',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        ) : null}
                      </div>

                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#FAF6EE', border: '1px solid rgba(160, 140, 110, 0.25)', borderRadius: '12px' }}>
                    No features available. Please reset database or add a custom section.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 11: PROFILE VIEW */}
          {activeTab === 'Profile' && (() => {
            // Local component states for Profile tab sub-sections if not already defined at the top
            // Since we are inside a map or render block, let's declare a local state or check if we already have it.
            // Wait, inside a JSX block we can't use React hook directly if it's evaluated inside a function wrapper.
            // Let's define the state `profileSubTab` in the AdminDashboard main body first!
            // Wait, let's check if we can add the state variables at the top of AdminDashboard.jsx first.
            // But let's write it in a clean way.
            return (
              <div className="admin-view-tab-content profile-tab-container">
                <div className="profile-layout-wrapper">
                  
                  {/* Inner Sidebar Submenu */}
                  <aside className="profile-inner-sidebar">
                    <button 
                      className={`profile-sub-nav-item ${profileSubTab === 'profile-info' ? 'active' : ''}`}
                      onClick={() => setProfileSubTab('profile-info')}
                    >
                      <User size={16} />
                      <span>Profile Information</span>
                    </button>
                    <button 
                      className={`profile-sub-nav-item ${profileSubTab === 'change-password' ? 'active' : ''}`}
                      onClick={() => setProfileSubTab('change-password')}
                    >
                      <Lock size={16} />
                      <span>Change Password</span>
                    </button>
                    <button 
                      className={`profile-sub-nav-item ${profileSubTab === 'security' ? 'active' : ''}`}
                      onClick={() => setProfileSubTab('security')}
                    >
                      <Settings size={16} />
                      <span>Security</span>
                    </button>
                    <button 
                      className={`profile-sub-nav-item ${profileSubTab === 'login-history' ? 'active' : ''}`}
                      onClick={() => setProfileSubTab('login-history')}
                    >
                      <BookOpen size={16} />
                      <span>Login History</span>
                    </button>
                  </aside>

                  {/* Dynamic subtab rendering */}
                  {profileSubTab === 'profile-info' && (
                    <div className="profile-form-content">
                      <div className="profile-left-col">
                        <div className="profile-large-avatar" style={{ backgroundColor: 'var(--color-primary, #D4AF37)' }}>
                          {authUser?.name?.slice(0, 1).toUpperCase() || 'A'}
                        </div>
                        <button className="profile-change-photo-btn" onClick={() => alert('Change Photo triggered')}>
                          Change Photo
                        </button>
                      </div>

                      <div className="profile-right-col">
                        <h3 className="profile-content-title" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>Profile Information</h3>
                        
                        <div className="profile-input-box">
                          <label>Name</label>
                          <input type="text" defaultValue={authUser?.name || 'Admin'} className="form-input-re" />
                        </div>

                        <div className="profile-input-box">
                          <label>Email</label>
                          <input type="email" defaultValue={authUser?.email || 'admin@mithrashopy.com'} className="form-input-re" />
                        </div>

                        <div className="profile-input-box">
                          <label>Phone</label>
                          <input type="text" defaultValue="+91 98765 43210" className="form-input-re" />
                        </div>

                        <div className="profile-input-box">
                          <label>Role</label>
                          <select defaultValue="Super Admin" className="form-input-re">
                            <option value="Super Admin">Super Admin</option>
                            <option value="Editor">Editor</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </div>

                        <button className="profile-save-btn" onClick={() => alert('Profile Information Updated successfully!')}>
                          Update Profile
                        </button>
                      </div>
                    </div>
                  )}

                  {profileSubTab === 'change-password' && (
                    <div className="profile-form-content" style={{ display: 'block', maxWidth: '800px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(122, 193, 66, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #D4AF37)' }}>
                          <Lock size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Change Password</h3>
                          <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Update your account password</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="profile-input-box">
                          <label style={{ fontWeight: 600, color: '#444' }}>Current Password</label>
                          <input 
                            type="password" 
                            placeholder="Enter current password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>

                        <div className="profile-input-box">
                          <label style={{ fontWeight: 600, color: '#444' }}>New Password</label>
                          <input 
                            type="password" 
                            placeholder="Enter new password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>

                        <div className="profile-input-box">
                          <label style={{ fontWeight: 600, color: '#444' }}>Confirm Password</label>
                          <input 
                            type="password" 
                            placeholder="Confirm new password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="form-input-re" 
                            style={{ backgroundColor: '#fff', border: '1px solid #e2ded5', borderRadius: '10px' }}
                          />
                        </div>

                        <button 
                          className="profile-save-btn" 
                          onClick={handleChangePasswordSubmit}
                          style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  )}

                  {profileSubTab === 'security' && (
                    <div className="profile-form-content" style={{ display: 'block', maxWidth: '800px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(122, 193, 66, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #D4AF37)' }}>
                          <Settings size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Security Settings</h3>
                          <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>Manage your account security</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* 2FA Section */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff5ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C59B6C' }}>
                              <Lock size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Two Factor Authentication (2FA)</h4>
                              <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Add an extra layer of security to your account</p>
                            </div>
                          </div>
                          <label className="admin-toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                            <input 
                              type="checkbox" 
                              checked={securitySettings.twoFactor} 
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactor: e.target.checked }))} 
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: securitySettings.twoFactor ? '#D4AF37' : '#ccc',
                              transition: '0.3s', borderRadius: '34px',
                            }}>
                              <span style={{
                                position: 'absolute', content: '""', height: '18px', width: '18px', left: securitySettings.twoFactor ? '26px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                              }}></span>
                            </span>
                          </label>
                        </div>

                        {/* Login Alerts Section */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0f9eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                              <Bell size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Login Alerts</h4>
                              <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Get notified for new login attempts</p>
                            </div>
                          </div>
                          <label className="admin-toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                            <input 
                              type="checkbox" 
                              checked={securitySettings.loginAlerts} 
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAlerts: e.target.checked }))} 
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: securitySettings.loginAlerts ? '#D4AF37' : '#ccc',
                              transition: '0.3s', borderRadius: '34px',
                            }}>
                              <span style={{
                                position: 'absolute', content: '""', height: '18px', width: '18px', left: securitySettings.loginAlerts ? '26px' : '4px', bottom: '4px',
                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                              }}></span>
                            </span>
                          </label>
                        </div>

                        {/* Active Sessions Section */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#faf9f6', border: '1px solid #eae6df', borderRadius: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff9e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                              <Settings size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Active Sessions</h4>
                              <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Manage your active sessions</p>
                            </div>
                          </div>
                          <button 
                            style={{ padding: '8px 20px', backgroundColor: '#eef6e6', color: '#D4AF37', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                            onClick={() => alert('Active Sessions: Windows PC (Chrome) - Current active session.')}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileSubTab === 'login-history' && (
                    <div className="profile-form-content" style={{ display: 'block', maxWidth: '900px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(122, 193, 66, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #D4AF37)' }}>
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Login History</h3>
                          <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0 0' }}>View your account login history</p>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto', border: '1px solid #eae6df', borderRadius: '16px', backgroundColor: '#faf9f6' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #eae6df', color: '#666' }}>
                              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Device</th>
                              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Browser</th>
                              <th style={{ padding: '16px 20px', fontWeight: 600 }}>IP Address</th>
                              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Location</th>
                              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Login Date</th>
                              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loginHistory.map((history, idx) => (
                              <tr key={idx} style={{ borderBottom: idx !== loginHistory.length - 1 ? '1px solid #eae6df' : 'none', color: '#2b2b2b', backgroundColor: '#fff' }}>
                                <td style={{ padding: '16px 20px', fontWeight: 700 }}>{history.device}</td>
                                <td style={{ padding: '16px 20px' }}>{history.browser}</td>
                                <td style={{ padding: '16px 20px', color: '#555' }}>{history.ip}</td>
                                <td style={{ padding: '16px 20px', color: '#555' }}>{history.location}</td>
                                <td style={{ padding: '16px 20px', color: '#555' }}>{history.date}</td>
                                <td style={{ padding: '16px 20px' }}>
                                  <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    backgroundColor: history.status === 'Success' ? '#eef6e6' : '#fdebeb',
                                    color: history.status === 'Success' ? '#D4AF37' : '#ea4335'
                                  }}>
                                    {history.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })()}

          {/* TAB 12: LOGOUT CONFIRMATION VIEW */}
          {activeTab === 'Logout' && (
            <div className="admin-view-tab-content logout-tab-container">
              <div className="logout-confirm-card">
                <div className="logout-icon-wrapper">
                  <LogOut size={40} />
                </div>
                <h3 className="logout-confirm-title">Are you sure you want to logout?</h3>
                <p className="logout-confirm-sub">You will be logged out from the admin panel.</p>
                <div className="logout-buttons-row">
                  <button className="btn-yes-logout" onClick={handleLogout}>
                    Yes, Logout
                  </button>
                  <button className="btn-cancel-logout" onClick={() => setActiveTab('Dashboard')}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- ADD PRODUCT MODAL DIALOG --- */}
      {showAddProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="admin-modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddProductSubmit} className="modal-body-form" style={{ padding: 0 }}>
              <div className="admin-modal-split-layout">
                {/* Left Navigation Sidebar */}
                <div className="admin-modal-sidebar">
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${addProductActiveTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setAddProductActiveTab('basic')}
                  >
                    <Package size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Basic Info</span>
                      <span className="admin-modal-sidebar-btn-desc">Name, price, stock & catalog</span>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${addProductActiveTab === 'specs' ? 'active' : ''}`}
                    onClick={() => setAddProductActiveTab('specs')}
                  >
                    <Layers size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Specs & Variants</span>
                      <span className="admin-modal-sidebar-btn-desc">Custom fields & sizing rows</span>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${addProductActiveTab === 'media' ? 'active' : ''}`}
                    onClick={() => setAddProductActiveTab('media')}
                  >
                    <ImageIcon size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Media & Description</span>
                      <span className="admin-modal-sidebar-btn-desc">Upload images & write details</span>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${addProductActiveTab === 'lucky' ? 'active' : ''}`}
                    onClick={() => setAddProductActiveTab('lucky')}
                  >
                    <Sparkles size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Lucky Charm Settings</span>
                      <span className="admin-modal-sidebar-btn-desc">Include in Lucky Charm & set stock</span>
                    </div>
                  </button>
                </div>

                {/* Right Scrollable Content Pane */}
                <div className="admin-modal-content-pane">
                  {addProductActiveTab === 'basic' && (
                    <>
                      {/* Section 1: Identification */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <Package size={16} />
                          <h4>Product Identification</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field">
                            <label>Product Name <span className="req">*</span></label>
                            <input 
                              type="text" 
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                              placeholder="e.g. Kids Party Dress" 
                              required 
                              className="modal-input"
                            />
                          </div>

                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Category</label>
                              <select 
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                className="modal-input"
                              >
                                {getCategoryPathsList().map(path => (
                                  <option key={path} value={path}>{path}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="form-field">
                              <label>SubCategory</label>
                              <input 
                                type="text" 
                                value={newProduct.subCategory}
                                onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                                placeholder="e.g. Party Wear" 
                                className="modal-input"
                              />
                            </div>
                          </div>

                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Catalogue</label>
                              <select 
                                value={newProduct.catalogue}
                                onChange={(e) => setNewProduct({ ...newProduct, catalogue: e.target.value })}
                                className="modal-input"
                              >
                                {catalogues.map(cat => (
                                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="form-field">
                              <label>Status</label>
                              <select 
                                value={newProduct.status}
                                onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                                className="modal-input"
                              >
                                <option value="Active">Active</option>
                                <option value="Low Stock">Low Stock</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Pricing & Stock */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <CreditCard size={16} />
                          <h4>Pricing & Inventory</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Price (₹) <span className="req">*</span></label>
                              <input 
                                type="number" 
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                placeholder="1299" 
                                required 
                                className="modal-input"
                              />
                            </div>
                            
                            <div className="form-field">
                              <label>Opening Stock Qty <span className="req">*</span></label>
                              <input 
                                type="number" 
                                value={newProduct.stock}
                                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                placeholder="25" 
                                required 
                                className="modal-input"
                              />
                            </div>
                          </div>

                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Original/Crossed-out Price (₹)</label>
                              <input 
                                type="number" 
                                value={newProduct.originalPrice || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                                placeholder="450 (Optional)" 
                                className="modal-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Brand Info */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <Star size={16} />
                          <h4>Brand & Popularity Details</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Brand Name</label>
                              <input 
                                type="text" 
                                value={newProduct.brand || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                placeholder="Mithira Collection" 
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Rating (1.0 to 5.0)</label>
                              <input 
                                type="number" 
                                step="0.1"
                                min="1"
                                max="5"
                                value={newProduct.rating || '4.8'}
                                onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Reviews Count</label>
                              <input 
                                type="number" 
                                value={newProduct.reviews || '120'}
                                onChange={(e) => setNewProduct({ ...newProduct, reviews: e.target.value })}
                                className="modal-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Section 4: Badging & Labels */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <Tag size={16} />
                          <h4>Product Badging & Labels</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field-row" style={{ alignItems: 'flex-start' }}>
                            <div className="form-field checkbox-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                              <input 
                                type="checkbox" 
                                id="add-prod-is-offer"
                                checked={newProduct.isOffer || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setNewProduct({ 
                                    ...newProduct, 
                                    isOffer: checked,
                                    discount: checked ? (newProduct.discount && newProduct.discount !== '0' ? newProduct.discount : '10') : '0'
                                  });
                                }}
                              />
                              <label htmlFor="add-prod-is-offer" style={{ fontWeight: 600, cursor: 'pointer' }}>Label as Special Offer</label>
                            </div>

                            <div className="form-field checkbox-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                              <input 
                                type="checkbox" 
                                id="add-prod-is-new"
                                checked={newProduct.isNewArrival || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setNewProduct({ 
                                    ...newProduct, 
                                    isNewArrival: checked,
                                    badge: checked ? 'NEW' : ''
                                  });
                                }}
                              />
                              <label htmlFor="add-prod-is-new" style={{ fontWeight: 600, cursor: 'pointer' }}>Label as New Arrival</label>
                            </div>
                          </div>

                          {newProduct.isOffer && (
                            <div className="form-field-row" style={{ marginTop: '15px' }}>
                              <div className="form-field">
                                <label>Offer Percentage (%) <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                  type="number" 
                                  required
                                  min="1"
                                  max="99"
                                  value={newProduct.discount && newProduct.discount !== '0' ? newProduct.discount : '10'}
                                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                                  placeholder="e.g. 20" 
                                  className="modal-input"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {addProductActiveTab === 'specs' && (
                    <>
                      {renderCategorySpecificFields(newProduct, setNewProduct)}
                      {renderVariantManager(newProduct, setNewProduct)}
                    </>
                  )}

                  {addProductActiveTab === 'media' && (
                    <>
                      {/* Section 1: Product Images */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <ImageIcon size={16} />
                          <h4>Product Media Gallery</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field">
                            <label>Images (Comma separated URLs)</label>
                            <input 
                              type="text" 
                              value={Array.isArray(newProduct.images) ? newProduct.images.join(', ') : (newProduct.images || '')}
                              onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                              placeholder="e.g. https://example.com/img1.jpg, https://example.com/img2.jpg" 
                              className="modal-input"
                              style={{ marginBottom: '8px' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label htmlFor="add-prod-file-upload" style={{ cursor: 'pointer', padding: '6px 14px', background: '#F4FBF0', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                                Upload Local File / Image
                              </label>
                              <input 
                                type="file" 
                                id="add-prod-file-upload" 
                                style={{ display: 'none' }} 
                                accept="image/*" 
                                onChange={(e) => handleLocalImageUpload(e, newProduct, setNewProduct)} 
                              />
                              <span style={{ fontSize: '0.78rem', color: '#666' }}>Or select file from your computer</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Description */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <BookOpen size={16} />
                          <h4>Product Description</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field">
                            <label>Detailed Description</label>
                            <textarea 
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                              placeholder="Enter detailed product description..." 
                              className="modal-input"
                              rows="4"
                              style={{ resize: 'vertical', width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {addProductActiveTab === 'lucky' && (
                    <div className="admin-modal-section-card">
                      <div className="admin-modal-section-header">
                        <Sparkles size={16} />
                        <h4>Lucky Charm Settings</h4>
                      </div>
                      <div className="admin-modal-section-body">
                        <div className="form-field">
                          <label>Include in Lucky Charm</label>
                          <select 
                            value={newProduct.includeInLuckyCharm ? 'Yes' : 'No'}
                            onChange={(e) => setNewProduct({ ...newProduct, includeInLuckyCharm: e.target.value === 'Yes' })}
                            className="modal-input"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        {newProduct.includeInLuckyCharm && (
                          <>
                            <div className="form-field">
                              <label>Chance Percentage (%)</label>
                              <input 
                                type="number" 
                                value={newProduct.luckyChancePercentage || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, luckyChancePercentage: parseFloat(e.target.value) || 0 })}
                                placeholder="e.g. 15"
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Lucky Stock</label>
                              <input 
                                type="number" 
                                value={newProduct.luckyStock || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, luckyStock: parseInt(e.target.value, 10) || 0 })}
                                placeholder="e.g. 50"
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Lucky Price (Discounted Reward Price)</label>
                              <input 
                                type="number" 
                                value={newProduct.luckyPrice || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, luckyPrice: parseFloat(e.target.value) || 0 })}
                                placeholder="e.g. 299"
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Active status</label>
                              <select 
                                value={newProduct.luckyActive ? 'Yes' : 'No'}
                                onChange={(e) => setNewProduct({ ...newProduct, luckyActive: e.target.value === 'Yes' })}
                                className="modal-input"
                              >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions Footer Bar */}
              <div className="modal-actions-row" style={{ borderTop: '1px solid #eae6df', margin: 0, padding: '16px 24px', background: '#fbfbfb' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddProductModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL DIALOG --- */}
      {editProductItem && (
        <div className="admin-modal-overlay" onClick={() => setEditProductItem(null)}>
          <div className="admin-modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Product Details</h3>
              <button className="close-btn" onClick={() => setEditProductItem(null)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditProductSubmit} className="modal-body-form" style={{ padding: 0 }}>
              <div className="admin-modal-split-layout">
                {/* Left Navigation Sidebar */}
                <div className="admin-modal-sidebar">
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${editProductActiveTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setEditProductActiveTab('basic')}
                  >
                    <Package size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Basic Info</span>
                      <span className="admin-modal-sidebar-btn-desc">Name, price, stock & catalog</span>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${editProductActiveTab === 'specs' ? 'active' : ''}`}
                    onClick={() => setEditProductActiveTab('specs')}
                  >
                    <Layers size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Specs & Variants</span>
                      <span className="admin-modal-sidebar-btn-desc">Custom fields & sizing rows</span>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${editProductActiveTab === 'media' ? 'active' : ''}`}
                    onClick={() => setEditProductActiveTab('media')}
                  >
                    <ImageIcon size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Media & Description</span>
                      <span className="admin-modal-sidebar-btn-desc">Upload images & write details</span>
                    </div>
                  </button>
                  <button 
                    type="button" 
                    className={`admin-modal-sidebar-btn ${editProductActiveTab === 'lucky' ? 'active' : ''}`}
                    onClick={() => setEditProductActiveTab('lucky')}
                  >
                    <Sparkles size={18} />
                    <div className="sidebar-btn-text">
                      <span className="admin-modal-sidebar-btn-label">Lucky Charm Settings</span>
                      <span className="admin-modal-sidebar-btn-desc">Include in Lucky Charm & set stock</span>
                    </div>
                  </button>
                </div>

                {/* Right Scrollable Content Pane */}
                <div className="admin-modal-content-pane">
                  {editProductActiveTab === 'basic' && (
                    <>
                      {/* Section 1: Identification */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <Package size={16} />
                          <h4>Product Identification</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field">
                            <label>Product Name <span className="req">*</span></label>
                            <input 
                              type="text" 
                              value={editProductItem.name}
                              onChange={(e) => setEditProductItem({ ...editProductItem, name: e.target.value })}
                              required 
                              className="modal-input"
                            />
                          </div>

                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Category</label>
                              <select 
                                value={editProductItem.category}
                                onChange={(e) => setEditProductItem({ ...editProductItem, category: e.target.value })}
                                className="modal-input"
                              >
                                {getCategoryPathsList().map(path => (
                                  <option key={path} value={path}>{path}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="form-field">
                              <label>SubCategory</label>
                              <input 
                                type="text" 
                                value={editProductItem.subCategory || ''}
                                onChange={(e) => setEditProductItem({ ...editProductItem, subCategory: e.target.value })}
                                placeholder="e.g. Party Wear" 
                                className="modal-input"
                              />
                            </div>
                          </div>

                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Catalogue</label>
                              <select 
                                value={editProductItem.catalogue}
                                onChange={(e) => setEditProductItem({ ...editProductItem, catalogue: e.target.value })}
                                className="modal-input"
                              >
                                {catalogues.map(cat => (
                                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="form-field">
                              <label>Status</label>
                              <select 
                                value={editProductItem.status}
                                onChange={(e) => setEditProductItem({ ...editProductItem, status: e.target.value })}
                                className="modal-input"
                              >
                                <option value="Active">Active</option>
                                <option value="Low Stock">Low Stock</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Pricing & Stock */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <CreditCard size={16} />
                          <h4>Pricing & Inventory</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Price (₹) <span className="req">*</span></label>
                              <input 
                                type="number" 
                                value={editProductItem.price}
                                onChange={(e) => setEditProductItem({ ...editProductItem, price: e.target.value })}
                                required 
                                className="modal-input"
                              />
                            </div>
                            
                            <div className="form-field">
                              <label>Stock Qty <span className="req">*</span></label>
                              <input 
                                type="number" 
                                value={editProductItem.stock}
                                onChange={(e) => setEditProductItem({ ...editProductItem, stock: e.target.value })}
                                required 
                                className="modal-input"
                              />
                            </div>
                          </div>

                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Original/Crossed-out Price (₹)</label>
                              <input 
                                type="number" 
                                value={editProductItem.originalPrice || ''}
                                onChange={(e) => setEditProductItem({ ...editProductItem, originalPrice: e.target.value })}
                                placeholder="450 (Optional)" 
                                className="modal-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Brand Info */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <Star size={16} />
                          <h4>Brand & Popularity Details</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field-row">
                            <div className="form-field">
                              <label>Brand Name</label>
                              <input 
                                type="text" 
                                value={editProductItem.brand || ''}
                                onChange={(e) => setEditProductItem({ ...editProductItem, brand: e.target.value })}
                                placeholder="Mithira Collection" 
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Rating (1.0 to 5.0)</label>
                              <input 
                                type="number" 
                                step="0.1"
                                min="1"
                                max="5"
                                value={editProductItem.rating || '4.8'}
                                onChange={(e) => setEditProductItem({ ...editProductItem, rating: e.target.value })}
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Reviews Count</label>
                              <input 
                                type="number" 
                                value={editProductItem.reviews || '120'}
                                onChange={(e) => setEditProductItem({ ...editProductItem, reviews: e.target.value })}
                                className="modal-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Section 4: Badging & Labels */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <Tag size={16} />
                          <h4>Product Badging & Labels</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field-row" style={{ alignItems: 'flex-start' }}>
                            <div className="form-field checkbox-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                              <input 
                                type="checkbox" 
                                id="edit-prod-is-offer"
                                checked={editProductItem.isOffer || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setEditProductItem({ 
                                    ...editProductItem, 
                                    isOffer: checked,
                                    discount: checked ? (editProductItem.discount && editProductItem.discount !== '0' ? editProductItem.discount : '10') : '0'
                                  });
                                }}
                              />
                              <label htmlFor="edit-prod-is-offer" style={{ fontWeight: 600, cursor: 'pointer' }}>Label as Special Offer</label>
                            </div>

                            <div className="form-field checkbox-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                              <input 
                                type="checkbox" 
                                id="edit-prod-is-new"
                                checked={editProductItem.isNewArrival || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setEditProductItem({ 
                                    ...editProductItem, 
                                    isNewArrival: checked,
                                    badge: checked ? 'NEW' : ''
                                  });
                                }}
                              />
                              <label htmlFor="edit-prod-is-new" style={{ fontWeight: 600, cursor: 'pointer' }}>Label as New Arrival</label>
                            </div>
                          </div>

                          {editProductItem.isOffer && (
                            <div className="form-field-row" style={{ marginTop: '15px' }}>
                              <div className="form-field">
                                <label>Offer Percentage (%) <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                  type="number" 
                                  required
                                  min="1"
                                  max="99"
                                  value={editProductItem.discount && editProductItem.discount !== '0' ? editProductItem.discount : '10'}
                                  onChange={(e) => setEditProductItem({ ...editProductItem, discount: e.target.value })}
                                  placeholder="e.g. 20" 
                                  className="modal-input"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {editProductActiveTab === 'specs' && (
                    <>
                      {renderCategorySpecificFields(editProductItem, setEditProductItem)}
                      {renderVariantManager(editProductItem, setEditProductItem)}
                    </>
                  )}

                  {editProductActiveTab === 'media' && (
                    <>
                      {/* Section 1: Product Images */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <ImageIcon size={16} />
                          <h4>Product Media Gallery</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field">
                            <label>Images (Comma separated URLs)</label>
                            <input 
                              type="text" 
                              value={Array.isArray(editProductItem.images) ? editProductItem.images.join(', ') : (editProductItem.images || editProductItem.image || '')}
                              onChange={(e) => setEditProductItem({ ...editProductItem, images: e.target.value })}
                              placeholder="e.g. https://example.com/img1.jpg, https://example.com/img2.jpg" 
                              className="modal-input"
                              style={{ marginBottom: '8px' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label htmlFor="edit-prod-file-upload" style={{ cursor: 'pointer', padding: '6px 14px', background: '#F4FBF0', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                                Upload Local File / Image
                              </label>
                              <input 
                                type="file" 
                                id="edit-prod-file-upload" 
                                style={{ display: 'none' }} 
                                accept="image/*" 
                                onChange={(e) => handleLocalImageUpload(e, editProductItem, setEditProductItem)} 
                              />
                              <span style={{ fontSize: '0.78rem', color: '#666' }}>Or select file from your computer</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Description */}
                      <div className="admin-modal-section-card">
                        <div className="admin-modal-section-header">
                          <BookOpen size={16} />
                          <h4>Product Description</h4>
                        </div>
                        <div className="admin-modal-section-body">
                          <div className="form-field">
                            <label>Detailed Description</label>
                            <textarea 
                              value={editProductItem.description || ''}
                              onChange={(e) => setEditProductItem({ ...editProductItem, description: e.target.value })}
                              placeholder="Enter detailed product description..." 
                              className="modal-input"
                              rows="4"
                              style={{ resize: 'vertical', width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {editProductActiveTab === 'lucky' && (
                    <div className="admin-modal-section-card">
                      <div className="admin-modal-section-header">
                        <Sparkles size={16} />
                        <h4>Lucky Charm Settings</h4>
                      </div>
                      <div className="admin-modal-section-body">
                        <div className="form-field">
                          <label>Include in Lucky Charm</label>
                          <select 
                            value={editProductItem.includeInLuckyCharm ? 'Yes' : 'No'}
                            onChange={(e) => setEditProductItem({ ...editProductItem, includeInLuckyCharm: e.target.value === 'Yes' })}
                            className="modal-input"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        {editProductItem.includeInLuckyCharm && (
                          <>
                            <div className="form-field">
                              <label>Chance Percentage (%)</label>
                              <input 
                                type="number" 
                                value={editProductItem.luckyChancePercentage || ''}
                                onChange={(e) => setEditProductItem({ ...editProductItem, luckyChancePercentage: parseFloat(e.target.value) || 0 })}
                                placeholder="e.g. 15"
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Lucky Stock</label>
                              <input 
                                type="number" 
                                value={editProductItem.luckyStock || ''}
                                onChange={(e) => setEditProductItem({ ...editProductItem, luckyStock: parseInt(e.target.value, 10) || 0 })}
                                placeholder="e.g. 50"
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Lucky Price (Discounted Reward Price)</label>
                              <input 
                                type="number" 
                                value={editProductItem.luckyPrice || ''}
                                onChange={(e) => setEditProductItem({ ...editProductItem, luckyPrice: parseFloat(e.target.value) || 0 })}
                                placeholder="e.g. 299"
                                className="modal-input"
                              />
                            </div>
                            <div className="form-field">
                              <label>Active status</label>
                              <select 
                                value={editProductItem.luckyActive ? 'Yes' : 'No'}
                                onChange={(e) => setEditProductItem({ ...editProductItem, luckyActive: e.target.value === 'Yes' })}
                                className="modal-input"
                              >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions Footer Bar */}
              <div className="modal-actions-row" style={{ borderTop: '1px solid #eae6df', margin: 0, padding: '16px 24px', background: '#fbfbfb' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditProductItem(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PRODUCT MODAL DIALOG --- */}
      {viewProductItem && (
        <div className="admin-modal-overlay" onClick={() => setViewProductItem(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Product Specifications</h3>
              <button className="close-btn" onClick={() => setViewProductItem(null)}><X size={18} /></button>
            </div>
            
            <div className="modal-body-view" style={{ flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                <div className="view-prod-img-wrap" style={{ flexShrink: 0 }}>
                  <img src={resolveProductImage(viewProductItem)} alt={viewProductItem.name} className="view-img" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                </div>
                <div className="view-prod-details" style={{ flexGrow: 1, paddingLeft: 0 }}>
                  <h4 className="view-title" style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{viewProductItem.name}</h4>
                  <div className="view-spec-table">
                    <div className="spec-row">
                      <span className="spec-lbl">Catalogue:</span>
                      <span className="spec-val bold">{viewProductItem.catalogue || 'Catalogue A'}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Category:</span>
                      <span className="spec-val bold">{viewProductItem.category || 'Clothing > Kids'}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">SubCategory:</span>
                      <span className="spec-val bold">{viewProductItem.subCategory || '—'}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Price:</span>
                      <span className="spec-val bold text-orange">₹{(viewProductItem.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Available Stock:</span>
                      <span className="spec-val bold">{viewProductItem.stock || 0} items</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Total Sales:</span>
                      <span className="spec-val bold">{viewProductItem.sales || 0} orders</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Status:</span>
                      <span className={`status-badge-re ${(viewProductItem.status || 'Active').toLowerCase().replace(' ', '-')}`}>{viewProductItem.status || 'Active'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {viewProductItem.attributes && Object.keys(viewProductItem.attributes).length > 0 && (
                <div style={{ marginBottom: '16px', background: '#f6faf0', padding: '16px', borderRadius: '12px', border: '1px solid #dbe8cb' }}>
                  <span className="spec-lbl" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#D4AF37' }}>Category Specifications:</span>
                  <div className="view-spec-table" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {Object.entries(viewProductItem.attributes).map(([key, val]) => (
                      <div key={key} className="spec-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eae6df', paddingBottom: '6px' }}>
                        <span className="spec-lbl" style={{ textTransform: 'capitalize' }}>{key}:</span>
                        <span className="spec-val bold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Images Gallery */}
              {Array.isArray(viewProductItem.images) && viewProductItem.images.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span className="spec-lbl" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Product Images Gallery:</span>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {viewProductItem.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${viewProductItem.name} ${idx + 1}`} 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eae6df' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: '16px', background: '#faf9f6', padding: '16px', borderRadius: '12px', border: '1px solid #eae6df' }}>
                <span className="spec-lbl" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Description:</span>
                <p style={{ fontSize: '0.9rem', color: '#555', margin: 0, lineHeight: '1.5' }}>
                  {viewProductItem.description || 'No description provided for this product.'}
                </p>
              </div>

              <div className="modal-actions-row" style={{ marginTop: '8px' }}>
                <button type="button" className="btn-primary" onClick={() => setViewProductItem(null)}>Close View</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD COUPON MODAL DIALOG --- */}
      {showAddCouponModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddCouponModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Create Coupon Promo Code</h3>
              <button className="close-btn" onClick={() => setShowAddCouponModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddCouponSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Promo Code <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  placeholder="e.g. WELCOME10" 
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Coupon Type</label>
                  <select 
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat (₹)</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Discount Value <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    placeholder="e.g. 10% OFF or Free Shipping" 
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Min Cart Value</label>
                  <input 
                    type="text" 
                    value={newCoupon.minCart}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minCart: e.target.value })}
                    placeholder="e.g. ₹499" 
                    className="modal-input"
                  />
                </div>
                <div className="form-field">
                  <label>Expiry Date <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={newCoupon.expiry}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                    placeholder="e.g. Jun 30, 2025" 
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Usage Limit</label>
                  <input 
                    type="number" 
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    placeholder="e.g. 500" 
                    className="modal-input"
                  />
                </div>
                <div className="form-field" style={{ visibility: 'hidden' }}>
                  {/* Spacer */}
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddCouponModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Generate Code</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD DYNAMIC FEATURE MODAL --- */}
      {showAddFeatureModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddFeatureModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Add Custom Section</h3>
              <button className="close-btn" onClick={() => setShowAddFeatureModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddFeatureSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Section Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  placeholder="e.g. Summer Promo, Customer Reviews" 
                  required 
                  className="modal-input"
                />
              </div>
              <div className="form-field">
                <label>Section Key <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newFeatureKey}
                  onChange={(e) => setNewFeatureKey(e.target.value)}
                  placeholder="e.g. summer_promo (lowercase, no spaces)" 
                  required 
                  className="modal-input"
                />
              </div>
              <div className="form-field">
                <label>Section Title (Header Text)</label>
                <input 
                  type="text" 
                  value={newFeatureTitle}
                  onChange={(e) => setNewFeatureTitle(e.target.value)}
                  placeholder="e.g. Big Summer Discounts" 
                  className="modal-input"
                />
              </div>
              <div className="form-field">
                <label>Section Subtitle (Tag / Small text)</label>
                <input 
                  type="text" 
                  value={newFeatureSubtitle}
                  onChange={(e) => setNewFeatureSubtitle(e.target.value)}
                  placeholder="e.g. Up to 50% OFF" 
                  className="modal-input"
                />
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddFeatureModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Section</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT DYNAMIC FEATURE MODAL --- */}
      {editFeatureItem && (
        <div className="admin-modal-overlay" onClick={() => setEditFeatureItem(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Section Details</h3>
              <button className="close-btn" onClick={() => setEditFeatureItem(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditFeatureSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Section Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editFeatureItem.name}
                  onChange={(e) => setEditFeatureItem({ ...editFeatureItem, name: e.target.value })}
                  placeholder="e.g. Summer Promo" 
                  required 
                  className="modal-input"
                />
              </div>
              <div className="form-field">
                <label>Section Title (Header Text)</label>
                <input 
                  type="text" 
                  value={editFeatureItem.title || ''}
                  onChange={(e) => setEditFeatureItem({ ...editFeatureItem, title: e.target.value })}
                  placeholder="e.g. Big Summer Discounts" 
                  className="modal-input"
                />
              </div>
              <div className="form-field">
                <label>Section Subtitle (Tag / Small text)</label>
                <input 
                  type="text" 
                  value={editFeatureItem.subtitle || ''}
                  onChange={(e) => setEditFeatureItem({ ...editFeatureItem, subtitle: e.target.value })}
                  placeholder="e.g. Up to 50% OFF" 
                  className="modal-input"
                />
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setEditFeatureItem(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CATEGORY MODAL DIALOG --- */}
      {showAddCategoryModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddCategoryModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Create Store Category</h3>
              <button className="close-btn" onClick={() => setShowAddCategoryModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddCategorySubmit} className="modal-body-form">
              <div className="form-field">
                <label>Category Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Women, Kurti, Saree" 
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Parent Category</label>
                  <select 
                    value={newCategory.parent}
                    onChange={(e) => setNewCategory({ ...newCategory, parent: e.target.value })}
                    className="modal-input"
                  >
                    <option value="—">— (None - Top Level)</option>
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Opening Products Qty</label>
                  <input 
                    type="number" 
                    value={newCategory.count}
                    onChange={(e) => setNewCategory({ ...newCategory, count: e.target.value })}
                    placeholder="0" 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select 
                  value={newCategory.status}
                  onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                  className="modal-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-field">
                <label>Category Cover Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={newCategory.image || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                    placeholder="e.g. https://example.com/category.jpg" 
                    className="modal-input"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="add-cat-file-upload" style={{ cursor: 'pointer', padding: '6px 14px', background: '#F4FBF0', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Upload Cover Image
                    </label>
                    <input 
                      type="file" 
                      id="add-cat-file-upload" 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={(e) => handleCategoryImageUpload(e, newCategory, setNewCategory)} 
                    />
                    {newCategory.image && (
                      <img src={newCategory.image} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* ── Visibility Checkboxes ── */}
              <div className="form-field">
                <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Show In</label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={newCategory.showInNavbar !== false}
                      onChange={(e) => setNewCategory({ ...newCategory, showInNavbar: e.target.checked })}
                      style={{ accentColor: '#D4AF37', width: 16, height: 16 }}
                    />
                    Navbar
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={newCategory.showInCategories !== false}
                      onChange={(e) => setNewCategory({ ...newCategory, showInCategories: e.target.checked })}
                      style={{ accentColor: '#D4AF37', width: 16, height: 16 }}
                    />
                    Shop By Categories
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={newCategory.showInFilters !== false}
                      onChange={(e) => setNewCategory({ ...newCategory, showInFilters: e.target.checked })}
                      style={{ accentColor: '#D4AF37', width: 16, height: 16 }}
                    />
                    Filters
                  </label>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddCategoryModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CATEGORY MODAL DIALOG --- */}
      {editCategoryItem && (
        <div className="admin-modal-overlay" onClick={() => setEditCategoryItem(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Category Details</h3>
              <button className="close-btn" onClick={() => setEditCategoryItem(null)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditCategorySubmit} className="modal-body-form">
              <div className="form-field">
                <label>Category Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editCategoryItem.name}
                  onChange={(e) => setEditCategoryItem({ ...editCategoryItem, name: e.target.value })}
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Parent Category</label>
                  <select 
                    value={editCategoryItem.parent}
                    onChange={(e) => setEditCategoryItem({ ...editCategoryItem, parent: e.target.value })}
                    className="modal-input"
                  >
                    <option value="—">— (None - Top Level)</option>
                    {getValidParentOptions(editCategoryItem.originalName).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Products Qty</label>
                  <input 
                    type="number" 
                    value={editCategoryItem.count}
                    onChange={(e) => setEditCategoryItem({ ...editCategoryItem, count: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select 
                  value={editCategoryItem.status}
                  onChange={(e) => setEditCategoryItem({ ...editCategoryItem, status: e.target.value })}
                  className="modal-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-field">
                <label>Category Cover Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={editCategoryItem.image || ''}
                    onChange={(e) => setEditCategoryItem({ ...editCategoryItem, image: e.target.value })}
                    placeholder="e.g. https://example.com/category.jpg" 
                    className="modal-input"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="edit-cat-file-upload" style={{ cursor: 'pointer', padding: '6px 14px', background: '#F4FBF0', border: '1px solid #D4AF37', color: '#D4AF37', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Upload Cover Image
                    </label>
                    <input 
                      type="file" 
                      id="edit-cat-file-upload" 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={(e) => handleCategoryImageUpload(e, editCategoryItem, setEditCategoryItem)} 
                    />
                    {editCategoryItem.image && (
                      <img src={editCategoryItem.image} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* ── Visibility Checkboxes ── */}
              <div className="form-field">
                <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Show In</label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={editCategoryItem.showInNavbar !== false}
                      onChange={(e) => setEditCategoryItem({ ...editCategoryItem, showInNavbar: e.target.checked })}
                      style={{ accentColor: '#D4AF37', width: 16, height: 16 }}
                    />
                    Navbar
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={editCategoryItem.showInCategories !== false}
                      onChange={(e) => setEditCategoryItem({ ...editCategoryItem, showInCategories: e.target.checked })}
                      style={{ accentColor: '#D4AF37', width: 16, height: 16 }}
                    />
                    Shop By Categories
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={editCategoryItem.showInFilters !== false}
                      onChange={(e) => setEditCategoryItem({ ...editCategoryItem, showInFilters: e.target.checked })}
                      style={{ accentColor: '#D4AF37', width: 16, height: 16 }}
                    />
                    Filters
                  </label>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setEditCategoryItem(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW CATEGORY MODAL DIALOG --- */}
      {viewCategoryItem && (
        <div className="admin-modal-overlay" onClick={() => setViewCategoryItem(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Category Specifications</h3>
              <button className="close-btn" onClick={() => setViewCategoryItem(null)}><X size={18} /></button>
            </div>
            
            <div className="modal-body-view">
              <div className="view-prod-details" style={{ paddingLeft: 0 }}>
                <h4 className="view-title" style={{ color: '#C59B6C' }}>{viewCategoryItem.name}</h4>
                <div className="view-spec-table">
                  <div className="spec-row">
                    <span className="spec-lbl">Parent Category:</span>
                    <span className="spec-val bold">{viewCategoryItem.parent || '—'}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Category Path:</span>
                    <span className="spec-val bold">{getCategoryPath(viewCategoryItem.name)}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Total Products:</span>
                    <span className="spec-val bold text-orange">{getCategoryProductCount(viewCategoryItem.name)} products</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Status:</span>
                    <span className={`status-badge-re ${(viewCategoryItem.status || 'Active').toLowerCase()}`}>{viewCategoryItem.status || 'Active'}</span>
                  </div>
                  {viewCategoryItem.image && (
                    <div className="spec-row">
                      <span className="spec-lbl">Cover Image:</span>
                      <span className="spec-val">
                        <img src={viewCategoryItem.image} alt={viewCategoryItem.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-actions-row">
                <button type="button" className="btn-primary" onClick={() => setViewCategoryItem(null)}>Close View</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD CATALOGUE MODAL DIALOG --- */}
      {showAddCatalogueModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddCatalogueModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Create Store Catalogue</h3>
              <button className="close-btn" onClick={() => setShowAddCatalogueModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddCatalogueSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Catalogue Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newCatalogue.name}
                  onChange={(e) => setNewCatalogue({ ...newCatalogue, name: e.target.value })}
                  placeholder="e.g. Catalogue C" 
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field">
                <label>Subtitle / Description <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newCatalogue.subtitle}
                  onChange={(e) => setNewCatalogue({ ...newCatalogue, subtitle: e.target.value })}
                  placeholder="e.g. Summer Chic Collection" 
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Products count</label>
                  <input 
                    type="number" 
                    value={newCatalogue.count}
                    onChange={(e) => setNewCatalogue({ ...newCatalogue, count: e.target.value })}
                    placeholder="0" 
                    className="modal-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Revenue Estimate</label>
                  <input 
                    type="text" 
                    value={newCatalogue.revenue}
                    onChange={(e) => setNewCatalogue({ ...newCatalogue, revenue: e.target.value })}
                    placeholder="₹85,000" 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Status</label>
                  <select 
                    value={newCatalogue.status}
                    onChange={(e) => setNewCatalogue({ ...newCatalogue, status: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Image Template</label>
                  <select 
                    value={newCatalogue.image}
                    onChange={(e) => setNewCatalogue({ ...newCatalogue, image: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Kids">Kids Collection Template</option>
                    <option value="Lifestyle">Lifestyle Collection Template</option>
                    <option value="Clothing">Clothing Collection Template</option>
                    <option value="Accessories">Accessories Collection Template</option>
                    <option value="Stationery">Stationery Collection Template</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddCatalogueModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Catalogue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CATALOGUE MODAL DIALOG --- */}
      {editCatalogueItem && (
        <div className="admin-modal-overlay" onClick={() => setEditCatalogueItem(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Catalogue Details</h3>
              <button className="close-btn" onClick={() => setEditCatalogueItem(null)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditCatalogueSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Catalogue Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editCatalogueItem.name}
                  onChange={(e) => setEditCatalogueItem({ ...editCatalogueItem, name: e.target.value })}
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field">
                <label>Subtitle / Description <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editCatalogueItem.subtitle}
                  onChange={(e) => setEditCatalogueItem({ ...editCatalogueItem, subtitle: e.target.value })}
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Products count</label>
                  <input 
                    type="number" 
                    value={editCatalogueItem.count}
                    onChange={(e) => setEditCatalogueItem({ ...editCatalogueItem, count: e.target.value })}
                    className="modal-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Revenue Estimate</label>
                  <input 
                    type="text" 
                    value={editCatalogueItem.revenue}
                    onChange={(e) => setEditCatalogueItem({ ...editCatalogueItem, revenue: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Status</label>
                  <select 
                    value={editCatalogueItem.status}
                    onChange={(e) => setEditCatalogueItem({ ...editCatalogueItem, status: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Image Template</label>
                  <select 
                    value={editCatalogueItem.image}
                    onChange={(e) => setEditCatalogueItem({ ...editCatalogueItem, image: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Kids">Kids Collection Template</option>
                    <option value="Lifestyle">Lifestyle Collection Template</option>
                    <option value="Clothing">Clothing Collection Template</option>
                    <option value="Accessories">Accessories Collection Template</option>
                    <option value="Stationery">Stationery Collection Template</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setEditCatalogueItem(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW CATALOGUE MODAL DIALOG --- */}
      {viewCatalogueItem && (
        <div className="admin-modal-overlay" onClick={() => setViewCatalogueItem(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Catalogue Specifications</h3>
              <button className="close-btn" onClick={() => setViewCatalogueItem(null)}><X size={18} /></button>
            </div>
            
            <div className="modal-body-view">
              <div className="view-prod-details" style={{ paddingLeft: 0 }}>
                <h4 className="view-title" style={{ color: '#C59B6C' }}>{viewCatalogueItem.name}</h4>
                <div className="view-spec-table">
                  <div className="spec-row">
                    <span className="spec-lbl">Subtitle/Focus:</span>
                    <span className="spec-val bold">{viewCatalogueItem.subtitle}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Total Products:</span>
                    <span className="spec-val bold">{viewCatalogueItem.count} products</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Estimated Revenue:</span>
                    <span className="spec-val bold text-orange">{viewCatalogueItem.revenue}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Status:</span>
                    <span className={`status-badge-re ${viewCatalogueItem.status.toLowerCase()}`}>{viewCatalogueItem.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions-row">
                <button type="button" className="btn-primary" onClick={() => setViewCatalogueItem(null)}>Close View</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT ORDER MODAL DIALOG --- */}
      {showEditOrderModal && editOrderItem && (
        <div className="admin-modal-overlay" onClick={() => { setShowEditOrderModal(false); setEditOrderItem(null); }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Order Details</h3>
              <button className="close-btn" onClick={() => { setShowEditOrderModal(false); setEditOrderItem(null); }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditOrderSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Customer Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editOrderItem.customer}
                  onChange={(e) => setEditOrderItem({ ...editOrderItem, customer: e.target.value })}
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Order Amount (e.g. ₹2,499) <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={editOrderItem.amount}
                    onChange={(e) => setEditOrderItem({ ...editOrderItem, amount: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Payment Method <span className="req">*</span></label>
                  <select 
                    value={editOrderItem.payment}
                    onChange={(e) => setEditOrderItem({ ...editOrderItem, payment: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Razorpay">Razorpay</option>
                    <option value="UPI">UPI</option>
                    <option value="COD">COD</option>
                  </select>
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Status</label>
                  <select 
                    value={editOrderItem.status}
                    onChange={(e) => setEditOrderItem({ ...editOrderItem, status: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Processing">Processing</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Date Ordered</label>
                  <input 
                    type="text" 
                    value={editOrderItem.date}
                    onChange={(e) => setEditOrderItem({ ...editOrderItem, date: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => { setShowEditOrderModal(false); setEditOrderItem(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW ORDER MODAL DIALOG --- */}
      {showViewOrderModal && viewOrderItem && (
        <div className="admin-modal-overlay" onClick={() => { setShowViewOrderModal(false); setViewOrderItem(null); }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Order Specifications</h3>
              <button className="close-btn" onClick={() => { setShowViewOrderModal(false); setViewOrderItem(null); }}><X size={18} /></button>
            </div>
            
            <div className="modal-body-view">
              <div className="view-prod-details" style={{ paddingLeft: 0 }}>
                <h4 className="view-title" style={{ color: '#C59B6C' }}>{viewOrderItem.id} Details</h4>
                <div className="view-spec-table">
                  <div className="spec-row">
                    <span className="spec-lbl">Customer Name:</span>
                    <span className="spec-val bold">{viewOrderItem.customer}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Product / Items:</span>
                    <span className="spec-val bold">{viewOrderItem.product}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Total Paid:</span>
                    <span className="spec-val bold text-orange">{viewOrderItem.amount}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Payment Method:</span>
                    <span className="spec-val bold">{viewOrderItem.payment}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Date Ordered:</span>
                    <span className="spec-val bold">{viewOrderItem.date}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Delivery Status:</span>
                    <span className={`orders-status-badge ${viewOrderItem.status.toLowerCase()}`}>
                      {viewOrderItem.status}
                    </span>
                  </div>
                  {viewOrderItem.items && Array.isArray(viewOrderItem.items) && (
                    <div style={{ marginTop: '16px', background: '#faf9f6', padding: '16px', borderRadius: '12px', border: '1px solid #eae6df' }}>
                      <span className="spec-lbl" style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#C59B6C' }}>Items / Selected Variants Details:</span>
                      {viewOrderItem.items.map((item, idx) => (
                        <div key={idx} style={{ borderBottom: idx < viewOrderItem.items.length - 1 ? '1px solid #eae6df' : 'none', paddingBottom: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name} (Qty: {item.quantity})</div>
                          <div style={{ color: '#666', marginTop: '3px' }}>Catalogue: <span style={{ color: '#000', fontWeight: 500 }}>{item.catalogue || 'Catalogue A'}</span></div>
                          {item.variant && (item.variant.size || item.variant.color) && (
                            <div style={{ color: '#D4AF37', fontWeight: 600, marginTop: '3px' }}>
                              Selected Variant: {item.variant.size ? `Size: ${item.variant.size}` : ''} {item.variant.color ? `| Color: ${item.variant.color}` : ''} {item.variant.sku ? `| SKU: ${item.variant.sku}` : ''} {item.variant.variantId ? `| VarID: ${item.variant.variantId}` : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-actions-row">
                <button type="button" className="btn-primary" onClick={() => { setShowViewOrderModal(false); setViewOrderItem(null); }}>Close View</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT CUSTOMER MODAL DIALOG --- */}
      {showEditCustomerModal && editCustomerItem && (
        <div className="admin-modal-overlay" onClick={() => { setShowEditCustomerModal(false); setEditCustomerItem(null); }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Customer Details</h3>
              <button className="close-btn" onClick={() => { setShowEditCustomerModal(false); setEditCustomerItem(null); }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditCustomerSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Customer Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editCustomerItem.name}
                  onChange={(e) => setEditCustomerItem({ ...editCustomerItem, name: e.target.value })}
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Email Address <span className="req">*</span></label>
                  <input 
                    type="email" 
                    value={editCustomerItem.email}
                    onChange={(e) => setEditCustomerItem({ ...editCustomerItem, email: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
                
                <div className="form-field">
                  <label>Phone Number <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={editCustomerItem.phone}
                    onChange={(e) => setEditCustomerItem({ ...editCustomerItem, phone: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Orders Count</label>
                  <input 
                    type="number" 
                    value={editCustomerItem.ordersCount}
                    onChange={(e) => setEditCustomerItem({ ...editCustomerItem, ordersCount: e.target.value })}
                    className="modal-input"
                  />
                </div>

                <div className="form-field">
                  <label>Joined Date</label>
                  <input 
                    type="text" 
                    value={editCustomerItem.joinedDate}
                    onChange={(e) => setEditCustomerItem({ ...editCustomerItem, joinedDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select 
                  value={editCustomerItem.status}
                  onChange={(e) => setEditCustomerItem({ ...editCustomerItem, status: e.target.value })}
                  className="modal-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => { setShowEditCustomerModal(false); setEditCustomerItem(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT COUPON MODAL DIALOG --- */}
      {showEditCouponModal && editCouponItem && (
        <div className="admin-modal-overlay" onClick={() => { setShowEditCouponModal(false); setEditCouponItem(null); }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Coupon Details</h3>
              <button className="close-btn" onClick={() => { setShowEditCouponModal(false); setEditCouponItem(null); }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditCouponSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Promo Code <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editCouponItem.code}
                  onChange={(e) => setEditCouponItem({ ...editCouponItem, code: e.target.value })}
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Coupon Type</label>
                  <select 
                    value={editCouponItem.type}
                    onChange={(e) => setEditCouponItem({ ...editCouponItem, type: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat (₹)</option>
                    <option value="Free Shipping">Free Shipping</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Discount Value <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={editCouponItem.discount}
                    onChange={(e) => setEditCouponItem({ ...editCouponItem, discount: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Min Cart Value</label>
                  <input 
                    type="text" 
                    value={editCouponItem.minCart}
                    onChange={(e) => setEditCouponItem({ ...editCouponItem, minCart: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="form-field">
                  <label>Expiry Date <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={editCouponItem.expiry}
                    onChange={(e) => setEditCouponItem({ ...editCouponItem, expiry: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Usage (e.g. 120/500)</label>
                  <input 
                    type="text" 
                    value={editCouponItem.usage}
                    onChange={(e) => setEditCouponItem({ ...editCouponItem, usage: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select 
                    value={editCouponItem.status}
                    onChange={(e) => setEditCouponItem({ ...editCouponItem, status: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => { setShowEditCouponModal(false); setEditCouponItem(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEWSLETTER SUBSCRIBERS INBOX MODAL --- */}
      {showSubscribersModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSubscribersModal(false)}>
          <div className="admin-modal-box wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Newsletter Mailing List</h3>
              <button className="close-btn" onClick={() => setShowSubscribersModal(false)}><X size={18} /></button>
            </div>
            
            <div className="modal-body-view">
              <div className="subscribers-modal-actions-row">
                <div className="admin-re-search-wrapper" style={{ flex: 1, margin: 0 }}>
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search by email..." 
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    className="admin-re-search-input"
                  />
                </div>
                
                <button 
                  className="admin-btn-primary orange-add-btn" 
                  style={{ margin: 0 }}
                  onClick={() => {
                    setNewSubscriberEmail('');
                    setShowAddSubscriberModal(true);
                  }}
                >
                  <Plus size={16} /> Add Subscriber
                </button>
              </div>

              <div className="admin-re-table-wrapper" style={{ marginTop: '20px', maxHeight: '350px', overflowY: 'auto' }}>
                <table className="admin-re-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Email Address</th>
                      <th>Subscribed Date</th>
                      <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers
                      .filter(sub => sub.email.toLowerCase().includes(subscriberSearch.toLowerCase()))
                      .map((sub, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="cust-avatar-circle" style={{ width: '28px', height: '28px' }}>
                              {getCustomerAvatar(sub.avatar) ? (
                                <img src={getCustomerAvatar(sub.avatar)} alt={sub.email} className="cust-avatar-img" />
                              ) : (
                                <span className="cust-avatar-fallback" style={{ fontSize: '0.65rem' }}>{sub.email.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                          </td>
                          <td className="bold text-black">{sub.email}</td>
                          <td className="text-gray">{sub.date}</td>
                          <td className="action-cell">
                            <div className="action-buttons-wrap" style={{ justifyContent: 'flex-end', paddingRight: '8px' }}>
                              <button 
                                className="table-act-btn delete" 
                                title="Remove Subscriber" 
                                onClick={() => {
                                  if (confirm(`Remove ${sub.email} from mailing list?`)) {
                                    setSubscribers(subscribers.filter(item => item.email !== sub.email));
                                    setTotalSubscribersCount(prev => Math.max(0, prev - 1));
                                    setThisMonthSubscribersCount(prev => Math.max(0, prev - 1));
                                  }
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {subscribers.filter(sub => sub.email.toLowerCase().includes(subscriberSearch.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan="4" className="empty-table-cell">No subscribers match search query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-primary" onClick={() => setShowSubscribersModal(false)}>Close List</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SUBSCRIBER SUB-MODAL --- */}
      {showAddSubscriberModal && (
        <div className="admin-modal-overlay" style={{ zIndex: 1000 }} onClick={() => setShowAddSubscriberModal(false)}>
          <div className="admin-modal-box small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Add Subscriber</h3>
              <button className="close-btn" onClick={() => setShowAddSubscriberModal(false)}><X size={18} /></button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSubscriberEmail) return;
                if (subscribers.some(s => s.email.toLowerCase() === newSubscriberEmail.toLowerCase())) {
                  alert('Email is already subscribed.');
                  return;
                }
                const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                const newSub = {
                  email: newSubscriberEmail.trim().toLowerCase(),
                  date: formattedDate,
                  avatar: ['celebKid', 'celebKeerthy', 'celebDulquer', 'celebCouple'][Math.floor(Math.random() * 4)]
                };
                setSubscribers([newSub, ...subscribers]);
                setTotalSubscribersCount(prev => prev + 1);
                setThisMonthSubscribersCount(prev => prev + 1);
                setShowAddSubscriberModal(false);
                setNewSubscriberEmail('');
              }} 
              className="modal-body-form"
            >
              <div className="form-field">
                <label>Email Address <span className="req">*</span></label>
                <input 
                  type="email" 
                  value={newSubscriberEmail}
                  onChange={(e) => setNewSubscriberEmail(e.target.value)}
                  placeholder="e.g. customer@gmail.com"
                  required 
                  className="modal-input"
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddSubscriberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Subscriber</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD BANNER MODAL DIALOG --- */}
      {showAddBannerModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddBannerModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Create Banner Campaign Slot</h3>
              <button className="close-btn" onClick={() => setShowAddBannerModal(false)}><X size={18} /></button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBanner.title) return;
                const bannerToAdd = {
                  id: Date.now(),
                  title: newBanner.title.trim(),
                  slot: newBanner.slot,
                  image: newBanner.image,
                  clickRate: '0.0%',
                  status: newBanner.status
                };
                setBanners([...banners, bannerToAdd]);
                setShowAddBannerModal(false);
                setNewBanner({ title: '', slot: 'Main Banner', image: 'Kids', status: 'Active' });
              }} 
              className="modal-body-form"
            >
              <div className="form-field">
                <label>Campaign / Banner Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="e.g. Diwali Accessories Blast"
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Placement Slot</label>
                  <select 
                    value={newBanner.slot}
                    onChange={(e) => setNewBanner({ ...newBanner, slot: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Main Banner">Main Banner Slide</option>
                    <option value="Sidebar Top">Sidebar Top</option>
                    <option value="Footer Banner">Footer Banner</option>
                    <option value="Promo Banner">Checkout promo</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Image Template</label>
                  <select 
                    value={newBanner.image}
                    onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Kids">Kids Collection Template</option>
                    <option value="Lifestyle">Lifestyle Collection Template</option>
                    <option value="Clothing">Clothing Collection Template</option>
                    <option value="Accessories">Accessories Collection Template</option>
                    <option value="Stationery">Stationery Collection Template</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select 
                  value={newBanner.status}
                  onChange={(e) => setNewBanner({ ...newBanner, status: e.target.value })}
                  className="modal-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddBannerModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ANNOUNCEMENT MODAL DIALOG --- */}
      {showAddAnnouncementModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddAnnouncementModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Create Text Announcement</h3>
              <button className="close-btn" onClick={() => setShowAddAnnouncementModal(false)}><X size={18} /></button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newAnnouncement.text || !newAnnouncement.expiry) return;
                const annToAdd = {
                  id: Date.now(),
                  text: newAnnouncement.text.trim(),
                  placement: newAnnouncement.placement,
                  expiry: newAnnouncement.expiry,
                  status: newAnnouncement.status
                };
                setAnnouncements([...announcements, annToAdd]);
                setShowAddAnnouncementModal(false);
                setNewAnnouncement({ text: '', placement: 'Top Header', expiry: 'Jun 30, 2025', status: 'Active' });
              }} 
              className="modal-body-form"
            >
              <div className="form-field">
                <label>Announcement Text <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newAnnouncement.text}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, text: e.target.value })}
                  placeholder="e.g. Free shipping on all orders above ₹999!"
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Placement Page</label>
                  <select 
                    value={newAnnouncement.placement}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, placement: e.target.value })}
                    className="modal-input"
                  >
                    <option value="Top Header">Top Header Scrolling Bar</option>
                    <option value="Cart Banner">Cart Banner Info</option>
                    <option value="Checkout Header">Checkout Header Scroll</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label>Expiry Date <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={newAnnouncement.expiry}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiry: e.target.value })}
                    placeholder="e.g. Jun 30, 2025"
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select 
                  value={newAnnouncement.status}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, status: e.target.value })}
                  className="modal-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddAnnouncementModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish Text</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONTACT INQUIRY DETAIL & REPLY MODAL --- */}
      {showReplyQueryModal && viewQueryItem && (
        <div className="admin-modal-overlay" onClick={() => { setShowReplyQueryModal(false); setViewQueryItem(null); }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Support Inquiry Resolution</h3>
              <button className="close-btn" onClick={() => { setShowReplyQueryModal(false); setViewQueryItem(null); }}><X size={18} /></button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyMessage) return;
                alert(`Reply sent successfully to ${viewQueryItem.name} (${viewQueryItem.email})!\nMessage: ${replyMessage}`);
                setContactQueries(contactQueries.map(q => q.id === viewQueryItem.id ? { ...q, status: 'Replied' } : q));
                setShowReplyQueryModal(false);
                setViewQueryItem(null);
              }} 
              className="modal-body-form"
            >
              <div className="view-prod-details" style={{ paddingLeft: 0, marginBottom: '16px' }}>
                <h4 className="view-title" style={{ color: '#C59B6C' }}>Inquiry Details</h4>
                <div className="view-spec-table">
                  <div className="spec-row">
                    <span className="spec-lbl">Sender Name:</span>
                    <span className="spec-val bold">{viewQueryItem.name}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Email Address:</span>
                    <span className="spec-val bold">{viewQueryItem.email}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Date Received:</span>
                    <span className="spec-val bold">{viewQueryItem.date}</span>
                  </div>
                  <div className="spec-row" style={{ display: 'block', marginTop: '10px' }}>
                    <span className="spec-lbl" style={{ display: 'block', marginBottom: '4px' }}>Inquiry Message:</span>
                    <div className="spec-val" style={{ background: '#faf9f6', padding: '12px', borderRadius: '8px', border: '1px solid #eae6df', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                      {viewQueryItem.message}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label>Write Reply Message <span className="req">*</span></label>
                <textarea 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your official support response here..."
                  required 
                  rows="4"
                  className="modal-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => { setShowReplyQueryModal(false); setViewQueryItem(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Send Email Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- CUSTOMER REVIEW REPLY MODAL --- */}
      {/* --- ADD LUCKY CHARM REWARD MODAL --- */}
      {showAddRewardModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddRewardModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Create Lucky Charm Reward</h3>
              <button className="close-btn" onClick={() => setShowAddRewardModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddLuckyRewardSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Reward Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={newReward.rewardName}
                  onChange={(e) => setNewReward({ ...newReward, rewardName: e.target.value })}
                  placeholder="e.g. Premium Leather Diary" 
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Reward Type</label>
                  <select 
                    value={newReward.rewardType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setNewReward({ 
                        ...newReward, 
                        rewardType: type,
                        productId: '',
                        couponId: '',
                        rewardName: ''
                      });
                    }}
                    className="modal-input"
                  >
                    <option value="product">Product</option>
                    <option value="coupon">Coupon</option>
                  </select>
                </div>

                {newReward.rewardType === 'product' ? (
                  <div className="form-field">
                    <label>Select Product <span className="req">*</span></label>
                    <select 
                      value={newReward.productId}
                      onChange={(e) => {
                        const prodId = e.target.value;
                        const prod = products.find(p => String(p.id) === String(prodId));
                        setNewReward({ 
                          ...newReward, 
                          productId: prodId,
                          rewardName: prod ? prod.name : newReward.rewardName,
                          luckyPrice: prod ? prod.price : newReward.luckyPrice
                        });
                      }}
                      required
                      className="modal-input"
                    >
                      <option value="">Select a Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-field">
                    <label>Select Coupon <span className="req">*</span></label>
                    <select 
                      value={newReward.couponId}
                      onChange={(e) => {
                        const cpCode = e.target.value;
                        const cp = coupons.find(c => c.code === cpCode);
                        setNewReward({ 
                          ...newReward, 
                          couponId: cpCode,
                          rewardName: cp ? `${cp.code} (${cp.discount})` : newReward.rewardName
                        });
                      }}
                      required
                      className="modal-input"
                    >
                      <option value="">Select a Coupon...</option>
                      {coupons.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.discount})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Chance Percentage (%) <span className="req">*</span></label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newReward.chancePercentage}
                    onChange={(e) => setNewReward({ ...newReward, chancePercentage: e.target.value })}
                    placeholder="e.g. 15" 
                    required 
                    className="modal-input"
                  />
                </div>
                <div className="form-field">
                  <label>Lucky Stock <span className="req">*</span></label>
                  <input 
                    type="number"
                    min="0"
                    value={newReward.luckyStock}
                    onChange={(e) => setNewReward({ ...newReward, luckyStock: e.target.value })}
                    placeholder="e.g. 50" 
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              {newReward.rewardType === 'product' && (
                <div className="form-field">
                  <label>Lucky Price (₹) <span className="req">*</span></label>
                  <input 
                    type="number"
                    min="0"
                    value={newReward.luckyPrice}
                    onChange={(e) => setNewReward({ ...newReward, luckyPrice: e.target.value })}
                    placeholder="e.g. 299" 
                    required 
                    className="modal-input"
                  />
                </div>
              )}

              <div className="form-field-row">
                <div className="form-field">
                  <label>Start Date</label>
                  <input 
                    type="date"
                    value={newReward.startDate ? newReward.startDate.split('T')[0] : ''}
                    onChange={(e) => setNewReward({ ...newReward, startDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="form-field">
                  <label>End Date</label>
                  <input 
                    type="date"
                    value={newReward.endDate ? newReward.endDate.split('T')[0] : ''}
                    onChange={(e) => setNewReward({ ...newReward, endDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select 
                  value={newReward.status}
                  onChange={(e) => setNewReward({ ...newReward, status: e.target.value })}
                  className="modal-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowAddRewardModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Reward</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT LUCKY CHARM REWARD MODAL --- */}
      {editRewardItem && (
        <div className="admin-modal-overlay" onClick={() => setEditRewardItem(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Lucky Charm Reward</h3>
              <button className="close-btn" onClick={() => setEditRewardItem(null)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditLuckyRewardSubmit} className="modal-body-form">
              <div className="form-field">
                <label>Reward Name <span className="req">*</span></label>
                <input 
                  type="text" 
                  value={editRewardItem.rewardName}
                  onChange={(e) => setEditRewardItem({ ...editRewardItem, rewardName: e.target.value })}
                  required 
                  className="modal-input"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Reward Type</label>
                  <select 
                    value={editRewardItem.rewardType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setEditRewardItem({ 
                        ...editRewardItem, 
                        rewardType: type,
                        productId: '',
                        couponId: '',
                        rewardName: ''
                      });
                    }}
                    className="modal-input"
                  >
                    <option value="product">Product</option>
                    <option value="coupon">Coupon</option>
                  </select>
                </div>

                {editRewardItem.rewardType === 'product' ? (
                  <div className="form-field">
                    <label>Select Product <span className="req">*</span></label>
                    <select 
                      value={editRewardItem.productId || ''}
                      onChange={(e) => {
                        const prodId = e.target.value;
                        const prod = products.find(p => String(p.id) === String(prodId));
                        setEditRewardItem({ 
                          ...editRewardItem, 
                          productId: prodId,
                          rewardName: prod ? prod.name : editRewardItem.rewardName,
                          luckyPrice: prod ? prod.price : editRewardItem.luckyPrice
                        });
                      }}
                      required
                      className="modal-input"
                    >
                      <option value="">Select a Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-field">
                    <label>Select Coupon <span className="req">*</span></label>
                    <select 
                      value={editRewardItem.couponId || ''}
                      onChange={(e) => {
                        const cpCode = e.target.value;
                        const cp = coupons.find(c => c.code === cpCode);
                        setEditRewardItem({ 
                          ...editRewardItem, 
                          couponId: cpCode,
                          rewardName: cp ? `${cp.code} (${cp.discount})` : editRewardItem.rewardName
                        });
                      }}
                      required
                      className="modal-input"
                    >
                      <option value="">Select a Coupon...</option>
                      {coupons.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.discount})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-field-row">
                <div className="form-field">
                  <label>Chance Percentage (%) <span className="req">*</span></label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editRewardItem.chancePercentage}
                    onChange={(e) => setEditRewardItem({ ...editRewardItem, chancePercentage: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
                <div className="form-field">
                  <label>Lucky Stock <span className="req">*</span></label>
                  <input 
                    type="number"
                    min="0"
                    value={editRewardItem.luckyStock}
                    onChange={(e) => setEditRewardItem({ ...editRewardItem, luckyStock: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
              </div>

              {editRewardItem.rewardType === 'product' && (
                <div className="form-field">
                  <label>Lucky Price (₹) <span className="req">*</span></label>
                  <input 
                    type="number"
                    min="0"
                    value={editRewardItem.luckyPrice || ''}
                    onChange={(e) => setEditRewardItem({ ...editRewardItem, luckyPrice: e.target.value })}
                    required 
                    className="modal-input"
                  />
                </div>
              )}

              <div className="form-field-row">
                <div className="form-field">
                  <label>Start Date</label>
                  <input 
                    type="date"
                    value={editRewardItem.startDate ? editRewardItem.startDate.split('T')[0] : ''}
                    onChange={(e) => setEditRewardItem({ ...editRewardItem, startDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="form-field">
                  <label>End Date</label>
                  <input 
                    type="date"
                    value={editRewardItem.endDate ? editRewardItem.endDate.split('T')[0] : ''}
                    onChange={(e) => setEditRewardItem({ ...editRewardItem, endDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select 
                  value={editRewardItem.status}
                  onChange={(e) => setEditRewardItem({ ...editRewardItem, status: e.target.value })}
                  className="modal-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setEditRewardItem(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReplyReviewModal && replyReviewItem && (
        <div className="admin-modal-overlay" onClick={() => { setShowReplyReviewModal(false); setReplyReviewItem(null); }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Review Response Portal</h3>
              <button className="close-btn" onClick={() => { setShowReplyReviewModal(false); setReplyReviewItem(null); }}><X size={18} /></button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                apiService.moderateReview(replyReviewItem.id, { reply: reviewReplyText, status: 'Approved' }).then((updatedReview) => {
                  setReviews(reviews.map(r => r.id === replyReviewItem.id ? (updatedReview || { ...r, reply: reviewReplyText, status: 'Approved' }) : r));
                });
                setShowReplyReviewModal(false);
                setReplyReviewItem(null);
                setReviewReplyText('');
              }} 
              className="modal-body-form"
            >
              <div className="view-prod-details" style={{ paddingLeft: 0, marginBottom: '16px' }}>
                <h4 className="view-title" style={{ color: '#C59B6C' }}>Customer Review</h4>
                <div className="view-spec-table">
                  <div className="spec-row">
                    <span className="spec-lbl">Product:</span>
                    <span className="spec-val bold">{replyReviewItem.productName}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Customer:</span>
                    <span className="spec-val bold">{replyReviewItem.customerName}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Rating:</span>
                    <span className="spec-val bold text-orange">{replyReviewItem.rating} / 5 Stars</span>
                  </div>
                  <div className="spec-row" style={{ display: 'block', marginTop: '10px' }}>
                    <span className="spec-lbl" style={{ display: 'block', marginBottom: '4px' }}>Review Comment:</span>
                    <div className="spec-val" style={{ background: '#faf9f6', padding: '12px', borderRadius: '8px', border: '1px solid #eae6df', fontStyle: 'italic' }}>
                      "{replyReviewItem.comment}"
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label>Official Store Response <span className="req">*</span></label>
                <textarea 
                  value={reviewReplyText}
                  onChange={(e) => setReviewReplyText(e.target.value)}
                  placeholder="e.g. Thank you for your feedback! We are thrilled you liked the product..."
                  required 
                  rows="4"
                  className="modal-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-secondary" onClick={() => { setShowReplyReviewModal(false); setReplyReviewItem(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Post Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

