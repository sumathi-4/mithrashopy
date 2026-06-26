import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { Gift, X, Sparkles, Trophy, CheckCircle, ShoppingBag, Star } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Lucky Charm Modal
   Step 1: Landing popup (dark royal blue – image1)
   Step 2: Spin Wheel  (cream/white – image2)
   Step 3: Congratulations (– image3)
   Step 4: Order success
───────────────────────────────────────────────────────────────────────────── */
export default function LuckyCharmModal() {
  const [isOpen, setIsOpen]     = useState(false);
  const [step,   setStep]       = useState('landing'); // 'landing' | 'spinning' | 'congratulations' | 'orderSuccess'
  const [rewards, setRewards]   = useState([]);
  const [wonReward, setWonReward] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg]   = useState(0);
  const [orderId, setOrderId]   = useState('');
  const [isLuckyOrder, setIsLuckyOrder] = useState(false);
  const wheelRef = useRef(null);

  const [sessionId, setSessionId] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const debounceTimerRef = useRef(null);
  const isCheckingRef = useRef(false);

  // Helper: Retrieve current cart items
  const getCurrentCartItems = useCallback(() => {
    let authUser = null;
    try {
      const stored = localStorage.getItem('mithira_auth_user');
      if (stored) authUser = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    if (authUser) {
      return authUser.cartItems || [];
    } else {
      try {
        return JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]');
      } catch (e) {
        console.error(e);
        return [];
      }
    }
  }, []);

  const fetchActiveRewards = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    try {
      const cartItems = getCurrentCartItems();
      const res = await apiService.checkLuckyCharmEligibility(cartItems);
      if (res?.success && res.available && res.rewards?.length > 0) {
        setRewards(res.rewards);
        setSessionId(res.sessionId || '');
        setIsAvailable(true);
        setErrorMessage('');
      } else {
        setRewards([]);
        setSessionId('');
        setIsAvailable(false);
        setErrorMessage(res?.message || 'Lucky Charm is not available.');
      }
    } catch (e) {
      console.error('Error checking lucky charm eligibility:', e);
      setRewards([]);
      setSessionId('');
      setIsAvailable(false);
      setErrorMessage('Failed to load campaign data.');
    } finally {
      isCheckingRef.current = false;
    }
  }, [getCurrentCartItems]);

  const triggerEligibilityCheckDebounced = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchActiveRewards();
    }, 600);
  }, [fetchActiveRewards]);

  // ── Open when navigating to /lucky-charms ──────────────────────────────────
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/lucky-charms')) {
        // Disabled auto-open modal popup on path since we route to full page.
      }
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [fetchActiveRewards]);

  // ── Listen to cart updates (debounced) ─────────────────────────────────────
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isOpen) {
        triggerEligibilityCheckDebounced();
      }
    };
    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('mithira_cart_update', handleCartUpdate);
    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('mithira_cart_update', handleCartUpdate);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOpen, triggerEligibilityCheckDebounced]);

  // ── Order success listener ─────────────────────────────────────────────────
  useEffect(() => {
    const handleOrderSuccess = (e) => {
      if (e.detail?.orderId) {
        setOrderId(e.detail.orderId);
        setIsLuckyOrder(!!e.detail.isLuckyCharm || e.type === 'mithira_lucky_charm_success');
        setStep('orderSuccess');
        setIsOpen(true);
      }
    };
    window.addEventListener('mithira_lucky_charm_success', handleOrderSuccess);
    window.addEventListener('mithira_order_success', handleOrderSuccess);
    return () => {
      window.removeEventListener('mithira_lucky_charm_success', handleOrderSuccess);
      window.removeEventListener('mithira_order_success', handleOrderSuccess);
    };
  }, []);

  const handleClose = () => {
    const wasSuccess = step === 'orderSuccess';
    setIsOpen(false);
    setStep('landing');
    setWonReward(null);
    setSpinDeg(0);
    if (wasSuccess) {
      window.history.pushState({}, '', '/account?tab=orders');
      window.dispatchEvent(new Event('popstate'));
      return;
    }
    if (window.location.pathname.toLowerCase().includes('/lucky-charms')) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // ── Go to spin step ────────────────────────────────────────────────────────
  const goToSpin = () => {
    setStep('spinning');
    setWonReward(null);
    setSpinDeg(0);
  };

  // ── Spin handler ───────────────────────────────────────────────────────────
  const startSpin = async () => {
    if (isSpinning || rewards.length === 0 || !sessionId) return;
    setIsSpinning(true);

    try {
      const cartItems = getCurrentCartItems();
      const res = await apiService.spinLuckyCharm(sessionId, cartItems);
      if (res?.success && res.won) {
        const won = res.reward;

        let index = rewards.findIndex(r =>
          won.rewardType === 'product' && String(r.productId) === String(won.productId)
        );
        if (index === -1) index = 0;

        const segCount    = rewards.length;
        const segAngle    = 360 / segCount;
        const stopAngle   = 360 - (index * segAngle) - segAngle / 2;
        const newRotation = spinDeg + 1800 + stopAngle - (spinDeg % 360);

        setSpinDeg(newRotation);

        setTimeout(() => {
          setWonReward(won);
          setStep('congratulations');
          setIsSpinning(false);
          fetchActiveRewards();
        }, 4200);
      } else {
        alert(res?.message || 'Spin failed, please try again.');
        setIsSpinning(false);
        fetchActiveRewards();
      }
    } catch (err) {
      console.error(err);
      alert('Network error, please try again.');
      setIsSpinning(false);
    }
  };

  // ── Claim reward ───────────────────────────────────────────────────────────
  const claimReward = async () => {
    if (!wonReward) return;

    const productId = wonReward.productId || 111;
    const variant   = {
      isLuckyCharm: true,
      rewardPrice:  wonReward.rewardValue,
      rewardName:   wonReward.rewardName,
      rewardImage:  wonReward.image
    };

    let authUser = null;
    try {
      const stored = localStorage.getItem('mithira_auth_user');
      if (stored) authUser = JSON.parse(stored);
    } catch (e) { console.error(e); }

    let cart = [], cartItems = [];
    if (authUser) {
      cart      = authUser.cart      || [];
      cartItems = authUser.cartItems || [];
    } else {
      try {
        cart      = JSON.parse(localStorage.getItem('mithira_guest_cart')       || '[]');
        cartItems = JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]');
      } catch (e) { console.error(e); }
    }

    const existingIndex = cartItems.findIndex(item =>
      String(item.productId) === String(productId) && item.variant?.isLuckyCharm === true
    );

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += 1;
    } else {
      cartItems.push({ productId, quantity: 1, variant });
      if (!cart.includes(String(productId)) && !cart.includes(productId)) {
        cart.push(productId);
      }
    }

    if (authUser) {
      try {
        const res    = await apiService.syncCart(cart.map(String), cartItems);
        const newUser = { ...authUser, cart: res.cart || cart, cartItems: res.cartItems || cartItems };
        localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
      } catch (e) { console.error('Cart sync error:', e); }
    } else {
      localStorage.setItem('mithira_guest_cart',       JSON.stringify(cart));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(cartItems));
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('mithira_cart_update'));

    setIsOpen(false);
    window.history.pushState({}, '', '/account?tab=cart');
    window.dispatchEvent(new Event('popstate'));
  };

  // ── Wheel geometry helpers ─────────────────────────────────────────────────
  const getWheelSegments = useCallback(() => {
    const n      = rewards.length || 1;
    const r      = 150;          // svg radius
    const cx     = 160;          // svg centre x
    const cy     = 160;          // svg centre y
    const TAU    = 2 * Math.PI;
    const segments = [];

    for (let i = 0; i < n; i++) {
      const startAngle = (i / n) * TAU - Math.PI / 2;
      const endAngle   = ((i + 1) / n) * TAU - Math.PI / 2;
      const midAngle   = (startAngle + endAngle) / 2;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const large = n > 2 ? (endAngle - startAngle > Math.PI ? 1 : 0) : 0;
      const path  = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;

      // Text position (70% of radius from centre)
      const textR  = r * 0.64;
      const tx     = cx + textR * Math.cos(midAngle);
      const ty     = cy + textR * Math.sin(midAngle);
      const textDeg = (midAngle * 180) / Math.PI + 90;

      segments.push({ path, tx, ty, textDeg, reward: rewards[i], even: i % 2 === 0 });
    }
    return segments;
  }, [rewards]);

  if (!isOpen) return null;

  const segments = getWheelSegments();

  return (
    <div className="lc-overlay">
      <style>{`
        /* ═══════ OVERLAY ═══════ */
        .lc-overlay {
          position: fixed; inset: 0;
          background: rgba(5,24,56,0.88);
          backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          padding: 16px;
        }

        /* ═══════ CLOSE BUTTON ═══════ */
        .lc-close-btn {
          position: absolute; top: 16px; right: 16px;
          width: 34px; height: 34px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; z-index: 10;
        }
        .lc-close-btn:hover { background: rgba(255,255,255,0.25); transform: scale(1.1); }

        /* ═══════ STEP 1: LANDING ═══════ */
        .lc-landing-card {
          position: relative;
          background: linear-gradient(135deg, #051838 0%, #092d68 60%, #051838 100%);
          border: 2px solid #D4AF37;
          border-radius: 24px;
          width: 100%; max-width: 820px;
          min-height: 360px;
          overflow: hidden;
          display: grid; grid-template-columns: 1fr 1fr;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 50px rgba(212,175,55,0.2);
          animation: lc-pop-in 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @media(max-width:680px) {
          .lc-landing-card { grid-template-columns: 1fr; max-width: 420px; }
          .lc-landing-right { display: none; }
        }
        @keyframes lc-pop-in {
          from { transform: scale(0.88) translateY(24px); opacity: 0; }
          to   { transform: scale(1) translateY(0);    opacity: 1; }
        }
        /* Decorative sparkle dots */
        .lc-landing-card::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(212,175,55,0.25) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .lc-landing-left {
          padding: 44px 36px;
          display: flex; flex-direction: column; justify-content: center;
          position: relative; z-index: 1;
        }
        .lc-brand-tag {
          color: #D4AF37; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        .lc-hero-title {
          font-size: 2.6rem; font-weight: 900; line-height: 1.1;
          color: #fff; margin: 0 0 14px;
        }
        .lc-hero-title .gold { color: #D4AF37; display: block; }
        .lc-hero-sub {
          font-size: 1rem; color: rgba(255,255,255,0.75);
          margin-bottom: 8px; font-weight: 500;
        }
        .lc-hero-desc {
          font-size: 0.85rem; color: rgba(212,175,55,0.7);
          margin-bottom: 28px;
        }
        .lc-spin-cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: #D4AF37; color: #051838;
          border: none; border-radius: 32px;
          padding: 14px 34px;
          font-size: 1.05rem; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer; align-self: flex-start;
          box-shadow: 0 8px 24px rgba(212,175,55,0.5);
          transition: all 0.25s;
        }
        .lc-spin-cta:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 32px rgba(212,175,55,0.65); }
        .lc-guarantee {
          display: flex; align-items: center; gap: 6px;
          margin-top: 16px; font-size: 0.82rem;
          color: rgba(255,255,255,0.55);
        }
        .lc-guarantee svg { color: #D4AF37; flex-shrink: 0; }

        /* Right side: static mini wheel + gift boxes */
        .lc-landing-right {
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1; padding: 24px;
        }
        .lc-preview-wheel-wrap {
          position: relative; width: 220px; height: 220px;
          filter: drop-shadow(0 16px 40px rgba(212,175,55,0.35));
          animation: lc-float 3s ease-in-out infinite;
        }
        @keyframes lc-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .lc-preview-pointer {
          position: absolute; top: -16px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 13px solid transparent;
          border-right: 13px solid transparent;
          border-top: 22px solid #D4AF37;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
          z-index: 2;
        }
        .lc-preview-center {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 52px; height: 52px; border-radius: 50%;
          background: #051838; border: 4px solid #D4AF37;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 0.65rem; color: #D4AF37;
          text-align: center; line-height: 1.2; z-index: 3;
        }

        /* ═══════ STEP 2: SPIN WHEEL ═══════ */
        .lc-spin-card {
          position: relative;
          background: #fdfbf7;
          border-radius: 24px;
          width: 100%; max-width: 520px;
          padding: 40px 32px 36px;
          display: flex; flex-direction: column; align-items: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.4);
          animation: lc-pop-in 0.4s cubic-bezier(0.16,1,0.3,1);
          text-align: center;
        }
        .lc-spin-step-title {
          font-size: 1.85rem; font-weight: 900; color: #051838;
          margin: 0 0 4px;
        }
        .lc-spin-step-sub {
          font-size: 0.95rem; color: #8893a7; margin-bottom: 28px;
        }
        .lc-wheel-host {
          position: relative; width: 320px; height: 320px;
          margin: 0 auto 28px;
        }
        .lc-wheel-arrow {
          position: absolute; top: -4px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 16px solid transparent;
          border-right: 16px solid transparent;
          border-top: 28px solid #D4AF37;
          z-index: 10;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
        }
        .lc-wheel-svg-wrap {
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 10px solid #D4AF37;
          overflow: visible;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25), 0 0 0 4px rgba(212,175,55,0.3);
          transition: transform 4.2s cubic-bezier(0.08,0.82,0.17,1);
        }
        .lc-center-btn {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 72px; height: 72px; border-radius: 50%;
          background: #051838; border: 5px solid #D4AF37;
          color: #D4AF37; font-size: 0.9rem; font-weight: 900;
          cursor: pointer; z-index: 5;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .lc-center-btn:hover:not(:disabled) { transform: translate(-50%,-50%) scale(1.08); }
        .lc-center-btn:disabled { cursor: not-allowed; opacity: 0.8; }
        .lc-spin-footer {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.83rem; color: #8893a7;
        }
        .lc-spin-footer svg { color: #D4AF37; flex-shrink: 0; }

        /* ═══════ STEP 3: CONGRATULATIONS ═══════ */
        .lc-congrats-card {
          position: relative;
          background: #ffffff;
          border-radius: 24px;
          width: 100%; max-width: 420px;
          padding: 40px 36px 36px;
          display: flex; flex-direction: column; align-items: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.4);
          animation: lc-pop-in 0.4s cubic-bezier(0.16,1,0.3,1);
          text-align: center;
          overflow: hidden;
        }
        /* Confetti dots */
        .lc-confetti {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .lc-confetti-dot {
          position: absolute; border-radius: 50%;
          animation: lc-confetti-fall linear infinite;
        }
        @keyframes lc-confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110%) rotate(360deg); opacity: 0; }
        }
        .lc-trophy-icon {
          color: #D4AF37; margin-bottom: 12px;
          animation: lc-bounce 2s ease-in-out infinite;
        }
        @keyframes lc-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .lc-congrats-title {
          font-size: 2rem; font-weight: 900; color: #051838;
          margin: 0 0 4px;
        }
        .lc-congrats-you-won {
          font-size: 1rem; color: #8893a7; font-weight: 600;
          margin-bottom: 22px;
        }
        .lc-congrats-divider {
          width: 48px; height: 3px; background: #D4AF37; border-radius: 3px;
          margin-bottom: 22px;
        }
        .lc-won-product-card {
          background: #fdfbf7; border: 2px solid #D4AF37;
          border-radius: 16px; padding: 20px 24px;
          width: 100%; margin-bottom: 28px;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          box-shadow: 0 6px 20px rgba(212,175,55,0.15);
        }
        .lc-won-img {
          width: 110px; height: 110px; border-radius: 12px;
          object-fit: cover; border: 2px solid rgba(212,175,55,0.3);
        }
        .lc-won-img-placeholder {
          width: 110px; height: 110px; border-radius: 12px;
          background: #051838; display: flex; align-items: center; justify-content: center;
          color: #D4AF37; border: 2px solid rgba(212,175,55,0.3);
        }
        .lc-won-name {
          font-size: 1.1rem; font-weight: 800; color: #051838; margin: 0;
        }
        .lc-won-worth {
          font-size: 1rem; color: #666; font-weight: 500;
        }
        .lc-won-worth strong { color: #D4AF37; }
        .lc-cta-group {
          display: flex; flex-direction: column; gap: 12px; width: 100%;
        }
        .lc-btn-claim {
          width: 100%; padding: 15px;
          background: #051838; color: #ffffff;
          border: none; border-radius: 12px;
          font-size: 0.95rem; font-weight: 800; letter-spacing: 0.06em;
          cursor: pointer; transition: all 0.25s;
          text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lc-btn-claim:hover { background: #092d68; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(5,24,56,0.3); }
        .lc-btn-continue {
          width: 100%; padding: 14px;
          background: transparent; color: #051838;
          border: 2px solid #051838; border-radius: 12px;
          font-size: 0.9rem; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase;
        }
        .lc-btn-continue:hover { background: rgba(5,24,56,0.05); }

        /* ═══════ STEP 4: ORDER SUCCESS ═══════ */
        .lc-success-card {
          position: relative;
          background: #fdfbf7;
          border: 1px solid #eae6df;
          border-radius: 24px;
          width: 100%; max-width: 440px;
          padding: 40px 32px;
          display: flex; flex-direction: column; align-items: center;
          box-shadow: 0 15px 50px rgba(5, 24, 56, 0.15);
          animation: lc-pop-in 0.4s cubic-bezier(0.16,1,0.3,1);
          text-align: center;
        }
        .lc-success-indicator {
          color: #051838;
          font-weight: 850;
          font-size: 0.98rem;
          margin-bottom: 20px;
          letter-spacing: 0.05em;
        }
        .lc-success-badge-wrap {
          position: relative;
          width: 110px;
          height: 110px;
          margin-bottom: 8px;
        }
        .lc-success-badge-svg {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .lc-success-title {
          font-size: 1.55rem;
          font-weight: 900;
          color: #051838;
          margin: 12px 0 6px;
        }
        .lc-success-msg {
          font-size: 0.88rem;
          color: #666;
          max-width: 320px;
          margin-bottom: 24px;
          line-height: 1.4;
        }
        .lc-success-id-box {
          background: #ffffff;
          border: 1px solid #eae6df;
          border-radius: 12px;
          padding: 16px 24px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          margin-bottom: 24px;
        }
        .lc-success-id-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #8893a7;
          letter-spacing: 0.08em;
        }
        .lc-success-id-val {
          font-size: 1.2rem;
          font-weight: 800;
          color: #051838;
        }
        .lc-success-track-text {
          font-size: 0.78rem;
          color: #8893a7;
          margin-bottom: 12px;
          font-weight: 600;
        }
        .lc-success-orders-btn {
          width: auto;
          min-width: 180px;
          padding: 12px 36px;
          background: #ffffff;
          color: #051838;
          border: 1.5px solid #D4AF37;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 6px rgba(212, 175, 55, 0.1);
        }
        .lc-success-orders-btn:hover {
          background: #fdfbf7;
          border-color: #c59b2d;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
        }

        /* Segment label */
        .lc-seg-text {
          font-size: 8.5px; font-weight: 700; letter-spacing: 0.04em;
          dominant-baseline: middle; text-anchor: middle;
          pointer-events: none;
        }
      `}</style>

      {/* ───────────────────────── STEP 1: LANDING ─────────────────────── */}
      {step === 'landing' && (
        <div className="lc-landing-card">
          <button className="lc-close-btn" onClick={handleClose}><X size={16} /></button>

          {/* LEFT CONTENT */}
          <div className="lc-landing-left">
            <span className="lc-brand-tag">✦ Mithra Shoppy</span>
            <h2 className="lc-hero-title">
              LUCKY<br />
              <span className="gold">CHARM</span>
            </h2>
            <p className="lc-hero-sub">Spin &amp; Win Premium Rewards</p>
            <p className="lc-hero-desc">Every Spin Gives You a Surprise</p>

            {isAvailable ? (
              <>
                <button className="lc-spin-cta" onClick={goToSpin}>
                  <Sparkles size={18} />
                  SPIN NOW
                </button>

                <div className="lc-guarantee">
                  <CheckCircle size={14} />
                  <span>Every Spin is a Winner</span>
                </div>
              </>
            ) : (
              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(220, 53, 69, 0.1)', borderLeft: '4px solid #dc3545', color: '#ff8a8d', borderRadius: '4px', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {errorMessage || 'Lucky Charm is currently not available.'}
              </div>
            )}
          </div>

          {/* RIGHT: MINI WHEEL PREVIEW */}
          <div className="lc-landing-right">
            <div className="lc-preview-wheel-wrap">
              <div className="lc-preview-pointer" />
              <svg viewBox="0 0 320 320" width="220" height="220" style={{ borderRadius: '50%', border: '8px solid #D4AF37', display: 'block', background: '#fff' }}>
                {rewards.length > 0 ? segments.map((seg, i) => (
                  <g key={i}>
                    <path d={seg.path.replace(/160/g, '160').replace(/150/g, '150')} fill={seg.even ? '#051838' : '#D4AF37'} />
                    <text
                      x={seg.tx}
                      y={seg.ty}
                      fill={seg.even ? '#D4AF37' : '#051838'}
                      className="lc-seg-text"
                      transform={`rotate(${seg.textDeg}, ${seg.tx}, ${seg.ty})`}
                    >
                      {(seg.reward.rewardName || '').split(' ').slice(0, 2).join(' ')}
                    </text>
                  </g>
                )) : (
                  // Placeholder wheel segments
                  Array.from({ length: 8 }).map((_, i) => {
                    const n = 8, r = 150, cx = 160, cy = 160, TAU = 2 * Math.PI;
                    const sa = (i / n) * TAU - Math.PI / 2;
                    const ea = ((i + 1) / n) * TAU - Math.PI / 2;
                    const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
                    const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
                    return (
                      <path key={i}
                        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                        fill={i % 2 === 0 ? '#051838' : '#D4AF37'}
                      />
                    );
                  })
                )}
              </svg>
              <div className="lc-preview-center">LUCKY<br />SPIN</div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────── STEP 2: SPIN WHEEL ─────────────────── */}
      {step === 'spinning' && (
        <div className="lc-spin-card">
          <button className="lc-close-btn" onClick={handleClose}><X size={16} /></button>
          <h2 className="lc-spin-step-title">Spin &amp; Win</h2>
          <p className="lc-spin-step-sub">Best of Luck!</p>

          <div className="lc-wheel-host">
            <div className="lc-wheel-arrow" />

            {/* SVG Wheel */}
            <div
              ref={wheelRef}
              className="lc-wheel-svg-wrap"
              style={{ transform: `rotate(${spinDeg}deg)` }}
            >
              <svg
                viewBox="0 0 320 320"
                width="320"
                height="320"
                style={{ display: 'block', borderRadius: '50%' }}
              >
                {segments.map((seg, i) => (
                  <g key={i}>
                    <path d={seg.path} fill={seg.even ? '#051838' : '#D4AF37'} />
                    {/* Divider line */}
                    <line
                      x1="160" y1="160"
                      x2={160 + 150 * Math.cos((i / rewards.length) * 2 * Math.PI - Math.PI / 2)}
                      y2={160 + 150 * Math.sin((i / rewards.length) * 2 * Math.PI - Math.PI / 2)}
                      stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
                    />
                    <text
                      x={seg.tx}
                      y={seg.ty}
                      fill={seg.even ? '#D4AF37' : '#051838'}
                      className="lc-seg-text"
                      transform={`rotate(${seg.textDeg}, ${seg.tx}, ${seg.ty})`}
                    >
                      {(seg.reward.rewardName || '').split(' ').slice(0, 2).join(' ')}
                    </text>
                    {/* Second line of text */}
                    {(seg.reward.rewardName || '').split(' ').length > 2 && (
                      <text
                        x={seg.tx}
                        y={seg.ty + 11}
                        fill={seg.even ? '#D4AF37' : '#051838'}
                        className="lc-seg-text"
                        transform={`rotate(${seg.textDeg}, ${seg.tx}, ${seg.ty + 11})`}
                      >
                        {(seg.reward.rewardName || '').split(' ').slice(2, 4).join(' ')}
                      </text>
                    )}
                  </g>
                ))}
                {/* Outer ring */}
                <circle cx="160" cy="160" r="150" fill="none" stroke="#D4AF37" strokeWidth="6" />
              </svg>
            </div>

            {/* Center SPIN button */}
            <button
              className="lc-center-btn"
              onClick={startSpin}
              disabled={isSpinning || !sessionId}
            >
              {isSpinning ? '...' : 'SPIN'}
            </button>
          </div>

          <div className="lc-spin-footer">
            <Star size={13} fill="#D4AF37" stroke="none" />
            <span>Every Spin Wins a Reward!</span>
          </div>
        </div>
      )}

      {/* ───────────────────────── STEP 3: CONGRATULATIONS ─────────────── */}
      {step === 'congratulations' && wonReward && (
        <div className="lc-congrats-card">
          <button className="lc-close-btn" style={{ border: '1px solid rgba(5,24,56,0.2)', background: 'rgba(5,24,56,0.05)', color: '#051838' }} onClick={handleClose}><X size={16} /></button>

          {/* Confetti */}
          <div className="lc-confetti">
            {[
              { left: '10%', top: '-5%', size: 8,  color: '#D4AF37', dur: '3.5s', delay: '0s'   },
              { left: '25%', top: '-3%', size: 6,  color: '#ff6b6b', dur: '4s',   delay: '0.5s' },
              { left: '50%', top: '-8%', size: 10, color: '#D4AF37', dur: '3s',   delay: '0.2s' },
              { left: '70%', top: '-4%', size: 7,  color: '#4ecdc4', dur: '4.5s', delay: '0.8s' },
              { left: '85%', top: '-6%', size: 9,  color: '#D4AF37', dur: '3.2s', delay: '0.3s' },
              { left: '40%', top: '-2%', size: 5,  color: '#fff',    dur: '5s',   delay: '1s'   },
            ].map((dot, i) => (
              <div key={i} className="lc-confetti-dot" style={{
                left: dot.left, top: dot.top,
                width: dot.size, height: dot.size,
                background: dot.color,
                animationDuration: dot.dur,
                animationDelay: dot.delay,
              }} />
            ))}
          </div>

          <Trophy size={60} className="lc-trophy-icon" />
          <h2 className="lc-congrats-title">Congratulations!</h2>
          <p className="lc-congrats-you-won">You Won</p>
          <div className="lc-congrats-divider" />

          <div className="lc-won-product-card">
            {wonReward.rewardType === 'product' ? (
              <>
                <img
                  src={wonReward.image?.startsWith('http') ? wonReward.image : `/uploads/${wonReward.image}`}
                  alt={wonReward.rewardName}
                  className="lc-won-img"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'; }}
                />
                <p className="lc-won-name">{wonReward.rewardName}</p>
                <p className="lc-won-worth">Worth <strong>₹{wonReward.rewardValue}</strong></p>
              </>
            ) : (
              <>
                <div className="lc-won-img-placeholder"><Gift size={44} /></div>
                <p className="lc-won-name">{wonReward.rewardName}</p>
                <p className="lc-won-worth">Code: <strong>{wonReward.couponCode}</strong></p>
              </>
            )}
          </div>

          <div className="lc-cta-group">
            <button className="lc-btn-claim" onClick={claimReward}>
              <ShoppingBag size={16} />
              CLAIM REWARD
            </button>
            <button className="lc-btn-continue" onClick={handleClose}>
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────── STEP 4: ORDER SUCCESS ─────────────────── */}
      {step === 'orderSuccess' && (() => {
        const points = 16;
        const cx = 50;
        const cy = 50;
        const r1 = 44; // outer radius
        const r2 = 36; // inner control point radius
        let scallopPath = '';
        for (let i = 0; i < points; i++) {
          const a1 = (i * 2 * Math.PI) / points;
          const a2 = ((i + 0.5) * 2 * Math.PI) / points;
          const a3 = ((i + 1) * 2 * Math.PI) / points;
          
          const x1 = cx + r1 * Math.cos(a1);
          const y1 = cy + r1 * Math.sin(a1);
          const xMid = cx + r2 * Math.cos(a2);
          const yMid = cy + r2 * Math.sin(a2);
          const x3 = cx + r1 * Math.cos(a3);
          const y3 = cy + r1 * Math.sin(a3);
          
          if (i === 0) {
            scallopPath += `M ${x1} ${y1}`;
          }
          scallopPath += ` Q ${xMid} ${yMid} ${x3} ${y3}`;
        }
        scallopPath += ' Z';

        return (
          <div className="lc-success-card">
            <button className="lc-close-btn" style={{ border: '1px solid rgba(5,24,56,0.2)', background: 'rgba(5,24,56,0.05)', color: '#051838' }} onClick={handleClose}><X size={16} /></button>
            
            <div className="lc-success-indicator">5. Order Placed</div>
            
            {/* Scalloped Gold Checkmark Badge with sparkles */}
            <div className="lc-success-badge-wrap">
              <svg viewBox="0 0 120 120" className="lc-success-badge-svg">
                {/* Gold seal */}
                <path d={scallopPath} fill="#D4AF37" transform="translate(10,10)" />
                {/* Checkmark */}
                <path d="M48 58 L57 67 L73 47" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Sparkles */}
                {/* Sparkle 1 (top-left star) */}
                <path d="M22 25 L24 28 L27 28 L25 30 L26 33 L23 31 L20 33 L21 30 L19 28 L22 28 Z" fill="#D4AF37" opacity="0.8" transform="scale(0.8) translate(5, 5)" />
                {/* Sparkle 2 (top-right circle) */}
                <circle cx="102" cy="35" r="3" fill="#D4AF37" opacity="0.6" />
                {/* Sparkle 3 (bottom-left circle) */}
                <circle cx="20" cy="85" r="2.5" fill="#D4AF37" opacity="0.6" />
                {/* Sparkle 4 (bottom-right star) */}
                <path d="M100 80 L102 82 L105 82 L103 84 L104 87 L101 85 L98 87 L99 84 L97 82 L100 82 Z" fill="#D4AF37" opacity="0.8" transform="scale(0.7) translate(40, 30)" />
                {/* Small dots */}
                <circle cx="50" cy="10" r="1.5" fill="#D4AF37" opacity="0.5" />
                <circle cx="10" cy="55" r="2" fill="#D4AF37" opacity="0.5" />
                <circle cx="112" cy="62" r="1.5" fill="#D4AF37" opacity="0.5" />
              </svg>
            </div>

            <h2 className="lc-success-title">Order Placed Successfully!</h2>
            <p className="lc-success-msg">
              {isLuckyOrder 
                ? 'Thank you! Your Lucky Charm reward has been claimed.' 
                : 'Thank you! Your order has been placed successfully.'}
            </p>
            
            {/* Order ID Card */}
            <div className="lc-success-id-box">
              <span className="lc-success-id-label">Order ID</span>
              <span className="lc-success-id-val">{orderId}</span>
            </div>

            <div className="lc-success-track-text">You can track your order from</div>

            <button className="lc-success-orders-btn" onClick={handleClose}>
              MY ORDERS
            </button>
          </div>
        );
      })()}
    </div>
  );
}
