import React from 'react';
import Card from '../common/Card';
import { Map } from 'lucide-react';

export default function GlobalLogistics() {
  return (
    <Card className="flex flex-col h-full bg-[#140D07] border-white/5 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-sans">Global Logistics</h3>
        <Map size={18} className="text-white/30" />
      </div>
      
      <div className="flex-1 relative rounded border border-white/5 overflow-hidden min-h-[140px] bg-[#0D0905]">
        {/* Fake points */}
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-aura-amber rounded-full shadow-[0_0_8px_#F59E0B]"></div>
        <div className="absolute top-[45%] left-2/3 w-1.5 h-1.5 bg-aura-red rounded-full shadow-[0_0_8px_#DC2626] animate-pulse"></div>
        <div className="absolute top-2/3 left-[45%] w-1.5 h-1.5 bg-aura-orange rounded-full shadow-[0_0_8px_#EA580C]"></div>
        <div className="absolute top-[20%] left-[80%] w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute top-[80%] left-[30%] w-1 h-1 bg-white/40 rounded-full"></div>

        {/* HUD overlays */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-aura-amber animate-pulse"></div>
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/50">Tracking Active</span>
        </div>
        
        {/* Radar sweep simulation */}
        <div className="absolute inset-0 border border-aura-amber/5 rounded-[50%] scale-[2] pointer-events-none"></div>
      </div>

      <button className="w-full mt-5 py-2.5 bg-[#0D0905] rounded text-[9px] font-mono tracking-widest uppercase text-white/50 hover:bg-white/5 hover:text-white transition-colors border border-white/5">
        Expand Operations Map
      </button>
    </Card>
  );
}
