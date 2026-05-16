import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle2, Info, Activity, ShieldAlert } from 'lucide-react';

export default function AnalysisModal({ analysis, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-aura-amber border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xs font-mono text-white/40 tracking-[0.2em] uppercase">Retrieving Tactical Intel...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-12 text-center text-white/40 font-mono text-sm uppercase tracking-widest">
        No tactical analysis data available for this sector.
      </div>
    );
  }

  const { priority_level, risk_factors, rationale } = analysis;
  
  const getPriorityColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return 'text-aura-red border-aura-red/30 bg-aura-red/5';
      case 'urgent': return 'text-aura-orange border-aura-orange/30 bg-aura-orange/5';
      case 'standard': return 'text-aura-amber border-aura-amber/30 bg-aura-amber/5';
      default: return 'text-white/40 border-white/10 bg-white/5';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Info */}
      <div className="flex justify-between items-start border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight mb-1">AI Logic Analysis</h2>
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest">AURA Engine Result: {analysis.request_id?.slice(-8)}</p>
        </div>
        <div className={`px-4 py-2 rounded border font-mono font-bold text-xs tracking-[0.2em] uppercase ${getPriorityColor(priority_level)}`}>
          Priority: {priority_level}
        </div>
      </div>

      {/* Rationale Section */}
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4 text-aura-amber">
          <Info size={18} />
          <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-white/80">Analysis Rationale</h3>
        </div>
        <p className="text-sm text-white/60 leading-relaxed font-sans italic">
          "{rationale || "Automated logic processing complete based on ground parameters and supply availability."}"
        </p>
      </div>

      {/* Risk Flags */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={18} className="text-aura-red" />
          <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-white/80">Tactical Risk Flags</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risk_factors && risk_factors.length > 0 ? risk_factors.map((risk, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded bg-aura-red/5 border border-aura-red/10">
              <AlertTriangle size={16} className="text-aura-red mt-0.5 flex-shrink-0" />
              <div className="text-xs font-mono text-white/80 leading-relaxed tracking-tight">{risk}</div>
            </div>
          )) : (
            <div className="col-span-2 flex items-center gap-4 p-4 rounded bg-green-500/5 border border-green-500/10">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              <div className="text-xs font-mono text-green-500 uppercase tracking-widest font-bold">No High-Risk Protocols Triggered</div>
            </div>
          )}
        </div>
      </div>

      {/* Item Breakdown (If needed) */}
      <div className="pt-6 flex justify-end">
        <button className="text-[10px] font-mono text-aura-amber tracking-[0.3em] uppercase hover:underline">
          View Raw Logic Trace
        </button>
      </div>
    </div>
  );
}

AnalysisModal.propTypes = {
  analysis: PropTypes.object,
  isLoading: PropTypes.bool,
};
