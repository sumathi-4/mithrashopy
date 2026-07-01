import React from 'react';

/**
 * MithraShoppy Shared EmptyState Component
 */
const EmptyState = ({
  illustration,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) => (
  <div className={`ms-empty-state ${className}`} role="status">
    {illustration && (
      <div className="ms-empty-state__illustration" aria-hidden="true">
        {illustration}
      </div>
    )}
    {!illustration && (
      <div className="ms-empty-state__icon" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="32" fill="hsla(225,75%,45%,0.08)" />
          <path d="M20 44 L32 20 L44 44 Z" stroke="hsla(225,75%,45%,0.5)" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <circle cx="32" cy="37" r="2" fill="hsla(225,75%,45%,0.6)" />
          <rect x="31" y="27" width="2" height="7" rx="1" fill="hsla(225,75%,45%,0.6)" />
        </svg>
      </div>
    )}
    <h3 className="ms-empty-state__title">{title}</h3>
    {description && <p className="ms-empty-state__desc">{description}</p>}
    {action && <div className="ms-empty-state__action">{action}</div>}
  </div>
);

export default EmptyState;
