import React from 'react';
import Card from '../common/Card';

export default function LiveTracker() {
  return (
    <Card className="p-0 overflow-hidden relative min-h-[160px]">
      <div className="absolute inset-0">
        {/* Placeholder for map */}
        <div className="w-full h-full opacity-30 flex items-center justify-center bg-aura-bg">
          <div className="w-full h-full grid grid-cols-8 grid-rows-4 gap-0 opacity-10">
            {Array.from({length: 32}).map((_, i) => <div key={i} className="border border-aura-border"></div>)}
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-aura-amber animate-pulse"></div>
        <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-aura-text-muted">Live Deployment Tracker</span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
        <div className="text-xs font-mono text-aura-text-faint tracking-wide">
          Active Zone: SECTOR 7G (Coordinates: 30.04N, 31.23E)
        </div>
        <button className="px-3 py-1.5 text-[9px] font-mono font-bold tracking-widest text-aura-amber border border-aura-amber/30 rounded hover:bg-aura-amber/10 transition-colors uppercase">
          Expand Map
        </button>
      </div>
    </Card>
  );
}
