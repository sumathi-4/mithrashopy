import React from 'react';

/**
 * MithraShoppy Shared Loader Component
 * Sizes: sm | md | lg
 * Variants: spinner | dots
 */
const Loader = ({ size = 'md', variant = 'spinner', overlay = false, label = 'Loading…' }) => {
  const spinner = (
    <div className={`ms-loader ms-loader--${size} ms-loader--${variant}`} role="status" aria-label={label}>
      {variant === 'spinner' && <span className="ms-loader__ring" aria-hidden="true" />}
      {variant === 'dots' && (
        <span className="ms-loader__dots" aria-hidden="true">
          <span /><span /><span />
        </span>
      )}
      <span className="ms-sr-only">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="ms-loader-overlay" aria-busy="true">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
