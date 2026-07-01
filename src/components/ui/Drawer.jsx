import React, { useEffect } from 'react';

/**
 * MithraShoppy Shared Drawer Component
 * Slides in from left or right
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  width = '360px',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`ms-drawer-backdrop ${isOpen ? 'ms-drawer-backdrop--visible' : ''}`}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`ms-drawer ms-drawer--${position} ${isOpen ? 'ms-drawer--open' : ''} ${className}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'ms-drawer-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div className="ms-drawer__header">
            {title && <h2 id="ms-drawer-title" className="ms-drawer__title">{title}</h2>}
            {showCloseButton && (
              <button className="ms-drawer__close" onClick={onClose} aria-label="Close drawer">
                ✕
              </button>
            )}
          </div>
        )}
        <div className="ms-drawer__body">{children}</div>
      </div>
    </>
  );
};

export default Drawer;
