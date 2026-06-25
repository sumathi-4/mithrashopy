import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Star,
  Trophy,
  X,
  CheckCircle
} from 'lucide-react';
import { resolveProductImage } from '../utils/imageHelper';

export default function UserAccount({ authUser, setAuthUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });
  const [ordersFilter, setOrdersFilter] = useState('all');

  const [cartItemsDetailed, setCartItemsDetailed] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [userOrders, setUserOrders] = useState([]);

  // Dynamic States for Claims & Reviews
  const [myClaims, setMyClaims] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewSubTab, setReviewSubTab] = useState('pending');
  
  // Review Submission Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Hidden File Input for Avatar Uploads
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const restrictedTabs = ['orders', 'addresses', 'profile', 'security', 'help', 'rewards', 'reviews'];
    if (restrictedTabs.includes(activeTab) && !authUser) {
      setActiveTab('cart');
      window.dispatchEvent(new CustomEvent('mithira_open_auth_modal', { detail: { type: 'user' } }));
    }
  }, [activeTab, authUser]);

  const handleTabChange = (tabName) => {
    const restrictedTabs = ['orders', 'addresses', 'profile', 'security', 'help', 'rewards', 'reviews'];
    if (restrictedTabs.includes(tabName) && !authUser) {
      alert(`Please log in to access ${tabName === 'help' ? 'account deletion' : tabName === 'profile' ? 'profile settings' : tabName === 'rewards' ? 'rewards and claims' : tabName === 'reviews' ? 'reviews and ratings' : tabName}.`);
      window.dispatchEvent(new CustomEvent('mithira_open_auth_modal', { detail: { type: 'user' } }));
      return;
    }
    setActiveTab(tabName);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tabName);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('mithira_auth_token');
    localStorage.removeItem('mithira_auth_user');
    setAuthUser(null);
    if (onNavigate) onNavigate('/');
  };


  // Cart operations and calculations
  const calculateSubtotal = () => {
    return cartItemsDetailed.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const calculateGST = () => {
    return Math.round(calculateSubtotal() * 0.18);
  };

  const calculateShipping = () => {
    const sub = calculateSubtotal();
    if (sub === 0 || sub >= 999) return 0;
    return 99;
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const sub = calculateSubtotal();
    const minStr = appliedCoupon.minCart || '₹0';
    const minVal = Number(minStr.replace(/[^0-9]/g, ''));
    if (sub < minVal) return 0;

    const discStr = appliedCoupon.discount || '';
    if (discStr.includes('%')) {
      const percentage = Number(discStr.replace(/[^0-9]/g, ''));
      return Math.round((sub * percentage) / 100);
    } else if (discStr.includes('OFF')) {
      const flat = Number(discStr.replace(/[^0-9]/g, ''));
      return flat;
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST() + calculateShipping() - calculateDiscount();
  };

  const applyCouponObject = (coupon) => {
    const sub = calculateSubtotal();
    const minStr = coupon.minCart || '₹0';
    const minVal = Number(minStr.replace(/[^0-9]/g, ''));
    if (sub < minVal) {
      alert(`Minimum spend of ₹${minVal} required for coupon ${coupon.code}`);
      return;
    }
    setAppliedCoupon(coupon);
    alert(`Coupon ${coupon.code} applied successfully!`);
  };

  const handleApplyPromoCode = () => {
    if (!couponCodeInput.trim()) return;
    const match = coupons.find(c => c.code === couponCodeInput.trim().toUpperCase());
    if (match) {
      applyCouponObject(match);
    } else {
      alert('Invalid or inactive coupon code.');
    }
  };

  const updateCartItemQuantity = (productId, newQty, variant) => {
    if (newQty < 1) return;
    const updated = cartItemsDetailed.map(item => {
      const sizeMatch = !variant || !variant.size || item.selectedVariant?.size === variant.size;
      const colorMatch = !variant || !variant.color || item.selectedVariant?.color === variant.color;
      if (item.id === productId && sizeMatch && colorMatch) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItemsDetailed(updated);
    syncCartToBackend(updated);
  };

  const updateCartItemVariant = (productId, oldVariant, newVariant) => {
    const updated = cartItemsDetailed.map(item => {
      const sizeMatch = !oldVariant || !oldVariant.size || item.selectedVariant?.size === oldVariant.size;
      const colorMatch = !oldVariant || !oldVariant.color || item.selectedVariant?.color === oldVariant.color;
      if (item.id === productId && sizeMatch && colorMatch) {
        return { ...item, selectedVariant: newVariant };
      }
      return item;
    });
    setCartItemsDetailed(updated);
    syncCartToBackend(updated);
  };

  const removeCartItem = (productId, variant) => {
    const updated = cartItemsDetailed.filter(item => {
      const matchProduct = item.id === productId;
      const sizeMatch = !variant || !variant.size || item.selectedVariant?.size === variant.size;
      const colorMatch = !variant || !variant.color || item.selectedVariant?.color === variant.color;
      return !(matchProduct && sizeMatch && colorMatch);
    });
    setCartItemsDetailed(updated);
    syncCartToBackend(updated);
  };

  const syncCartToBackend = (detailedItems) => {
    const cartIds = detailedItems.map(item => String(item.id));
    const cartItemsPayload = detailedItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      variant: {
        size: item.selectedVariant?.size || null,
        color: item.selectedVariant?.color || null,
        variantId: item.selectedVariant?.variantId || null,
        sku: item.selectedVariant?.sku || null
      }
    }));

    if (authUser) {
      apiService.syncCart(cartIds, cartItemsPayload).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, cart: res.cart || cartIds, cartItems: res.cartItems || cartItemsPayload };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
        }
      });
    } else {
      localStorage.setItem('mithira_guest_cart', JSON.stringify(cartIds));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(cartItemsPayload));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
    }
  };

  const completeOrderCheckout = (order) => {
    apiService.syncCart([], []).then(res => {
      if (res && setAuthUser) {
        setAuthUser(prev => {
          const newUser = { ...prev, cart: res.cart, cartItems: res.cartItems };
          localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
          return newUser;
        });
      }
    });
    setUserOrders(prev => [order, ...prev]);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    
    // Dispatch order success event for all orders to display the beautiful success screen
    window.dispatchEvent(new CustomEvent('mithira_order_success', { 
      detail: { 
        orderId: order.id, 
        isLuckyCharm: !!order.isLuckyCharmOrder 
      } 
    }));
  };

  const handlePlaceOrder = () => {
    if (cartItemsDetailed.length === 0) return;
    if (!authUser) {
      alert('Please log in to place your order.');
      window.dispatchEvent(new CustomEvent('mithira_open_auth_modal', { detail: { type: 'user' } }));
      return;
    }
    if (!selectedAddressId) {
      alert('Please select a delivery address.');
      return;
    }

    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    const orderItems = cartItemsDetailed.map(item => ({
      productId: item.id,
      name: item.name,
      variant: {
        size: item.selectedVariant?.size || null,
        color: item.selectedVariant?.color || null,
        variantId: item.selectedVariant?.variantId || null,
        sku: item.selectedVariant?.sku || null
      },
      catalogue: item.catalogue || 'Catalogue A',
      quantity: item.quantity,
      price: item.price
    }));

    const catDetails = {};
    orderItems.forEach(item => {
      catDetails[item.productId] = item.catalogue;
    });

    const orderPayload = {
      product: orderItems.map(item => `${item.name} (${item.quantity})`).join(', '),
      amount: String(calculateTotal()),
      payment: paymentMethod,
      items: orderItems,
      catalogueDetails: catDetails
    };

    apiService.createOrder(orderPayload).then(async (res) => {
      if (!res || !res.success) {
        alert('Failed to place order. Please try again.');
        return;
      }

      // If COD or direct flow
      if (!res.requiresRazorpay) {
        alert('Order placed successfully! Thank you for shopping with us.');
        completeOrderCheckout(res.order);
        return;
      }

      // Handle Mock Mode
      if (res.mock) {
        const confirmPayment = window.confirm(
          `[MOCK PAYMENT GATEWAY]\n\nOrder ID: ${res.orderId}\nAmount: ₹${orderPayload.amount}\n\nClick OK to simulate successful payment, or Cancel to simulate failure.`
        );
        if (confirmPayment) {
          const verifyPayload = {
            razorpay_order_id: res.razorpayOrderId,
            razorpay_payment_id: 'mock_pay_' + Math.floor(100000 + Math.random() * 900000),
            razorpay_signature: 'mock_signature',
            orderId: res.orderId
          };
          apiService.verifyPayment(verifyPayload).then(verifyRes => {
            if (verifyRes && verifyRes.success) {
              alert('Mock payment successful! Order placed.');
              completeOrderCheckout(verifyRes.order);
            } else {
              alert('Mock payment verification failed.');
            }
          });
        } else {
          alert('Payment cancelled.');
        }
        return;
      }

      // Handle Real Razorpay Flow
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
      }

      const options = {
        key: res.razorpayKeyId,
        amount: res.amount,
        currency: res.currency,
        name: 'Mithira Shopy',
        description: orderPayload.product,
        order_id: res.razorpayOrderId,
        handler: async function (paymentRes) {
          try {
            const verifyPayload = {
              razorpay_order_id: paymentRes.razorpay_order_id,
              razorpay_payment_id: paymentRes.razorpay_payment_id,
              razorpay_signature: paymentRes.razorpay_signature,
              orderId: res.orderId
            };
            const verifyRes = await apiService.verifyPayment(verifyPayload);
            if (verifyRes && verifyRes.success) {
              alert('Payment successful and verified! Order placed.');
              completeOrderCheckout(verifyRes.order);
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error(err);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: res.user.name,
          email: res.user.email,
          contact: res.user.phone
        },
        theme: {
          color: '#051838'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // Wishlist Items State
  const [wishlistItems, setWishlistItems] = useState([]);

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
    } else {
      try {
        const local = JSON.parse(localStorage.getItem('mithira_guest_wishlist') || '[]');
        const updated = local.filter(id => id !== itemId && String(id) !== String(itemId));
        localStorage.setItem('mithira_guest_wishlist', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('mithira_cart_update'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Addresses List State
  const [addresses, setAddresses] = useState([]);

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

  // Dynamic stats matching database values
  const stats = [
    { label: 'Total Orders', value: String(userOrders.length), linkText: 'View all orders', tab: 'orders', color: '#8A72F6', icon: <ShoppingBag size={20} className="ua-card-icon-purple" /> },
    { label: 'Wishlist', value: String(wishlistItems.length), linkText: 'View wishlist', tab: 'wishlist', color: '#E94FA8', icon: <Heart size={20} className="ua-card-icon-pink" /> },
    { label: 'Saved Addresses', value: String(addresses.length), linkText: 'Manage addresses', tab: 'addresses', color: '#E94FA8', icon: <Heart size={20} className="ua-card-icon-red" /> },
    { label: 'Reward Points', value: String(250 + myClaims.filter(c => c.status === 'Claimed').length * 100), linkText: 'View rewards', tab: 'rewards', color: '#F2994A', icon: <Sparkles size={20} className="ua-card-icon-orange" /> }
  ];

  useEffect(() => {
    apiService.getProducts().then(prods => {
      if (prods && prods.length > 0) {
        setAllProducts(prods);
      }
    });
    apiService.getCoupons().then(list => {
      if (list) {
        setCoupons(list.filter(c => c.status === 'Active'));
      }
    });
  }, []);

  useEffect(() => {
    if (authUser) {
      apiService.getAddresses().then(data => {
        if (data) {
          setAddresses(data);
        }
      });
      apiService.getOrders().then(list => {
        if (list) {
          setUserOrders(list);
        }
      });
      apiService.getMyClaims().then(claims => {
        if (claims) {
          setMyClaims(claims);
        }
      });
      apiService.getMyReviews().then(reviews => {
        if (reviews) {
          setMyReviews(reviews);
        }
      });
      apiService.getMe().then(user => {
        if (user && setAuthUser) {
          setAuthUser(user);
          localStorage.setItem('mithira_auth_user', JSON.stringify(user));
        }
      });
    } else {
      setAddresses([]);
      setUserOrders([]);
      setMyClaims([]);
      setMyReviews([]);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault);
      if (def) {
        setSelectedAddressId(def.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses]);

  useEffect(() => {
    if (allProducts.length > 0) {
      let userCartItems = [];
      let userCartIds = [];
      try {
        userCartItems = authUser ? (authUser.cartItems || []) : (JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]'));
        userCartIds = authUser ? (authUser.cart || []) : (JSON.parse(localStorage.getItem('mithira_guest_cart') || '[]'));
      } catch {
        userCartItems = [];
        userCartIds = [];
      }
      
      let resolved = [];
      if (userCartItems.length > 0) {
        resolved = userCartItems.map(item => {
          const prod = allProducts.find(p => 
            p.id === item.productId || 
            p._id === item.productId || 
            String(p.id) === String(item.productId) || 
            String(p._id) === String(item.productId)
          );
          if (prod) {
            const isLucky = item.variant?.isLuckyCharm === true;
            const color = item.variant?.color;
            const size = item.variant?.size;
            let matchedVar = null;
            if (prod.variants && prod.variants.length > 0) {
              matchedVar = prod.variants.find(v => 
                (color && v.color && String(v.color).toLowerCase() === String(color).toLowerCase()) &&
                (size && v.size && String(v.size).toLowerCase() === String(size).toLowerCase())
              );
              if (!matchedVar && color) {
                matchedVar = prod.variants.find(v => v.color && String(v.color).toLowerCase() === String(color).toLowerCase());
              }
            }
            
            let variantPrice = (matchedVar && matchedVar.price !== null && matchedVar.price !== undefined) 
              ? matchedVar.price 
              : prod.price;

            let variantImage = (matchedVar && matchedVar.image) 
              ? resolveProductImage({ ...prod, image: matchedVar.image }) 
              : resolveProductImage(prod);

            let variantTitle = prod.title || prod.name;

            if (isLucky) {
              variantPrice = item.variant.rewardPrice;
              variantTitle = item.variant.rewardName;
              if (item.variant.rewardImage) {
                variantImage = item.variant.rewardImage.startsWith('http') 
                  ? item.variant.rewardImage 
                  : resolveProductImage({ ...prod, image: item.variant.rewardImage });
              }
            }

            return {
              ...prod,
              id: prod.id || prod._id,
              title: variantTitle,
              name: variantTitle,
              price: variantPrice,
              image: variantImage,
              quantity: item.quantity || 1,
              selectedVariant: item.variant || { size: null, color: null, variantId: null, sku: null }
            };
          }
          return null;
        }).filter(Boolean);
      } else {
        resolved = userCartIds.map(id => {
          const prod = allProducts.find(p => 
            p.id === Number(id) || 
            p.id === id || 
            p._id === id || 
            String(p.id) === String(id) || 
            String(p._id) === String(id)
          );
          if (prod) {
            const firstVar = prod.variants?.[0];
            const variantPrice = (firstVar && firstVar.price !== null && firstVar.price !== undefined) 
              ? firstVar.price 
              : prod.price;
            const variantImage = (firstVar && firstVar.image) 
              ? resolveProductImage({ ...prod, image: firstVar.image }) 
              : resolveProductImage(prod);
            return {
              ...prod,
              id: prod.id || prod._id,
              title: prod.title || prod.name,
              price: variantPrice,
              image: variantImage,
              quantity: 1,
              selectedVariant: { 
                size: firstVar?.size || null, 
                color: firstVar?.color || null,
                variantId: firstVar?._id || firstVar?.id || null,
                sku: firstVar?.sku || null
              }
            };
          }
          return null;
        }).filter(Boolean);
      }
      setCartItemsDetailed(resolved);
    } else {
      setCartItemsDetailed([]);
    }
  }, [authUser, allProducts]);

  useEffect(() => {
    if (authUser) {
      setProfileForm(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        dob: authUser.dob || '15/08/1995',
        gender: authUser.gender || 'Female',
        avatar: authUser.profileImage || authUser.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if (allProducts.length > 0) {
      let ids = [];
      try {
        ids = authUser ? (authUser.wishlist || []) : (JSON.parse(localStorage.getItem('mithira_guest_wishlist') || '[]'));
      } catch {
        ids = [];
      }
      const resolved = allProducts.filter(p => 
        ids.includes(p.id) || 
        ids.includes(p._id) || 
        ids.includes(String(p.id)) || 
        ids.includes(String(p._id))
      );
      setWishlistItems(resolved.map(p => ({
        id: p.id || p._id,
        title: p.title || p.name,
        price: typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : p.price,
        image: p.image || (p.images && p.images[0])
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
      const newList = updated || addresses.filter(addr => addr.id !== addressId);
      setAddresses(newList);
      if (authUser && setAuthUser) {
        const newUser = { ...authUser, addresses: newList };
        setAuthUser(newUser);
        localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
      }
      alert('Address deleted successfully!');
    });
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (editingAddress) {
      apiService.editAddress(editingAddress.id, addressForm).then(updated => {
        const newList = updated || addresses.map(addr => addr.id === editingAddress.id ? { ...addressForm } : addr);
        setAddresses(newList);
        if (authUser && setAuthUser) {
          const newUser = { ...authUser, addresses: newList };
          setAuthUser(newUser);
          localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
        }
        alert('Address updated successfully!');
      });
    } else {
      apiService.addAddress(addressForm).then(updated => {
        let newList;
        if (updated) {
          newList = updated;
        } else {
          const newAddress = {
            ...addressForm,
            id: 'addr_' + Date.now()
          };
          newList = [...addresses, newAddress];
        }
        setAddresses(newList);
        if (authUser && setAuthUser) {
          const newUser = { ...authUser, addresses: newList };
          setAuthUser(newUser);
          localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
        }
        alert('Address added successfully!');
      });
    }
    setIsAddressModalOpen(false);
  };

  const resolvedUserOrders = userOrders.map(order => {
    const firstItem = order.items?.[0];
    const matchedProduct = firstItem ? allProducts.find(p => p.id === firstItem.productId) : null;
    const img = matchedProduct?.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80';
    
    let statusColorClass = 'ua-status-processing';
    if (order.status?.toLowerCase() === 'delivered') statusColorClass = 'ua-status-delivered';
    else if (order.status?.toLowerCase() === 'shipped') statusColorClass = 'ua-status-shipped';
    else if (order.status?.toLowerCase() === 'cancelled') statusColorClass = 'ua-status-cancelled';

    return {
      id: order.id,
      date: order.date,
      itemsCount: order.items?.reduce((acc, it) => acc + it.quantity, 0) || 1,
      image: img,
      title: order.product,
      price: order.amount,
      status: order.status || 'Pending',
      statusDate: order.date,
      statusColorClass,
      category: order.status?.toLowerCase() || 'pending',
      rawOrder: order
    };
  });

  const activeOrdersList = resolvedUserOrders;

  const filteredOrders = activeOrdersList.filter(order => {
    if (ordersFilter === 'all') return true;
    return order.category === ordersFilter;
  });

  const getFilterCounts = (cat) => {
    if (cat === 'all') return activeOrdersList.length;
    return activeOrdersList.filter(o => o.category === cat).length;
  };

  const recentOrders = activeOrdersList.slice(0, 3);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: authUser?.name || 'Sumati Reddy',
    email: authUser?.email || 'sumati.reddy@gmail.com',
    phone: authUser?.phone || '+91 98765 43210',
    dob: authUser?.dob || '15/08/1995',
    gender: authUser?.gender || 'Female',
    avatar: authUser?.profileImage || authUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    apiService.updateProfile({
      name: profileForm.name,
      phone: profileForm.phone,
      dob: profileForm.dob,
      gender: profileForm.gender,
      profileImage: profileForm.avatar
    }).then(updatedUser => {
      if (updatedUser) {
        setAuthUser(updatedUser);
        localStorage.setItem('mithira_auth_user', JSON.stringify(updatedUser));
      } else if (setAuthUser) {
        setAuthUser(prev => ({
          ...prev,
          name: profileForm.name,
          phone: profileForm.phone,
          profileImage: profileForm.avatar
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

  const getReviewableProducts = () => {
    const purchased = [];
    userOrders.forEach(o => {
      if (o.status && o.status.toLowerCase() !== 'cancelled' && o.status.toLowerCase() !== 'pending payment') {
        o.items?.forEach(item => {
          if (!purchased.some(p => String(p.productId) === String(item.productId))) {
            purchased.push(item);
          }
        });
      }
    });
    return purchased.filter(p => 
      !myReviews.some(r => String(r.productName).toLowerCase().trim() === String(p.name).toLowerCase().trim())
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReviewProduct) return;
    try {
      const res = await apiService.submitReview({
        productName: selectedReviewProduct.name,
        rating: reviewRating,
        comment: reviewComment,
        productImage: selectedReviewProduct.image || 'Kids',
        productId: selectedReviewProduct.productId
      });
      if (res) {
        alert('Review submitted successfully! It will appear once approved by Admin.');
        setIsReviewModalOpen(false);
        setReviewComment('');
        setReviewRating(5);
        apiService.getMyReviews().then(reviews => {
          if (reviews) setMyReviews(reviews);
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit review.');
    }
  };

  const triggerPhotoUpload = (immediate = false) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.immediate = String(immediate);
      fileInputRef.current.click();
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size is 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const url = await apiService.uploadImage(file.name, reader.result);
        setProfileForm(prev => ({ ...prev, avatar: url }));
        
        const isImmediate = e.target.dataset.immediate === 'true';
        if (isImmediate) {
          const res = await apiService.updateProfile({
            name: authUser.name,
            phone: authUser.phone,
            dob: authUser.dob,
            gender: authUser.gender,
            profileImage: url
          });
          if (res) {
            setAuthUser(res);
            localStorage.setItem('mithira_auth_user', JSON.stringify(res));
            alert('Profile picture updated successfully!');
          }
        } else {
          alert('Photo uploaded. Click "Save Changes" on the form to save permanently.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to upload image.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClaimReward = (claim) => {
    if (claim.rewardType === 'coupon') {
      setCouponCodeInput(claim.couponCode);
      const match = coupons.find(c => c.code === claim.couponCode);
      if (match) {
        applyCouponObject(match);
      } else {
        setAppliedCoupon({
          code: claim.couponCode,
          discount: `${claim.rewardValue}% OFF`,
          minCart: '₹0'
        });
        alert(`Coupon ${claim.couponCode} applied!`);
      }
      return;
    }
    
    if (claim.rewardType === 'product') {
      const itemInCart = cartItemsDetailed.some(item => 
        item.id === claim.productId && item.selectedVariant?.isLuckyCharm === true
      );
      if (itemInCart) {
        alert('This reward item is already in your cart.');
        return;
      }
      
      const updatedCartItems = [...(authUser?.cartItems || [])];
      const newCartItem = {
        productId: claim.productId,
        quantity: 1,
        variant: {
          size: null,
          color: null,
          isLuckyCharm: true,
          rewardPrice: claim.rewardValue || 0,
          rewardName: claim.rewardName,
          rewardImage: claim.image
        }
      };
      updatedCartItems.push(newCartItem);
      
      const updatedCartIds = [...(authUser?.cart || []), String(claim.productId)];
      
      apiService.syncCart(updatedCartIds, updatedCartItems).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, cart: res.cart || updatedCartIds, cartItems: res.cartItems || updatedCartItems };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
          alert(`${claim.rewardName} added to cart as a reward! Go to cart to checkout.`);
          setActiveTab('cart');
        }
      });
    }
  };

  return (
    <div className="ua-account-page">
      <div className="ua-container">
        
        {/* Left Profile Sidebar */}
        <aside className="ua-sidebar">
          {/* Hidden File Input for Image Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <div className="ua-profile-card">
            <div className="ua-avatar-wrapper">
              <img 
                src={authUser?.profileImage || authUser?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"} 
                alt="Profile Avatar" 
                className="ua-avatar"
              />
              <button 
                className="ua-camera-btn" 
                aria-label="Upload photo" 
                onClick={() => triggerPhotoUpload(true)}
              >
                <Camera size={14} />
              </button>
            </div>
            <h2 className="ua-user-name">{authUser?.name || 'Sumati Reddy'}</h2>
            <p className="ua-user-email">{authUser?.email || 'sumati.reddy@gmail.com'}</p>
          </div>

          <nav className="ua-nav">
            <button 
              className={`ua-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <User size={18} />
              <span>Dashboard</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => handleTabChange('cart')}
            >
              <ShoppingBag size={18} />
              <span>My Cart ({cartItemsDetailed.reduce((acc, item) => acc + item.quantity, 0)})</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <ShoppingBag size={18} />
              <span>My Orders</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => handleTabChange('wishlist')}
            >
              <Heart size={18} />
              <span>Wishlist</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => handleTabChange('addresses')}
            >
              <MapPin size={18} />
              <span>Addresses</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => handleTabChange('rewards')}
            >
              <Sparkles size={18} />
              <span>My Rewards</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              <Star size={18} />
              <span>My Reviews</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <Settings size={18} />
              <span>Profile Settings</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <ShieldCheck size={18} />
              <span>Security</span>
            </button>
            <button 
              className={`ua-nav-item ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => handleTabChange('help')}
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
          {activeTab === 'cart' && (
            <div className="ua-cart-view">
              <div className="ua-cart-header">
                <h2 className="ua-cart-title">My Shopping Cart ({cartItemsDetailed.length})</h2>
                <p className="ua-cart-sub">Secure Checkout &amp; Fast Delivery</p>
              </div>

              {cartItemsDetailed.length > 0 ? (
                <div className="ua-cart-grid">
                  {/* Left Column: Cart Items & Address Selector */}
                  <div className="ua-cart-left-col">
                    <div className="ua-cart-items-card">
                      {cartItemsDetailed.map(item => {
                        const subtotal = item.price * item.quantity;
                        return (
                          <div key={`${item.id}-${item.selectedVariant?.size || 's'}-${item.selectedVariant?.color || 'c'}`} className="ua-cart-item-row">
                            <img src={item.image || 'Kids'} alt={item.name} className="ua-cart-item-img" />
                            <div className="ua-cart-item-info">
                              <h4 className="ua-cart-item-name">{item.name}</h4>
                              {item.selectedVariant?.isLuckyCharm && (
                                <div style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                                  <span>⭐ Lucky Charm Reward</span>
                                </div>
                              )}
                              <p className="ua-cart-item-catalogue">{item.catalogue || 'Catalogue A'}</p>
                              
                              {/* Variant selectors */}
                              <div className="ua-cart-item-variants">
                                {item.variants && item.variants.length > 0 && (
                                  <>
                                    {/* Size Selector */}
                                    <div className="ua-variant-select-group">
                                      <label>Size:</label>
                                      <select
                                        value={item.selectedVariant?.size || ''}
                                        onChange={(e) => updateCartItemVariant(item.id, item.selectedVariant, { ...item.selectedVariant, size: e.target.value })}
                                      >
                                        <option value="">None</option>
                                        {[...new Set(item.variants.map(v => v.size).filter(Boolean))].map(sz => (
                                          <option key={sz} value={sz}>{sz}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Color Selector */}
                                    <div className="ua-variant-select-group">
                                      <label>Color:</label>
                                      <select
                                        value={item.selectedVariant?.color || ''}
                                        onChange={(e) => updateCartItemVariant(item.id, item.selectedVariant, { ...item.selectedVariant, color: e.target.value })}
                                      >
                                        <option value="">None</option>
                                        {[...new Set(item.variants.map(v => v.color).filter(Boolean))].map(col => (
                                          <option key={col} value={col}>{col}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="ua-cart-item-qty-price">
                                <div className="ua-qty-controller">
                                  <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1, item.selectedVariant)}>-</button>
                                  <span>{item.quantity}</span>
                                  <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1, item.selectedVariant)}>+</button>
                                </div>
                                <span className="ua-cart-item-price">₹{item.price} x {item.quantity} = ₹{subtotal}</span>
                              </div>
                            </div>
                            <button 
                              className="ua-cart-item-remove-btn" 
                              onClick={() => removeCartItem(item.id, item.selectedVariant)}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Address Selection Card */}
                    <div className="ua-cart-address-card">
                      <div className="ua-cart-card-header">
                        <h3>Select Delivery Address</h3>
                        <button className="ua-cart-add-addr-btn" onClick={() => handleTabChange('addresses')}>
                          + Add New
                        </button>
                      </div>
                      {addresses.length > 0 ? (
                        <div className="ua-cart-address-list">
                          {addresses.map(addr => (
                            <label key={addr.id} className={`ua-cart-address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="delivery_address" 
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)} 
                              />
                              <div className="ua-cart-addr-details">
                                <span className="ua-cart-addr-type-badge">{addr.type}</span>
                                <strong className="ua-cart-addr-name">{addr.name}</strong>
                                <span className="ua-cart-addr-phone">{addr.phone}</span>
                                <p className="ua-cart-addr-text">
                                  {addr.street}, {addr.locality}, {addr.city} - {addr.pincode}, {addr.state}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="ua-cart-address-empty">
                          <p>No saved addresses found. Please add an address to proceed with checkout.</p>
                          <button onClick={() => handleTabChange('addresses')} className="ua-cart-btn-primary">Add Address</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Checkout Summary & Coupons */}
                  <div className="ua-cart-right-col">
                    {/* Coupon Application Card */}
                    <div className="ua-checkout-coupon-card">
                      <h3>Apply Coupons</h3>
                      <div className="ua-coupon-input-group">
                        <input 
                          type="text" 
                          placeholder="Enter Promo Code" 
                          value={couponCodeInput} 
                          onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                        />
                        <button onClick={handleApplyPromoCode}>Apply</button>
                      </div>

                      {appliedCoupon && (
                        <div className="ua-applied-coupon-badge">
                          <span>Applied: <strong>{appliedCoupon.code}</strong> ({appliedCoupon.discount})</span>
                          <button onClick={() => setAppliedCoupon(null)}>Remove</button>
                        </div>
                      )}

                      {coupons.length > 0 && (
                        <div className="ua-available-coupons">
                          <h4>Available Offers:</h4>
                          <div className="ua-coupon-offers-list">
                            {coupons.map(cp => (
                              <div key={cp.code} className="ua-coupon-offer-item">
                                <div className="ua-coi-details">
                                  <strong>{cp.code}</strong>
                                  <span>{cp.discount} (Min. Spend: {cp.minCart})</span>
                                </div>
                                <button onClick={() => {
                                  setCouponCodeInput(cp.code);
                                  applyCouponObject(cp);
                                }}>Apply</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Summary Details Card */}
                    <div className="ua-checkout-summary-card">
                      <h3>Order Summary</h3>
                      <div className="ua-summary-row">
                        <span>Items Price ({cartItemsDetailed.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                        <span>₹{calculateSubtotal()}</span>
                      </div>
                      <div className="ua-summary-row">
                        <span>Estimated GST / Tax (18%)</span>
                        <span>₹{calculateGST()}</span>
                      </div>
                      <div className="ua-summary-row">
                        <span>Shipping Fee</span>
                        {calculateShipping() === 0 ? (
                          <span className="ua-free-shipping">FREE</span>
                        ) : (
                          <span>₹{calculateShipping()}</span>
                        )}
                      </div>

                      {appliedCoupon && (
                        <div className="ua-summary-row ua-discount-row">
                          <span>Coupon Discount ({appliedCoupon.code})</span>
                          <span>-₹{calculateDiscount()}</span>
                        </div>
                      )}

                      <div className="ua-summary-row ua-total-row">
                        <span>Total Payable</span>
                        <span>₹{calculateTotal()}</span>
                      </div>

                      {cartItemsDetailed.some(item => item.selectedVariant?.isLuckyCharm === true) && (
                        <div style={{
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid #D4AF37',
                          color: '#051838',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          marginTop: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>⭐ This item is a Lucky Charm Reward</span>
                        </div>
                      )}

                      {/* Payment Method Selector */}
                      <div className="ua-payment-method-selector">
                        <h4>Payment Method</h4>
                        <div className="ua-payment-options">
                          <label>
                            <input 
                              type="radio" 
                              name="payment_method" 
                              value="Razorpay" 
                              checked={paymentMethod === 'Razorpay'}
                              onChange={() => setPaymentMethod('Razorpay')}
                            />
                            Razorpay / Card
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="payment_method" 
                              value="UPI" 
                              checked={paymentMethod === 'UPI'}
                              onChange={() => setPaymentMethod('UPI')}
                            />
                            UPI / NetBanking
                          </label>
                          <label>
                            <input 
                              type="radio" 
                              name="payment_method" 
                              value="COD" 
                              checked={paymentMethod === 'COD'}
                              onChange={() => setPaymentMethod('COD')}
                            />
                            Cash on Delivery (COD)
                          </label>
                        </div>
                      </div>

                      <button 
                        className="ua-cart-btn-primary ua-btn-checkout" 
                        onClick={handlePlaceOrder}
                        disabled={cartItemsDetailed.length === 0 || !selectedAddressId}
                      >
                        Place Order (₹{calculateTotal()})
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ua-cart-empty">
                  <ShoppingBag size={64} className="empty-cart-icon" />
                  <h3>Your shopping cart is empty</h3>
                  <p>Check out our beautiful collections and add items to your cart.</p>
                  <button onClick={() => onNavigate('/Shop')} className="ua-cart-btn-primary">Shop Now</button>
                </div>
              )}
            </div>
          )}

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
                      onClick={() => handleTabChange(stat.tab)}
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
                  <button className="ua-view-all-link" onClick={() => handleTabChange('orders')}>
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
                          <button className="ua-btn-secondary tracking-btn" onClick={() => handleTabChange('orders')}>
                            Track Order
                          </button>
                        ) : (
                          <button className="ua-btn-secondary" onClick={() => handleTabChange('orders')}>
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
                          <h4 className="ua-od-number">
                            Order #{order.id}
                            {order.rawOrder?.isLuckyCharmOrder && (
                              <span style={{
                                marginLeft: '10px',
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                border: '1px solid #D4AF37',
                                color: '#051838',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                ⭐ Lucky Charm Order
                              </span>
                            )}
                          </h4>
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

                        {(order.status === 'Processing' || order.status === 'Pending' || order.status === 'Pending Payment') && (
                          <button 
                            className="ua-od-action-btn btn-cancel-order"
                            onClick={() => {
                              const confirmCancel = window.confirm(`Are you sure you want to cancel order #${order.id}?`);
                              if (confirmCancel) {
                                apiService.cancelOrder(order.id).then(() => {
                                  alert('Order cancelled successfully!');
                                  apiService.getOrders().then(list => {
                                    if (list) setUserOrders(list);
                                  });
                                }).catch(err => {
                                  alert(err.message || 'Failed to cancel order.');
                                });
                              }
                            }}
                          >
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
                                        const newUser = { ...prev, cart: res.cart || res, cartItems: res.cartItems || prev.cartItems };
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
                  <div className="ua-ps-avatar-container" onClick={() => triggerPhotoUpload(false)} style={{ cursor: 'pointer' }}>
                    <img 
                      src={profileForm.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"}
                      alt="Avatar Preview" 
                      className="ua-ps-avatar"
                    />
                    <div className="ua-ps-avatar-overlay-badge">
                      <Camera size={12} />
                    </div>
                  </div>
                  <button type="button" className="ua-ps-btn-change-photo" onClick={() => triggerPhotoUpload(false)}>
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

          {activeTab === 'rewards' && (
            <div className="ua-rewards-view">
              <div className="ua-rewards-header">
                <h2 className="ua-rewards-title">My Rewards</h2>
                <p className="ua-rewards-sub">Manage and claim your Lucky Charm spin rewards</p>
              </div>

              <div className="ua-rewards-points-card">
                <div className="ua-rewards-points-left">
                  <Trophy className="ua-trophy-icon" size={48} />
                  <div>
                    <h3 className="ua-points-title">Mithira Rewards Balance</h3>
                    <p className="ua-points-sub">Earn 100 points for every claim, and bonus points on register!</p>
                  </div>
                </div>
                <div className="ua-rewards-points-right">
                  <span className="ua-points-number">{250 + myClaims.filter(c => c.status === 'Claimed').length * 100}</span>
                  <span className="ua-points-lbl">Points</span>
                </div>
              </div>

              <h3 className="ua-claims-section-title">Lucky Charm Rewards History</h3>
              {myClaims.length > 0 ? (
                <div className="ua-claims-grid">
                  {myClaims.map(claim => {
                    const isProduct = claim.rewardType === 'product';
                    const isPending = claim.status === 'Pending';
                    const claimDate = new Date(claim.claimedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric'
                    });

                    let resolvedImg = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80';
                    if (claim.image) {
                      if (claim.image.startsWith('http')) {
                        resolvedImg = claim.image;
                      } else {
                        resolvedImg = resolveProductImage({ image: claim.image });
                      }
                    }

                    return (
                      <div key={claim._id || claim.id} className={`ua-claim-card ${claim.status.toLowerCase()}`}>
                        <div className="ua-claim-img-wrapper">
                          <img src={resolvedImg} alt={claim.rewardName} className="ua-claim-img" />
                          <span className={`ua-claim-status-badge ${claim.status.toLowerCase()}`}>
                            {claim.status}
                          </span>
                        </div>
                        <div className="ua-claim-info">
                          <h4 className="ua-claim-name">{claim.rewardName}</h4>
                          <p className="ua-claim-meta">
                            Won on {claimDate}
                          </p>
                          <p className="ua-claim-value">
                            {isProduct ? `Value: ₹${claim.rewardValue}` : `Discount: ${claim.rewardValue}% OFF`}
                          </p>
                        </div>
                        <div className="ua-claim-actions">
                          {isPending ? (
                            <button
                              className="ua-claim-btn-action claim-pending-btn"
                              onClick={() => handleClaimReward(claim)}
                            >
                              {isProduct ? 'Claim Product' : 'Apply Coupon'}
                            </button>
                          ) : (
                            <button className="ua-claim-btn-action claim-done-btn" disabled>
                              <CheckCircle size={14} style={{ marginRight: '4px' }} />
                              Claimed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="ua-claims-empty-state">
                  <Sparkles size={48} className="empty-sparkles-icon" />
                  <p>You haven't won any Lucky Charm rewards yet.</p>
                  <button onClick={() => onNavigate('/')} className="ua-cart-btn-primary">Spin the Wheel</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="ua-reviews-view">
              <div className="ua-reviews-header">
                <h2 className="ua-reviews-title">My Reviews &amp; Ratings</h2>
                <p className="ua-reviews-sub">Share your feedback on purchased products</p>
              </div>

              <div className="ua-reviews-tabs">
                <button
                  className={`ua-review-tab-btn ${reviewSubTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setReviewSubTab('pending')}
                >
                  Pending Reviews ({getReviewableProducts().length})
                </button>
                <button
                  className={`ua-review-tab-btn ${reviewSubTab === 'submitted' ? 'active' : ''}`}
                  onClick={() => setReviewSubTab('submitted')}
                >
                  My Submitted Reviews ({myReviews.length})
                </button>
              </div>

              {reviewSubTab === 'pending' ? (
                <div className="ua-reviews-pending-section">
                  {getReviewableProducts().length > 0 ? (
                    <div className="ua-reviews-product-grid">
                      {getReviewableProducts().map(prod => {
                        let resolvedImg = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80';
                        if (prod.image) {
                          resolvedImg = prod.image.startsWith('http') ? prod.image : resolveProductImage({ image: prod.image });
                        } else {
                          const matchedProduct = allProducts.find(p => p.id === prod.productId);
                          if (matchedProduct?.image) {
                            resolvedImg = matchedProduct.image.startsWith('http') ? matchedProduct.image : resolveProductImage({ image: matchedProduct.image });
                          }
                        }

                        return (
                          <div key={prod.productId} className="ua-review-pending-card">
                            <img src={resolvedImg} alt={prod.name} className="ua-rp-img" />
                            <div className="ua-rp-info">
                              <h4 className="ua-rp-name">{prod.name}</h4>
                              <p className="ua-rp-meta">Purchased item</p>
                              <button
                                className="ua-rp-btn-review"
                                onClick={() => {
                                  setSelectedReviewProduct({
                                    productId: prod.productId,
                                    name: prod.name,
                                    image: prod.image || 'Kids'
                                  });
                                  setReviewRating(5);
                                  setReviewComment('');
                                  setIsReviewModalOpen(true);
                                }}
                              >
                                Write a Review
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ua-reviews-empty-state">
                      <CheckCircle size={48} className="empty-reviews-icon" />
                      <p>You have reviewed all your purchased items. Thank you!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ua-reviews-submitted-section">
                  {myReviews.length > 0 ? (
                    <div className="ua-submitted-reviews-list">
                      {myReviews.map(rev => {
                        let resolvedImg = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80';
                        if (rev.productImage) {
                          resolvedImg = rev.productImage.startsWith('http') ? rev.productImage : resolveProductImage({ image: rev.productImage });
                        }

                        return (
                          <div key={rev.id} className="ua-review-item-card">
                            <div className="ua-rev-header">
                              <img src={resolvedImg} alt={rev.productName} className="ua-rev-img" />
                              <div className="ua-rev-meta">
                                <h4 className="ua-rev-product-name">{rev.productName}</h4>
                                <div className="ua-rev-stars-row">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      size={14}
                                      fill={star <= rev.rating ? "#F2C94C" : "none"}
                                      stroke={star <= rev.rating ? "#F2C94C" : "#BDBDBD"}
                                    />
                                  ))}
                                  <span className="ua-rev-date">on {rev.date}</span>
                                </div>
                              </div>
                              <span className={`ua-rev-status-badge ${rev.status.toLowerCase()}`}>
                                {rev.status}
                              </span>
                            </div>
                            
                            <div className="ua-rev-comment">
                              <p>"{rev.comment}"</p>
                              {rev.verifiedPurchase && (
                                <span className="ua-verified-purchase-badge">
                                  ✓ Verified Purchase
                                </span>
                              )}
                            </div>

                            {rev.reply && (
                              <div className="ua-rev-admin-reply">
                                <h5 className="ua-reply-title">Response from Store Manager:</h5>
                                <p className="ua-reply-text">"{rev.reply}"</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ua-reviews-empty-state">
                      <Star size={48} className="empty-reviews-icon" />
                      <p>You haven't submitted any reviews yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {isReviewModalOpen && selectedReviewProduct && (
        <div className="ua-modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="ua-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ua-modal-header-row">
              <h3 className="ua-modal-title">Write a Review</h3>
              <button className="ua-modal-close-btn" onClick={() => setIsReviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="ua-review-modal-product-summary">
              <img 
                src={selectedReviewProduct.image.startsWith('http') ? selectedReviewProduct.image : resolveProductImage({ image: selectedReviewProduct.image })} 
                alt={selectedReviewProduct.name} 
                className="ua-rmps-img" 
              />
              <div>
                <h4>{selectedReviewProduct.name}</h4>
                <p>Share your honest experience</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="ua-review-submit-form">
              <div className="ua-form-group">
                <label className="ua-form-label">Overall Rating</label>
                <div className="ua-star-rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className="ua-star-selector-btn"
                      onClick={() => setReviewRating(star)}
                    >
                      <Star
                        size={28}
                        fill={star <= reviewRating ? "#F2C94C" : "none"}
                        stroke={star <= reviewRating ? "#F2C94C" : "#BDBDBD"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="ua-form-group">
                <label className="ua-form-label">Review Details</label>
                <textarea
                  className="ua-form-textarea"
                  rows={4}
                  placeholder="What did you like or dislike? How is the quality, fabric, size fit?"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <div className="ua-modal-actions">
                <button 
                  type="button" 
                  className="ua-modal-btn btn-cancel"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ua-modal-btn btn-save" disabled={!reviewComment.trim()}>
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .ua-rewards-view, .ua-reviews-view {
          padding: 10px;
        }
        .ua-rewards-header, .ua-reviews-header {
          margin-bottom: 25px;
        }
        .ua-rewards-title, .ua-reviews-title {
          font-size: 24px;
          font-weight: 700;
          color: #051838;
          margin-bottom: 5px;
        }
        .ua-rewards-sub, .ua-reviews-sub {
          font-size: 14px;
          color: #828282;
        }

        .ua-rewards-points-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #051838 0%, #1e3c72 100%);
          padding: 25px;
          border-radius: 12px;
          color: #ffffff;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(5, 24, 56, 0.15);
        }
        .ua-rewards-points-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .ua-trophy-icon {
          color: #F2C94C;
        }
        .ua-points-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 5px 0;
        }
        .ua-points-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        .ua-rewards-points-right {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .ua-points-number {
          display: block;
          font-size: 32px;
          font-weight: 800;
          color: #F2C94C;
          line-height: 1;
        }
        .ua-points-lbl {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ua-claims-section-title {
          font-size: 18px;
          font-weight: 600;
          color: #051838;
          margin-bottom: 20px;
        }

        .ua-claims-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .ua-claim-card {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        .ua-claim-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }
        .ua-claim-img-wrapper {
          position: relative;
          height: 180px;
          background: #f9f9f9;
        }
        .ua-claim-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ua-claim-status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ua-claim-status-badge.pending {
          background: #FFF9E6;
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .ua-claim-status-badge.claimed {
          background: #E8F5E9;
          color: #2E7D32;
          border: 1px solid rgba(46, 125, 50, 0.3);
        }
        .ua-claim-info {
          padding: 15px;
          flex-grow: 1;
        }
        .ua-claim-name {
          font-size: 15px;
          font-weight: 600;
          color: #051838;
          margin: 0 0 5px 0;
          line-height: 1.4;
        }
        .ua-claim-meta {
          font-size: 12px;
          color: #828282;
          margin: 0 0 10px 0;
        }
        .ua-claim-value {
          font-size: 14px;
          font-weight: 700;
          color: #E94FA8;
          margin: 0;
        }
        .ua-claim-actions {
          padding: 0 15px 15px 15px;
        }
        .ua-claim-btn-action {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .claim-pending-btn {
          background: #051838;
          color: #ffffff;
          border: none;
        }
        .claim-pending-btn:hover {
          background: #112d5a;
          transform: scale(1.02);
        }
        .claim-done-btn {
          background: #f2f2f2;
          color: #828282;
          border: 1px solid #e0e0e0;
          cursor: not-allowed;
        }

        .ua-claims-empty-state, .ua-reviews-empty-state {
          text-align: center;
          padding: 50px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        .empty-sparkles-icon, .empty-reviews-icon {
          color: #E0E0E0;
          margin-bottom: 15px;
        }
        .ua-claims-empty-state p, .ua-reviews-empty-state p {
          color: #828282;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .ua-reviews-tabs {
          display: flex;
          gap: 15px;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 25px;
        }
        .ua-review-tab-btn {
          background: none;
          border: none;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #828282;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        .ua-review-tab-btn:hover {
          color: #051838;
        }
        .ua-review-tab-btn.active {
          color: #051838;
        }
        .ua-review-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #051838;
        }

        .ua-reviews-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
        .ua-review-pending-card {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .ua-rp-img {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          object-fit: cover;
        }
        .ua-rp-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .ua-rp-name {
          font-size: 14px;
          font-weight: 600;
          color: #051838;
          margin: 0 0 3px 0;
        }
        .ua-rp-meta {
          font-size: 11px;
          color: #828282;
          margin-bottom: 8px;
        }
        .ua-rp-btn-review {
          align-self: flex-start;
          background: #E94FA8;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ua-rp-btn-review:hover {
          background: #d83d97;
        }

        .ua-submitted-reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ua-review-item-card {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
        }
        .ua-rev-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        .ua-rev-img {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          object-fit: cover;
        }
        .ua-rev-meta {
          flex-grow: 1;
        }
        .ua-rev-product-name {
          font-size: 15px;
          font-weight: 600;
          color: #051838;
          margin: 0 0 4px 0;
        }
        .ua-rev-stars-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ua-rev-date {
          font-size: 12px;
          color: #828282;
          margin-left: 8px;
        }
        .ua-rev-status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .ua-rev-status-badge.pending {
          background: #FFF9E6;
          color: #D4AF37;
        }
        .ua-rev-status-badge.approved {
          background: #E8F5E9;
          color: #2E7D32;
        }
        .ua-rev-status-badge.rejected {
          background: #FFEBEE;
          color: #C62828;
        }
        .ua-rev-comment {
          font-size: 14px;
          color: #4f4f4f;
          line-height: 1.5;
          margin-bottom: 15px;
        }
        .ua-verified-purchase-badge {
          display: inline-block;
          font-size: 11px;
          color: #2E7D32;
          font-weight: 600;
          background: #E8F5E9;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 5px;
        }
        .ua-rev-admin-reply {
          background: #f9f9f9;
          border-left: 3px solid #051838;
          padding: 12px 15px;
          border-radius: 0 8px 8px 0;
          margin-top: 15px;
        }
        .ua-reply-title {
          font-size: 12px;
          font-weight: 700;
          color: #051838;
          margin: 0 0 5px 0;
        }
        .ua-reply-text {
          font-size: 13px;
          font-style: italic;
          color: #4f4f4f;
          margin: 0;
        }

        .ua-modal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .ua-modal-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #828282;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ua-modal-close-btn:hover {
          background: #f2f2f2;
          color: #051838;
        }
        .ua-review-modal-product-summary {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #f9f9f9;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .ua-rmps-img {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          object-fit: cover;
        }
        .ua-review-modal-product-summary h4 {
          font-size: 14px;
          font-weight: 600;
          color: #051838;
          margin: 0 0 3px 0;
        }
        .ua-review-modal-product-summary p {
          font-size: 11px;
          color: #828282;
          margin: 0;
        }
        .ua-star-rating-selector {
          display: flex;
          gap: 8px;
          margin: 10px 0;
        }
        .ua-star-selector-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: transform 0.2s ease;
        }
        .ua-star-selector-btn:hover {
          transform: scale(1.15);
        }
        .ua-form-textarea {
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
        }
        .ua-form-textarea:focus {
          outline: none;
          border-color: #051838;
        }
      ` }} />
    </div>
  );
}
