import React from 'react';
import PropTypes from 'prop-types';
import Table from '../common/Table';
import { Edit2, Trash2 } from 'lucide-react';
import { SUPPLY_CATEGORIES } from '../../constants';

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'medical':
    case SUPPLY_CATEGORIES.MEDICINE: return 'bg-aura-red/15 text-aura-red border-aura-red/30';
    case 'food':
    case SUPPLY_CATEGORIES.FOOD:     return 'bg-aura-blue/15 text-aura-blue border-aura-blue/30';
    case 'shelter':
    case SUPPLY_CATEGORIES.SHELTER:  return 'bg-aura-text-faint/15 text-aura-text-muted border-aura-border-strong';
    case 'utility':
    case 'other':
    case SUPPLY_CATEGORIES.OTHER:    return 'bg-aura-accent/15 text-aura-accent border-aura-accent/30';
    default: return 'bg-aura-surface text-aura-text-faint border-aura-border';
  }
};

export default function InventoryTable({ supplies, onEdit, onDelete }) {
  const columns = [
    {
      header: 'Supply ID',
      cell: (row) => (
        <span className="text-aura-accent font-mono text-[11px] tracking-widest font-bold" title={row._id || row.id}>
          {(row._id || row.id)?.slice(-6) || '---'}
        </span>
      )
    },
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-sans font-semibold text-aura-text text-[13px] tracking-tight">
          {row.item_name || row.name}
        </span>
      )
    },
    {
      header: 'Category',
      cell: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-[9px] font-mono tracking-[0.15em] uppercase rounded border ${getCategoryColor(row.category)}`}>
          {row.category}
        </span>
      )
    },
    {
      header: 'Quantity',
      cell: (row) => (
        <span className="font-mono text-[12px] text-aura-text-muted">
          {(row.quantity || 0).toLocaleString()}
          <span className="text-aura-text-faint ml-1">Units</span>
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-4 text-aura-text-faint">
          <button
            onClick={() => onEdit(row)}
            className="hover:text-aura-accent transition-colors p-1 rounded hover:bg-aura-accent-muted"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="hover:text-aura-red transition-colors p-1 rounded hover:bg-aura-red/10"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden border border-aura-border bg-aura-card rounded-aura">
      <Table columns={columns} data={supplies} className="flex-1 overflow-y-auto" />
      <div className="p-3 border-t border-aura-border bg-aura-surface text-center">
        <button className="text-[10px] font-mono text-aura-accent tracking-[0.2em] uppercase hover:text-aura-accent-hover transition-all">
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
