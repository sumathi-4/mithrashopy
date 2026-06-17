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
  Globe
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import kidsDressImg from '../assets/kids_tq_110.jpg';
import handbagImg from '../assets/hero_accessories.jpg';
import heroKidsImg from '../assets/hero_kids.jpg';
import heroGiftsImg from '../assets/hero_gifts.jpg';
import heroClothingImg from '../assets/hero_clothing.jpg';
import heroAccessoriesImg from '../assets/hero_accessories.jpg';
import heroStationeryImg from '../assets/hero_stationery.jpg';
import celebKidImg from '../assets/celeb_kid.jpg';
import celebKeerthyImg from '../assets/celeb_keerthy.jpg';
import celebDulquerImg from '../assets/celeb_dulquer.jpg';
import celebCoupleImg from '../assets/celeb_couple.jpg';

export default function AdminDashboard({ authUser, setAuthUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive UI Dropdowns
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  // Settings Sub-tab States
  const [settingsSubTab, setSettingsSubTab] = useState('store');
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
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [viewProductItem, setViewProductItem] = useState(null);
  const [editProductItem, setEditProductItem] = useState(null);

  // Products filtering & pagination states
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodCatalogueFilter, setProdCatalogueFilter] = useState('All Catalogues');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('All Categories');
  const [prodStatusFilter, setProdStatusFilter] = useState('Status');
  const [prodCurrentPage, setProdCurrentPage] = useState(1);

  // --- Core Mock States (Stored in localStorage or state) ---
  const [products, setProducts] = useState(() => {
    const local = localStorage.getItem('mithra_admin_products');
    let rawProducts = [];
    if (local) {
      try {
        rawProducts = JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    
    if (!rawProducts || rawProducts.length === 0) {
      rawProducts = [
        { id: 1, name: 'Kids Party Dress', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: 1299, stock: 25, sales: 120, status: 'Active', image: kidsDressImg },
        { id: 2, name: 'Women Kurti', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 899, stock: 40, sales: 48, status: 'Active', image: kidsDressImg },
        { id: 3, name: 'Premium Pen Set', category: 'Stationery', catalogue: 'Catalogue B', price: 299, stock: 100, sales: 32, status: 'Active', image: kidsDressImg },
        { id: 4, name: 'Birthday Gift Box', category: 'Gifts', catalogue: 'Catalogue B', price: 509, stock: 30, sales: 95, status: 'Active', image: handbagImg },
        { id: 5, name: 'Stylish Handbag', category: 'Accessories', catalogue: 'Catalogue B', price: 1499, stock: 5, sales: 150, status: 'Low Stock', image: handbagImg },
        
        { id: 6, name: 'Baby Cotton Frock', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: 799, stock: 15, sales: 40, status: 'Active', image: kidsDressImg },
        { id: 7, name: 'Floral Print Kurta', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 1199, stock: 18, sales: 55, status: 'Active', image: kidsDressImg },
        { id: 8, name: 'Executive Gel Pens', category: 'Stationery', catalogue: 'Catalogue B', price: 199, stock: 250, sales: 85, status: 'Active', image: kidsDressImg },
        { id: 9, name: 'Chocolate Hamper', category: 'Gifts', catalogue: 'Catalogue B', price: 899, stock: 50, sales: 60, status: 'Active', image: handbagImg },
        { id: 10, name: 'Leather Shoulder Bag', category: 'Accessories', catalogue: 'Catalogue B', price: 2499, stock: 8, sales: 75, status: 'Active', image: handbagImg },
        
        { id: 11, name: 'Girls Denim Jacket', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: 1599, stock: 12, sales: 30, status: 'Active', image: kidsDressImg },
        { id: 12, name: 'Silk Anarkali Suit', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 3499, stock: 22, sales: 90, status: 'Active', image: kidsDressImg },
        { id: 13, name: 'Calligraphy Ink Set', category: 'Stationery', catalogue: 'Catalogue B', price: 499, stock: 60, sales: 20, status: 'Active', image: kidsDressImg },
        { id: 14, name: 'Surprise Balloon Box', category: 'Gifts', catalogue: 'Catalogue B', price: 299, stock: 35, sales: 110, status: 'Active', image: handbagImg },
        { id: 15, name: 'Travel Backpack', category: 'Accessories', catalogue: 'Catalogue B', price: 1899, stock: 3, sales: 45, status: 'Low Stock', image: handbagImg },
        
        { id: 16, name: 'Toddler Jumpsuit', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: 649, stock: 20, sales: 25, status: 'Active', image: kidsDressImg },
        { id: 17, name: 'Designer Lehenga Choli', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 5999, stock: 10, sales: 65, status: 'Active', image: kidsDressImg },
        { id: 18, name: 'Sketch Pens Collection', category: 'Stationery', catalogue: 'Catalogue B', price: 349, stock: 120, sales: 50, status: 'Active', image: kidsDressImg },
        { id: 19, name: 'Personalized Photo Mug', category: 'Gifts', catalogue: 'Catalogue B', price: 399, stock: 45, sales: 140, status: 'Active', image: handbagImg },
        { id: 20, name: 'Elegant Clutch Purse', category: 'Accessories', catalogue: 'Catalogue B', price: 999, stock: 7, sales: 55, status: 'Active', image: handbagImg },
        
        { id: 21, name: 'Girls Summer Skirt', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: 499, stock: 30, sales: 35, status: 'Active', image: kidsDressImg },
        { id: 22, name: 'Cotton Daily Wear Kurti', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 599, stock: 60, sales: 120, status: 'Active', image: kidsDressImg },
        { id: 23, name: 'Fine Tip Fineliners', category: 'Stationery', catalogue: 'Catalogue B', price: 249, stock: 80, sales: 42, status: 'Active', image: kidsDressImg },
        { id: 24, name: 'Anniversary Gift Box', category: 'Gifts', catalogue: 'Catalogue B', price: 1299, stock: 14, sales: 30, status: 'Active', image: handbagImg },
        { id: 25, name: 'Canvas Tote Bag', category: 'Accessories', catalogue: 'Catalogue B', price: 799, stock: 4, sales: 88, status: 'Low Stock', image: handbagImg }
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
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: '', stock: '', status: 'Active' });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'Percentage', minCart: '', expiry: '', usageLimit: '500' });
  
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editCategoryItem, setEditCategoryItem] = useState(null);
  const [viewCategoryItem, setViewCategoryItem] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', parent: '—', count: 0, status: 'Active' });

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

  // Sync state with backend database on mount
  useEffect(() => {
    const syncBackendData = async () => {
      try {
        const prodData = await apiService.getProducts();
        if (prodData && prodData.length > 0) setProducts(prodData);
        
        const catData = await apiService.getCategories();
        if (catData && catData.length > 0) setCategories(catData);
        
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
      status: newCategory.status
    };

    try {
      const saved = await apiService.createCategory(catToAdd);
      setCategories([...categories, saved]);
    } catch (err) {
      setCategories([...categories, catToAdd]);
    }
    setShowAddCategoryModal(false);
    setNewCategory({ name: '', parent: '—', count: 0, status: 'Active' });
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
            status: editCategoryItem.status
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
            status: editCategoryItem.status
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
    if (activeTab === 'Profile') return '11. Profile';
    if (activeTab === 'Logout') return '12. Logout';
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

  // Handlers for Add/Edit/Delete Product Operations
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    
    const productToAdd = {
      name: newProduct.name,
      category: newProduct.category,
      catalogue: newProduct.catalogue,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10),
      sales: 0,
      status: newProduct.status,
      image: newProduct.category.includes('Clothing') ? 'Kids' : 'Accessories'
    };

    try {
      const saved = await apiService.createProduct(productToAdd);
      setProducts([saved, ...products]);
    } catch (err) {
      setProducts([{ ...productToAdd, id: Date.now() }, ...products]);
    }
    setShowAddProductModal(false);
    setNewProduct({ name: '', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: '', stock: '', status: 'Active' });
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editProductItem.name || !editProductItem.price || !editProductItem.stock) return;

    try {
      const saved = await apiService.updateProduct(editProductItem.id, editProductItem);
      setProducts(products.map(p => p.id === editProductItem.id ? saved : p));
    } catch (err) {
      setProducts(products.map(p => p.id === editProductItem.id ? {
        ...p,
        name: editProductItem.name,
        category: editProductItem.category,
        catalogue: editProductItem.catalogue,
        price: parseFloat(editProductItem.price),
        stock: parseInt(editProductItem.stock, 10),
        status: editProductItem.status
      } : p));
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
                    <h3 className="stat-val">₹2,45,000</h3>
                    <span className="stat-trend positive">▲ 12.5% vs last month</span>
                  </div>
                  <div className="stat-card-right red-badge">
                    <TrendingUp size={20} />
                  </div>
                </div>
                
                <div className="re-stat-card">
                  <div className="stat-card-left">
                    <span className="stat-lbl">Total Orders</span>
                    <h3 className="stat-val">542</h3>
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
                    <h3 className="stat-val">128</h3>
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
                          <stop offset="0%" stopColor="#EA6D26" stopOpacity="0.45"/>
                          <stop offset="100%" stopColor="#EA6D26" stopOpacity="0.00"/>
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
                        stroke="#EA6D26" 
                        strokeWidth="3.5"
                      />

                      {/* Interactive Dot Triggers */}
                      {chartPoints.map((pt, i) => {
                        const cx = 50 + i * 85;
                        const cy = 180 - (pt.value / 250000) * 160;
                        return (
                          <g key={pt.date} onMouseEnter={() => setHoveredPoint({ idx: i, cx, cy, label: pt.date, val: pt.value })} onMouseLeave={() => setHoveredPoint(null)}>
                            <circle cx={cx} cy={cy} r="5" fill="#fff" stroke="#EA6D26" strokeWidth="3.5" className="chart-dot" />
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
                          <circle cx={hoveredPoint.cx} cy={hoveredPoint.cy} r="8" fill="#EA6D26" opacity="0.3" />
                          <rect 
                            x={hoveredPoint.cx > 450 ? hoveredPoint.cx - 130 : hoveredPoint.cx + 10} 
                            y={hoveredPoint.cy - 35} 
                            width="120" 
                            height="50" 
                            rx="6" 
                            fill="#fff" 
                            stroke="#EA6D26" 
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
                    <span className="metric-val">₹2,45,000</span>
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
                              <img src={product.image} alt={product.name} className="table-prod-img" />
                            </td>
                            <td className="bold text-black">{product.name}</td>
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
                          <td colSpan="8" className="empty-table-cell">No products found matching filters.</td>
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
                    setNewCategory({ name: '', parent: '—', count: 0, status: 'Active' });
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
                            <td className="text-gray font-semibold">{cat.count}</td>
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
                                    count: cat.count,
                                    status: cat.status
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
                                count: cat.count,
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
                          <p className="cat-products-count">{cat.count} Products</p>
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
                          return matchesQuery && matchesStatus;
                        })
                        .map((order) => (
                          <tr key={order.id}>
                            <td className="bold-order-id">{order.id}</td>
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
                        return matchesQuery && matchesStatus;
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                                  color: banner.status === 'Active' ? '#76BA24' : '#ea4335'
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
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef0e6', color: '#ea6d26', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>1</span>
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                                  color: ann.status === 'Active' ? '#76BA24' : ann.status === 'Expired' ? '#ea4335' : '#777'
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
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef0e6', color: '#ea6d26', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>1</span>
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                                    color: q.status === 'Resolved' ? '#76BA24' : q.status === 'In Progress' ? '#ea6d26' : '#2b87e3'
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
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef0e6', color: '#ea6d26', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>1</span>
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
                                    fill={i < rev.rating ? '#ea6d26' : 'none'} 
                                    stroke={i < rev.rating ? '#ea6d26' : '#ccc'} 
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
                        <input type="text" defaultValue="Mithra Shopy" className="form-input-re" />
                      </div>
                      <div className="settings-field-box">
                        <label>Store Email</label>
                        <input type="email" defaultValue="info@mithrashopy.com" className="form-input-re" />
                      </div>
                      <div className="settings-field-box">
                        <label>Store Phone</label>
                        <input type="text" defaultValue="+91 98765 43210" className="form-input-re" />
                      </div>
                    </div>

                    <div className="settings-field-box full-width" style={{ marginTop: '20px' }}>
                      <label>Store Address</label>
                      <input type="text" defaultValue="123, Shop Street, Coimbatore, Tamil Nadu - 641001" className="form-input-re" />
                    </div>

                    <div className="settings-logo-upload-section" style={{ marginTop: '25px' }}>
                      <label className="logo-section-label">Store Logo</label>
                      <div className="logo-upload-row">
                        <div className="logo-preview-box">
                          <img src={logoImg} alt="Store Logo" className="logo-preview-img" style={{ maxHeight: '40px', objectFit: 'contain' }} />
                        </div>
                        <button className="change-logo-btn" onClick={() => alert('Change Logo triggered')}>
                          Change Logo
                        </button>
                      </div>
                    </div>

                    <div className="settings-action-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                      <button className="settings-save-btn" onClick={() => alert('Settings Saved successfully!')}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'shipping' && (
                  <div className="settings-form-content" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                            backgroundColor: shippingSettings.enableCod ? '#76BA24' : '#ccc',
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
                            backgroundColor: shippingSettings.enableExpress ? '#76BA24' : '#ccc',
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
                            backgroundColor: shippingSettings.enableInternational ? '#76BA24' : '#ccc',
                            transition: '0.3s', borderRadius: '34px',
                          }}>
                            <span style={{
                              position: 'absolute', content: '""', height: '18px', width: '18px', left: shippingSettings.enableInternational ? '26px' : '4px', bottom: '4px',
                              backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                            }}></span>
                          </span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="profile-change-photo-btn" onClick={() => alert('Cancel trigger')}>Cancel</button>
                        <button className="settings-save-btn" style={{ margin: 0 }} onClick={() => alert('Shipping Settings Saved successfully!')}>Save Changes</button>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSubTab === 'payment' && (
                  <div className="settings-form-content" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0f9eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                              backgroundColor: paymentSettings.cod ? '#76BA24' : '#ccc',
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
                              backgroundColor: paymentSettings.razorpay ? '#76BA24' : '#ccc',
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
                              backgroundColor: paymentSettings.upi ? '#76BA24' : '#ccc',
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
                              backgroundColor: paymentSettings.stripe ? '#76BA24' : '#ccc',
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
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff5ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea6d26' }}>
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
                              backgroundColor: paymentSettings.bankTransfer ? '#76BA24' : '#ccc',
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
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                          style={{ backgroundColor: '#76BA24', color: '#fff', margin: 0 }}
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
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(118, 186, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                        <div className="profile-large-avatar" style={{ backgroundColor: 'var(--color-primary, #76BA24)' }}>
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(118, 186, 36, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #76BA24)' }}>
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(118, 186, 36, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #76BA24)' }}>
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
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff5ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea6d26' }}>
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
                              backgroundColor: securitySettings.twoFactor ? '#76BA24' : '#ccc',
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
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0f9eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#76BA24' }}>
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
                              backgroundColor: securitySettings.loginAlerts ? '#76BA24' : '#ccc',
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
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff9e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f58220' }}>
                              <Settings size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Active Sessions</h4>
                              <p style={{ fontSize: '0.82rem', color: '#777', margin: '4px 0 0 0' }}>Manage your active sessions</p>
                            </div>
                          </div>
                          <button 
                            style={{ padding: '8px 20px', backgroundColor: '#eef6e6', color: '#76BA24', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
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
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light, rgba(118, 186, 36, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #76BA24)' }}>
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
                                    color: history.status === 'Success' ? '#76BA24' : '#ea4335'
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
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddProductSubmit} className="modal-body-form">
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
              </div>

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

              <div className="modal-actions-row">
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
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>Edit Product Details</h3>
              <button className="close-btn" onClick={() => setEditProductItem(null)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditProductSubmit} className="modal-body-form">
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
              </div>

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

              <div className="modal-actions-row">
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
            
            <div className="modal-body-view">
              <div className="view-prod-img-wrap">
                <img src={viewProductItem.image} alt={viewProductItem.name} className="view-img" />
              </div>
              <div className="view-prod-details">
                <h4 className="view-title">{viewProductItem.name}</h4>
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
              
              <div className="modal-actions-row">
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
                <h4 className="view-title" style={{ color: '#ea6d26' }}>{viewCategoryItem.name}</h4>
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
                    <span className="spec-val bold text-orange">{viewCategoryItem.count || 0} products</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-lbl">Status:</span>
                    <span className={`status-badge-re ${(viewCategoryItem.status || 'Active').toLowerCase()}`}>{viewCategoryItem.status || 'Active'}</span>
                  </div>
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
                <h4 className="view-title" style={{ color: '#ea6d26' }}>{viewCatalogueItem.name}</h4>
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
                <h4 className="view-title" style={{ color: '#ea6d26' }}>{viewOrderItem.id} Details</h4>
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
                <h4 className="view-title" style={{ color: '#ea6d26' }}>Inquiry Details</h4>
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
                <h4 className="view-title" style={{ color: '#ea6d26' }}>Customer Review</h4>
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
