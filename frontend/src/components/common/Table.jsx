import React from 'react';
import PropTypes from 'prop-types';

/**
 * Table — themed data table.
 */
export default function Table({ columns, data, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-aura-border bg-aura-surface">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 text-[10px] font-mono tracking-widest text-aura-text-faint uppercase font-semibold whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-aura-border">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-aura-surface-hover transition-colors duration-150"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-sm font-sans whitespace-nowrap text-aura-text">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      cell: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
};
