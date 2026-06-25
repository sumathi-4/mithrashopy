import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import { loginAdmin, verifySession, logout } from './services/authService';
import logoImg from '../../src/assets/logo.png';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check active session on load
  useEffect(() => {
    verifySession().then(user => {
      if (user) {
        setAuthUser(user);
      }
      setSessionChecked(true);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const res = await loginAdmin({ email: email.trim(), password });
      if (res.success) {
        setAuthUser(res.user);
      } else {
        setError(res.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      setError('Cannot connect to backend server. Please verify it is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocalNavigate = (path) => {
    // Standard SPA navigation simulation since we don't have routers
    if (path === '/') {
      logout();
      setAuthUser(null);
    }
  };

  if (!sessionChecked) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#051838',
        color: '#dfb743',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '1.25rem'
      }}>
        Verifying Session...
      </div>
    );
  }

  // If not logged in, render the login page
  if (!authUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#051838',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#08214d',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(223, 183, 67, 0.15)',
          padding: '40px 32px',
          textAlign: 'center'
        }}>
          {/* Logo / Header */}
          <div style={{ marginBottom: '32px' }}>
            <img src={logoImg} alt="Mithra Shopy Logo" style={{ height: '70px', width: 'auto', marginBottom: '16px' }} />
            <h1 style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}>
              Mithra<span style={{ color: '#dfb743' }}>Shoppy</span>
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(223, 183, 67, 0.1)',
              border: '1px solid rgba(223, 183, 67, 0.2)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              color: '#dfb743',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Shield size={12} />
              Control Center
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            {error && (
              <div style={{
                backgroundColor: 'rgba(235, 87, 87, 0.1)',
                border: '1px solid #eb5757',
                color: '#ff6b6b',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.85rem',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#a0aec0',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '6px'
              }}>
                Admin Email Address
              </label>
              <input
                type="email"
                placeholder="admin@mithrashoppy.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#051838',
                  border: '1px solid rgba(223, 183, 67, 0.25)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                color: '#a0aec0',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#051838',
                    border: '1px solid rgba(223, 183, 67, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    paddingRight: '46px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#a0aec0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: '#dfb743',
                color: '#051838',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(223, 183, 67, 0.2)'
              }}
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If logged in, render the dashboard
  return (
    <AdminDashboard
      authUser={authUser}
      setAuthUser={setAuthUser}
      onNavigate={handleLocalNavigate}
    />
  );
}
