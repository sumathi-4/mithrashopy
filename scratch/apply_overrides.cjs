const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/index.css');
const content = fs.readFileSync(cssPath, 'utf8');

// Split by the start of the override block comment
const splitMarker = '/* ==========================================================================\r\n   MAXIMUM SPECIFICITY OVERRIDES';
const alternativeMarker = '/* ==========================================================================\n   MAXIMUM SPECIFICITY OVERRIDES';

let baseContent = '';
if (content.includes(splitMarker)) {
  baseContent = content.split(splitMarker)[0];
} else if (content.includes(alternativeMarker)) {
  baseContent = content.split(alternativeMarker)[0];
} else {
  // Fallback to line splitting
  const lines = content.split(/\r?\n/);
  baseContent = lines.slice(0, 24389).join('\n') + '\n';
}

const newOverrides = `/* ==========================================================================
   MAXIMUM SPECIFICITY OVERRIDES — DEFEATS ALL CATEGORY COLOR OVERRIDES
   Applied with \`body\` prefix to win specificity over legacy theme classes.
   This ensures ALL products (incl. admin-added) follow the fixed premium theme.
   ========================================================================== */

/* Force global theme colors on any theme container variables */
body, 
body [class*="-theme"], 
body [class*="theme-"], 
body .quickview-split-overlay,
body .shop-product-detail-page-view {
  --theme-primary: #051838 !important;
  --theme-primary-rgb: 5, 24, 56 !important;
  --theme-accent: #dfb743 !important;
  --theme-btn-bg: #051838 !important;
  --theme-btn-text: #ffffff !important;
  --theme-glow: 0 8px 25px rgba(5, 24, 56, 0.25) !important;
}

/* --- PRODUCT CARDS (all categories) --- */
body .clothing-product-card,
body .clothing-product-card.theme-clothing,
body .clothing-product-card.cat-card-clothing,
body .clothing-product-card.cat-card-stationery,
body .clothing-product-card.cat-card-gifts,
body .clothing-product-card.cat-card-accessories,
body [class*="-theme"] .clothing-product-card,
body [class*="theme-"] .clothing-product-card,
body .shop-view-page .clothing-product-card {
  background: #fdfbf7 !important;
  border: 2px solid #dfb743 !important;
  border-radius: 20px !important;
  box-shadow: 0 4px 15px rgba(5, 24, 56, 0.08) !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}

body .clothing-product-card:hover,
body .clothing-product-card.theme-clothing:hover,
body .clothing-product-card.cat-card-clothing:hover,
body .clothing-product-card.cat-card-stationery:hover,
body .clothing-product-card.cat-card-gifts:hover,
body .clothing-product-card.cat-card-accessories:hover,
body [class*="-theme"] .clothing-product-card:hover,
body [class*="theme-"] .clothing-product-card:hover,
body .shop-view-page .clothing-product-card:hover {
  border-color: #dfb743 !important;
  box-shadow: 0 8px 25px rgba(5, 24, 56, 0.15) !important;
}

/* Image wrapper height consistency */
body .clothing-img-wrapper {
  aspect-ratio: 1 / 1.15 !important;
  background: #ffffff !important;
}

/* Brand name: Premium Blue, visible */
body .clothing-product-card .clothing-brand-name,
body .clothing-product-card.theme-clothing .clothing-brand-name,
body .clothing-product-card.cat-card-clothing .clothing-brand-name,
body .clothing-product-card.cat-card-stationery .clothing-brand-name,
body .clothing-product-card.cat-card-gifts .clothing-brand-name,
body .clothing-product-card.cat-card-accessories .clothing-brand-name,
body [class*="-theme"] .clothing-brand-name,
body [class*="theme-"] .clothing-brand-name {
  color: #051838 !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}

/* Product title: Black */
body .clothing-product-card .clothing-product-title,
body .clothing-product-card.theme-clothing .clothing-product-title,
body .clothing-product-card.cat-card-clothing .clothing-product-title,
body .clothing-product-card.cat-card-stationery .clothing-product-title,
body .clothing-product-card.cat-card-gifts .clothing-product-title,
body .clothing-product-card.cat-card-accessories .clothing-product-title,
body [class*="-theme"] .clothing-product-title,
body [class*="theme-"] .clothing-product-title {
  color: #000000 !important;
}

/* Selling price: Premium Blue */
body .clothing-product-card .clothing-selling-price,
body .clothing-product-card.theme-clothing .clothing-selling-price,
body .clothing-product-card.cat-card-clothing .clothing-selling-price,
body .clothing-product-card.cat-card-stationery .clothing-selling-price,
body .clothing-product-card.cat-card-gifts .clothing-selling-price,
body .clothing-product-card.cat-card-accessories .clothing-selling-price,
body [class*="-theme"] .clothing-selling-price,
body [class*="theme-"] .clothing-selling-price {
  color: #051838 !important;
  font-weight: 800 !important;
}

/* Original/crossed price: faded blue */
body .clothing-product-card .clothing-original-price,
body .clothing-product-card.theme-clothing .clothing-original-price,
body .clothing-product-card.cat-card-clothing .clothing-original-price,
body .clothing-product-card.cat-card-stationery .clothing-original-price,
body .clothing-product-card.cat-card-gifts .clothing-original-price,
body .clothing-product-card.cat-card-accessories .clothing-original-price,
body [class*="-theme"] .clothing-original-price,
body [class*="theme-"] .clothing-original-price {
  color: rgba(5, 24, 56, 0.5) !important;
}

/* Add to Cart button on cards: Premium Blue → Gold on hover */
body .clothing-product-card .clothing-card-add-cart-btn,
body .clothing-product-card.theme-clothing .clothing-card-add-cart-btn,
body .clothing-product-card.cat-card-clothing .clothing-card-add-cart-btn,
body .clothing-product-card.cat-card-stationery .clothing-card-add-cart-btn,
body .clothing-product-card.cat-card-gifts .clothing-card-add-cart-btn,
body .clothing-product-card.cat-card-accessories .clothing-card-add-cart-btn,
body [class*="-theme"] .clothing-card-add-cart-btn,
body [class*="theme-"] .clothing-card-add-cart-btn,
body .shop-view-page .clothing-card-add-cart-btn {
  background: #051838 !important;
  color: #ffffff !important;
  border: 2px solid #051838 !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}
body .clothing-product-card .clothing-card-add-cart-btn:hover,
body .clothing-product-card.theme-clothing .clothing-card-add-cart-btn:hover,
body .clothing-product-card.cat-card-clothing .clothing-card-add-cart-btn:hover,
body .clothing-product-card.cat-card-stationery .clothing-card-add-cart-btn:hover,
body .clothing-product-card.cat-card-gifts .clothing-card-add-cart-btn:hover,
body .clothing-product-card.cat-card-accessories .clothing-card-add-cart-btn:hover,
body [class*="-theme"] .clothing-card-add-cart-btn:hover,
body [class*="theme-"] .clothing-card-add-cart-btn:hover,
body .shop-view-page .clothing-card-add-cart-btn:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
  border-color: #dfb743 !important;
}

/* Card image hover action icons: Gold default → Blue on hover */
body .clothing-product-card .clothing-hover-action-btn,
body .clothing-product-card.theme-clothing .clothing-hover-action-btn,
body .clothing-product-card.cat-card-clothing .clothing-hover-action-btn,
body .clothing-product-card.cat-card-stationery .clothing-hover-action-btn,
body .clothing-product-card.cat-card-gifts .clothing-hover-action-btn,
body .clothing-product-card.cat-card-accessories .clothing-hover-action-btn {
  background: #dfb743 !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(223, 183, 67, 0.4) !important;
}
body .clothing-product-card .clothing-hover-action-btn:hover,
body .clothing-product-card.theme-clothing .clothing-hover-action-btn:hover,
body .clothing-product-card.cat-card-clothing .clothing-hover-action-btn:hover,
body .clothing-product-card.cat-card-stationery .clothing-hover-action-btn:hover,
body .clothing-product-card.cat-card-gifts .clothing-hover-action-btn:hover,
body .clothing-product-card.cat-card-accessories .clothing-hover-action-btn:hover {
  background: #051838 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(5, 24, 56, 0.4) !important;
}

/* Wishlist float btn: Gold → Blue on active/hover */
body .clothing-product-card .clothing-wishlist-float-btn,
body .clothing-product-card.theme-clothing .clothing-wishlist-float-btn,
body .clothing-product-card.cat-card-clothing .clothing-wishlist-float-btn,
body .clothing-product-card.cat-card-stationery .clothing-wishlist-float-btn,
body .clothing-product-card.cat-card-gifts .clothing-wishlist-float-btn,
body .clothing-product-card.cat-card-accessories .clothing-wishlist-float-btn {
  background: #dfb743 !important;
  color: #ffffff !important;
  border: 1px solid #dfb743 !important;
}
body .clothing-product-card .clothing-wishlist-float-btn:hover,
body .clothing-product-card .clothing-wishlist-float-btn.active,
body .clothing-product-card.theme-clothing .clothing-wishlist-float-btn:hover,
body .clothing-product-card.theme-clothing .clothing-wishlist-float-btn.active {
  background: #051838 !important;
  color: #ffffff !important;
  border-color: #051838 !important;
}

/* --- QUICK VIEW MODAL (all categories) --- */
/* Strictly uniform dimension layout for all Quick Views */
body .quickview-split-card,
body .quickview-split-overlay .quickview-split-card,
body .quickview-split-overlay[class*="theme-"] .quickview-split-card,
body .quickview-split-overlay[class*="-theme"] .quickview-split-card {
  width: 960px !important;
  max-width: 95vw !important;
  height: 640px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  background: #fdfbf7 !important;
  border: 2px solid #dfb743 !important;
  border-radius: 20px !important;
  box-shadow: 0 15px 45px rgba(5, 24, 56, 0.15) !important;
  overflow: hidden !important;
}

/* Header bar styling */
body .quickview-modal-header {
  height: 54px !important;
  padding: 0 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  border-bottom: 1px solid rgba(5, 24, 56, 0.08) !important;
  background: #fdfbf7 !important;
  box-sizing: border-box !important;
}
body .quickview-modal-title-top {
  color: #051838 !important;
  font-weight: 700 !important;
}

/* Layout container splits into exactly 2 panes inside 640px card height */
body .quickview-split-layout {
  display: grid !important;
  grid-template-columns: 430px 1fr !important;
  height: calc(640px - 54px) !important;
  overflow: hidden !important;
}

/* Gallery pane styling */
body .quickview-split-gallery-pane {
  display: flex !important;
  gap: 15px !important;
  padding: 24px !important;
  height: 100% !important;
  box-sizing: border-box !important;
  align-items: center !important;
}

/* Gallery thumbnail scroll column */
body .quickview-gallery-thumbnails {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  width: 60px !important;
  flex-shrink: 0 !important;
  max-height: 440px !important;
  height: auto !important;
  overflow-y: auto !important;
}

/* Main image size inside Quick View */
body .quickview-main-image-wrapper {
  height: 440px !important;
  width: 330px !important;
  flex-shrink: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  background: #ffffff !important;
  border: 1px solid rgba(5, 24, 56, 0.1) !important;
}
body .quickview-split-layout .quickview-split-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

/* Right Info pane: Scrolls internally, preventing modal resizing */
body .quickview-split-info-pane,
body .quickview-split-overlay[class*="theme-"] .quickview-split-info-pane,
body .quickview-split-overlay[class*="-theme"] .quickview-split-info-pane {
  padding: 30px 40px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
  height: 100% !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
  justify-content: flex-start !important;
}

/* Product title - Force Black on all category themes */
body .quickview-split-overlay .modal-title,
body .quickview-split-overlay[class*="theme-"] .modal-title,
body .quickview-split-overlay[class*="-theme"] .modal-title {
  color: #000000 !important;
  font-family: var(--font-serif) !important;
  font-size: 1.8rem !important;
  font-weight: 800 !important;
  margin: 0 !important;
  line-height: 1.25 !important;
}

/* Description & body text - Force Premium Blue on all categories */
body .quickview-split-overlay .modal-desc,
body .quickview-split-overlay[class*="theme-"] .modal-desc,
body .quickview-split-overlay[class*="-theme"] .modal-desc {
  color: #051838 !important;
  font-size: 0.88rem !important;
  line-height: 1.55 !important;
  margin: 0 !important;
}

/* General labels, texts, spans, reviews, availability status */
body .quickview-split-overlay span:not(.availability-status):not(.modal-discount-badge):not(.modal-original-price),
body .quickview-split-overlay p,
body .quickview-split-overlay label,
body .quickview-split-overlay .modal-reviews-count,
body .quickview-split-overlay[class*="theme-"] span:not(.availability-status):not(.modal-discount-badge):not(.modal-original-price),
body .quickview-split-overlay[class*="theme-"] p,
body .quickview-split-overlay[class*="theme-"] label,
body .quickview-split-overlay[class*="theme-"] .modal-reviews-count,
body .quickview-split-overlay[class*="-theme"] span:not(.availability-status):not(.modal-discount-badge):not(.modal-original-price),
body .quickview-split-overlay[class*="-theme"] p,
body .quickview-split-overlay[class*="-theme"] label,
body .quickview-split-overlay[class*="-theme"] .modal-reviews-count {
  color: #051838 !important;
}

/* Star ratings & availability */
body .quickview-split-overlay .modal-stars,
body .quickview-split-overlay .star-filled,
body .quickview-split-overlay[class*="theme-"] .modal-stars,
body .quickview-split-overlay[class*="-theme"] .modal-stars {
  color: #dfb743 !important;
}

/* Pricing inside quick view */
body .quickview-split-overlay .modal-price,
body .quickview-split-overlay[class*="theme-"] .modal-price,
body .quickview-split-overlay[class*="-theme"] .modal-price {
  color: #051838 !important;
  font-weight: 800 !important;
  font-size: 1.6rem !important;
}
body .quickview-split-overlay .modal-original-price,
body .quickview-split-overlay[class*="theme-"] .modal-original-price,
body .quickview-split-overlay[class*="-theme"] .modal-original-price {
  color: rgba(5, 24, 56, 0.5) !important;
  text-decoration: line-through !important;
  font-size: 1.1rem !important;
}

/* Section titles and headings (Select Size, Quantity) - Force Black */
body .quickview-split-overlay .modal-section-title,
body .quickview-split-overlay[class*="theme-"] .modal-section-title,
body .quickview-split-overlay[class*="-theme"] .modal-section-title,
body .quickview-split-overlay .qty-label,
body .quickview-split-overlay[class*="theme-"] .qty-label,
body .quickview-split-overlay[class*="-theme"] .qty-label,
body .quickview-split-overlay .availability-label,
body .quickview-split-overlay[class*="theme-"] .availability-label,
body .quickview-split-overlay[class*="-theme"] .availability-label {
  color: #000000 !important;
  font-weight: 700 !important;
}

/* Quantity block layout & premium gold selector border */
body .quickview-split-overlay .modal-quantity-selector,
body .quickview-split-overlay[class*="theme-"] .modal-quantity-selector,
body .quickview-split-overlay[class*="-theme"] .modal-quantity-selector {
  border: 1.5px solid #dfb743 !important;
  background: transparent !important;
  border-radius: 20px !important;
  padding: 2px 10px !important;
}
body .quickview-split-overlay .modal-quantity-selector button.qty-btn,
body .quickview-split-overlay[class*="theme-"] .modal-quantity-selector button.qty-btn,
body .quickview-split-overlay[class*="-theme"] .modal-quantity-selector button.qty-btn {
  color: #dfb743 !important;
  background: transparent !important;
  font-weight: 800 !important;
  font-size: 1.1rem !important;
}
body .quickview-split-overlay .modal-quantity-selector button.qty-btn:hover,
body .quickview-split-overlay[class*="theme-"] .modal-quantity-selector button.qty-btn:hover,
body .quickview-split-overlay[class*="-theme"] .modal-quantity-selector button.qty-btn:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
}
body .quickview-split-overlay .modal-quantity-selector .qty-value,
body .quickview-split-overlay[class*="theme-"] .modal-quantity-selector .qty-value,
body .quickview-split-overlay[class*="-theme"] .modal-quantity-selector .qty-value {
  color: #051838 !important;
  font-weight: 700 !important;
}

/* Select Option Buttons (Size Pills, Themes) */
body .quickview-split-overlay .modal-size-btn,
body .quickview-split-overlay[class*="theme-"] .modal-size-btn,
body .quickview-split-overlay[class*="-theme"] .modal-size-btn {
  border: 1px solid #000000 !important;
  color: #000000 !important;
  background: transparent !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
}
body .quickview-split-overlay .modal-size-btn:hover,
body .quickview-split-overlay[class*="theme-"] .modal-size-btn:hover,
body .quickview-split-overlay[class*="-theme"] .modal-size-btn:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
  border-color: #dfb743 !important;
}
body .quickview-split-overlay .modal-size-btn.active,
body .quickview-split-overlay[class*="theme-"] .modal-size-btn.active,
body .quickview-split-overlay[class*="-theme"] .modal-size-btn.active {
  background: #051838 !important;
  color: #ffffff !important;
  border-color: #051838 !important;
}

/* Primary ADD TO CART button inside quick view */
body .quickview-split-overlay .modal-primary-action-btn,
body .quickview-split-overlay .modal-add-cart-btn-split,
body .quickview-split-overlay[class*="theme-"] .modal-primary-action-btn,
body .quickview-split-overlay[class*="theme-"] .modal-add-cart-btn-split,
body .quickview-split-overlay[class*="-theme"] .modal-primary-action-btn,
body .quickview-split-overlay[class*="-theme"] .modal-add-cart-btn-split {
  background: #051838 !important;
  color: #ffffff !important;
  border: 2px solid #051838 !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
  padding: 12px 20px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  box-shadow: none !important;
  background-image: none !important;
}
body .quickview-split-overlay .modal-primary-action-btn:hover,
body .quickview-split-overlay .modal-add-cart-btn-split:hover,
body .quickview-split-overlay[class*="theme-"] .modal-primary-action-btn:hover,
body .quickview-split-overlay[class*="theme-"] .modal-add-cart-btn-split:hover,
body .quickview-split-overlay[class*="-theme"] .modal-primary-action-btn:hover,
body .quickview-split-overlay[class*="-theme"] .modal-add-cart-btn-split:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
  border-color: #dfb743 !important;
  background-image: none !important;
}

/* Secondary GO TO PRODUCT button: Solid Premium Golden */
body .quickview-split-overlay .modal-secondary-action-btn,
body .quickview-split-overlay[class*="theme-"] .modal-secondary-action-btn,
body .quickview-split-overlay[class*="-theme"] .modal-secondary-action-btn {
  background: #dfb743 !important;
  border: 2px solid #dfb743 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
  padding: 12px 20px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  box-shadow: none !important;
  background-image: none !important;
}
body .quickview-split-overlay .modal-secondary-action-btn:hover,
body .quickview-split-overlay[class*="theme-"] .modal-secondary-action-btn:hover,
body .quickview-split-overlay[class*="-theme"] .modal-secondary-action-btn:hover {
  background: #051838 !important;
  border-color: #051838 !important;
  color: #ffffff !important;
  background-image: none !important;
}

/* Add to Wishlist link: aligned below & centered, transparent, no border */
body .quickview-split-overlay .modal-extra-links-row,
body .quickview-split-overlay[class*="theme-"] .modal-extra-links-row,
body .quickview-split-overlay[class*="-theme"] .modal-extra-links-row {
  display: flex !important;
  justify-content: center !important;
  margin-top: 5px !important;
  border-top: none !important;
  padding-top: 0 !important;
}
body .quickview-split-overlay .modal-extra-link-btn,
body .quickview-split-overlay[class*="theme-"] .modal-extra-link-btn,
body .quickview-split-overlay[class*="-theme"] .modal-extra-link-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: #051838 !important;
  font-weight: 700 !important;
  text-decoration: underline !important;
  font-size: 0.9rem !important;
  cursor: pointer !important;
  padding: 5px 15px !important;
  transition: color 0.2s ease !important;
}
body .quickview-split-overlay .modal-extra-link-btn:hover,
body .quickview-split-overlay[class*="theme-"] .modal-extra-link-btn:hover,
body .quickview-split-overlay[class*="-theme"] .modal-extra-link-btn:hover {
  color: #dfb743 !important;
  background: transparent !important;
  transform: scale(1.05) !important;
}

/* Close button - Black */
body .quickview-split-overlay .modal-close-btn,
body .quickview-split-overlay[class*="theme-"] .modal-close-btn,
body .quickview-split-overlay[class*="-theme"] .modal-close-btn {
  color: #000000 !important;
}

/* --- PRODUCT DETAIL PAGE (all categories) --- */
body .shop-product-detail-page-view .product-detail-grid-layout {
  background: #fdfbf7 !important;
  border: 2px solid #dfb743 !important;
  box-shadow: 0 0 25px rgba(5, 24, 56, 0.1) !important;
  border-radius: 20px !important;
}

/* Title & section headings */
body .shop-product-detail-page-view .product-detail-title {
  color: #000000 !important;
  font-weight: 800 !important;
}
body .shop-product-detail-page-view .product-detail-section-title,
body .shop-product-detail-page-view .product-detail-grid-layout .product-detail-section-title {
  color: #000000 !important;
  font-weight: 700 !important;
}

/* Selling price: Premium Blue */
body .shop-product-detail-page-view .product-detail-price-value {
  color: #051838 !important;
  font-weight: 800 !important;
}

/* Original price: faded */
body .shop-product-detail-page-view .product-detail-original-price {
  color: rgba(5, 24, 56, 0.5) !important;
  text-decoration: line-through !important;
}

/* Star rating icons */
body .shop-product-detail-page-view .star-filled,
body .shop-product-detail-page-view .rating-star-icon {
  color: #dfb743 !important;
}

/* Quantity selectors on details page: Premium Gold */
body .shop-product-detail-page-view .product-detail-qty-control {
  border: 1px solid #dfb743 !important;
  background: transparent !important;
  border-radius: 20px !important;
}
body .shop-product-detail-page-view .product-detail-qty-control button {
  color: #dfb743 !important;
  background: transparent !important;
}
body .shop-product-detail-page-view .product-detail-qty-control button:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
}
body .shop-product-detail-page-view .product-detail-qty-control span {
  color: #051838 !important;
}

/* Size pills */
body .shop-product-detail-page-view .modal-size-btn {
  border: 1px solid #000000 !important;
  color: #000000 !important;
  background: transparent !important;
}
body .shop-product-detail-page-view .modal-size-btn:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
  border-color: #dfb743 !important;
}
body .shop-product-detail-page-view .modal-size-btn.active {
  background: #051838 !important;
  color: #ffffff !important;
  border-color: #051838 !important;
}

/* Primary ADD TO CART button on details page */
body .shop-product-detail-page-view .product-detail-cart-btn {
  background: #051838 !important;
  color: #ffffff !important;
  border: 2px solid #051838 !important;
  background-image: none !important;
}
body .shop-product-detail-page-view .product-detail-cart-btn:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
  border-color: #dfb743 !important;
}

/* Secondary BUY NOW button on details page */
body .shop-product-detail-page-view .product-detail-buy-btn {
  background: transparent !important;
  border: 2px solid #051838 !important;
  color: #051838 !important;
  background-image: none !important;
}
body .shop-product-detail-page-view .product-detail-buy-btn:hover {
  background: #dfb743 !important;
  color: #ffffff !important;
  border-color: #dfb743 !important;
}

/* Detail page main image container */
body .product-detail-main-image-wrapper {
  height: 440px !important;
  width: 330px !important;
  flex-shrink: 0 !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  border: 1px solid rgba(5, 24, 56, 0.1) !important;
  background: #ffffff !important;
}
body .product-detail-main-image-wrapper .product-detail-main-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

/* Thumbnail active: Gold border */
body .product-detail-thumbnail-wrapper.active,
body .quickview-thumbnail-wrapper.active {
  border-color: #dfb743 !important;
}
`;
