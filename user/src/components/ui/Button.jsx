import React from 'react';

/**
 * MithraShoppy Shared Button Component
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes: sm | md | lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...rest
}) => {
  const base = 'ms-btn';
  const cls = [
    base,
    `ms-btn--${variant}`,
    `ms-btn--${size}`,
    fullWidth ? 'ms-btn--full' : '',
    loading ? 'ms-btn--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="ms-btn__spinner" aria-hidden="true" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="ms-btn__icon ms-btn__icon--left">{icon}</span>
      )}
      <span className="ms-btn__text">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="ms-btn__icon ms-btn__icon--right">{icon}</span>
      )}
    </button>
  );
};

export default Button;
