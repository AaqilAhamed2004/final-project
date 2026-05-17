import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { Map } from 'lucide-react';

export default function GlobalLogistics({ requests }) {
  const inTransit = requests.filter(r => r.status === 'approved' || r.status === 'fulfilled').length;
  
  return (
    <Card className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-sans">Global Logistics</h3>
        <Map size={18} className="text-aura-text-faint" />
      </div>
      
      <div className="flex-1 relative rounded border border-aura-border overflow-hidden min-h-[140px] bg-aura-surface">
        {/* Fake points for aesthetic, but HUD is real */}
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-aura-accent rounded-full shadow-[0_0_8px_var(--color-accent)]"></div>
        <div className="absolute top-[45%] left-2/3 w-1.5 h-1.5 bg-aura-red rounded-full shadow-[0_0_8px_var(--color-red)] animate-pulse"></div>
        <div className="absolute top-2/3 left-[45%] w-1.5 h-1.5 bg-aura-orange rounded-full shadow-[0_0_8px_var(--color-orange)]"></div>

        {/* HUD overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-aura-amber animate-pulse"></div>
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-aura-text-muted">Tracking Active</span>
          </div>
          <div className="text-[10px] font-mono text-aura-amber/80 uppercase">
            {inTransit} Units in Transit
          </div>
        </div>
        
        {/* Radar sweep simulation */}
        <div className="absolute inset-0 border border-aura-amber/5 rounded-[50%] scale-[2] pointer-events-none"></div>
      </div>

      <button className="w-full mt-5 py-2.5 bg-aura-surface rounded text-[9px] font-mono tracking-widest uppercase text-aura-text-faint hover:bg-aura-surface-hover hover:text-aura-text transition-colors border border-aura-border">
        Expand Operations Map
      </button>
    </Card>
  );
}

GlobalLogistics.propTypes = {
  requests: PropTypes.array,
};

GlobalLogistics.defaultProps = {
  requests: [],
};
