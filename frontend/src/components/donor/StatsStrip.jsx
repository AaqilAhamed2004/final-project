import React from 'react';
import PropTypes from 'prop-types';
import { PRIORITY_LEVELS } from '../../constants';

export default function StatsStrip({ requests }) {
  const activeRequests = requests.filter(r => r.status === 'pending');
  
  const activeCount    = activeRequests.length;
  const criticalCount  = activeRequests.filter(r => r.priority_level === PRIORITY_LEVELS.CRITICAL).length;
  const moderateCount  = activeRequests.filter(r => r.priority_level === PRIORITY_LEVELS.URGENT).length;
  const lowCount       = activeRequests.filter(r => r.priority_level === PRIORITY_LEVELS.STANDARD).length;

  return (
    <div className="flex gap-4 mb-8">
      {/* Active Count */}
      <div className="flex-1 bg-[#1A1108] border border-aura-amber/20 rounded py-3.5 px-6 flex flex-col justify-center items-center">
        <div className="text-[11px] font-mono text-white/70 font-bold tracking-wider mb-0.5">Active</div>
        <div className="text-2xl font-bold font-sans text-aura-amber">{activeCount.toLocaleString()}</div>
      </div>
      
      {/* Critical Count */}
      <div className="flex-1 bg-[#200D0E] border border-aura-red/30 rounded py-3.5 px-6 flex flex-col justify-center items-center">
        <div className="text-[11px] font-mono text-white/70 font-bold tracking-wider mb-0.5">Critical</div>
        <div className="text-2xl font-bold font-sans text-[#FF8A8A]">{criticalCount.toLocaleString()}</div>
      </div>

      {/* Moderate Count */}
      <div className="flex-1 bg-[#1F1206] border border-aura-orange/30 rounded py-3.5 px-6 flex flex-col justify-center items-center">
        <div className="text-[11px] font-mono text-white/70 font-bold tracking-wider mb-0.5">Moderate</div>
        <div className="text-2xl font-bold font-sans text-aura-orange">{moderateCount.toLocaleString()}</div>
      </div>

      {/* Low Count */}
      <div className="flex-1 bg-[#161304] border border-aura-yellow/30 rounded py-3.5 px-6 flex flex-col justify-center items-center">
        <div className="text-[11px] font-mono text-white/70 font-bold tracking-wider mb-0.5">Low</div>
        <div className="text-2xl font-bold font-sans text-[var(--tw-colors-aura-yellow)]" style={{ color: '#CA8A04' }}>{lowCount.toLocaleString()}</div>
      </div>
    </div>
  );
}

StatsStrip.propTypes = {
  requests: PropTypes.array.isRequired,
};
