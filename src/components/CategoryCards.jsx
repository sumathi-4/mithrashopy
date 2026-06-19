import React, { useState, useEffect } from 'react';
import imgClothing from '../assets/hero_clothing.jpg';
import imgStationery from '../assets/hero_stationery.jpg';
import imgGifts from '../assets/hero_gifts.jpg';
import imgAccessories from '../assets/hero_accessories.jpg';
import logoImg from '../assets/logo.png';
import { apiService } from '../services/apiService';

export default function CategoryCards() {
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    let active = true;
    apiService.getCategories().then(data => {
      if (active && data && data.length > 0) {
        const parents = data.reduce((acc, cat) => {
          const parentName = cat.name.split(' > ')[0].trim();
          if (!acc.some(c => c.title.toLowerCase() === parentName.toLowerCase())) {
            let image = imgClothing;
            let subtitle = `Premium ${parentName} Collections`;
            let themeClass = "theme-clothing";

            if (parentName.toLowerCase() === 'clothing') {
              image = imgClothing;
              subtitle = "Kids, Men & Women Fashion";
              themeClass = "theme-clothing";
            } else if (parentName.toLowerCase() === 'stationery') {
              image = imgStationery;
              subtitle = "Aesthetic Premium Journals & Pens";
              themeClass = "theme-stationery";
            } else if (parentName.toLowerCase() === 'gifts') {
              image = imgGifts;
              subtitle = "Birthday, Wedding & Return Gifts";
              themeClass = "theme-gifts";
            } else if (parentName.toLowerCase() === 'accessories') {
              image = imgAccessories;
              subtitle = "Accessories & Premium Picks";
              themeClass = "theme-accessories";
            } else {
              themeClass = "theme-gifts";
              image = cat.image || imgGifts;
            }

            acc.push({
              id: cat._id || cat.id || Math.random(),
              title: parentName,
              subtitle: cat.description || subtitle,
              image: cat.image || image,
              themeClass
            });
          }
          return acc;
        }, []);
        setCategoriesList(parents);
      }
    }).catch(err => {
      console.warn("Failed to load categories for CategoryCards", err);
    });
    return () => { active = false; };
  }, []);

  const categories = categoriesList.length > 0 ? categoriesList : [
    {
      id: 1,
      title: "Clothing",
      subtitle: "Kids, Men & Women Fashion",
      image: imgClothing,
      themeClass: "theme-clothing"
    },
    {
      id: 2,
      title: "Stationery",
      subtitle: "Aesthetic Premium Journals & Pens",
      image: imgStationery,
      themeClass: "theme-stationery"
    },
    {
      id: 3,
      title: "Gifts",
      subtitle: "Birthday, Wedding & Return Gifts",
      image: imgGifts,
      themeClass: "theme-gifts"
    },
    {
      id: 4,
      title: "Accessories",
      subtitle: "Accessories & Premium Picks",
      image: imgAccessories,
      themeClass: "theme-accessories"
    }
  ];


  return (
    <section id="categories" className="categories-section">

      <div className="categories-container">
        
        {/* Section Header */}
        <div className="section-header">
          <img src={logoImg} className="section-crown-icon" alt="Logo" style={{ objectFit: 'contain' }} />
          <h2 className="section-title">Shop By Category</h2>
          <p className="section-subtitle">Curated collections tailored for your cultural lifestyle</p>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className={`category-card ${cat.themeClass}`}
              onClick={() => {
                window.history.pushState({}, '', `/Shop?category=${cat.title.toLowerCase()}`);
                window.dispatchEvent(new Event('popstate'));
              }}
              style={{ cursor: 'pointer' }}
            >
              
              {/* Image Container with background */}
              <div className="card-image-wrapper">
                <img src={cat.image} alt={cat.title} className="card-img" />
                <div className="card-glow-overlay"></div>
              </div>

              {/* Glassmorphic Content Card */}
              <div className="card-content-glass">
                <div className="card-crown-logo">
                  <img src={logoImg} className="card-crown-svg" alt="Logo" style={{ objectFit: 'contain' }} />
                </div>
                <h3 className="card-title">{cat.title}</h3>
                <p className="card-subtitle">{cat.subtitle}</p>
                <button className="card-explore-btn">
                  Explore Now
                </button>
              </div>

              {/* Shimmer Sweep Animation Overlay */}
              <div className="shimmer-sweep"></div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
