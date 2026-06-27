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
  CheckCircle,
  Printer,
  CreditCard,
  Truck,
  Calendar
} from 'lucide-react';
import { resolveProductImage } from '../utils/imageHelper';
import { useToast } from './ToastProvider';

export default function UserAccount({ authUser, setAuthUser, onNavigate }) {
  const { addToast } = useToast();
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

  // Order Details Modal States
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

  // Hidden File Input for Avatar Uploads
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
      const orderId = params.get('orderId');
      if (orderId && userOrders.length > 0) {
        const match = userOrders.find(o => String(o.id) === String(orderId));
        if (match) {
          setSelectedOrderDetails(match);
          setShowOrderDetailsModal(true);
        }
      } else if (!orderId) {
        setShowOrderDetailsModal(false);
        setSelectedOrderDetails(null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [userOrders]);

  useEffect(() => {
    const restrictedTabs = ['orders', 'addresses', 'profile', 'security', 'help', 'rewards', 'reviews'];
    if (restrictedTabs.includes(activeTab) && !authUser) {
      const hasToken = localStorage.getItem('mithira_auth_token');
      if (!hasToken) {
        setActiveTab('cart');
        window.dispatchEvent(new CustomEvent('mithira_open_auth_modal', { detail: { type: 'user' } }));
      }
    }
  }, [activeTab, authUser]);

  const handleTabChange = (tabName) => {
    const restrictedTabs = ['orders', 'addresses', 'profile', 'security', 'help', 'rewards', 'reviews'];
    if (restrictedTabs.includes(tabName) && !authUser) {
      addToast({ message: `Please log in to access ${tabName === 'help' ? 'account deletion' : tabName === 'profile' ? 'profile settings' : tabName === 'rewards' ? 'rewards and claims' : tabName === 'reviews' ? 'reviews and ratings' : tabName}.`, type: 'info' });
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
      addToast({ message: `Minimum spend of ₹${minVal} required for coupon ${coupon.code}`, type: 'error' });
      return;
    }
    setAppliedCoupon(coupon);
    addToast({ message: `Coupon ${coupon.code} applied successfully!`, type: 'success' });
  };

  const handleApplyPromoCode = () => {
    if (!couponCodeInput.trim()) return;
    const match = coupons.find(c => c.code === couponCodeInput.trim().toUpperCase());
    if (match) {
      applyCouponObject(match);
    } else {
      addToast({ message: 'Invalid or inactive coupon code.', type: 'error' });
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
      addToast({ message: 'Please log in to place your order.', type: 'info' });
      window.dispatchEvent(new CustomEvent('mithira_open_auth_modal', { detail: { type: 'user' } }));
      return;
    }
    if (!selectedAddressId) {
      addToast({ message: 'Please select a delivery address.', type: 'error' });
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
      catalogueDetails: catDetails,
      shippingAddress: selectedAddr || {},
      subtotal: calculateSubtotal(),
      gst: calculateGST(),
      shipping: calculateShipping(),
      discount: calculateDiscount()
    };

    apiService.createOrder(orderPayload).then(async (res) => {
      if (!res || !res.success) {
        addToast({ message: 'Failed to place order. Please try again.', type: 'error' });
        return;
      }

      // If COD or direct flow
      if (!res.requiresRazorpay) {
        addToast({ message: 'Order placed successfully! Thank you for shopping with us.', type: 'success' });
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
              addToast({ message: 'Mock payment successful! Order placed.', type: 'success' });
              completeOrderCheckout(verifyRes.order);
            } else {
              addToast({ message: 'Mock payment verification failed.', type: 'error' });
            }
          });
        } else {
          addToast({ message: 'Payment cancelled.', type: 'info' });
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
        addToast({ message: 'Failed to load Razorpay SDK. Please check your internet connection.', type: 'error' });
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
              addToast({ message: 'Payment successful and verified! Order placed.', type: 'success' });
              completeOrderCheckout(verifyRes.order);
            } else {
              addToast({ message: 'Payment verification failed.', type: 'error' });
            }
          } catch (err) {
            console.error(err);
            addToast({ message: 'Error verifying payment.', type: 'error' });
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
    { label: 'Total Orders', value: String(userOrders.length), linkText: 'View all orders', tab: 'orders', color: '#D4AF37', icon: <ShoppingBag size={20} className="ua-card-icon-gold" /> },
    { label: 'Wishlist', value: String(wishlistItems.length), linkText: 'View wishlist', tab: 'wishlist', color: '#D4AF37', icon: <Heart size={20} className="ua-card-icon-gold" /> },
    { label: 'Saved Addresses', value: String(addresses.length), linkText: 'Manage addresses', tab: 'addresses', color: '#D4AF37', icon: <MapPin size={20} className="ua-card-icon-gold" /> },
    { label: 'Reward Points', value: String(250 + myClaims.filter(c => c.status === 'Claimed').length * 100), linkText: 'View rewards', tab: 'rewards', color: '#D4AF37', icon: <Sparkles size={20} className="ua-card-icon-gold" /> }
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
          const params = new URLSearchParams(window.location.search);
          const orderId = params.get('orderId');
          if (orderId) {
            const match = list.find(o => String(o.id) === String(orderId));
            if (match) {
              setSelectedOrderDetails(match);
              setShowOrderDetailsModal(true);
            }
          }
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
      addToast({ message: 'Address deleted successfully!', type: 'success' });
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
        addToast({ message: 'Address updated successfully!', type: 'success' });
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
        addToast({ message: 'Address added successfully!', type: 'success' });
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
      addToast({ message: 'Profile updated successfully!', type: 'success' });
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
      addToast({ message: 'New password and confirm password do not match.', type: 'error' });
      return;
    }
    apiService.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new
    }).then(success => {
      if (success) {
        addToast({ message: 'Password updated successfully!', type: 'success' });
        setPasswordForm({ current: '', new: '', confirm: '' });
      } else {
        addToast({ message: 'Failed to update password. Please verify current password.', type: 'error' });
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
        addToast({ message: 'Review submitted successfully! It will appear once approved by Admin.', type: 'success' });
        setIsReviewModalOpen(false);
        setReviewComment('');
        setReviewRating(5);
        apiService.getMyReviews().then(reviews => {
          if (reviews) setMyReviews(reviews);
        });
      }
    } catch (err) {
      console.error(err);
      addToast({ message: 'Failed to submit review.', type: 'error' });
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
      addToast({ message: 'File is too large. Maximum size is 2MB.', type: 'error' });
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
            addToast({ message: 'Profile picture updated successfully!', type: 'success' });
          }
        } else {
          addToast({ message: 'Photo uploaded. Click "Save Changes" on the form to save permanently.', type: 'info' });
        }
      } catch (err) {
        console.error(err);
        addToast({ message: 'Failed to upload image.', type: 'error' });
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
        addToast({ message: `Coupon ${claim.couponCode} applied!`, type: 'success' });
      }
      return;
    }
    
    if (claim.rewardType === 'product') {
      const itemInCart = cartItemsDetailed.some(item => 
        item.id === claim.productId && item.selectedVariant?.isLuckyCharm === true
      );
      if (itemInCart) {
        addToast({ message: 'This reward item is already in your cart.', type: 'info' });
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
          addToast({ message: `${claim.rewardName} added to cart as a reward! Go to cart to checkout.`, type: 'success' });
          setActiveTab('cart');
        }
      });
    }
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrderDetails(order);
    setShowOrderDetailsModal(true);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', 'orders');
    params.set('orderId', order.id);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetailsModal(false);
    setSelectedOrderDetails(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('orderId');
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleReorder = (rawOrder) => {
    if (!rawOrder || !rawOrder.items || rawOrder.items.length === 0) return;
    
    const itemsToAdd = rawOrder.items.map(item => {
      const match = allProducts.find(p => String(p.id) === String(item.productId) || String(p._id) === String(item.productId));
      if (match) {
        return {
          productId: match.id || match._id,
          quantity: item.quantity || 1,
          variant: item.variant || { size: null, color: null, variantId: null, sku: null }
        };
      }
      return null;
    }).filter(Boolean);

    if (itemsToAdd.length === 0) {
      addToast({ message: 'These products are no longer available in the store.', type: 'error' });
      return;
    }

    let currentCartItems = [];
    let currentCartIds = [];
    try {
      currentCartItems = authUser ? (authUser.cartItems || []) : JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]');
      currentCartIds = authUser ? (authUser.cart || []) : JSON.parse(localStorage.getItem('mithira_guest_cart') || '[]');
    } catch {
      currentCartItems = [];
      currentCartIds = [];
    }

    itemsToAdd.forEach(newItem => {
      const existingIndex = currentCartItems.findIndex(existing => 
        String(existing.productId) === String(newItem.productId) &&
        (!existing.variant || !newItem.variant || (existing.variant.size === newItem.variant.size && existing.variant.color === newItem.variant.color))
      );

      if (existingIndex > -1) {
        currentCartItems[existingIndex].quantity += newItem.quantity;
      } else {
        currentCartItems.push(newItem);
        currentCartIds.push(String(newItem.productId));
      }
    });

    const uniqueIds = Array.from(new Set(currentCartIds));
    
    if (authUser) {
      apiService.syncCart(uniqueIds, currentCartItems).then(res => {
        if (res && setAuthUser) {
          setAuthUser(prev => {
            const newUser = { ...prev, cart: res.cart || uniqueIds, cartItems: res.cartItems || currentCartItems };
            localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
            return newUser;
          });
          addToast({ message: 'All items from this order have been added to your cart!', type: 'success' });
          handleTabChange('cart');
        }
      });
    } else {
      localStorage.setItem('mithira_guest_cart', JSON.stringify(uniqueIds));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(currentCartItems));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mithira_cart_update'));
      addToast({ message: 'All items from this order have been added to your cart!', type: 'success' });
      handleTabChange('cart');
    }
  };

  const handleDownloadInvoice = (rawOrder) => {
    if (!rawOrder) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    const itemsRows = (rawOrder.items || []).map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${item.name}</strong>
          ${item.variant && (item.variant.size || item.variant.color) ? `
            <div style="font-size: 11px; color: #555; margin-top: 3px;">
              Variant: ${item.variant.size ? `Size ${item.variant.size}` : ''} ${item.variant.color ? `| Color ${item.variant.color}` : ''}
            </div>
          ` : ''}
        </td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">₹${(item.price || 0).toLocaleString('en-IN')}</td>
        <td style="text-align: right;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const addr = rawOrder.shippingAddress || {};
    const addressHtml = addr.name ? `
      <strong>${addr.name}</strong><br/>
      ${addr.street || ''}, ${addr.locality || ''}<br/>
      ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}<br/>
      Phone: ${addr.phone || ''}
    ` : `
      <strong>${rawOrder.customer || ''}</strong><br/>
      Address details are not available.
    `;

    const totalAmount = parseFloat(String(rawOrder.amount).replace(/[₹,]/g, '').trim()) || 0;
    const subtotal = rawOrder.subtotal || Math.round(totalAmount / 1.18);
    const gst = rawOrder.gst || Math.round(subtotal * 0.18);
    const shipping = rawOrder.shipping !== undefined ? rawOrder.shipping : (subtotal < 999 && subtotal > 0 ? 99 : 0);
    const discount = rawOrder.discount || 0;

    const htmlContent = `
      <html>
      <head>
        <title>Invoice - Mithira Shopy - ${rawOrder.id}</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #111; padding: 40px; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #051838; }
          .logo span { color: #D4AF37; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { margin: 0; font-size: 28px; color: #051838; }
          .details-row { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
          .details-box { width: 45%; }
          .details-box h3 { border-bottom: 1px solid #eae6df; padding-bottom: 5px; color: #051838; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          th { background: #faf9f6; color: #051838; border-bottom: 2px solid #eae6df; padding: 12px; font-weight: 600; text-align: left; }
          td { border-bottom: 1px solid #eae6df; padding: 12px; vertical-align: top; }
          .summary-table { width: 40%; margin-left: auto; border: none; }
          .summary-table td { border: none; padding: 6px 12px; }
          .summary-table .total-row { border-top: 1px solid #eae6df; font-weight: 700; color: #D4AF37; font-size: 16px; }
          .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #777; border-top: 1px solid #eae6df; padding-top: 20px; }
          .seal { display: inline-block; border: 2px dashed #2E7D32; color: #2E7D32; padding: 6px 12px; border-radius: 4px; font-weight: 700; text-transform: uppercase; font-size: 12px; transform: rotate(-5deg); margin-top: 15px; }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #D4AF37; color: #fff; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 700; cursor: pointer;">Print Invoice</button>
          <button onclick="window.close()" style="background: #eae6df; color: #333; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 700; cursor: pointer;">Close Window</button>
        </div>
        <div class="header">
          <div class="logo">Mithira <span>Shopy</span></div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <div style="margin-top: 5px;">Invoice No: <strong>INV-${rawOrder.id.replace('#', '')}</strong></div>
          </div>
        </div>
        
        <div class="details-row">
          <div class="details-box">
            <h3>Vendor Details</h3>
            <strong>Mithira Shopy Official Ltd.</strong><br/>
            12-4/A, Jubilee Hills, Metro Pillar Road<br/>
            Hyderabad, Telangana - 500033<br/>
            Email: support@mithirashoppy.com<br/>
            GSTIN: 36AAAAA1111A1Z1
          </div>
          <div class="details-box">
            <h3>Shipping Details</h3>
            ${addressHtml}
            <br/>
            Date Ordered: ${rawOrder.date}<br/>
            Payment Method: ${rawOrder.payment}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 8%;">S.No</th>
              <th style="width: 50%;">Product Details</th>
              <th style="text-align: center; width: 10%;">Qty</th>
              <th style="text-align: right; width: 15%;">Unit Price</th>
              <th style="text-align: right; width: 17%;">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="seal">Payment Received</div>
          </div>
          <table class="summary-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">₹${subtotal.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>GST (18%):</td>
              <td style="text-align: right;">₹${gst.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Shipping Charges:</td>
              <td style="text-align: right;">₹${shipping === 0 ? 'FREE' : `₹${shipping}`}</td>
            </tr>
            ${discount > 0 ? `
            <tr style="color: #2E7D32;">
              <td>Discount:</td>
              <td style="text-align: right;">-₹${discount.toLocaleString('en-IN')}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td>Grand Total:</td>
              <td style="text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for shopping with Mithira Shopy! For customer support, reach out to us at <strong>support@mithirashoppy.com</strong>.</p>
          <p>This is a computer generated invoice and does not require a physical signature.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getTimelineSteps = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'cancelled') {
      return (
        <div className="tracking-timeline cancelled-timeline">
          <div className="timeline-step completed cancelled">
            <div className="timeline-circle"><X size={14} /></div>
            <div className="timeline-label">Cancelled</div>
          </div>
        </div>
      );
    }

    const steps = [
      { key: 'placed', label: 'Order Placed', active: true, done: true },
      { key: 'processing', label: 'Processing', active: ['processing', 'shipped', 'delivered'].includes(s), done: ['shipped', 'delivered'].includes(s) },
      { key: 'shipped', label: 'Shipped', active: ['shipped', 'delivered'].includes(s), done: ['delivered'].includes(s) },
      { key: 'delivered', label: 'Delivered', active: s === 'delivered', done: s === 'delivered' }
    ];

    return (
      <div className="tracking-timeline">
        {steps.map((step, idx) => {
          let stepClass = '';
          if (step.done) stepClass = 'completed';
          else if (step.active) stepClass = 'active';
          else stepClass = 'upcoming';

          return (
            <React.Fragment key={step.key}>
              <div className={`timeline-step ${stepClass}`}>
                <div className="timeline-circle">
                  {step.done ? <CheckCircle size={14} /> : (idx + 1)}
                </div>
                <div className="timeline-label">{step.label}</div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`timeline-line ${step.done ? 'completed' : 'upcoming'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderShippingAddressDetails = (order) => {
    const addr = order.shippingAddress || {};
    if (!addr.name) {
      return (
        <div className="address-display-placeholder">
          <p><strong>{order.customer}</strong></p>
          <p style={{ fontStyle: 'italic', color: '#777' }}>Detailed shipping address is not available for this legacy order.</p>
        </div>
      );
    }
    return (
      <div className="address-display-details">
        <p><strong>{addr.name}</strong></p>
        <p>{addr.street}{addr.locality ? `, ${addr.locality}` : ''}</p>
        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
        <p style={{ marginTop: '5px' }}>Phone: <strong>{addr.phone}</strong></p>
      </div>
    );
  };

  const renderBillingDetails = (order) => {
    const totalAmount = parseFloat(String(order.amount).replace(/[₹,]/g, '').trim()) || 0;
    const subtotal = order.subtotal || Math.round(totalAmount / 1.18);
    const gst = order.gst || Math.round(subtotal * 0.18);
    const shipping = order.shipping !== undefined ? order.shipping : (subtotal < 999 && subtotal > 0 ? 99 : 0);
    const discount = order.discount || 0;

    return (
      <div className="billing-details-breakdown">
        <div className="billing-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="billing-row">
          <span>GST (18%)</span>
          <span>₹{gst.toLocaleString('en-IN')}</span>
        </div>
        <div className="billing-row">
          <span>Shipping Fee</span>
          <span>{shipping === 0 ? <span style={{ color: '#2E7D32', fontWeight: 600 }}>FREE</span> : `₹${shipping}`}</span>
        </div>
        {discount > 0 && (
          <div className="billing-row discount-row" style={{ color: '#2E7D32' }}>
            <span>Promo Discount</span>
            <span>-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="billing-row total-row" style={{ borderTop: '1px solid #eae6df', paddingTop: '10px', marginTop: '10px', fontWeight: 700, fontSize: '1.05rem', color: '#051838' }}>
          <span>Grand Total</span>
          <span style={{ color: '#D4AF37' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  };

  const renderOrderItems = (order) => {
    return (order.items || []).map((item, index) => {
      const match = allProducts.find(p => String(p.id) === String(item.productId) || String(p._id) === String(item.productId));
      const image = match ? resolveProductImage(match) : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80';
      
      return (
        <div key={index} className="order-details-item-row">
          <img src={image} alt={item.name} className="item-thumbnail" />
          <div className="item-details">
            <h5 className="item-name">{item.name}</h5>
            {item.variant && (item.variant.size || item.variant.color) && (
              <div className="item-variant">
                {item.variant.size ? `Size: ${item.variant.size} ` : ''}
                {item.variant.color ? `| Color: ${item.variant.color}` : ''}
              </div>
            )}
            <div className="item-price-qty">
              <span>₹{(item.price || 0).toLocaleString('en-IN')} × {item.quantity}</span>
              <span className="item-row-total">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      );
    });
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
                          <h4 className="ua-order-number">Order {order.id.startsWith('#') ? order.id : '#' + order.id}</h4>
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
                          <button className="ua-btn-secondary tracking-btn" onClick={() => handleOpenOrderDetails(order.rawOrder)}>
                            Track Order
                          </button>
                        ) : (
                          <button className="ua-btn-secondary" onClick={() => handleOpenOrderDetails(order.rawOrder)}>
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
                           Order {order.id.startsWith('#') ? order.id : '#' + order.id}
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
                        <button 
                          className="ua-od-action-btn btn-view-details"
                          onClick={() => handleOpenOrderDetails(order.rawOrder)}
                        >
                          View Details
                        </button>

                        {order.status === 'Delivered' && (
                          <>
                            <button 
                              className="ua-od-action-btn btn-secondary-action"
                              onClick={() => handleDownloadInvoice(order.rawOrder)}
                            >
                              Download Invoice
                            </button>
                            <button 
                              className="ua-od-action-btn btn-reorder"
                              onClick={() => handleReorder(order.rawOrder)}
                            >
                              Reorder
                            </button>
                          </>
                        )}

                        {order.status === 'Shipped' && (
                          <>
                            <button 
                              className="ua-od-action-btn btn-secondary-action"
                              onClick={() => handleOpenOrderDetails(order.rawOrder)}
                            >
                              Track Order
                            </button>
                            <button 
                              className="ua-od-action-btn btn-reorder"
                              onClick={() => handleReorder(order.rawOrder)}
                            >
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
                                  addToast({ message: 'Order cancelled successfully!', type: 'success' });
                                  apiService.getOrders().then(list => {
                                    if (list) setUserOrders(list);
                                  });
                                }).catch(err => {
                                  addToast({ message: err.message || 'Failed to cancel order.', type: 'error' });
                                });
                              }
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                        
                        {order.status === 'Cancelled' && (
                          <button 
                            className="ua-od-action-btn btn-reorder"
                            onClick={() => handleReorder(order.rawOrder)}
                          >
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
                            <Heart size={16} fill="#D4AF37" stroke="#D4AF37" />
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
                                addToast({ message: `Added ${item.title} to cart!`, type: 'success' });
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

      {showOrderDetailsModal && selectedOrderDetails && (
        <div className="ua-modal-overlay" onClick={handleCloseOrderDetails}>
          <div className="ua-modal-card order-details-modal-card" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="ua-modal-header-row">
              <div>
                <h3 className="ua-modal-title">Order Details</h3>
                <p className="order-details-subtitle">Order #{selectedOrderDetails.id} • Placed on {selectedOrderDetails.date}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  className="order-details-header-btn" 
                  title="Print Invoice"
                  onClick={() => handleDownloadInvoice(selectedOrderDetails)}
                >
                  <Printer size={15} />
                  <span>Invoice</span>
                </button>
                <button className="ua-modal-close-btn" onClick={handleCloseOrderDetails}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="order-details-modal-body">
              
              {/* Order Status Visual Tracker */}
              <div className="order-tracking-section">
                <h4 className="order-details-section-title">Order Status</h4>
                {getTimelineSteps(selectedOrderDetails.status)}
              </div>

              {/* Shipping Address & Payment Info Grid */}
              <div className="order-info-grid">
                <div className="order-info-block">
                  <div className="block-title-row">
                    <MapPin size={16} className="block-icon" />
                    <h5>Shipping Address</h5>
                  </div>
                  <div className="block-content">
                    {renderShippingAddressDetails(selectedOrderDetails)}
                  </div>
                </div>
                
                <div className="order-info-block">
                  <div className="block-title-row">
                    <CreditCard size={16} className="block-icon" />
                    <h5>Payment & Billing</h5>
                  </div>
                  <div className="block-content">
                    <div style={{ marginBottom: '8px' }}>
                      Payment Method: <strong>{selectedOrderDetails.payment}</strong>
                    </div>
                    <div>
                      Payment Status: <span style={{ 
                        color: selectedOrderDetails.status?.toLowerCase() === 'pending payment' ? '#C62828' : 
                               selectedOrderDetails.status?.toLowerCase() === 'cancelled' ? '#666' : '#2E7D32',
                        fontWeight: 700 
                      }}>
                        {selectedOrderDetails.status?.toLowerCase() === 'pending payment' ? 'Pending' : 
                         selectedOrderDetails.status?.toLowerCase() === 'cancelled' ? 'No Payment' : 'Paid'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="order-items-section">
                <h4 className="order-details-section-title">Items Ordered</h4>
                <div className="order-items-details-list">
                  {renderOrderItems(selectedOrderDetails)}
                </div>
              </div>

              {/* Summary and Grand Total */}
              <div className="order-billing-summary-block">
                <h4 className="order-details-section-title">Billing Summary</h4>
                {renderBillingDetails(selectedOrderDetails)}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="ua-modal-actions order-details-footer">
              <button 
                type="button" 
                className="ua-modal-btn btn-cancel" 
                onClick={handleCloseOrderDetails}
              >
                Close View
              </button>
              <button 
                type="button" 
                className="ua-modal-btn btn-save" 
                onClick={() => handleReorder(selectedOrderDetails)}
              >
                Reorder Items
              </button>
            </div>

          </div>
        </div>
      )}

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
          color: #D4AF37;
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
          background: #051838;
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
          background: #112d5a;
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

        /* Order Details Modal Styles */
        .order-details-modal-card {
          max-width: 680px;
          width: 95%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .order-details-subtitle {
          font-size: 13px;
          color: #828282;
          margin-top: 3px;
          margin-bottom: 0;
        }
        .order-details-header-btn {
          background: #faf9f6;
          border: 1px solid #eae6df;
          color: #051838;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .order-details-header-btn:hover {
          background: #D4AF37;
          border-color: #D4AF37;
          color: #ffffff;
        }
        .order-details-modal-body {
          max-height: 60vh;
          overflow-y: auto;
          padding: 10px 5px;
          margin-bottom: 10px;
        }
        .order-details-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #051838;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 15px 0;
          border-left: 3px solid #D4AF37;
          padding-left: 8px;
        }
        .order-tracking-section {
          background: #faf9f6;
          border: 1px solid #eae6df;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        /* Timeline Tracker Styles */
        .tracking-timeline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          margin: 15px 0 5px 0;
          padding: 0 10px;
        }
        .cancelled-timeline {
          justify-content: center;
        }
        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
          width: 80px;
          text-align: center;
        }
        .timeline-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .timeline-label {
          font-size: 11px;
          font-weight: 600;
          margin-top: 8px;
          color: #828282;
        }
        .timeline-line {
          flex-grow: 1;
          height: 3px;
          background: #eae6df;
          margin: 0 -20px;
          position: relative;
          top: -19px;
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        /* Timeline States */
        .timeline-step.completed .timeline-circle {
          background: #E8F5E9;
          color: #2E7D32;
          border: 2px solid #2E7D32;
        }
        .timeline-step.completed .timeline-label {
          color: #2E7D32;
        }
        .timeline-step.active .timeline-circle {
          background: #051838;
          color: #ffffff;
          border: 2px solid #051838;
          box-shadow: 0 0 0 4px rgba(5, 24, 56, 0.15);
          animation: timelinePulse 2s infinite;
        }
        .timeline-step.active .timeline-label {
          color: #051838;
          font-weight: 700;
        }
        .timeline-step.upcoming .timeline-circle {
          background: #ffffff;
          color: #828282;
          border: 2px solid #eae6df;
        }
        .timeline-line.completed {
          background: #2E7D32;
        }
        .timeline-line.upcoming {
          background: #eae6df;
        }
        
        .timeline-step.completed.cancelled .timeline-circle {
          background: #FFEBEE;
          color: #C62828;
          border: 2px solid #C62828;
        }
        .timeline-step.completed.cancelled .timeline-label {
          color: #C62828;
        }

        @keyframes timelinePulse {
          0% { box-shadow: 0 0 0 0 rgba(5, 24, 56, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(5, 24, 56, 0); }
          100% { box-shadow: 0 0 0 0 rgba(5, 24, 56, 0); }
        }

        /* Address & Payment Info Grid */
        .order-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .order-info-block {
          border: 1px solid #eae6df;
          border-radius: 12px;
          padding: 16px;
          background: #ffffff;
        }
        .block-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #eae6df;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .block-icon {
          color: #D4AF37;
        }
        .block-title-row h5 {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
          color: #051838;
          text-transform: uppercase;
        }
        .block-content {
          font-size: 13px;
          line-height: 1.5;
          color: #4f4f4f;
        }
        
        /* Items Details */
        .order-items-details-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .order-details-item-row {
          display: flex;
          gap: 15px;
          align-items: center;
          padding: 12px;
          border: 1px solid #eae6df;
          border-radius: 10px;
          background: #ffffff;
          transition: background-color 0.2s ease;
        }
        .order-details-item-row:hover {
          background-color: #faf9f6;
        }
        .item-thumbnail {
          width: 55px;
          height: 55px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #eae6df;
        }
        .item-details {
          flex-grow: 1;
        }
        .item-name {
          margin: 0 0 2px 0;
          font-size: 13px;
          font-weight: 600;
          color: #051838;
        }
        .item-variant {
          font-size: 11px;
          color: #D4AF37;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .item-price-qty {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #777;
        }
        .item-row-total {
          font-weight: 700;
          color: #051838;
        }
        
        /* Billing Details Breakdown */
        .billing-details-breakdown {
          border-top: 1px solid #eae6df;
          padding-top: 15px;
          margin-top: 5px;
        }
        .billing-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #555;
          margin-bottom: 8px;
        }
        .discount-row {
          font-weight: 600;
        }
        .order-details-footer {
          border-top: 1px solid #eae6df;
          padding-top: 15px;
          margin-top: 0;
        }
      ` }} />
    </div>
  );
}
