import React from 'react';
import bannerVideo from '../assets/banner_video.mp4';

export default function VideoShowcase() {
  const handleViewTrendsClick = () => {
    window.history.pushState({}, '', '/Shop');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <section className="video-showcase-section">
      <div className="video-container-wrap">
        <video
          className="video-element"
          autoPlay
          loop
          muted
          playsInline
          src={bannerVideo}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Subtle Bottom-Center Button Overlay (No giant card blocking the video) */}
        <div className="video-overlay-simple">
          <button 
            className="video-trends-btn"
            onClick={handleViewTrendsClick}
            aria-label="View Top Trends"
          >
            View Trends <span className="trends-arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
