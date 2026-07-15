import React from 'react';

/**
 * MithraShoppy Shared Breadcrumbs Component
 */
const Breadcrumbs = ({ items = [], className = '' }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`ms-breadcrumbs ${className}`}>
      <ol className="ms-breadcrumbs__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="ms-breadcrumbs__item">
              {!isLast ? (
                <>
                  {item.onClick ? (
                    <button className="ms-breadcrumbs__link" onClick={item.onClick}>
                      {item.label}
                    </button>
                  ) : (
                    <a className="ms-breadcrumbs__link" href={item.href || '#'}>
                      {item.label}
                    </a>
                  )}
                  <span className="ms-breadcrumbs__separator" aria-hidden="true">/</span>
                </>
              ) : (
                <span className="ms-breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
