import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';
import imgClothing from '../assets/sbc_clothing.png';
import imgStationery from '../assets/sbc_stationery.png';
import imgGifts from '../assets/sbc_gifts.png';
import imgAccessories from '../assets/sbc_accessories.png';
import imgKids from '../assets/hero_kids.jpg';

// Default images mapped to category names (case-insensitive)
const DEFAULT_IMAGES = {
  clothing:              imgClothing,
  stationery:            imgStationery,
  gifts:                 imgGifts,
  accessories:           imgAccessories,
  'accessories & fancy': imgAccessories,
  fancy:                 imgAccessories,
  kids:                  imgKids,
};

// Fallback list when backend is offline
const FALLBACK_CATEGORIES = [
  { name: 'Clothing',            image: imgClothing    },
  { name: 'Stationery',          image: imgStationery  },
  { name: 'Gifts',               image: imgGifts       },
  { name: 'Accessories & Fancy', image: imgAccessories },
];

const resolveCategoryImage = (imageVal, key) => {
  if (!imageVal) return DEFAULT_IMAGES[key] || imgClothing;
  const str = String(imageVal).toLowerCase();
  const isReal = str.startsWith('http') || str.startsWith('/') || str.startsWith('data:') || /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/.test(str);
  
  if (isReal) {
    if (str.startsWith('/uploads/') || str.startsWith('uploads/')) {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const cleanPath = imageVal.startsWith('/') ? imageVal : `/${imageVal}`;
      return `${BASE_URL}${cleanPath}`;
    }
    return imageVal;
  }
  return DEFAULT_IMAGES[key] || imgClothing;
};

export default function CategoryCards() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading]       = useState(true);
  const stripRef                    = useRef(null);

  useEffect(() => {
    apiService
      .getCategories()
      .then((data) => {
        if (data && data.length > 0) {
          const roots = data.filter(
            (c) =>
              (!c.parent || c.parent === '—' || c.parent === '') &&
              c.status === 'Active' &&
              c.showInCategories !== false
          );
          if (roots.length > 0) {
            setCategories(
              roots.map((c) => {
                const key = c.name.toLowerCase();
                return {
                  name:  c.name,
                  image: resolveCategoryImage(c.image, key),
                };
              })
            );
          }
        }
      })
      .catch(() => {/* keep fallback */})
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (catName) => {
    window.history.pushState({}, '', `/shop/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const scrollLeft  = () => stripRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  const scrollRight = () => stripRef.current?.scrollBy({ left:  320, behavior: 'smooth' });

  return (
    <section id="categories" className="sbc-section">
      {/* ── Section Header ── */}
      <div className="sbc-header">
        <h2 className="sbc-title">Shop by Top Categories</h2>
        <p className="sbc-subtitle">Explore our top categories and find your perfect style</p>
      </div>

      {/* ── Scroll Strip ── */}
      <div className="sbc-strip-wrapper">
        <button className="sbc-arrow sbc-arrow-left"  onClick={scrollLeft}  aria-label="Scroll left">&#8249;</button>

        <div className="sbc-strip" ref={stripRef}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="sbc-card sbc-skeleton" />
              ))
            : categories.map((cat, i) => (
                <button
                  key={i}
                  className="sbc-card"
                  onClick={() => handleClick(cat.name)}
                  aria-label={`Shop ${cat.name}`}
                >
                  {/* 3‑D card face */}
                  <div className="sbc-card-face">
                    <img src={cat.image} alt={cat.name} className="sbc-card-img" />
                    {/* bottom label overlay */}
                    <div className="sbc-card-label-wrap">
                      <span className="sbc-card-label">{cat.name}</span>
                    </div>
                    {/* shine sweep on hover */}
                    <div className="sbc-card-shine" aria-hidden="true" />
                  </div>
                  {/* 3‑D edge / depth illusion */}
                  <div className="sbc-card-edge" aria-hidden="true" />
                  <div className="sbc-card-shadow" aria-hidden="true" />
                </button>
              ))}
        </div>

        <button className="sbc-arrow sbc-arrow-right" onClick={scrollRight} aria-label="Scroll right">&#8250;</button>
      </div>
    </section>
  );
}
