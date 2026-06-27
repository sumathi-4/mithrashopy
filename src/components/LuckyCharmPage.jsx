import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';
import { resolveProductImage } from '../utils/imageHelper';
import {
  ArrowLeft, ShieldCheck, ShieldAlert, ShoppingBag, Gift, Crown,
  Lock, ArrowRight, Package, RefreshCw, AlertTriangle, Store, Star, Trophy
} from 'lucide-react';

export default function LuckyCharmPage({ authUser, setAuthUser, onNavigate }) {
  // 'loading' | 'loaded' | 'error'
  const [status, setStatus] = useState('loading');
  const [eligibility, setEligibility] = useState({
    available: false,
    campaignName: '',
    rewardBudget: 0,
    cartTotal: 0,
    rewardsCount: 0,
    sessionId: '',
    rewards: [],
    message: '',
    minOrderValue: 500,
    maxOrderValue: 10000
  });
  const [apiError, setApiError] = useState('');

  // ─── Lucky Wheel custom states ───────────────────────────────────
  const [step, setStep] = useState('landing'); // 'landing' | 'wheel' | 'reveal'
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [wonReward, setWonReward] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isWaitingBackend, setIsWaitingBackend] = useState(false);
  const [winningSegmentIndex, setWinningSegmentIndex] = useState(null);
  const [spinDuration, setSpinDuration] = useState(4500);
  const [spinError, setSpinError] = useState('');

  const wheelRef = useRef(null);

  /* ─── Cart helpers ──────────────────────────────────────────────── */
  const getCurrentCartItems = useCallback(() => {
    let user = authUser;
    if (!user) {
      try {
        const stored = localStorage.getItem('mithira_auth_user');
        if (stored) user = JSON.parse(stored);
      } catch (e) { /* silent */ }
    }
    if (user) return user.cartItems || [];
    try {
      return JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]');
    } catch (e) { return []; }
  }, [authUser]);

  /* ─── Eligibility check ─────────────────────────────────────────── */
  const checkEligibility = useCallback(async () => {
    setStatus('loading');
    setApiError('');
    try {
      const cartItems = getCurrentCartItems();
      const res = await apiService.checkLuckyCharmEligibility(cartItems);
      if (res?.success) {
        setEligibility({
          available: !!res.available,
          campaignName: res.campaign?.campaignName || 'No Active Campaign',
          rewardBudget: res.campaign?.rewardBudget || 0,
          cartTotal: res.cartTotal || 0,
          rewardsCount: Array.isArray(res.rewards) ? res.rewards.length : 0,
          sessionId: res.sessionId || '',
          rewards: Array.isArray(res.rewards) ? res.rewards : [],
          message: res.message || '',
          minOrderValue: res.campaign?.minOrderValue || 500,
          maxOrderValue: res.campaign?.maxOrderValue || 10000
        });
        setStatus('loaded');
      } else {
        setEligibility(prev => ({
          ...prev,
          available: false,
          rewardsCount: 0,
          sessionId: '',
          rewards: [],
          message: res?.message || 'Could not check eligibility.'
        }));
        setStatus('loaded');
      }
    } catch (err) {
      console.error('Eligibility check failed:', err);
      setApiError("We couldn't connect to our servers. Please check your connection and try again.");
      setStatus('error');
    }
  }, [getCurrentCartItems]);

  useEffect(() => {
    checkEligibility();
    const onCart = () => checkEligibility();
    window.addEventListener('storage', onCart);
    window.addEventListener('mithira_cart_update', onCart);
    return () => {
      window.removeEventListener('storage', onCart);
      window.removeEventListener('mithira_cart_update', onCart);
    };
  }, [checkEligibility]);

  /* ─── Navigation helpers ────────────────────────────────────────── */
  const handleBack = (e) => {
    e.preventDefault();
    if (step === 'wheel') {
      setStep('landing');
    } else if (step === 'reveal') {
      setStep('wheel');
    } else {
      if (onNavigate) {
        onNavigate('/');
      } else {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
      }
    }
  };

  const handleBackToShop = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/Shop');
    } else {
      window.history.pushState({}, '', '/Shop');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleStartSpin = () => {
    if (!eligibility.available || !eligibility.sessionId || eligibility.rewards.length === 0) return;
    setStep('wheel');
  };

  // ─── Unload Protection ────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isSpinning || countdown !== null || isWaitingBackend) {
        e.preventDefault();
        e.returnValue = 'A spin is currently in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSpinning, countdown, isWaitingBackend]);

  // ─── Scroll Lock ──────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ─── Synth Audio Tick Generator ──────────────────────────────────
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime); // 600Hz clean click
      gain.gain.setValueAtTime(0.06, ctx.currentTime); // low volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04); // decay fast
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) { /* blocked or unsupported */ }
  };

  // ─── Real-time Rotation Monitoring for Pointer Ticks ─────────────
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    if (!isSpinning) {
      lastIndexRef.current = -1;
      return;
    }

    let active = true;
    const segCount = eligibility.rewards.length || 8;
    const degPerSeg = 360 / segCount;
    
    const checkRotation = () => {
      if (!active || !wheelRef.current) return;
      
      const style = window.getComputedStyle(wheelRef.current);
      const transform = style.transform || style.webkitTransform;
      
      if (transform && transform !== 'none') {
        const values = transform.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        let angle = Math.atan2(b, a) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        
        // Relative angle pointing to the top pointer
        const relativeAngle = (360 - angle) % 360;
        const currentSegmentIndex = Math.floor(relativeAngle / degPerSeg);
        
        if (currentSegmentIndex !== lastIndexRef.current && currentSegmentIndex >= 0 && currentSegmentIndex < segCount) {
          lastIndexRef.current = currentSegmentIndex;
          
          // Trigger CSS pointer swing animation
          const pointer = document.querySelector('.lc-wheel-pointer');
          if (pointer) {
            pointer.classList.remove('tick');
            void pointer.offsetWidth; // trigger reflow
            pointer.classList.add('tick');
          }
          
          playTickSound();
        }
      }
      
      requestAnimationFrame(checkRotation);
    };
    
    checkRotation();
    return () => {
      active = false;
    };
  }, [isSpinning, eligibility.rewards]);

  // ─── Spin Handlers ────────────────────────────────────────────────
  const handleSpinClick = () => {
    if (isSpinning || countdown !== null || isWaitingBackend || eligibility.rewards.length === 0 || !eligibility.sessionId) return;
    
    setWinningSegmentIndex(null);
    setSpinError('');
    setCountdown(3);
    
    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
      } else {
        clearInterval(interval);
        setCountdown(null);
        triggerBackendSpin();
      }
    }, 1000);
  };

  const triggerBackendSpin = async () => {
    setIsWaitingBackend(true);
    setSpinError('');
    try {
      const cartItems = getCurrentCartItems();
      const res = await apiService.spinLuckyCharm(eligibility.sessionId, cartItems);
      setIsWaitingBackend(false);
      
      if (res?.success && res.won) {
        const won = res.reward;
        
        let index = eligibility.rewards.findIndex(r =>
          won.rewardType === 'product' && String(r.productId) === String(won.productId)
        );
        if (index === -1) index = 0;

        const segCount = eligibility.rewards.length;
        const segAngle = 360 / segCount;
        const stopAngle = 360 - (index * segAngle) - (segAngle / 2);
        
        // Dynamic duration: 4500ms to 5800ms
        const duration = 4500 + Math.floor(Math.random() * 1300);
        setSpinDuration(duration);
        
        const newRotation = spinDeg + 1800 + stopAngle - (spinDeg % 360);
        setSpinDeg(newRotation);
        setIsSpinning(true);

        // After spin finishes
        setTimeout(() => {
          setIsSpinning(false);
          setWinningSegmentIndex(index); // Trigger glow pulse
          
          // Wait 1.8s for glow appreciation, then slide to Reveal step
          setTimeout(() => {
            setWonReward(won);
            setStep('reveal');
            setWinningSegmentIndex(null);
            checkEligibility();
          }, 1800);
          
        }, duration);

      } else {
        setSpinError(res?.message || 'Spin failed, please try again.');
        checkEligibility();
      }
    } catch (err) {
      console.error(err);
      setIsWaitingBackend(false);
      setSpinError('Network error, please try again.');
    }
  };

  const claimReward = async () => {
    if (!wonReward) return;

    const productId = wonReward.productId || 111;
    const variant   = {
      isLuckyCharm: true,
      rewardPrice:  wonReward.rewardValue,
      rewardName:   wonReward.rewardName,
      rewardImage:  wonReward.image
    };

    let user = authUser;
    if (!user) {
      try {
        const stored = localStorage.getItem('mithira_auth_user');
        if (stored) user = JSON.parse(stored);
      } catch (e) { /* silent */ }
    }

    let cart = [], cartItems = [];
    if (user) {
      cart      = user.cart      || [];
      cartItems = user.cartItems || [];
    } else {
      try {
        cart      = JSON.parse(localStorage.getItem('mithira_guest_cart')       || '[]');
        cartItems = JSON.parse(localStorage.getItem('mithira_guest_cart_items') || '[]');
      } catch (e) { /* silent */ }
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

    if (user) {
      try {
        const res = await apiService.syncCart(cart.map(String), cartItems);
        const newUser = { ...user, cart: res.cart || cart, cartItems: res.cartItems || cartItems };
        localStorage.setItem('mithira_auth_user', JSON.stringify(newUser));
        if (setAuthUser) setAuthUser(newUser);
      } catch (e) { console.error('Cart sync error:', e); }
    } else {
      localStorage.setItem('mithira_guest_cart',       JSON.stringify(cart));
      localStorage.setItem('mithira_guest_cart_items', JSON.stringify(cartItems));
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('mithira_cart_update'));

    if (onNavigate) {
      onNavigate('/account?tab=cart');
    } else {
      window.history.pushState({}, '', '/account?tab=cart');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // ─── Wheel geometry helpers ───────────────────────────────────────
  const getWheelSegments = () => {
    const rewards = eligibility.rewards || [];
    const n = rewards.length || 6;
    const r = 142; // wheel radius inside the border (reduced slightly to fit bulbs)
    const cx = 160;
    const cy = 160;
    const segments = [];
    const anglePerSeg = 360 / n;

    for (let i = 0; i < n; i++) {
      // Calculate angles in radians
      // Subtract 90 degrees to align segment 0 at 12 o'clock (top)
      const startAngleDeg = i * anglePerSeg - 90;
      const endAngleDeg = (i + 1) * anglePerSeg - 90;
      const startAngleRad = (startAngleDeg * Math.PI) / 180;
      const endAngleRad = (endAngleDeg * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startAngleRad);
      const y1 = cy + r * Math.sin(startAngleRad);
      const x2 = cx + r * Math.cos(endAngleRad);
      const y2 = cy + r * Math.sin(endAngleRad);

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

      // Mid-angle for text & image rotation (relative to the segment bisector pointing up)
      const midAngleDeg = i * anglePerSeg + (anglePerSeg / 2);

      // Determine segment colors: alternate between a premium dark navy and a light silver-cream (as in Image 2)
      let fillColor = '#0c172a'; // Dark Navy/Black
      let isLight = false;
      if (i % 2 === 1) {
        fillColor = '#edf2f7'; // Light Silver-Cream
        isLight = true;
      }

      segments.push({
        path,
        midAngleDeg,
        reward: rewards[i],
        fillColor,
        isLight,
        dividerX: x1,
        dividerY: y1
      });
    }
    return segments;
  };

  /* ─── Formatters ────────────────────────────────────────────────── */
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

  const isLoading = status === 'loading';
  const isError   = status === 'error';
  const isEligible = eligibility.available && !isLoading;

  const segments = getWheelSegments();

  /* ─── Render ────────────────────────────────────────────────────── */
  return (
    <div className="lcp-root">
      <style>{`
        /* ── Google Fonts ─────────────────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* ── Root Container ───────────────────────────────────────── */
        .lcp-root {
          height: calc(100vh - 40px);
          max-height: calc(100vh - 40px);
          width: calc(100% - 40px);
          margin: 20px auto;
          background: #030a18;
          position: relative;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #fff;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          animation: lcp-slide-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          border: 3px solid #D4AF37;
          border-radius: 20px;
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.5), inset 0 0 20px rgba(212, 175, 55, 0.15);
          overflow: hidden;
        }
        .lcp-landing-slide {
          background: url('/lucky_background.jpg') no-repeat center right / cover;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        @keyframes lcp-slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }

        /* ── Gradient Overlay ─────────────────────────────────────── */
        .lcp-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(5, 24, 56, 0.45) 0%,
            rgba(5, 24, 56, 0.25) 50%,
            rgba(5, 24, 56, 0.1) 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        /* ── Top Bar ──────────────────────────────────────────────── */
        .lcp-topbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 6%;
        }
        .lcp-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
        }
        .lcp-nav-btn:hover {
          color: #D4AF37;
        }
        .lcp-nav-btn.back:hover {
          transform: translateX(-4px);
        }
        .lcp-nav-btn.shop {
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 8px 18px;
          border-radius: 100px;
          color: #D4AF37;
          font-size: 0.85rem;
        }
        .lcp-nav-btn.shop:hover {
          background: rgba(212,175,55,0.2);
          transform: none;
        }

        /* ── Page Content Grid ────────────────────────────────────── */
        .lcp-content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: grid;
          grid-template-columns: 55% 45%;
          padding: 85px 6% 60px;
          align-items: center;
          box-sizing: border-box;
        }
        .lcp-left {
          display: flex;
          flex-direction: column;
          gap: 28px;
          max-width: 620px;
        }

        /* ── Campaign Pill ────────────────────────────────────────── */
        .lcp-pill {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(212,175,55,0.3);
          background: rgba(212,175,55,0.08);
          color: #D4AF37;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
        }

        /* ── Title ────────────────────────────────────────────────── */
        .lcp-title {
          font-family: 'Marcellus', Georgia, serif;
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.05;
          margin: 0;
          background: linear-gradient(135deg, #fff 0%, #FFF8E7 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .lcp-subtitle {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.78);
          margin: 0;
          font-weight: 500;
        }

        /* ── Rewards Available Badge ──────────────────────────────── */
        .lcp-rewards-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 0.88rem;
          font-weight: 700;
          width: fit-content;
          transition: all 0.3s;
        }
        .lcp-rewards-badge.active {
          background: rgba(74, 222, 128, 0.12);
          border: 1px solid rgba(74, 222, 128, 0.35);
          color: #4ade80;
        }
        .lcp-rewards-badge.inactive {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.45);
        }

        /* ── Stat Cards Grid ──────────────────────────────────────── */
        .lcp-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          width: 100%;
        }
        .lcp-card {
          background: rgba(5, 24, 56, 0.8);
          border: 1.5px solid rgba(212, 175, 55, 0.55);
          border-radius: 16px;
          padding: 22px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .lcp-card:hover {
          border-color: #D4AF37;
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(212,175,55,0.25);
        }
        .lcp-icon-wrap {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .lcp-icon-wrap.blue {
          background: rgba(0,114,255,0.14);
          border: 1px solid rgba(56,189,248,0.3);
          color: #38bdf8;
        }
        .lcp-icon-wrap.gold {
          background: rgba(212,175,55,0.14);
          border: 1px solid rgba(212,175,55,0.3);
          color: #D4AF37;
        }
        .lcp-card-label {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.55);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 5px;
        }
        .lcp-card-value {
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
        }
        .lcp-card-value.gold { color: #D4AF37; }

        /* ── Status Banner ────────────────────────────────────────── */
        .lcp-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 600;
          width: 100%;
          box-sizing: border-box;
        }
        .lcp-banner.eligible {
          background: rgba(5, 24, 56, 0.85);
          border: 1.5px solid rgba(74, 222, 128, 0.6);
          color: #4ade80;
        }
        .lcp-banner.ineligible {
          background: rgba(5, 24, 56, 0.85);
          border: 1.5px solid rgba(248, 113, 113, 0.6);
          color: #f87171;
        }

        /* ── CTA Button ───────────────────────────────────────────── */
        .lcp-btn-wrap {
          position: relative;
          width: 100%;
        }
        /* Glow ring — only visible when eligible */
        .lcp-btn-glow {
          position: absolute;
          inset: -4px;
          border-radius: 100px;
          background: transparent;
          box-shadow: 0 0 0 0 rgba(212,175,55,0);
          transition: box-shadow 0.4s ease;
          pointer-events: none;
          z-index: 0;
        }
        .lcp-btn-glow.active {
          box-shadow:
            0 0 18px 4px rgba(212,175,55,0.55),
            0 0 40px 8px rgba(212,175,55,0.25);
          animation: lcp-glow-pulse 2s ease-in-out infinite;
        }
        @keyframes lcp-glow-pulse {
          0%,100% { box-shadow: 0 0 18px 4px rgba(212,175,55,0.55), 0 0 40px 8px rgba(212,175,55,0.25); }
          50%      { box-shadow: 0 0 28px 8px rgba(212,175,55,0.75), 0 0 60px 16px rgba(212,175,55,0.35); }
        }
        .lcp-spin-btn {
          position: relative;
          z-index: 1;
          width: 100%;
          border: none;
          background: linear-gradient(135deg, #FFE89C 0%, #D4AF37 50%, #A27E12 100%);
          color: #051838;
          font-size: 1.12rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 18px 40px;
          border-radius: 100px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 8px 28px rgba(212,175,55,0.3);
        }
        .lcp-spin-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(212,175,55,0.5);
          background: linear-gradient(135deg, #FFF0B5 0%, #E7C24F 50%, #B8901C 100%);
        }
        .lcp-spin-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .lcp-spin-btn:disabled {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.22);
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.45;
          pointer-events: none;
        }

        /* ── Notes below CTA ──────────────────────────────────────── */
        .lcp-notes {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-top: -10px;
        }
        .lcp-spin-note {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.5);
          font-style: italic;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .lcp-spin-note svg { color: rgba(212,175,55,0.55); flex-shrink: 0; }
        .lcp-win-note {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.38);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .lcp-win-note svg { color: rgba(212,175,55,0.45); flex-shrink: 0; }

        /* ── Loading Skeleton ─────────────────────────────────────── */
        .lcp-skeleton {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 620px;
          width: 100%;
        }
        .lcp-skel-block {
          border-radius: 12px;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.06) 25%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.06) 75%
          );
          background-size: 200% 100%;
          animation: lcp-shimmer 1.6s infinite;
        }
        @keyframes lcp-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .lcp-skel-title  { height: 60px; width: 65%; border-radius: 8px; }
        .lcp-skel-sub    { height: 22px; width: 80%; border-radius: 6px; }
        .lcp-skel-cards  {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .lcp-skel-card   { height: 110px; border-radius: 16px; }
        .lcp-skel-banner { height: 50px; width: 100%; border-radius: 12px; }
        .lcp-skel-btn    { height: 58px; width: 100%; border-radius: 100px; }

        /* ── Error State ──────────────────────────────────────────── */
        .lcp-error-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 18px;
          padding: 32px;
          background: rgba(220,53,69,0.07);
          border: 1px solid rgba(220,53,69,0.25);
          border-radius: 20px;
          max-width: 480px;
        }
        .lcp-error-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(220,53,69,0.12);
          border: 1px solid rgba(220,53,69,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f87171;
        }
        .lcp-error-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .lcp-error-msg {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.65);
          margin: 0;
          line-height: 1.5;
        }
        .lcp-retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: 100px;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.35);
          color: #D4AF37;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lcp-retry-btn:hover {
          background: rgba(212,175,55,0.22);
          transform: translateY(-1px);
        }

        /* ── Responsive ───────────────────────────────────────────── */
        @media (max-width: 990px) {
          .lcp-landing-slide { background-position: center center; }
          .lcp-overlay {
            background: linear-gradient(
              180deg,
              rgba(5, 24, 56, 0.6) 0%,
              rgba(5, 24, 56, 0.3) 100%
            );
          }
          .lcp-content {
            grid-template-columns: 1fr;
            padding: 85px 24px 60px;
          }
          .lcp-title { font-size: 3rem; }
        }
        @media (max-width: 640px) {
          .lcp-root {
            margin: 10px auto;
            width: calc(100% - 20px);
            min-height: calc(100vh - 20px);
            border-width: 2px;
            border-radius: 12px;
          }
          .lcp-topbar { padding: 16px 20px; }
          .lcp-content { padding: 85px 20px 50px; }
          .lcp-title  { font-size: 2.4rem; }
          .lcp-cards-grid  { grid-template-columns: 1fr 1fr; }
          .lcp-skel-cards  { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 420px) {
          .lcp-cards-grid { grid-template-columns: 1fr; }
          .lcp-skel-cards { grid-template-columns: 1fr; }
          .lcp-title { font-size: 2rem; }
        }

        /* ── Slider Layout ────────────────────────────────────────── */
        .lcp-slider-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          height: calc(100% - 70px);
        }
        .lcp-slider-track {
          display: flex;
          width: 300%;
          transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
          flex: 1;
          height: 100%;
        }
        .lcp-slide-item {
          width: 33.333%;
          flex-shrink: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .lcp-slider-track.step-landing {
          transform: translateX(0%);
        }
        .lcp-slider-track.step-wheel {
          transform: translateX(-33.333%);
        }
        .lcp-slider-track.step-reveal {
          transform: translateX(-66.666%);
        }

        /* ── Slide 2: Lucky Wheel Page ────────────────────────────── */
        /* ── Slide 2: Lucky Wheel Page ────────────────────────────── */
        .lcp-wheel-slide {
          background: radial-gradient(circle at 35% 50%, #0c2045 0%, #040d1a 100%);
          position: relative;
          overflow: hidden;
        }
        .lcp-wheel-slide::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15) 1px, transparent 1px),
            radial-gradient(circle at 75% 40%, rgba(212,175,55,0.2) 2px, transparent 2px),
            radial-gradient(circle at 50% 80%, rgba(212,175,55,0.1) 1.5px, transparent 1.5px),
            radial-gradient(circle at 85% 75%, rgba(212,175,55,0.18) 1.2px, transparent 1.2px),
            radial-gradient(circle at 15% 70%, rgba(212,175,55,0.12) 2px, transparent 2px),
            radial-gradient(circle at 60% 20%, rgba(212,175,55,0.25) 1px, transparent 1px);
          background-size: 300px 300px;
          opacity: 0.85;
          pointer-events: none;
          animation: lcp-star-twinkle 6s ease-in-out infinite;
        }
        @keyframes lcp-star-twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.95; }
        }
        .lcp-wheel-page-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 70px;
          padding: 40px 6%;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          box-sizing: border-box;
          z-index: 2;
          position: relative;
          height: 100%;
        }
        .lcp-wheel-left {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          width: 100%;
          max-width: 470px;
          flex-shrink: 0;
        }
        .lc-wheel-host {
          position: relative;
          width: 100%;
          max-width: 470px;
          aspect-ratio: 1;
          margin: 0 auto;
        }
        .lc-wheel-pointer {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 56px;
          z-index: 10;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          transform-origin: 50% 15%;
          transition: transform 0.05s ease;
        }
        .lc-wheel-pointer.tick {
          animation: pointer-tick-swing 0.15s ease-out;
        }
        @keyframes pointer-tick-swing {
          0%   { transform: translateX(-50%) rotate(0deg); }
          50%  { transform: translateX(-50%) rotate(-12deg); }
          100% { transform: translateX(-50%) rotate(0deg); }
        }
        .lc-wheel-svg-wrap {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: visible;
          filter: drop-shadow(0 15px 45px rgba(0,0,0,0.6));
        }
        .lc-center-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: radial-gradient(circle, #10244c 0%, #071024 100%);
          border: 4px solid #D4AF37;
          color: #FFF8E7;
          cursor: pointer;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.6), inset 0 0 8px rgba(212, 175, 55, 0.5);
          text-align: center;
          line-height: 1.15;
        }
        .lc-center-btn:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.08);
          box-shadow: 0 0 22px rgba(212, 175, 55, 0.8), inset 0 0 12px rgba(212, 175, 55, 0.8);
          color: #FFF;
        }
        .lc-center-btn:active:not(:disabled) {
          transform: translate(-50%, -50%) scale(0.95);
        }
        .lc-center-btn:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }
        .lc-spin-text {
          font-size: 0.82rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .lc-now-text {
          font-size: 0.82rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #D4AF37;
        }
        .lc-bulb {
          animation: bulb-flash 1.2s ease-in-out infinite;
        }
        .lc-bulb:nth-child(even) {
          animation-delay: 0.6s;
        }
        @keyframes bulb-flash {
          0%, 100% { fill: #FFF8E7; filter: drop-shadow(0 0 2px #FFE89C); }
          50%      { fill: #FFF; filter: drop-shadow(0 0 8px #FFD700); }
        }

        .lcp-wheel-right {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: left;
        }
        .lcp-brand-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lcp-brand-txt {
          font-family: 'Marcellus', serif;
          font-size: 1.15rem;
          letter-spacing: 0.1em;
          color: #D4AF37;
          text-transform: uppercase;
        }
        .lcp-wheel-title {
          font-family: 'Marcellus', serif;
          font-size: 3.6rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.1;
          color: #fff;
        }
        .lcp-wheel-subtitle {
          font-size: 1.4rem;
          font-weight: 700;
          color: #D4AF37;
          margin: -8px 0 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lcp-wheel-range-desc {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.8);
          margin: 4px 0 10px;
          line-height: 1.6;
        }
        .lcp-lucky-badge {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(212,175,55,0.08);
          border: 1.5px solid #D4AF37;
          color: #D4AF37;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 8px 24px;
          border-radius: 100px;
          box-shadow: 0 4px 15px rgba(212,175,55,0.15);
        }
        .lcp-badge-arrow {
          animation: arrow-bounce-right 1.5s ease-in-out infinite;
        }
        @keyframes arrow-bounce-right {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(4px); }
        }
        .lcp-wheel-footnote {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          margin-top: 10px;
        }
        .lcp-wheel-footnote svg {
          color: #D4AF37;
        }

        /* ── Slide 3: Reward Reveal Page ──────────────────────────── */
        .lcp-reveal-page-content {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 85px 20px 80px;
          width: 100%;
          box-sizing: border-box;
          z-index: 2;
          position: relative;
        }
        .lc-congrats-card {
          position: relative;
          background: rgba(5, 24, 56, 0.85);
          border: 2px solid #D4AF37;
          border-radius: 24px;
          width: 100%;
          max-width: 440px;
          padding: 44px 36px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.15);
          text-align: center;
          overflow: hidden;
        }
        .lc-trophy-icon {
          color: #D4AF37;
          margin-bottom: 16px;
          animation: lc-bounce 2s ease-in-out infinite;
        }
        @keyframes lc-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .lc-congrats-title {
          font-family: 'Marcellus', serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 6px;
          letter-spacing: 0.02em;
        }
        .lc-congrats-you-won {
          font-size: 1rem;
          color: rgba(255,255,255,0.65);
          font-weight: 600;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .lc-congrats-divider {
          width: 60px;
          height: 3px;
          background: #D4AF37;
          border-radius: 3px;
          margin-bottom: 24px;
        }
        .lc-won-product-card {
          background: rgba(10, 25, 49, 0.6);
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .lc-won-img {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid #D4AF37;
        }
        .lc-won-img-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          background: #051838;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
          border: 2px solid #D4AF37;
        }
        .lc-won-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          margin: 0;
          line-height: 1.3;
        }
        .lc-won-worth {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
        }
        .lc-won-worth strong {
          color: #D4AF37;
          font-weight: 800;
        }
        .lc-cta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .lc-btn-claim {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #FFE89C 0%, #D4AF37 50%, #A27E12 100%);
          color: #051838;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.25s;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 18px rgba(212,175,55,0.3);
        }
        .lc-btn-claim:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(212,175,55,0.45);
          background: linear-gradient(135deg, #FFF0B5 0%, #E7C24F 50%, #B8901C 100%);
        }
        .lc-btn-continue {
          width: 100%;
          padding: 15px;
          background: transparent;
          color: #D4AF37;
          border: 2px solid #D4AF37;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .lc-btn-continue:hover {
          background: rgba(212,175,55,0.12);
        }

        /* ── Segment styling inside SVG ───────────────────────────── */
        .lc-seg-image {
          border-radius: 6px;
          overflow: hidden;
        }
        .lc-seg-text {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.04em;
          dominant-baseline: middle;
          text-anchor: middle;
          pointer-events: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Countdown Overlay */
        .lc-countdown-overlay {
          position: absolute;
          inset: 0;
          background: rgba(3, 10, 24, 0.75);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 25;
          animation: fade-in 0.3s ease;
        }
        .lc-countdown-num {
          font-family: 'Marcellus', Georgia, serif;
          font-size: 6rem;
          font-weight: 800;
          color: #D4AF37;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
          animation: countdown-pulse 1s ease-in-out infinite;
        }
        @keyframes countdown-pulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        /* Loading Overlay */
        .lc-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(3, 10, 24, 0.85);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          z-index: 25;
          animation: fade-in 0.3s ease;
        }
        .lc-spinner {
          width: 44px;
          height: 44px;
          border: 4px solid rgba(212, 175, 55, 0.2);
          border-top-color: #D4AF37;
          border-radius: 50%;
          animation: lc-spin 1s linear infinite;
        }
        .lc-loading-txt {
          font-size: 0.82rem;
          font-weight: 700;
          color: #FFF8E7;
          letter-spacing: 0.05em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        @keyframes lc-spin {
          to { transform: rotate(360deg); }
        }

        /* Winning Segment glow pulse */
        @keyframes winning-seg-glow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.4));
            fill: #D4AF37;
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.9));
            fill: #FFE89C;
          }
        }
        .lc-winning-seg {
          animation: winning-seg-glow 0.6s ease-in-out infinite;
        }

        /* Spin Error Overlay */
        .lc-spin-error-overlay {
          position: absolute;
          inset: 0;
          background: rgba(220, 53, 69, 0.95);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 25;
          animation: fade-in 0.3s ease;
          box-sizing: border-box;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Responsive slide views */
        @media (max-width: 900px) {
          .lcp-wheel-page-content {
            flex-direction: column;
            justify-content: center;
            text-align: center;
            gap: 30px;
            padding: 20px 20px 40px;
          }
          .lcp-wheel-right {
            align-items: center;
            text-align: center;
          }
          .lcp-wheel-title {
            font-size: 2.8rem;
          }
          .lcp-lucky-badge {
            align-self: center;
          }
        }


      `}</style>

      {/* Top Bar — Back link + Back to Shop button */}
      <div className="lcp-topbar">
        <button className="lcp-nav-btn back" onClick={handleBack}>
          <ArrowLeft size={17} />
          <span>Back</span>
        </button>
        <button className="lcp-nav-btn shop" onClick={handleBackToShop}>
          <Store size={15} />
          <span>Back to Shop</span>
        </button>
      </div>

      {/* Slider Container */}
      <div className="lcp-slider-container">
        <div className={`lcp-slider-track step-${step}`}>
          
          {/* SLIDE 1: LANDING PAGE */}
          <div className="lcp-slide-item lcp-landing-slide">
            <div className="lcp-overlay" />
            <div className="lcp-content">
              <div className="lcp-left">

                {/* ── LOADING SKELETON ─────────────────────────────────── */}
                {isLoading && (
                  <div className="lcp-skeleton">
                    <div className="lcp-skel-block lcp-skel-title" />
                    <div className="lcp-skel-block lcp-skel-sub" />
                    <div className="lcp-skel-cards">
                      <div className="lcp-skel-block lcp-skel-card" />
                      <div className="lcp-skel-block lcp-skel-card" />
                      <div className="lcp-skel-block lcp-skel-card" />
                    </div>
                    <div className="lcp-skel-block lcp-skel-banner" />
                    <div className="lcp-skel-block lcp-skel-btn" />
                  </div>
                )}

                {/* ── API ERROR STATE ───────────────────────────────────── */}
                {isError && (
                  <>
                    <div className="lcp-pill">
                      <Lock size={11} />
                      <span>Lucky Charm</span>
                    </div>
                    <div className="lcp-error-box">
                      <div className="lcp-error-icon">
                        <AlertTriangle size={24} />
                      </div>
                      <h2 className="lcp-error-title">Something went wrong</h2>
                      <p className="lcp-error-msg">{apiError}</p>
                      <button className="lcp-retry-btn" onClick={checkEligibility}>
                        <RefreshCw size={15} />
                        Retry
                      </button>
                    </div>
                  </>
                )}

                {/* ── LOADED STATE ─────────────────────────────────────── */}
                {!isLoading && !isError && (
                  <>
                    {/* Campaign pill */}
                    <div className="lcp-pill">
                      <Lock size={11} />
                      <span>LIMITED TIME CAMPAIGN</span>
                    </div>

                    {/* Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h1 className="lcp-title">Lucky Charm</h1>
                      <p className="lcp-subtitle">Spin the wheel and win exclusive rewards!</p>
                    </div>

                    {/* Rewards count badge */}
                    <div className={`lcp-rewards-badge ${eligibility.rewardsCount > 0 ? 'active' : 'inactive'}`}>
                      <Package size={16} />
                      <span>
                        {eligibility.rewardsCount > 0
                          ? `${eligibility.rewardsCount} Reward${eligibility.rewardsCount !== 1 ? 's' : ''} Available`
                          : 'No Rewards Available'}
                      </span>
                    </div>

                    {/* Stat Cards */}
                    <div className="lcp-cards-grid">
                      <div className="lcp-card">
                        <div className="lcp-icon-wrap blue">
                          <ShoppingBag size={19} />
                        </div>
                        <span className="lcp-card-label">Order Amount</span>
                        <span className="lcp-card-value">{fmt(eligibility.cartTotal)}</span>
                      </div>

                      <div className="lcp-card">
                        <div className="lcp-icon-wrap gold">
                          <Gift size={19} />
                        </div>
                        <span className="lcp-card-label">Eligible Reward Budget</span>
                        <span className="lcp-card-value gold">{fmt(eligibility.rewardBudget)}</span>
                      </div>

                      <div className="lcp-card">
                        <div className="lcp-icon-wrap gold">
                          <Crown size={19} />
                        </div>
                        <span className="lcp-card-label">Campaign Name</span>
                        <span className="lcp-card-value" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                          {eligibility.campaignName}
                        </span>
                      </div>
                    </div>

                    {/* Status Banner */}
                    {isEligible ? (
                      <div className="lcp-banner eligible">
                        <ShieldCheck size={19} />
                        <span>You are eligible for Lucky Charm</span>
                      </div>
                    ) : (
                      <div className="lcp-banner ineligible">
                        <ShieldAlert size={19} />
                        <span>{eligibility.message || 'Your cart is not eligible for the Lucky Charm campaign.'}</span>
                      </div>
                    )}

                    {/* CTA — glow wrapper only when eligible */}
                    <div className="lcp-btn-wrap">
                      <div className={`lcp-btn-glow ${isEligible ? 'active' : ''}`} />
                      <button
                        className="lcp-spin-btn"
                        disabled={!isEligible}
                        onClick={handleStartSpin}
                      >
                        <span>START SPINNING</span>
                        <ArrowRight size={19} />
                      </button>
                    </div>

                    {/* Notes */}
                    <div className="lcp-notes">
                      <span className="lcp-spin-note">
                        <Lock size={11} />
                        One spin per eligible order.
                      </span>
                      <span className="lcp-win-note">
                        <Gift size={11} />
                        Win exciting rewards on every spin
                      </span>
                    </div>
                  </>
                )}

              </div>
              <div />
            </div>
          </div>

          {/* SLIDE 2: LUCKY WHEEL PAGE */}
          <div className="lcp-slide-item lcp-wheel-slide">
            <div className="lcp-wheel-page-content">
              {/* Left Side: Wheel */}
              <div className="lcp-wheel-left">
                <div className="lc-wheel-host">
                  {/* Gold Pointer */}
                  <svg viewBox="0 0 36 48" className="lc-wheel-pointer">
                    <path
                      d="M18 48 C28 32 36 24 36 14 C36 6 28 0 18 0 C8 0 0 6 0 14 C0 24 8 32 18 48 Z"
                      fill="url(#pointerGoldGrad)"
                      stroke="#8B6914"
                      strokeWidth="1.5"
                    />
                    <circle cx="18" cy="14" r="5" fill="#FFF" filter="url(#glow)" />
                  </svg>

                  {/* Rotating Wheel wrap */}
                  <div
                    ref={wheelRef}
                    className="lc-wheel-svg-wrap"
                    style={{ 
                      transform: `rotate(${spinDeg}deg)`, 
                      transition: `transform ${spinDuration}ms cubic-bezier(0.12, 0.8, 0.15, 1)` 
                    }}
                  >
                    <svg viewBox="0 0 320 320" width="100%" height="100%" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="pointerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFE89C" />
                          <stop offset="50%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#A27E12" />
                        </linearGradient>
                        <linearGradient id="wheelGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFE89C" />
                          <stop offset="50%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#A27E12" />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComponentTransfer in="blur" result="brightBlur">
                            <feFuncA type="linear" slope="1.5" />
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode in="brightBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <clipPath id="segmentClip">
                          <circle cx="160" cy="160" r="142" />
                        </clipPath>
                      </defs>

                      {/* Segments */}
                      <g clipPath="url(#segmentClip)">
                        {segments.map((seg, i) => {
                          const resolvedImg = resolveProductImage({
                            image: seg.reward?.image,
                            category: seg.reward?.rewardType || seg.reward?.category,
                            title: seg.reward?.rewardName
                          });
                          const shortName = seg.reward?.rewardName 
                            ? (seg.reward.rewardName.length > 13 ? seg.reward.rewardName.substring(0, 11) + '...' : seg.reward.rewardName)
                            : '';

                          return (
                            <g key={i}>
                              <path 
                                d={seg.path} 
                                fill={seg.fillColor} 
                                className={winningSegmentIndex === i ? 'lc-winning-seg' : ''}
                                style={{ transition: 'all 0.3s' }}
                              />
                              
                              <g transform={`rotate(${seg.midAngleDeg}, 160, 160)`}>
                                {resolvedImg && (
                                  <image
                                    href={resolvedImg}
                                    x="136"
                                    y="38"
                                    width="48"
                                    height="48"
                                    className="lc-seg-image"
                                    style={{
                                      transform: `rotate(${- (spinDeg + seg.midAngleDeg)}deg)`,
                                      transformOrigin: '160px 62px',
                                      transition: `transform ${spinDuration}ms cubic-bezier(0.12, 0.8, 0.15, 1)`
                                    }}
                                    onError={(e) => {
                                      e.target.setAttribute('href', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80');
                                    }}
                                  />
                                )}
                                <text
                                  x="160"
                                  y="98"
                                  fill={seg.isLight ? '#0c172a' : '#D4AF37'}
                                  className="lc-seg-text"
                                  style={{
                                    transform: `rotate(${- (spinDeg + seg.midAngleDeg)}deg)`,
                                    transformOrigin: '160px 98px',
                                    transition: `transform ${spinDuration}ms cubic-bezier(0.12, 0.8, 0.15, 1)`
                                  }}
                                >
                                  {shortName}
                                </text>
                              </g>

                              <line
                                x1="160"
                                y1="160"
                                x2={seg.dividerX}
                                y2={seg.dividerY}
                                stroke="#D4AF37"
                                strokeWidth="1.5"
                                opacity="0.35"
                              />
                            </g>
                          );
                        })}
                      </g>

                      {/* Outer Gold Border Ring */}
                      <circle
                        cx="160"
                        cy="160"
                        r="142"
                        fill="none"
                        stroke="url(#wheelGoldGrad)"
                        strokeWidth="16"
                      />
                      
                      {/* Inner gold frame ring */}
                      <circle
                        cx="160"
                        cy="160"
                        r="134"
                        fill="none"
                        stroke="#8B6914"
                        strokeWidth="1"
                      />

                      {/* Inner frame gold line */}
                      <circle
                        cx="160"
                        cy="160"
                        r="133"
                        fill="none"
                        stroke="#FFE89C"
                        strokeWidth="0.8"
                        opacity="0.5"
                      />

                      {/* Blinking Bulbs */}
                      {Array.from({ length: 16 }).map((_, i) => {
                        const angle = (i / 16) * 2 * Math.PI;
                        const bx = 160 + 142 * Math.cos(angle);
                        const by = 160 + 142 * Math.sin(angle);
                        return (
                          <circle
                            key={i}
                            cx={bx}
                            cy={by}
                            r="4.5"
                            fill="#FFF8E7"
                            stroke="#8B6914"
                            strokeWidth="0.8"
                            className="lc-bulb"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Countdown Overlay */}
                  {countdown !== null && (
                    <div className="lc-countdown-overlay">
                      <span className="lc-countdown-num">{countdown}</span>
                    </div>
                  )}

                  {/* Backend Loading Overlay */}
                  {isWaitingBackend && (
                    <div className="lc-loading-overlay">
                      <div className="lc-spinner" />
                      <span className="lc-loading-txt">Determining your reward...</span>
                    </div>
                  )}

                  {/* Spin Error Overlay */}
                  {spinError && (
                    <div className="lc-spin-error-overlay">
                      <div className="lcp-error-icon" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}>
                        <AlertTriangle size={24} />
                      </div>
                      <h3 className="lcp-error-title" style={{ marginTop: '8px', fontSize: '1rem' }}>Spin Failed</h3>
                      <p className="lcp-error-msg" style={{ fontSize: '0.75rem', textAlign: 'center', marginBottom: '12px', color: '#fff', opacity: 0.9 }}>
                        {spinError}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="lcp-retry-btn" style={{ padding: '6px 14px', fontSize: '0.75rem', background: '#fff', color: '#dc3545', border: 'none' }} onClick={handleSpinClick}>
                          <RefreshCw size={11} />
                          Retry
                        </button>
                        <button className="lc-btn-continue" style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '100px', border: '1px solid #fff', color: '#fff', background: 'transparent' }} onClick={() => setSpinError('')}>
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Central SPIN Button */}
                  <button
                    className="lc-center-btn"
                    onClick={handleSpinClick}
                    disabled={isSpinning || countdown !== null || isWaitingBackend || !eligibility.sessionId}
                  >
                    <span className="lc-spin-text">{isSpinning || isWaitingBackend ? '...' : 'SPIN'}</span>
                    {!isSpinning && !isWaitingBackend && <span className="lc-now-text">NOW</span>}
                  </button>
                </div>
              </div>

              {/* Right Side: Copy & Info */}
              <div className="lcp-wheel-right">
                <div className="lcp-brand-header">
                  <span className="lcp-brand-txt">✦ Mithra Shoppy</span>
                </div>
                <h2 className="lcp-wheel-title">Spin &amp; Win</h2>
                <h3 className="lcp-wheel-subtitle">Amazing Rewards</h3>
                <p className="lcp-wheel-range-desc">
                  Based on your shopping range (₹{eligibility.minOrderValue} - ₹{eligibility.maxOrderValue})
                </p>
                <div className="lcp-lucky-badge">
                  <ArrowRight size={14} className="lcp-badge-arrow" />
                  <span>Good Luck!</span>
                </div>
                <div className="lcp-wheel-footnote">
                  <Star size={13} fill="#D4AF37" stroke="none" />
                  <span>Every Spin Wins</span>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 3: REWARD REVEAL PAGE */}
          <div className="lcp-slide-item lcp-wheel-slide">
            <div className="lcp-reveal-page-content">
              {wonReward && (
                <div className="lc-congrats-card">
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
                        position: 'absolute',
                        borderRadius: '50%',
                        left: dot.left, top: dot.top,
                        width: dot.size, height: dot.size,
                        background: dot.color,
                        animationName: 'lc-confetti-fall',
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationDuration: dot.dur,
                        animationDelay: dot.delay,
                      }} />
                    ))}
                  </div>

                  <Trophy size={56} className="lc-trophy-icon" />
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
                          onError={(e) => {
                            e.target.src = resolveProductImage({ image: wonReward.image }) || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <p className="lc-won-name">{wonReward.rewardName}</p>
                        <p className="lc-won-worth">
                          Worth <strong>₹{wonReward.rewardValue || '750.00'}</strong>
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="lc-won-img-placeholder">
                          <Gift size={44} />
                        </div>
                        <p className="lc-won-name">{wonReward.rewardName}</p>
                        {wonReward.couponCode && (
                          <p className="lc-won-worth">
                            Code: <strong>{wonReward.couponCode}</strong>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="lc-cta-group">
                    <button className="lc-btn-claim" onClick={claimReward}>
                      <ShoppingBag size={17} />
                      CLAIM REWARD
                    </button>
                    <button className="lc-btn-continue" onClick={(e) => { e.preventDefault(); setStep('landing'); }}>
                      SPIN AGAIN / BACK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
