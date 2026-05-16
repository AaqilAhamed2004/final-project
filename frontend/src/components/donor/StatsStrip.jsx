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
      <div className="flex-1 bg-[#1A1108]/40 border border-aura-amber/10 rounded-lg py-5 px-6 flex flex-col justify-center items-center shadow-lg transition-all duration-300 hover:border-aura-amber/30 group">
        <div className="text-[10px] font-mono text-white/30 group-hover:text-white/50 font-bold tracking-[0.2em] uppercase mb-1">Active</div>
        <div className="text-3xl font-bold font-sans text-aura-amber tracking-tighter">{activeCount.toLocaleString()}</div>
      </div>
      
      {/* Critical Count */}
      <div className="flex-1 bg-[#200D0E]/40 border border-aura-red/10 rounded-lg py-5 px-6 flex flex-col justify-center items-center shadow-lg transition-all duration-300 hover:border-aura-red/30 group">
        <div className="text-[10px] font-mono text-white/30 group-hover:text-white/50 font-bold tracking-[0.2em] uppercase mb-1">Critical</div>
        <div className="text-3xl font-bold font-sans text-aura-red tracking-tighter">{criticalCount.toLocaleString()}</div>
      </div>

      {/* Moderate Count */}
      <div className="flex-1 bg-[#1F1206]/40 border border-aura-orange/10 rounded-lg py-5 px-6 flex flex-col justify-center items-center shadow-lg transition-all duration-300 hover:border-aura-orange/30 group">
        <div className="text-[10px] font-mono text-white/30 group-hover:text-white/50 font-bold tracking-[0.2em] uppercase mb-1">Moderate</div>
        <div className="text-3xl font-bold font-sans text-aura-orange tracking-tighter">{moderateCount.toLocaleString()}</div>
      </div>

      {/* Low Count */}
      <div className="flex-1 bg-[#161304]/40 border border-aura-yellow/10 rounded-lg py-5 px-6 flex flex-col justify-center items-center shadow-lg transition-all duration-300 hover:border-aura-yellow/30 group">
        <div className="text-[10px] font-mono text-white/30 group-hover:text-white/50 font-bold tracking-[0.2em] uppercase mb-1">Low</div>
        <div className="text-3xl font-bold font-sans text-aura-yellow tracking-tighter">{lowCount.toLocaleString()}</div>
      </div>
    </div>
  );
}

StatsStrip.propTypes = {
  requests: PropTypes.array.isRequired,
};
