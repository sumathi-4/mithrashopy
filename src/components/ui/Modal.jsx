import React, { useEffect, useRef } from 'react';

/**
 * MithraShoppy Shared Modal Component
 * Supports: default, confirmation dialogs (via ConfirmDialog export)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}) => {
  const contentRef = useRef(null);

  // trap focus & ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ms-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'ms-modal-title' : undefined}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={contentRef}
        className={`ms-modal ms-modal--${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="ms-modal__header">
            {title && <h2 id="ms-modal-title" className="ms-modal__title">{title}</h2>}
            {showCloseButton && (
              <button className="ms-modal__close" onClick={onClose} aria-label="Close modal">
                ✕
              </button>
            )}
          </div>
        )}
        <div className="ms-modal__body">{children}</div>
      </div>
    </div>
  );
};

/**
 * ConfirmDialog — Destructive-action confirmation overlay
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnBackdrop={!loading}>
    <div className="ms-confirm">
      {description && <p className="ms-confirm__desc">{description}</p>}
      <div className="ms-confirm__actions">
        <button className="ms-btn ms-btn--outline ms-btn--md" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </button>
        <button
          className={`ms-btn ms-btn--${variant} ms-btn--md ${loading ? 'ms-btn--loading' : ''}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <span className="ms-btn__spinner" aria-hidden="true" />}
          {!loading && confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default Modal;
