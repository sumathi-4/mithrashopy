import React from 'react';

/**
 * MithraShoppy Shared Skeleton Loader Component
 * Variants: text | rect | circle | card | product-card | table-row
 */
const Skeleton = ({ variant = 'text', width, height, className = '', count = 1, ...rest }) => {
  const cls = [
    'ms-skeleton',
    `ms-skeleton--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  if (count > 1) {
    return (
      <div className="ms-skeleton-group">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={cls} style={style} aria-hidden="true" {...rest} />
        ))}
      </div>
    );
  }

  return <div className={cls} style={style} aria-hidden="true" {...rest} />;
};

/**
 * Pre-composed ProductCard skeleton
 */
export const ProductCardSkeleton = () => (
  <div className="ms-skeleton-product-card">
    <Skeleton variant="rect" height="220px" />
    <div className="ms-skeleton-product-card__info">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  </div>
);

/**
 * Pre-composed TableRow skeleton
 */
export const TableRowSkeleton = ({ cols = 5, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, ri) => (
      <tr key={ri} className="ms-table__row">
        {Array.from({ length: cols }).map((_, ci) => (
          <td key={ci} className="ms-table__td">
            <Skeleton variant="text" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default Skeleton;
