import React from 'react';
import PropTypes from 'prop-types';

export default function Table({ columns, data, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 text-xs font-mono tracking-widest text-white/50 uppercase font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/5 transition-colors duration-200">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-sm font-sans whitespace-nowrap">
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
