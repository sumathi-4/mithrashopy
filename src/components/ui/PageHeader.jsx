import React from 'react';

/**
 * MithraShoppy Shared PageHeader Component
 * Renders breadcrumbs + title + optional action slot
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  className = '',
}) => (
  <div className={`ms-page-header ${className}`}>
    {breadcrumbs.length > 0 && (
      <nav className="ms-page-header__breadcrumbs" aria-label="Breadcrumb">
        <ol className="ms-breadcrumbs__list">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <li key={i} className="ms-breadcrumbs__item">
                {!isLast ? (
                  <>
                    {crumb.onClick ? (
                      <button className="ms-breadcrumbs__link" onClick={crumb.onClick}>
                        {crumb.label}
                      </button>
                    ) : (
                      <a className="ms-breadcrumbs__link" href={crumb.href || '#'}>
                        {crumb.label}
                      </a>
                    )}
                    <span className="ms-breadcrumbs__separator" aria-hidden="true">/</span>
                  </>
                ) : (
                  <span className="ms-breadcrumbs__current" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    )}
    <div className="ms-page-header__row">
      <div className="ms-page-header__text">
        <h1 className="ms-page-header__title">{title}</h1>
        {subtitle && <p className="ms-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ms-page-header__actions">{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
