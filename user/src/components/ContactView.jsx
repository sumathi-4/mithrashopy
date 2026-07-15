import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Tag } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    apiService.postContactQuery({
      name: formData.name,
      email: formData.email,
      message: `${formData.subject ? `[${formData.subject}] ` : ''}${formData.message}`
    }).then(() => {
      alert(`Thank you ${formData.name}! Your message has been sent successfully.`);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }).catch(err => {
      alert(`Failed to send message: ${err.message || 'Error occurred.'}`);
    });
  };

  return (
    <div className="contact-view-page">
      <div className="contact-container">
        
        {/* Contact Page Title */}
        <h1 className="contact-main-title">Contact Page</h1>

        {/* Contact Card Box */}
        <div className="contact-card-box">
          
          {/* Left Panel: Get In Touch Details */}
          <div className="contact-info-panel">
            <h2 className="contact-panel-title">Get In Touch</h2>
            <p className="contact-panel-desc">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            <div className="contact-details-list-vertical">
              
              <div className="contact-detail-item-vertical">
                <div className="contact-icon-circle">
                  <MapPin size={18} />
                </div>
                <div className="contact-detail-text">
                  <span>123, Fashion Street,</span>
                  <span>New York, NY 10001</span>
                </div>
              </div>

              <div className="contact-detail-item-vertical">
                <div className="contact-icon-circle">
                  <Mail size={18} />
                </div>
                <div className="contact-detail-text">
                  <a href="mailto:info@mithrashopy.com">info@mithrashopy.com</a>
                </div>
              </div>

              <div className="contact-detail-item-vertical">
                <div className="contact-icon-circle">
                  <Phone size={18} />
                </div>
                <div className="contact-detail-text">
                  <a href="tel:+15551234567">+1 (555) 123-4567</a>
                </div>
              </div>

              <div className="contact-detail-item-vertical">
                <div className="contact-icon-circle">
                  <Clock size={18} />
                </div>
                <div className="contact-detail-text">
                  <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                </div>
              </div>

            </div>

            {/* Social Circle Links */}
            <div className="contact-social-row">
              <a href="#facebook" className="contact-social-circle" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              <a href="#instagram" className="contact-social-circle" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#twitter" className="contact-social-circle" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#pinterest" className="contact-social-circle" aria-label="Pinterest">
                <Tag size={16} />
              </a>
            </div>

          </div>

          {/* Right Panel: White Message Form Card */}
          <form className="contact-form-panel" onSubmit={handleSubmit}>
            
            <div className="contact-form-row">
              <div className="contact-form-group">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  className="contact-input-field"
                />
              </div>
              <div className="contact-form-group">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  className="contact-input-field"
                />
              </div>
            </div>

            <div className="contact-form-group full-width-group">
              <input 
                type="tel" 
                name="phone" 
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={handleChange}
                className="contact-input-field"
              />
            </div>

            <div className="contact-form-group full-width-group">
              <input 
                type="text" 
                name="subject" 
                placeholder="Subject" 
                value={formData.subject}
                onChange={handleChange}
                required 
                className="contact-input-field"
              />
            </div>

            <div className="contact-form-group full-width-group">
              <textarea 
                name="message" 
                placeholder="Your Message" 
                value={formData.message}
                onChange={handleChange}
                required 
                className="contact-textarea-field"
                rows="6"
              ></textarea>
            </div>

            <button type="submit" className="contact-submit-btn">
              Send Message
            </button>

          </form>

        </div>

      </div>

      {/* Full-width Map Section */}
      <div className="contact-map-section">
        <iframe 
          title="Mithra Shopy Location Map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0094%2C40.7100%2C-73.9994%2C40.7200&layer=mapnik" 
          className="contact-map-iframe"
          frameBorder="0" 
          scrolling="no" 
          marginHeight="0" 
          marginWidth="0"
        ></iframe>
      </div>

    </div>
  );
}
