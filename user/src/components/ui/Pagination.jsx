import React from 'react';

/**
 * MithraShoppy Shared Pagination Component
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const range = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const buildPages = () => {
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalPageNumbers) return range(1, totalPages);

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots)
      return [...range(1, 3 + 2 * siblingCount), '...', totalPages];
    if (showLeftDots && !showRightDots)
      return [1, '...', ...range(totalPages - (3 + 2 * siblingCount) + 1, totalPages)];
    return [1, '...', ...range(leftSibling, rightSibling), '...', totalPages];
  };

  const pages = buildPages();

  return (
    <nav className={`ms-pagination ${className}`} aria-label="Pagination">
      <button
        className="ms-pagination__btn ms-pagination__btn--arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="ms-pagination__dots">…</span>
        ) : (
          <button
            key={page}
            className={`ms-pagination__btn ${page === currentPage ? 'ms-pagination__btn--active' : ''}`}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        className="ms-pagination__btn ms-pagination__btn--arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
};

export default Pagination;
