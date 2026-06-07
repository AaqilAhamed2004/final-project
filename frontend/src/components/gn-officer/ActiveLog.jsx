import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Table from '../common/Table';
import Badge from '../common/Badge';
import StatusBadge from '../common/StatusBadge';
import { Eye, CheckCircle, PackageCheck, Clock } from 'lucide-react';
import { formatRequestId } from '../../utils/priorityHelpers';

export default function ActiveLog({ requests, onViewDetails, onStatusUpdate }) {
  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      cell: (row) => <span className="text-aura-amber font-mono text-sm font-bold tracking-wider" title={row.id || row._id}>{formatRequestId((row.id || row._id)?.slice(-6) || 'N/A')}</span>
    },
    { 
      header: 'LOCATION', 
      cell: (row) => (
        <span className="font-sans text-sm text-aura-text truncate max-w-[150px] block" title={row.location}>{row.location}</span>
      )
    },
    { 
      header: 'STATUS', 
      cell: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'PRIORITY', 
      cell: (row) => <Badge priority={row.priority_level || 'Standard'} /> 
    },
    { 
      header: 'ACTION', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onViewDetails(row)}
            className="text-aura-text-faint hover:text-aura-text transition-colors p-1" 
            title="View Tactical Analysis"
          >
            <Eye size={16} />
          </button>
          
          {row.status === 'pending' && (
            <button 
              onClick={() => onStatusUpdate(row.id || row._id, 'approved')}
              className="text-aura-amber/40 hover:text-aura-amber transition-colors p-1"
              title="Approve Request"
            >
              <CheckCircle size={16} />
            </button>
          )}

          {row.status === 'ongoing' && (
            <button 
              onClick={() => onStatusUpdate(row.id || row._id, 'completed')}
              className="text-green-500/40 hover:text-green-500 transition-colors p-1"
              title="Mark as Completed"
            >
              <PackageCheck size={16} />
            </button>
          )}

          {row.status === 'approved' && (
            <div className="text-aura-text-faint" title="Awaiting Logistics">
              <Clock size={16} />
            </div>
          )}
        </div>
      )
    },
  ];

  return (
    <Card className="flex flex-col p-0 overflow-hidden shadow-aura-card">
      <div className="flex justify-between items-center p-6 border-b border-aura-border bg-aura-surface">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight">Active Tactical Log</h2>
          <p className="text-[10px] font-mono text-aura-text-faint uppercase tracking-[0.2em] mt-1">Real-time request processing feed</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-aura-amber animate-pulse"></div>
            <span className="text-[10px] font-mono text-aura-amber tracking-widest uppercase font-bold">Live Stream</span>
        </div>
      </div>
      
      {requests.length > 0 ? (
        <div className="overflow-x-auto">
          <Table columns={columns} data={requests} className="min-w-[600px]" />
        </div>
      ) : (
        <div className="p-12 text-center text-aura-text-faint text-sm font-mono uppercase tracking-[0.3em]">No active deployments in this sector.</div>
      )}
    </Card>
  );
}

ActiveLog.propTypes = {
  requests: PropTypes.array.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
};
