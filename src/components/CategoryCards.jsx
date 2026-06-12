import React from 'react';

export default function CategoryCards() {
  const categories = [
    {
      id: 1,
      title: "Clothing",
      subtitle: "Kids, Men & Women Fashion",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      themeClass: "theme-clothing"
    },
    {
      id: 2,
      title: "Stationery",
      subtitle: "Aesthetic Premium Journals & Pens",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      themeClass: "theme-stationery"
    },
    {
      id: 3,
      title: "Gifts",
      subtitle: "Birthday, Wedding & Return Gifts",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      themeClass: "theme-gifts"
    },
    {
      id: 4,
      title: "Accessories",
      subtitle: "Accessories & Premium Picks",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      themeClass: "theme-accessories"
    }
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">
        
        {/* Section Header */}
        <div className="section-header">
          <svg className="section-crown-icon" viewBox="0 0 100 40">
            <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z M 15,37 L 85,37 L 85,39 L 15,39 Z" />
          </svg>
          <h2 className="section-title">Shop By Category</h2>
          <p className="section-subtitle">Curated collections tailored for your cultural lifestyle</p>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className={`category-card ${cat.themeClass}`}>
              
              {/* Image Container with background */}
              <div className="card-image-wrapper">
                <img src={cat.image} alt={cat.title} className="card-img" />
                <div className="card-glow-overlay"></div>
              </div>

              {/* Glassmorphic Content Card */}
              <div className="card-content-glass">
                <div className="card-crown-logo">
                  <svg viewBox="0 0 100 40" className="card-crown-svg">
                    <path d="M 15,35 L 85,35 L 80,18 L 65,26 L 50,10 L 35,26 L 20,18 Z" />
                  </svg>
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
