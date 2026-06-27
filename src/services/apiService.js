const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper: Get JWT token from local storage
function getStoredToken() {
  return localStorage.getItem('mithira_auth_token');
}

// Check connectivity to the backend
let isBackendReachable = true;

async function checkBackendStatus() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
    isBackendReachable = res.ok;
  } catch {
    isBackendReachable = false;
  }
}

// Perform health check on initialization
checkBackendStatus();
// Re-check periodically
setInterval(checkBackendStatus, 15000);

// Base fetch wrapper
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const options = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    isBackendReachable = true;
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed.');
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      isBackendReachable = false;
    }
    throw err;
  }
}

export const apiService = {
  // Check if server is running
  isOnline() {
    return isBackendReachable;
  },

  // ─── Products ───
  async getProducts() {
    try {
      const res = await apiRequest('/api/products');
      return res.products;
    } catch (err) {
      console.warn('Backend products offline, loading local products...');
      const local = localStorage.getItem('mithra_admin_products');
      return local ? JSON.parse(local) : [];
    }
  },

  async createProduct(product) {
    try {
      const res = await apiRequest('/api/products', 'POST', product);
      return res.product;
    } catch (err) {
      if (isBackendReachable) throw err;
      return { ...product, id: Date.now(), sales: 0 };
    }
  },

  async updateProduct(id, product) {
    try {
      const res = await apiRequest(`/api/products/${id}`, 'PUT', product);
      return res.product;
    } catch (err) {
      if (isBackendReachable) throw err;
      return product;
    }
  },

  async deleteProduct(id) {
    try {
      await apiRequest(`/api/products/${id}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  // ─── Categories ───
  async getCategories() {
    try {
      const res = await apiRequest('/api/categories');
      return res.categories;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_categories');
      return local ? JSON.parse(local) : [];
    }
  },

  async createCategory(category) {
    try {
      const res = await apiRequest('/api/categories', 'POST', category);
      return res.category;
    } catch (err) {
      if (isBackendReachable) throw err;
      return category;
    }
  },

  async updateCategory(name, category) {
    try {
      await apiRequest(`/api/categories/${name}`, 'PUT', category);
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  async deleteCategory(name) {
    try {
      await apiRequest(`/api/categories/${name}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  // ─── Catalogues ───
  async getCatalogues() {
    try {
      const res = await apiRequest('/api/catalogues');
      return res.catalogues;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_catalogues');
      return local ? JSON.parse(local) : [];
    }
  },

  async createCatalogue(catalogue) {
    try {
      const res = await apiRequest('/api/catalogues', 'POST', catalogue);
      return res.catalogue;
    } catch (err) {
      if (isBackendReachable) throw err;
      return catalogue;
    }
  },

  async updateCatalogue(name, catalogue) {
    try {
      const res = await apiRequest(`/api/catalogues/${name}`, 'PUT', catalogue);
      return res.catalogue;
    } catch (err) {
      if (isBackendReachable) throw err;
      return catalogue;
    }
  },

  async deleteCatalogue(name) {
    try {
      await apiRequest(`/api/catalogues/${name}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  // ─── Coupons ───
  async getCoupons() {
    try {
      const res = await apiRequest('/api/coupons');
      return res.coupons;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_coupons');
      return local ? JSON.parse(local) : [];
    }
  },

  async createCoupon(coupon) {
    try {
      const res = await apiRequest('/api/coupons', 'POST', coupon);
      return res.coupon;
    } catch (err) {
      if (isBackendReachable) throw err;
      return coupon;
    }
  },

  async updateCoupon(code, coupon) {
    try {
      const res = await apiRequest(`/api/coupons/${code}`, 'PUT', coupon);
      return res.coupon;
    } catch (err) {
      if (isBackendReachable) throw err;
      return coupon;
    }
  },

  async deleteCoupon(code) {
    try {
      await apiRequest(`/api/coupons/${code}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  // ─── Settings ───
  async getSettings() {
    try {
      const res = await apiRequest('/api/settings');
      return res.settings;
    } catch (err) {
      return {
        storeName: 'MithiraShoppy Official',
        supportEmail: 'support@mithirashoppy.com',
        taxPercentage: 18,
        defaultCurrency: 'INR'
      };
    }
  },

  async updateSettings(settings) {
    try {
      const res = await apiRequest('/api/settings', 'PUT', settings);
      return res.settings;
    } catch (err) {
      if (isBackendReachable) throw err;
      return settings;
    }
  },

  // ─── Reviews ───
  async getReviews() {
    try {
      const res = await apiRequest('/api/reviews');
      return res.reviews;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_reviews');
      return local ? JSON.parse(local) : [];
    }
  },

  async submitReview(review) {
    try {
      const res = await apiRequest('/api/reviews', 'POST', review);
      return res.review;
    } catch (err) {
      if (isBackendReachable) throw err;
      return { ...review, id: Date.now(), customerName: 'Customer', date: 'Jun 28, 2025', status: 'Pending', reply: '' };
    }
  },

  async moderateReview(id, data) {
    try {
      const res = await apiRequest(`/api/reviews/${id}`, 'PUT', data);
      return res.review;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async deleteReview(id) {
    try {
      await apiRequest(`/api/reviews/${id}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  // ─── Orders ───
  async getOrders() {
    try {
      const res = await apiRequest('/api/orders');
      return res.orders;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_orders');
      return local ? JSON.parse(local) : [];
    }
  },

  async createOrder(order) {
    try {
      const res = await apiRequest('/api/orders', 'POST', order);
      return res;
    } catch (err) {
      if (isBackendReachable) throw err;
      return { success: true, order: { ...order, id: '#ORD' + Math.floor(1000 + Math.random() * 9000), date: 'Jun 28, 2025', status: 'Pending' } };
    }
  },

  async verifyPayment(verificationPayload) {
    try {
      const res = await apiRequest('/api/orders/verify', 'POST', verificationPayload);
      return res;
    } catch (err) {
      if (isBackendReachable) throw err;
      return { success: true, order: { id: verificationPayload.orderId, status: 'Processing', payment: 'Razorpay' } };
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const res = await apiRequest(`/api/orders/${id}`, 'PUT', { status });
      return res.order;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async deleteOrder(id) {
    try {
      await apiRequest(`/api/orders/${id}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  // ─── User Profile & Addresses & Cart & Wishlist ───
  async getMe() {
    try {
      const res = await apiRequest('/api/auth/me');
      return res.user;
    } catch (err) {
      return null;
    }
  },

  async updateProfile(profile) {
    try {
      const res = await apiRequest('/api/user/profile', 'PUT', profile);
      return res.user;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async changePassword(passwords) {
    try {
      await apiRequest('/api/user/password', 'PUT', passwords);
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return false;
    }
  },

  async getAddresses() {
    try {
      const res = await apiRequest('/api/user/addresses');
      return res.addresses;
    } catch (err) {
      return null;
    }
  },

  async addAddress(address) {
    try {
      const res = await apiRequest('/api/user/addresses', 'POST', address);
      return res.addresses;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async editAddress(id, address) {
    try {
      const res = await apiRequest(`/api/user/addresses/${id}`, 'PUT', address);
      return res.addresses;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async deleteAddress(id) {
    try {
      const res = await apiRequest(`/api/user/addresses/${id}`, 'DELETE');
      return res.addresses;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async syncCart(cart, cartItems = null) {
    try {
      const res = await apiRequest('/api/user/cart', 'POST', { cart, cartItems });
      return res;
    } catch (err) {
      return { success: false, cart, cartItems };
    }
  },

  async syncWishlist(wishlist) {
    try {
      const res = await apiRequest('/api/user/wishlist', 'POST', { wishlist });
      return res.wishlist;
    } catch (err) {
      return wishlist;
    }
  },

  // ─── Marketing: Banners & Announcements & Inquiries ───
  async getBanners() {
    try {
      const res = await apiRequest('/api/marketing/banners');
      return res.banners;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_banners');
      return local ? JSON.parse(local) : [];
    }
  },

  async createBanner(banner) {
    try {
      const res = await apiRequest('/api/marketing/banners', 'POST', banner);
      return res.banner;
    } catch (err) {
      if (isBackendReachable) throw err;
      return banner;
    }
  },

  async toggleBanner(id) {
    try {
      const res = await apiRequest(`/api/marketing/banners/${id}`, 'PUT');
      return res.banner;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async deleteBanner(id) {
    try {
      await apiRequest(`/api/marketing/banners/${id}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  async getAnnouncements() {
    try {
      const res = await apiRequest('/api/marketing/announcements');
      return res.announcements;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_announcements');
      return local ? JSON.parse(local) : [];
    }
  },

  async createAnnouncement(ann) {
    try {
      const res = await apiRequest('/api/marketing/announcements', 'POST', ann);
      return res.announcement;
    } catch (err) {
      if (isBackendReachable) throw err;
      return ann;
    }
  },

  async toggleAnnouncement(id) {
    try {
      const res = await apiRequest(`/api/marketing/announcements/${id}`, 'PUT');
      return res.announcement;
    } catch (err) {
      if (isBackendReachable) throw err;
      return null;
    }
  },

  async deleteAnnouncement(id) {
    try {
      await apiRequest(`/api/marketing/announcements/${id}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  async getContactQueries() {
    try {
      const res = await apiRequest('/api/marketing/queries');
      return res.queries;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_contact_queries');
      return local ? JSON.parse(local) : [];
    }
  },

  async postContactQuery(query) {
    try {
      await apiRequest('/api/marketing/queries', 'POST', query);
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  async replyContactQuery(id, replyText) {
    try {
      await apiRequest(`/api/marketing/queries/${id}`, 'PUT', { replyText });
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  async deleteContactQuery(id) {
    try {
      await apiRequest(`/api/marketing/queries/${id}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      return true;
    }
  },

  // ─── Features (Website Functionalities) ───
  async getFeatures() {
    try {
      const res = await apiRequest('/api/features');
      return res.features;
    } catch (err) {
      const local = localStorage.getItem('mithra_admin_features');
      if (local) {
        return JSON.parse(local);
      }
      const defaultFeatures = [
        { id: 1, key: 'hero', name: 'Hero Carousel', title: 'Curated Elegance', subtitle: 'Explore Mithira Shopy collections', status: 'Active', order: 1 },
        { id: 2, key: 'trust_bar', name: 'Trust Bar', title: 'Why You Can Trust Us', subtitle: 'Our commitments to you', status: 'Active', order: 2 },
        { id: 3, key: 'categories', name: 'Shop by Top Categories', title: 'Shop by Top Categories', subtitle: 'Explore our top categories and find your perfect style', status: 'Active', order: 3 },
        { id: 4, key: 'video_showcase', name: 'Video Showcase', title: 'Video Tour', subtitle: 'Take a virtual look inside our boutique', status: 'Active', order: 4 },
        { id: 5, key: 'exclusive_products', name: 'Exclusive Products', title: 'Exclusive Collection', subtitle: 'Handpicked premium fashion boutique items', status: 'Active', order: 5 },
        { id: 6, key: 'celebrity_collection', name: 'Celebrity Collection', title: 'Celebrity Collections', subtitle: 'Inspired by leading fashion influencers', status: 'Active', order: 6 },
        { id: 7, key: 'why_choose_us', name: 'Why Choose Us', title: 'Why Choose Mithra Shopy', subtitle: 'Direct-from-weaver premium quality items', status: 'Active', order: 7 }
      ];
      localStorage.setItem('mithra_admin_features', JSON.stringify(defaultFeatures));
      return defaultFeatures;
    }
  },

  async createFeature(feature) {
    try {
      const res = await apiRequest('/api/features', 'POST', feature);
      return res.feature;
    } catch (err) {
      if (isBackendReachable) throw err;
      const local = localStorage.getItem('mithra_admin_features');
      const list = local ? JSON.parse(local) : [];
      const nextId = list.reduce((max, f) => f.id > max ? f.id : max, 0) + 1;
      const newFeature = {
        ...feature,
        id: nextId,
        key: feature.key.trim().toLowerCase().replace(/\s+/g, '_'),
        status: feature.status || 'Active',
        order: feature.order !== undefined ? parseInt(feature.order, 10) : list.length + 1
      };
      list.push(newFeature);
      localStorage.setItem('mithra_admin_features', JSON.stringify(list));
      return newFeature;
    }
  },

  async updateFeature(id, feature) {
    try {
      const res = await apiRequest(`/api/features/${id}`, 'PUT', feature);
      return res.feature;
    } catch (err) {
      if (isBackendReachable) throw err;
      const local = localStorage.getItem('mithra_admin_features');
      let list = local ? JSON.parse(local) : [];
      list = list.map(f => f.id === id ? { ...f, ...feature } : f);
      localStorage.setItem('mithra_admin_features', JSON.stringify(list));
      return { id, ...feature };
    }
  },

  async deleteFeature(id) {
    try {
      await apiRequest(`/api/features/${id}`, 'DELETE');
      return true;
    } catch (err) {
      if (isBackendReachable) throw err;
      const local = localStorage.getItem('mithra_admin_features');
      let list = local ? JSON.parse(local) : [];
      list = list.filter(f => f.id !== id);
      localStorage.setItem('mithra_admin_features', JSON.stringify(list));
      return true;
    }
  },

  async uploadImage(filename, base64Data) {
    try {
      const res = await apiRequest('/api/upload', 'POST', { filename, base64Data });
      return res.url;
    } catch (err) {
      console.error('File upload error, returning mock URL');
      return `https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80`;
    }
  },

  // ─── Lucky Charm Endpoints ──────────────────────────────────────────────
  async checkLuckyCharmEligibility(cartItems = []) {
    try {
      return await apiRequest('/api/lucky-charms/check-eligibility', 'POST', { cartItems });
    } catch (err) {
      console.warn('Backend offline, loading mock lucky rewards...');
      return {
        success: true,
        available: true,
        sessionId: 'mock_session_' + Date.now(),
        rewards: [
          { _id: '1', rewardName: 'Premium Leather Diary', rewardType: 'product', productId: 111, luckyStock: 50, luckyPrice: 0, image: 'Stationery', value: 0 },
          { _id: '2', rewardName: 'Boho Necklace', rewardType: 'product', productId: 118, luckyStock: 40, luckyPrice: 0, image: 'Accessories', value: 0 },
          { _id: '3', rewardName: 'Bridal Floral Hair Accessory', rewardType: 'product', productId: 115, luckyStock: 30, luckyPrice: 0, image: 'Accessories', value: 0 }
        ],
        campaign: { campaignName: 'Mock Campaign', rewardBudget: 500, wheelProductCount: 3 }
      };
    }
  },

  async spinLuckyCharm(sessionId, cartItems = []) {
    try {
      return await apiRequest('/api/lucky-charms/spin', 'POST', { sessionId, cartItems });
    } catch (err) {
      console.warn('Backend offline, returning mock win');
      return {
        success: true,
        won: true,
        reward: {
          id: 111,
          rewardName: 'Premium Leather Diary',
          rewardType: 'product',
          productId: 111,
          rewardValue: 0,
          image: 'Stationery'
        },
        claimId: 'mock_claim_' + Date.now()
      };
    }
  },

  // ─── Customer Dashboard Extra Hookups ───
  async cancelOrder(id) {
    try {
      return await apiRequest(`/api/orders/${id}/cancel`, 'PUT');
    } catch (err) {
      if (isBackendReachable) throw err;
      return { success: true };
    }
  },

  async getMyReviews() {
    try {
      const res = await apiRequest('/api/reviews/my-reviews');
      return res.reviews;
    } catch (err) {
      return [];
    }
  },

  async getMyClaims() {
    try {
      const res = await apiRequest('/api/lucky-charms/my-claims');
      return res.claims;
    } catch (err) {
      return [];
    }
  }
};
