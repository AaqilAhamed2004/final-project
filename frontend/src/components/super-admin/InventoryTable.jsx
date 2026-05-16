import React from 'react';
import PropTypes from 'prop-types';
import Table from '../common/Table';
import { Edit2, Trash2 } from 'lucide-react';
import { SUPPLY_CATEGORIES } from '../../constants';

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'medical':
    case SUPPLY_CATEGORIES.MEDICINE: return 'bg-aura-red/20 text-aura-red border-aura-red/30';
    case 'food':
    case SUPPLY_CATEGORIES.FOOD: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'shelter':
    case SUPPLY_CATEGORIES.SHELTER: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    case 'utility':
    case 'other':
    case SUPPLY_CATEGORIES.OTHER: return 'bg-aura-amber/20 text-aura-amber border-aura-amber/30';
    default: return 'bg-white/5 text-white/50 border-white/10';
  }
};

export default function InventoryTable({ supplies, onEdit, onDelete }) {
  const columns = [
    {
      header: 'Supply ID',
      cell: (row) => <span className="text-aura-amber font-mono text-[11px] tracking-widest font-bold" title={row._id || row.id}>{(row._id || row.id)?.slice(-6) || '---'}</span>
    },
    {
      header: 'Name',
      cell: (row) => <span className="font-sans font-bold text-white/90 text-[13px] tracking-tight">{row.item_name || row.name}</span>
    },
    {
      header: 'Category',
      cell: (row) => (
        <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-mono tracking-[0.2em] uppercase rounded-[2px] border ${getCategoryColor(row.category)}`}>
          {row.category}
        </span>
      )
    },
    {
      header: 'Quantity',
      cell: (row) => <span className="font-mono text-[12px] text-white/60">{(row.quantity || 0).toLocaleString()} <span className="text-white/30 ml-0.5">Units</span></span>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-5 text-white/20">
          <button onClick={() => onEdit(row)} className="hover:text-white transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(row)} className="hover:text-aura-red transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden border border-white/5 bg-[#0D0905] rounded-lg">
      <Table columns={columns} data={supplies} className="flex-1 overflow-y-auto [&>div>table>thead>tr>th]:bg-[#140D07] [&>div>table>thead>tr>th]:border-b [&>div>table>thead>tr>th]:border-white/5 [&>div>table>thead>tr>th]:text-[10px] [&>div>table>thead>tr>th]:font-mono [&>div>table>thead>tr>th]:tracking-widest" />
      <div className="p-3 border-t border-white/5 bg-[#140D07] text-center">
        <button className="text-[10px] font-mono text-aura-amber tracking-[0.2em] uppercase hover:text-white transition-all">
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
