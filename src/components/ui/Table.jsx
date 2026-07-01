import React from 'react';

/**
 * MithraShoppy Shared Table Component
 * Supports striped rows, hover highlight, sticky header
 */
const Table = ({
  columns = [],
  data = [],
  striped = true,
  hoverable = true,
  stickyHeader = false,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  const tableCls = [
    'ms-table',
    striped ? 'ms-table--striped' : '',
    hoverable ? 'ms-table--hoverable' : '',
    stickyHeader ? 'ms-table--sticky-header' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="ms-table-container">
      <table className={tableCls}>
        <thead className="ms-table__head">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`ms-table__th ${col.align ? `ms-table__th--${col.align}` : ''}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="ms-table__body">
          {loading ? (
            // skeleton rows
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="ms-table__row">
                {columns.map((col) => (
                  <td key={col.key} className="ms-table__td">
                    <div className="ms-skeleton ms-skeleton--text" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ms-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row.id ?? rowIdx} className="ms-table__row">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`ms-table__td ${col.align ? `ms-table__td--${col.align}` : ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
