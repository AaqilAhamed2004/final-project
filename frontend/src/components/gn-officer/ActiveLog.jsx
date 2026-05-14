import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Table from '../common/Table';
import Badge from '../common/Badge';
import StatusBadge from '../common/StatusBadge';
import { Eye, Filter, RefreshCw } from 'lucide-react';
import { formatRequestId } from '../../utils/priorityHelpers';

export default function ActiveLog({ requests }) {
  const columns = [
    { 
      header: 'ID', 
      accessor: '_id',
      cell: (row) => <span className="text-aura-amber font-mono text-sm font-bold tracking-wider" title={row._id}>{formatRequestId(row._id?.slice(-6) || 'N/A')}</span>
    },
    { 
      header: 'SUPPLY TYPE', 
      cell: (row) => (
        <span className="font-sans text-sm text-white/90">{row.supply_type}</span>
      )
    },
    { 
      header: 'STATUS', 
      cell: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'PRIORITY', 
      cell: (row) => <Badge priority={row.prolog_analysis?.priority_level || 'yellow'} /> 
    },
    { 
      header: 'ACTION', 
      cell: () => (
        <button className="text-white/40 hover:text-white transition-colors">
          <Eye size={16} />
        </button>
      )
    },
  ];

  return (
    <Card className="flex flex-col p-0 overflow-hidden bg-[#140D07] border-white/5">
      <div className="flex justify-between items-center p-6 pb-4">
        <h2 className="text-xl font-bold font-sans">Active Log</h2>
        <div className="flex items-center gap-4 text-white/40">
          <button className="hover:text-white transition-colors"><Filter size={16} /></button>
          <button className="hover:text-white transition-colors"><RefreshCw size={16} /></button>
        </div>
      </div>
      
      {requests.length > 0 ? (
        <Table columns={columns} data={requests.slice(0, 3)} className="border-t border-white/5" />
      ) : (
        <div className="p-6 text-center text-white/40 text-sm font-mono border-t border-white/5">No active requests found.</div>
      )}
    </Card>
  );
}

ActiveLog.propTypes = {
  requests: PropTypes.array.isRequired,
};
