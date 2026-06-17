import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  LogOut, 
  Sparkles,
  Camera
} from 'lucide-react';

export default function UserAccount({ authUser, setAuthUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ordersFilter, setOrdersFilter] = useState('all');

  const handleLogout = () => {
    localStorage.removeItem('mithira_auth_token');
    localStorage.removeItem('mithira_auth_user');
    setAuthUser(null);
    if (onNavigate) onNavigate('/');
  };

  // Static stats matching image card values
  const stats = [
    { label: 'Total Orders', value: '12', linkText: 'View all orders', tab: 'orders', color: '#8A72F6', icon: <ShoppingBag size={20} className="ua-card-icon-purple" /> },
    { label: 'Wishlist', value: '8', linkText: 'View wishlist', tab: 'wishlist', color: '#E94FA8', icon: <Heart size={20} className="ua-card-icon-pink" /> },
    { label: 'Saved Addresses', value: '3', linkText: 'Manage addresses', tab: 'addresses', color: '#E94FA8', icon: <Heart size={20} className="ua-card-icon-red" /> },
    { label: 'Reward Points', value: '250', linkText: 'View rewards', tab: 'rewards', color: '#F2994A', icon: <Sparkles size={20} className="ua-card-icon-orange" /> }
  ];

  // Dummy full orders with actual details & status styling to replicate image exactly
  const allOrdersList = [
    {
      id: '1001',
      date: '12 May, 2025',
      itemsCount: 3,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80',
      title: 'Floral Printed Anarkali Suit',
      price: '₹4,698',
      status: 'Delivered',
      statusDate: '16 May, 2025',
      statusColorClass: 'ua-status-delivered',
      category: 'delivered'
    },
    {
      id: '1002',
      date: '09 May, 2025',
      itemsCount: 2,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80',
      title: 'Premium Silk Saree',
      price: '₹3,499',
      status: 'Shipped',
      statusDate: '11 May, 2025',
      statusColorClass: 'ua-status-shipped',
      category: 'shipped'
    },
    {
      id: '1003',
      date: '05 May, 2025',
      itemsCount: 1,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=150&q=80',
      title: 'Designer Party Gown',
      price: '₹2,999',
      status: 'Processing',
      statusDate: 'Expected by 18 May, 2025',
      statusColorClass: 'ua-status-processing',
      category: 'processing'
    },
    {
      id: '1004',
      date: '01 May, 2025',
      itemsCount: 1,
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=150&q=80',
      title: 'Cotton Printed Kurtis',
      price: '₹1,299',
      status: 'Cancelled',
      statusDate: 'Cancelled on 02 May, 2025',
      statusColorClass: 'ua-status-cancelled',
      category: 'cancelled'
    }
  ];

  // Wishlist Items State
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 'w1',
      title: 'Floral Printed Anarkali Suit',
      price: '₹2,199',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'w2',
      title: 'Premium Silk Saree',
      price: '₹3,499',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'w3',
      title: 'Designer Party Gown',
      price: '₹2,999',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'w4',
      title: 'Embroidered Lehenga',
      price: '₹4,799',
      image: 'https://images.unsplash.com/photo-1610030470217-48f86bb98330?auto=format&fit=crop&w=300&q=80'
    }
  ]);

  const handleRemoveFromWishlist = (itemId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    if (authUser) {
      const updatedIds = (authUser.wishlist || []).filter(id => id !== itemId);
      apiService.syncWishlist(updatedIds).then(res => {
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

  // Addresses List State
  const [addresses, setAddresses] = useState([
    {
      id: 'a1',
      type: 'Home',
      isDefault: true,
      name: 'Sumati Reddy',
      phone: '+91 98765 43210',
      street: '12-5-31/1, Street No. 5',
      locality: 'Madhapur',
      city: 'Hyderabad',
      pincode: '500081',
      state: 'Telangana',
      country: 'India'
    },
    {
      id: 'a2',
      type: 'Office',
      isDefault: false,
      name: 'Sumati Reddy',
      phone: '+91 98765 43210',
      street: 'Mithra Shopy Office, HiTech City Road',
      locality: 'Kondapur',
      city: 'Hyderabad',
      pincode: '500084',
      state: 'Telangana',
      country: 'India'
    },
    {
      id: 'a3',
      type: 'Other',
      isDefault: false,
      name: 'Sumati Reddy',
      phone: '+91 98765 43210',
      street: '8-2-293/82, Road No. 10',
      locality: 'Banjara Hills',
      city: 'Hyderabad',
      pincode: '500034',
      state: 'Telangana',
      country: 'India'
    }
  ]);

  // Modal and Form Address State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    isDefault: false,
    name: 'Sumati Reddy',
    phone: '+91 98765 43210',
    street: '',
    locality: '',
    city: 'Hyderabad',
    pincode: '',
    state: 'Telangana',
    country: 'India'
  });

  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    apiService.getProducts().then(prods => {
      if (prods && prods.length > 0) {
        setAllProducts(prods);
      }
    });
  }, []);

  useEffect(() => {
    if (authUser) {
      apiService.getAddresses().then(data => {
        if (data && data.length > 0) {
          setAddresses(data);
        }
      });
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      setProfileForm(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        dob: authUser.dob || '15/08/1995',
        gender: authUser.gender || 'Female'
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser && allProducts.length > 0) {
      const ids = authUser.wishlist || [];
      const resolved = allProducts.filter(p => ids.includes(p.id));
      setWishlistItems(resolved.map(p => ({
        id: p.id,
        title: p.title,
        price: '₹' + p.price,
        image: p.image
      })));
    }
  }, [authUser, allProducts]);

  const handleOpenAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({ ...address });
    } else {
      setEditingAddress(null);
      setAddressForm({
        type: 'Home',
        isDefault: false,
        name: authUser?.name || 'Sumati Reddy',
        phone: authUser?.phone || '+91 98765 43210',
        street: '',
        locality: '',
        city: 'Hyderabad',
        pincode: '',
        state: 'Telangana',
        country: 'India'
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (addressId) => {
    apiService.deleteAddress(addressId).then(updated => {
      setAddresses(prev => updated || prev.filter(addr => addr.id !== addressId));
    });
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (editingAddress) {
      apiService.editAddress(editingAddress.id, addressForm).then(updated => {
        if (updated) {
          setAddresses(updated);
        } else {
          setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? { ...addressForm } : addr));
        }
      });
    } else {
      apiService.addAddress(addressForm).then(updated => {
        if (updated) {
          setAddresses(updated);
        } else {
          const newAddress = {
            ...addressForm,
            id: 'addr_' + Date.now()
          };
          setAddresses(prev => [...prev, newAddress]);
        }
      });
    }
    setIsAddressModalOpen(false);
  };

  const filteredOrders = allOrdersList.filter(order => {
    if (ordersFilter === 'all') return true;
    return order.category === ordersFilter;
  });

  const getFilterCounts = (cat) => {
    if (cat === 'all') return allOrdersList.length;
    return allOrdersList.filter(o => o.category === cat).length;
  };

  const recentOrders = allOrdersList.slice(0, 3);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: authUser?.name || 'Sumati Reddy',
    email: authUser?.email || 'sumati.reddy@gmail.com',
    phone: authUser?.phone || '+91 98765 43210',
    dob: '15/08/1995',
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    apiService.updateProfile({
      name: profileForm.name,
      phone: profileForm.phone,
      dob: profileForm.dob,
      gender: profileForm.gender
    }).then(updatedUser => {
      if (updatedUser) {
        setAuthUser(updatedUser);
        localStorage.setItem('mithira_auth_user', JSON.stringify(updatedUser));
      } else if (setAuthUser) {
        setAuthUser(prev => ({
          ...prev,
          name: profileForm.name,
          phone: profileForm.phone
        }));
      }
      alert('Profile updated successfully!');
    });
  };

  // Security Password State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert('New password and confirm password do not match.');
      return;
    }
    apiService.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new
    }).then(success => {
      if (success) {
        alert('Password updated successfully!');
        setPasswordForm({ current: '', new: '', confirm: '' });
      } else {
        alert('Failed to update password. Please verify current password.');
      }
    });
  };

  // Danger Zone Delete State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const handleDeleteAccountAction = () => {
    if (deleteConfirmText === 'DELETE') {
      const confirmDelete = window.confirm('Are you absolutely sure you want to permanently delete your account? This action cannot be undone.');
      if (confirmDelete) {
        localStorage.removeItem('mithira_auth_token');
        localStorage.removeItem('mithira_auth_user');
        setAuthUser(null);
        if (onNavigate) onNavigate('/');
      }
    }
  };

  return (
    <div className="ua-account-page">
      <div className="ua-container">
        
        {/* Left Profile Sidebar */}
        <aside className="ua-sidebar">
          <div className="ua-profile-card">
            <div className="ua-avatar-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" 
                alt="Profile Avatar" 
                className="ua-avatar"
              />
              <button className="ua-camera-btn" aria-label="Upload photo">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="ua-user-name">{authUser?.name || 'Sumati Reddy'}</h2>
            <p className="ua-user-email">{authUser?.email || 'sumati.reddy@gmail.com'}</p>
          </div>

          <nav className="ua-nav">
            <button 
              className={`ua-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <User size={18} />
              <span>Dashboard</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={18} />
              <span>My Orders</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Heart size={18} />
              <span>Wishlist</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={18} />
              <span>Addresses</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Settings size={18} />
              <span>Profile Settings</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <ShieldCheck size={18} />
              <span>Security</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              <AlertTriangle size={18} />
              <span>Delete Account</span>
            </button>
            
            <div className="ua-nav-divider" />
            
            <button className="ua-nav-item ua-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Right Dashboard Area */}
        <main className="ua-main-content">
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="ua-welcome-section">
                <h1 className="ua-welcome-title">Welcome back, {authUser?.name?.split(' ')[0] || 'Sumati'}! 👋</h1>
                <p className="ua-welcome-subtitle">Here's what's happening with your account today.</p>
              </div>

              {/* Stats Cards Row */}
              <div className="ua-stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="ua-stat-card">
                    <div className="ua-stat-header">
                      <div className="ua-card-icon-box">
                        {stat.icon}
                      </div>
                      <div className="ua-stat-info">
                        <span className="ua-stat-label" style={{ color: stat.color }}>{stat.label}</span>
                        <span className="ua-stat-value">{stat.value}</span>
                      </div>
                    </div>
                    <button 
                      className="ua-stat-action" 
                      style={{ color: stat.color }}
                      onClick={() => setActiveTab(stat.tab)}
                    >
                      {stat.linkText}
                    </button>
                  </div>
                ))}
              </div>

              {/* Recent Orders Section */}
              <div className="ua-orders-section">
                <div className="ua-section-header">
                  <h3 className="ua-section-title">Recent Orders</h3>
                  <button className="ua-view-all-link" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </button>
                </div>

                <div className="ua-orders-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="ua-order-row">
                      <div className="ua-order-meta">
                        <div className="ua-order-icon-bg">
                          <ShoppingBag size={20} className="ua-order-icon-svg" />
                        </div>
                        <div>
                          <h4 className="ua-order-number">Order #{order.id}</h4>
                          <p className="ua-order-date">Placed on {order.date}</p>
                        </div>
                      </div>

                      <div className="ua-order-product">
                        <img src={order.image} alt={order.title} className="ua-product-thumbnail" />
                        <div>
                          <h5 className="ua-product-name">{order.title}</h5>
                          <p className="ua-product-price">{order.price}</p>
                        </div>
                      </div>

                      <div className="ua-order-status">
                        <span className={`ua-status-badge ${order.statusColorClass}`}>
                          {order.status}
                        </span>
                        <p className="ua-status-time">
                          {order.status === 'Delivered' ? `on ${order.statusDate}` : 
                           order.status === 'Shipped' ? `on ${order.statusDate}` : 
                           order.statusDate}
                        </p>
                      </div>

                      <div className="ua-order-actions">
                        {order.status === 'Shipped' ? (
                          <button className="ua-btn-secondary tracking-btn">
                            Track Order
                          </button>
                        ) : (
                          <button className="ua-btn-secondary">
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="ua-my-orders-view">
              <div className="ua-orders-header">
                <h2 className="ua-orders-main-title">My Orders</h2>
                <p className="ua-orders-main-sub">Track, return or buy items again</p>
              </div>

              {/* Sub-Filters Tabs Bar */}
              <div className="ua-orders-tabs">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'delivered', label: 'Delivered' },
                  { id: 'shipped', label: 'Shipped' },
                  { id: 'processing', label: 'Processing' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`ua-order-tab-btn ${ordersFilter === tab.id ? 'active' : ''}`}
                    onClick={() => setOrdersFilter(tab.id)}
                  >
                    {tab.label} ({getFilterCounts(tab.id)})
                  </button>
                ))}
              </div>

              {/* Orders List Content */}
              <div className="ua-orders-container">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <div key={order.id} className="ua-order-detail-card">
                      
                      {/* Product details and image */}
                      <div className="ua-od-left">
                        <img src={order.image} alt={order.title} className="ua-od-img" />
                        <div className="ua-od-info">
                          <h4 className="ua-od-number">Order #{order.id}</h4>
                          <span className="ua-od-meta">{order.date}  •  {order.itemsCount} {order.itemsCount > 1 ? 'items' : 'item'}</span>
                          <span className="ua-od-price">{order.price}</span>
                        </div>
                      </div>

                      {/* Delivery Status and timing */}
                      <div className="ua-od-middle">
                        <span className={`ua-status-badge ${order.statusColorClass}`}>
                          {order.status}
                        </span>
                        <p className="ua-od-status-date">
                          {order.status === 'Delivered' ? `Delivered on ${order.statusDate.split('on ')[1] || order.statusDate}` :
                           order.status === 'Shipped' ? `Shipped on ${order.statusDate.split('on ')[1] || order.statusDate}` :
                           order.statusDate}
                        </p>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="ua-od-right">
                        <button className="ua-od-action-btn btn-view-details">
                          View Details
                        </button>

                        {order.status === 'Delivered' && (
                          <>
                            <button className="ua-od-action-btn btn-secondary-action">
                              Download Invoice
                            </button>
                            <button className="ua-od-action-btn btn-reorder">
                              Reorder
                            </button>
                          </>
                        )}

                        {order.status === 'Shipped' && (
                          <>
                            <button className="ua-od-action-btn btn-secondary-action">
                              Track Order
                            </button>
                            <button className="ua-od-action-btn btn-reorder">
                              Reorder
                            </button>
                          </>
                        )}

                        {order.status === 'Processing' && (
                          <button className="ua-od-action-btn btn-cancel-order">
                            Cancel Order
                          </button>
                        )}
                        
                        {order.status === 'Cancelled' && (
                          <button className="ua-od-action-btn btn-reorder">
                            Reorder
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="ua-orders-empty-state">
                    <ShoppingBag size={48} />
                    <p>No orders found matching this filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="ua-wishlist-view">
              <div className="ua-wishlist-header">
                <h2 className="ua-wishlist-title">My Wishlist ({wishlistItems.length})</h2>
                <p className="ua-wishlist-sub">Items you have saved for later</p>
              </div>

              {wishlistItems.length > 0 ? (
                <>
                  <div className="ua-wishlist-grid">
                    {wishlistItems.map(item => (
                      <div key={item.id} className="ua-wishlist-card">
                        <div className="ua-wl-img-wrapper">
                          <img src={item.image} alt={item.title} className="ua-wl-img" />
                          <button 
                            className="ua-wl-heart-btn" 
                            aria-label="Remove from Wishlist"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                          >
                            <Heart size={16} fill="#E94FA8" stroke="#E94FA8" />
                          </button>
                        </div>
                        <div className="ua-wl-info">
                          <h4 className="ua-wl-name">{item.title}</h4>
                          <span className="ua-wl-price">{item.price}</span>
                        </div>
                        <div className="ua-wl-actions">
                          <button 
                            className="ua-wl-btn-add-cart"
                            onClick={() => {
                              if (authUser) {
                                const currentCart = authUser.cart || [];
                                if (!currentCart.includes(item.id)) {
                                  const updatedCart = [...currentCart, item.id];
                                  apiService.syncCart(updatedCart).then(res => {
                                    if (res && setAuthUser) {
                                      setAuthUser(prev => {
                                        const newUser = { ...prev, cart: res };
                                        localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
                                        return newUser;
                                      });
                                    }
                                  });
                                }
                                alert(`Added ${item.title} to cart!`);
                              }
                            }}
                          >
                            Add to Cart
                          </button>
                          <button 
                            className="ua-wl-btn-remove"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ua-wishlist-footer">
                    <button className="ua-wl-view-more">
                      View More Items
                    </button>
                  </div>
                </>
              ) : (
                <div className="ua-wishlist-empty">
                  <Heart size={48} className="empty-heart-icon" />
                  <p>Your wishlist is currently empty.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="ua-addresses-view">
              <div className="ua-addresses-header">
                <div>
                  <h2 className="ua-addresses-title">My Addresses</h2>
                  <p className="ua-addresses-sub">Manage your saved addresses</p>
                </div>
                <button 
                  className="ua-btn-add-address"
                  onClick={() => handleOpenAddressModal()}
                >
                  + Add New Address
                </button>
              </div>

              <div className="ua-addresses-grid">
                {addresses.map(addr => (
                  <div key={addr.id} className="ua-address-card">
                    <div className="ua-addr-card-header">
                      <h3 className="ua-addr-type">{addr.type}</h3>
                      {addr.isDefault && <span className="ua-badge-default">Default</span>}
                    </div>
                    
                    <div className="ua-addr-body">
                      <p className="ua-addr-name">{addr.name}</p>
                      <p className="ua-addr-phone">{addr.phone}</p>
                      <p className="ua-addr-details">
                        {addr.street},<br />
                        {addr.locality},<br />
                        {addr.city} - {addr.pincode},<br />
                        {addr.state}, {addr.country}
                      </p>
                    </div>

                    <div className="ua-addr-actions">
                      <button 
                        className="ua-addr-action-btn btn-edit-addr"
                        onClick={() => handleOpenAddressModal(addr)}
                      >
                        <Settings size={14} /> Edit
                      </button>
                      <button 
                        className="ua-addr-action-btn btn-delete-addr"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        <LogOut size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Add/Edit Modal */}
              {isAddressModalOpen && (
                <div className="ua-modal-overlay" onClick={() => setIsAddressModalOpen(false)}>
                  <div className="ua-modal-card" onClick={e => e.stopPropagation()}>
                    <h3 className="ua-modal-title">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <form onSubmit={handleSaveAddress} className="ua-address-form">
                      <div className="ua-form-row">
                        <div className="ua-form-group">
                          <label className="ua-form-label">Address Type</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            placeholder="Home, Office, Other"
                            value={addressForm.type}
                            onChange={e => setAddressForm({...addressForm, type: e.target.value})}
                            required
                          />
                        </div>
                        <div className="ua-form-group">
                          <label className="ua-form-label">Full Name</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            value={addressForm.name}
                            onChange={e => setAddressForm({...addressForm, name: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="ua-form-row">
                        <div className="ua-form-group">
                          <label className="ua-form-label">Mobile Number</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            value={addressForm.phone}
                            onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                            required
                          />
                        </div>
                        <div className="ua-form-group">
                          <label className="ua-form-label">Street / Flat / House No.</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            value={addressForm.street}
                            onChange={e => setAddressForm({...addressForm, street: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="ua-form-row">
                        <div className="ua-form-group">
                          <label className="ua-form-label">Locality / Area</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            value={addressForm.locality}
                            onChange={e => setAddressForm({...addressForm, locality: e.target.value})}
                            required
                          />
                        </div>
                        <div className="ua-form-group">
                          <label className="ua-form-label">City</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            value={addressForm.city}
                            onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="ua-form-row">
                        <div className="ua-form-group">
                          <label className="ua-form-label">Pincode</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            value={addressForm.pincode}
                            onChange={e => setAddressForm({...addressForm, pincode: e.target.value})}
                            required
                          />
                        </div>
                        <div className="ua-form-group">
                          <label className="ua-form-label">State</label>
                          <input 
                            type="text" 
                            className="ua-form-input" 
                            value={addressForm.state}
                            onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="ua-form-group checkbox-group">
                        <label className="ua-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={addressForm.isDefault}
                            onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})}
                          />
                          Set as Default Address
                        </label>
                      </div>

                      <div className="ua-modal-actions">
                        <button 
                          type="button" 
                          className="ua-modal-btn btn-cancel"
                          onClick={() => setIsAddressModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="ua-modal-btn btn-save">
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'profile' && (
            <div className="ua-profile-settings-view">
              <div className="ua-ps-header">
                <h2 className="ua-ps-title">Profile Settings</h2>
                <p className="ua-ps-sub">Update your personal information</p>
              </div>

              <div className="ua-ps-content">
                {/* Left Profile Picture Upload Column */}
                <div className="ua-ps-left-col">
                  <span className="ua-ps-label-title">Profile Picture</span>
                  <div className="ua-ps-avatar-container">
                    <img 
                      src={profileForm.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"}
                      alt="Avatar Preview" 
                      className="ua-ps-avatar"
                    />
                    <div className="ua-ps-avatar-overlay-badge">
                      <Camera size={12} />
                    </div>
                  </div>
                  <button className="ua-ps-btn-change-photo">
                    Change Photo
                  </button>
                  <span className="ua-ps-file-rules">JPG, PNG (Max. 2MB)</span>
                </div>

                {/* Right Form Fields Column */}
                <form className="ua-ps-right-col" onSubmit={handleSaveProfile}>
                  <div className="ua-ps-row">
                    <div className="ua-ps-group">
                      <label className="ua-ps-label">Full Name</label>
                      <input 
                        type="text" 
                        className="ua-form-input" 
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="ua-ps-group">
                      <label className="ua-ps-label">Email Address</label>
                      <input 
                        type="email" 
                        className="ua-form-input readonly-input" 
                        value={profileForm.email}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  <div className="ua-ps-row">
                    <div className="ua-ps-group full-width">
                      <label className="ua-ps-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="ua-form-input" 
                        value={profileForm.phone}
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="ua-ps-row">
                    <div className="ua-ps-group">
                      <label className="ua-ps-label">Date of Birth</label>
                      <div className="ua-ps-date-wrap">
                        <input 
                          type="text" 
                          className="ua-form-input" 
                          value={profileForm.dob}
                          placeholder="DD/MM/YYYY"
                          onChange={e => setProfileForm({...profileForm, dob: e.target.value})}
                        />
                        <Sparkles size={16} className="date-icon" />
                      </div>
                    </div>
                    <div className="ua-ps-group">
                      <label className="ua-ps-label">Gender</label>
                      <select 
                        className="ua-form-input select-input"
                        value={profileForm.gender}
                        onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Submission Row */}
                  <div className="ua-ps-actions">
                    <button type="submit" className="ua-ps-btn-save">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="ua-ps-btn-cancel"
                      onClick={() => setProfileForm({
                        name: authUser?.name || 'Sumati Reddy',
                        email: authUser?.email || 'sumati.reddy@gmail.com',
                        phone: authUser?.phone || '+91 98765 43210',
                        dob: '15/08/1995',
                        gender: 'Female',
                        avatar: ''
                      })}
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {activeTab === 'security' && (
            <div className="ua-security-view">
              <div className="ua-sec-grid">
                
                {/* Left Card: Change Password */}
                <form className="ua-sec-card" onSubmit={handleUpdatePassword}>
                  <h3 className="ua-sec-card-title">Change Password</h3>
                  
                  <div className="ua-sec-group">
                    <label className="ua-sec-label">Current Password</label>
                    <div className="ua-sec-pwd-wrap">
                      <input 
                        type={showCurrentPwd ? 'text' : 'password'} 
                        className="ua-form-input" 
                        placeholder="••••••••••••"
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                        required
                      />
                      <button 
                        type="button" 
                        className="ua-sec-eye-btn"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="ua-sec-group">
                    <label className="ua-sec-label">New Password</label>
                    <div className="ua-sec-pwd-wrap">
                      <input 
                        type={showNewPwd ? 'text' : 'password'} 
                        className="ua-form-input" 
                        placeholder="••••••••••••"
                        value={passwordForm.new}
                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                        required
                      />
                      <button 
                        type="button" 
                        className="ua-sec-eye-btn"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="ua-sec-group">
                    <label className="ua-sec-label">Confirm New Password</label>
                    <div className="ua-sec-pwd-wrap">
                      <input 
                        type={showConfirmPwd ? 'text' : 'password'} 
                        className="ua-form-input" 
                        placeholder="••••••••••••"
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        required
                      />
                      <button 
                        type="button" 
                        className="ua-sec-eye-btn"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="ua-sec-btn-update">
                    Update Password
                  </button>
                </form>

                {/* Right Card: Login Activity */}
                <div className="ua-sec-card">
                  <h3 className="ua-sec-card-title">Login Activity</h3>
                  
                  <div className="ua-sec-activity-section">
                    <span className="ua-sec-sub-label">Last Login</span>
                    <div className="ua-sec-last-login-info">
                      <p className="ua-sec-login-time">17 May, 2025  •  10:30 AM</p>
                      <p className="ua-sec-login-device">Hyderabad, India  •  Chrome on Windows</p>
                    </div>
                  </div>

                  <div className="ua-sec-activity-section border-top">
                    <span className="ua-sec-sub-label">Active Devices</span>
                    <div className="ua-sec-devices-list">
                      
                      <div className="ua-sec-device-row">
                        <div>
                          <p className="ua-sec-device-name">Chrome on Windows</p>
                          <p className="ua-sec-device-loc">Hyderabad, India</p>
                        </div>
                        <span className="ua-sec-badge-active">Active</span>
                      </div>

                      <div className="ua-sec-device-row">
                        <div>
                          <p className="ua-sec-device-name">iPhone 14 (Mobile)</p>
                          <p className="ua-sec-device-loc">Hyderabad, India</p>
                        </div>
                        <span className="ua-sec-badge-active">Active</span>
                      </div>

                      <div className="ua-sec-device-row">
                        <div>
                          <p className="ua-sec-device-name">Chrome on MacBook</p>
                          <p className="ua-sec-device-loc">Bangalore, India</p>
                        </div>
                        <span className="ua-sec-device-time">2 days ago</span>
                      </div>

                    </div>
                  </div>

                  <button className="ua-sec-link-sessions">
                    View All Sessions
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="ua-help-view">
              <div className="ua-help-header">
                <h2 className="ua-help-title">Delete Account</h2>
              </div>

              <div className="ua-help-danger-card">
                <div className="ua-help-danger-header">
                  <span className="danger-warning-icon">⚠️</span>
                  <span className="danger-warning-title">Danger Zone</span>
                </div>

                <div className="ua-help-danger-body">
                  <h4 className="danger-body-title">Delete Account</h4>
                  <p className="danger-body-sub">Once you delete your account, there is no going back. Please be certain.</p>

                  <ul className="danger-body-rules">
                    <li> All your data will be permanently deleted</li>
                    <li> Your orders and wishlist will be removed</li>
                    <li> This action cannot be undone</li>
                  </ul>

                  <div className="danger-confirm-group">
                    <label className="danger-confirm-label">Type <span className="danger-highlight">DELETE</span> to continue</label>
                    <input 
                      type="text" 
                      className="ua-form-input danger-confirm-input" 
                      placeholder="DELETE"
                      value={deleteConfirmText}
                      onChange={e => setDeleteConfirmText(e.target.value)}
                    />
                  </div>

                  <button 
                    className="danger-btn-delete"
                    disabled={deleteConfirmText !== 'DELETE'}
                    onClick={handleDeleteAccountAction}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
