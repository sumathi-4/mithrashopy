import React from 'react';
import { Gift, ChevronRight } from 'lucide-react';

export default function GiftsByOccasion() {
  const handleNavigation = (path) => {
    window.history.pushState({}, '', path);
    alert(`Navigating to: ${path}`);
  };

  const occasions = [
    {
      id: 'o1',
      title: "Birthday Gifts",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 'o2',
      title: "Wedding Gifts",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 'o3',
      title: "Anniversary Gifts",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 'o4',
      title: "Return Gifts",
      image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 'o5',
      title: "Baby Shower Gifts",
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <section className="gifts-occasion-section">
      <div className="gifts-occasion-container">
        
        {/* Section Title */}
        <div className="gifts-header">
          <Gift size={20} className="gifts-header-icon" />
          <h2 className="gifts-title">Shop Gifts By Occasion</h2>
        </div>

        {/* Occasion Grid */}
        <div className="occasions-grid">
          {occasions.map((occ) => (
            <div 
              key={occ.id} 
              className="occasion-card"
              onClick={() => handleNavigation(`/shop?category=gifts&occasion=${occ.title.toLowerCase().replace(' ', '_')}`)}
            >
              <div className="occasion-img-wrapper">
                <img src={occ.image} alt={occ.title} className="occasion-img" />
                <div className="occasion-overlay"></div>
              </div>
              
              <div className="occasion-info">
                <h3 className="occasion-card-title">{occ.title}</h3>
                <div className="occasion-explore-link">
                  <span>Explore Gifts</span>
                  <ChevronRight size={14} className="chevron-arrow" />
                </div>
              </div>
              
              {/* Glassy border shine element */}
              <div className="occasion-card-glow"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
