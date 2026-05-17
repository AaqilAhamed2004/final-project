import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';
import { Map, Download, CheckCircle2 } from 'lucide-react';
import { formatTimestamp } from '../../utils/priorityHelpers';
import PrologSummary from './PrologSummary';
import PriorityBadge from './PriorityBadge';

export default function PriorityResult({ requestData, onClose, isModal = true }) {
  // If no requestData, provide some dummy data for standalone view
  const data = requestData || {
    _id: 'AQ-992-ALPHA-X',
    is_special: true,
  };

  const containerClasses = isModal 
    ? "flex flex-col p-8 bg-aura-card border border-aura-border" 
    : "flex flex-col p-8 max-w-4xl mx-auto mt-10 bg-aura-bg border border-aura-border rounded-xl shadow-2xl";

  return (
    <div className={containerClasses}>
      {/* Header section */}
      <div className="flex justify-between items-center mb-8 w-full relative">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-[3px] border-aura-amber flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-aura-amber"></div>
          </div>
          <h1 className="text-lg font-bold tracking-widest uppercase">AURA</h1>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-aura-text-muted">
          NETWORK STATUS: <span className="text-aura-amber">SECURE_NODE_04</span>
        </div>
      </div>

      {/* Confirmed Icon */}
      <div className="flex flex-col items-center justify-center mb-10 mt-2">
        <div className="w-20 h-20 mb-4 rounded-xl border border-aura-accent/30 bg-aura-accent-muted flex items-center justify-center shadow-[0_0_30px_var(--color-accent-muted)] relative">
          <div className="absolute inset-2 border border-aura-amber/20 rounded-lg"></div>
          <CheckCircle2 size={32} className="text-aura-amber relative z-10" />
        </div>
        <h2 className="text-4xl font-bold text-aura-amber mb-1 tracking-tight">Confirmed</h2>
        <p className="text-aura-text text-lg font-sans">Stored in Database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-4">
          <Card className="py-5 px-6 border-aura-border bg-aura-surface">
            <div className="text-[10px] font-mono tracking-widest text-aura-text-muted mb-1.5 uppercase">Request ID</div>
            <div className="text-2xl font-mono font-bold tracking-wider">{data._id || data.id}</div>
          </Card>
          
          <PriorityBadge priority={data.prolog_analysis?.priority_level} isSpecial={data.is_special || data.isSpecial} />
        </div>

        {/* Prolog Logic Summary */}
        <PrologSummary analysis={data.prolog_analysis} />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Button className="py-4 text-xs" onClick={onClose}>
          <Map size={16} />
          View Tactical Map
        </Button>
        <Button variant="secondary" className="py-4 text-xs text-aura-text border-aura-border hover:bg-aura-surface hover:text-aura-text" onClick={onClose}>
          <Download size={16} />
          Export Manifest
        </Button>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end text-[8px] font-mono text-aura-text-faint uppercase tracking-[0.2em] pt-4 border-t border-aura-border">
        <div className="space-y-1">
          <div>COORDINATES: 34.0522° N, 118.2437° W</div>
          <div>TIMESTAMP: {formatTimestamp(new Date().toISOString())}</div>
        </div>
        <div className="text-right space-y-1">
          <div>AURA SYSTEM RELIEF OPS</div>
          <div>AUTH_LVL: GN_OFFICER</div>
        </div>
      </div>
    </div>
  );
}

PriorityResult.propTypes = {
  requestData: PropTypes.object,
  onClose: PropTypes.func,
  isModal: PropTypes.bool,
};
