import React from 'react';
import PropTypes from 'prop-types';
import Table from '../common/Table';
import { Edit2, Trash2 } from 'lucide-react';
import { SUPPLY_CATEGORIES } from '../../constants';

const getCategoryColor = (category) => {
  switch (category) {
    case SUPPLY_CATEGORIES.MEDICAL: return 'bg-aura-red/20 text-[#FF8A8A] border-aura-red/30';
    case SUPPLY_CATEGORIES.FOOD: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case SUPPLY_CATEGORIES.UTILITY: return 'bg-aura-amber/20 text-aura-amber border-aura-amber/30';
    case SUPPLY_CATEGORIES.SHELTER: return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
    case SUPPLY_CATEGORIES.COMMUNICATION: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

export default function InventoryTable({ supplies, onEdit, onDelete }) {
  const columns = [
    {
      header: 'Supply ID',
      cell: (row) => <span className="text-aura-amber font-mono text-sm tracking-wider font-bold">{row.id}</span>
    },
    {
      header: 'Name',
      cell: (row) => <span className="font-sans font-bold text-white/90 text-sm tracking-tight">{row.name}</span>
    },
    {
      header: 'Category',
      cell: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded border ${getCategoryColor(row.category)}`}>
          {row.category}
        </span>
      )
    },
    {
      header: 'Quantity',
      cell: (row) => <span className="font-mono text-sm text-white/70">{row.quantity.toLocaleString()}</span>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-5 text-white/30">
          <button onClick={() => onEdit(row)} className="hover:text-aura-amber transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDelete(row)} className="hover:text-aura-red transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden border border-white/5 bg-[#0D0905] rounded-md">
      <Table columns={columns} data={supplies} className="flex-1 overflow-y-auto [&>div>table>thead>tr>th]:bg-[#140D07] [&>div>table>thead>tr>th]:border-b [&>div>table>thead>tr>th]:border-white/5" />
      <div className="p-3 border-t border-white/5 bg-[#140D07] text-center">
        <button className="text-[10px] font-mono text-aura-amber tracking-[0.2em] uppercase hover:underline transition-all">
          View Full Inventory List
        </button>
      </div>
    </div>
  );
}

InventoryTable.propTypes = {
  supplies: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
