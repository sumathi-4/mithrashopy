import React from 'react';

export default function CustomFeatureSection({ title, subtitle, name }) {
  // If it's a custom block, we can render the title, subtitle, and support basic descriptive blocks.
  return (
    <section className="custom-feature-section" style={{ padding: '80px 5%', background: '#FAF6EE', borderBottom: '1px solid rgba(160, 140, 110, 0.15)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        {subtitle && (
          <span className="why-commitment-tag" style={{ display: 'block', marginBottom: '12px', fontSize: '0.88rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B38F2D', fontWeight: 'bold' }}>
            {subtitle}
          </span>
        )}
        {title && (
          <h2 className="why-main-title" style={{ fontFamily: "var(--font-serif)", fontSize: '2.5rem', color: '#051838', marginBottom: '24px' }}>
            {title}
          </h2>
        )}
        <div className="custom-feature-content" style={{ color: '#666666', fontSize: '1.05rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
          <p>
            Welcome to the <strong>{name}</strong> section. This is a custom functionality managed directly by the administrator. 
            You can customize this header, description, and status at any time from the super admin dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
