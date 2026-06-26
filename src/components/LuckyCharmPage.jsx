import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import {
  ArrowLeft, ShieldCheck, ShieldAlert, ShoppingBag, Gift, Crown,
  Lock, ArrowRight, Package, RefreshCw, AlertTriangle, Store
} from 'lucide-react';

export default function LuckyCharmPage({ authUser, onNavigate }) {
  // 'loading' | 'loaded' | 'error'
  const [status, setStatus] = useState('loading');
  const [eligibility, setEligibility] = useState({
    available: false,
    campaignName: '',
    rewardBudget: 0,
    cartTotal: 0,
    rewardsCount: 0,
    message: ''
  });
  const [apiError, setApiError] = useState('');

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
          message: res.message || ''
        });
        setStatus('loaded');
      } else {
        setEligibility(prev => ({
          ...prev,
          available: false,
          rewardsCount: 0,
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
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
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
    if (!eligibility.available) return;
    alert('Spinning wheel and reward reveal will be unlocked in the next phase! Backend confirmed you are eligible.');
  };

  /* ─── Formatters ────────────────────────────────────────────────── */
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

  const isLoading = status === 'loading';
  const isError   = status === 'error';
  const isEligible = eligibility.available && !isLoading;

  /* ─── Render ────────────────────────────────────────────────────── */
  return (
    <div className="lcp-root">
      <style>{`
        /* ── Google Fonts ─────────────────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* ── Root Container ───────────────────────────────────────── */
        .lcp-root {
          min-height: 100vh;
          width: 100%;
          background: url('/lucky_background.jpg') no-repeat center right / cover;
          position: relative;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #fff;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          animation: lcp-slide-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow-x: hidden;
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
            rgba(5,24,56,1)   0%,
            rgba(5,24,56,.98) 35%,
            rgba(5,24,56,.85) 60%,
            rgba(5,24,56,.2)  100%
          );
          z-index: 1;
        }

        /* ── Top Bar ──────────────────────────────────────────────── */
        .lcp-topbar {
          position: relative;
          z-index: 3;
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
          padding: 20px 6% 60px;
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
          background: rgba(9,45,104,0.25);
          border: 1px solid rgba(212,175,55,0.18);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 22px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .lcp-card:hover {
          border-color: rgba(212,175,55,0.45);
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(212,175,55,0.12);
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
          backdrop-filter: blur(8px);
        }
        .lcp-banner.eligible {
          background: rgba(46,117,89,0.12);
          border: 1px solid rgba(46,117,89,0.35);
          color: #4ade80;
        }
        .lcp-banner.ineligible {
          background: rgba(220,53,69,0.08);
          border: 1px solid rgba(220,53,69,0.28);
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
          backdrop-filter: blur(10px);
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
          .lcp-root { background-position: center center; }
          .lcp-overlay { background: rgba(5,24,56,0.93); }
          .lcp-content {
            grid-template-columns: 1fr;
            padding: 16px 24px 60px;
          }
          .lcp-title { font-size: 3rem; }
        }
        @media (max-width: 640px) {
          .lcp-topbar { padding: 16px 20px; }
          .lcp-content { padding: 14px 20px 50px; }
          .lcp-title  { font-size: 2.4rem; }
          .lcp-cards-grid  { grid-template-columns: 1fr 1fr; }
          .lcp-skel-cards  { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 420px) {
          .lcp-cards-grid { grid-template-columns: 1fr; }
          .lcp-skel-cards { grid-template-columns: 1fr; }
          .lcp-title { font-size: 2rem; }
        }
      `}</style>

      {/* Overlay */}
      <div className="lcp-overlay" />

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

      {/* Main Content */}
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
                  <span>Your cart is not eligible for the Lucky Charm campaign.</span>
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

        {/* Right column — spacer so the background wheel shows */}
        <div />
      </div>
    </div>
  );
}
