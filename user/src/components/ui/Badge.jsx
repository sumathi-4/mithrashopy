import React from 'react';

/**
 * MithraShoppy Shared Badge Component
 * Variants: success | warning | error | info | neutral | primary | gold
 */
const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...rest
}) => {
  const cls = [
    'ms-badge',
    `ms-badge--${variant}`,
    `ms-badge--${size}`,
    dot ? 'ms-badge--dot' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={cls} {...rest}>
      {dot && <span className="ms-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;
