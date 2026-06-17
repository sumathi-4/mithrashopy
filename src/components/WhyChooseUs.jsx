import { Award, Tag, ShieldCheck, Truck } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Award size={32} className="why-icon" />,
      title: "Premium Quality",
      description: "Handpicked collections crafted with authentic fabrics & materials."
    },
    {
      icon: <Tag size={32} className="why-icon" />,
      title: "Affordable Pricing",
      description: "Direct-from-weaver boutique items that guarantee true value."
    },
    {
      icon: <ShieldCheck size={32} className="why-icon" />,
      title: "Trusted Products",
      description: "100% genuine products with secure payments and customer trust."
    },
    {
      icon: <Truck size={32} className="why-icon" />,
      title: "Fast Delivery",
      description: "Express shipping with real-time tracking across India."
    }
  ];

  return (
    <section className="why-choose-section">
      <div className="section-container">
        <div className="section-header text-center" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-tag-mini" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E94FA8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>OUR COMMITMENT</span>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: '#2D2D2D', marginTop: '8px', marginBottom: '12px' }}>Why Choose Mithra Shopy</h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>Delivering elegance and quality at your doorstep</p>
        </div>

        <div className="why-grid">
          {features.map((feat, index) => (
            <div key={index} className="why-card">
              <div className="why-icon-box">
                {feat.icon}
              </div>
              <h3 className="why-title">{feat.title}</h3>
              <p className="why-desc">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
