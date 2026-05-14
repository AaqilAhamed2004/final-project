import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

export default function IntelStream({ supplies, requests }) {
  // Derive intel events from live data
  const intelItems = useMemo(() => {
    const events = [];
    
    // 1. Critical Requests
    requests.filter(r => r.prolog_analysis?.priority_level === 'red').forEach(r => {
      events.push({
        id: `req-${r._id}`,
        type: 'CRITICAL ALERT',
        typeColor: 'text-aura-red',
        dotColor: 'bg-aura-red',
        timestamp: new Date(r.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `High-priority request for ${r.supply_type} in ${r.location_name} requires immediate attention.`,
        meta: `REQ ID: ${r._id?.slice(-6) || 'N/A'}`,
        sortTime: new Date(r.created_at || Date.now()).getTime()
      });
    });

    // 2. Low Stock Alerts
    supplies.filter(s => s.quantity < 20).forEach(s => {
      events.push({
        id: `stock-${s._id}`,
        type: 'INVENTORY WARNING',
        typeColor: 'text-aura-amber',
        dotColor: 'bg-aura-amber',
        timestamp: 'NOW',
        message: `${s.item_name} stock falling below threshold (${s.quantity} units remaining).`,
        meta: `CAT: ${s.category}`,
        sortTime: Date.now()
      });
    });

    // 3. New Requests
    requests.filter(r => r.status === 'pending' && r.prolog_analysis?.priority_level !== 'red').slice(0, 3).forEach(r => {
      events.push({
        id: `pending-${r._id}`,
        type: 'NEW REQUEST',
        typeColor: 'text-blue-400',
        dotColor: 'bg-blue-400',
        timestamp: new Date(r.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `Relief request submitted for ${r.supply_type} at ${r.location_name}.`,
        meta: `OFFICER ID: ${r.gn_officer_id?.slice(-6) || 'N/A'}`,
        sortTime: new Date(r.created_at || Date.now()).getTime()
      });
    });

    // Sort by time
    return events.sort((a, b) => b.sortTime - a.sortTime);
  }, [supplies, requests]);

  return (
    <Card className="flex flex-col h-full bg-[#140D07] border-white/5 p-0 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#140D07] z-10 shadow-sm">
        <h3 className="text-xl font-bold font-sans tracking-tight">Intel Stream</h3>
        <span className="px-2 py-1 border border-white/10 rounded bg-[#0D0905] text-[9px] font-mono tracking-widest uppercase text-white/50">Live</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-7 relative bg-[#0D0905]/50">
        <div className="absolute left-7 top-6 bottom-6 w-px bg-white/5 z-0"></div>
        
        {intelItems.length === 0 ? (
          <div className="text-center py-10 text-white/20 font-mono text-xs uppercase tracking-widest">
            Scanning for tactical updates...
          </div>
        ) : (
          intelItems.map((item) => (
            <div key={item.id} className="relative pl-7 z-10 group">
              {/* Timeline dot */}
              <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full ${item.dotColor} ${item.dotColor.includes('red') ? 'animate-pulse' : ''} outline outline-4 outline-[#0D0905]`}></div>
              
              <div className="flex flex-col gap-1.5 bg-[#140D07] p-3 rounded border border-white/5 group-hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-mono tracking-widest font-bold uppercase ${item.typeColor}`}>
                    {item.type}
                  </span>
                  <span className="text-white/20 text-[10px]">•</span>
                  <span className="text-[10px] font-mono tracking-widest text-aura-amber/70">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-sm font-sans text-white/80 leading-snug">
                  {item.message}
                </p>
                {item.meta && (
                  <div className="text-[9px] font-mono tracking-widest text-white/30 uppercase mt-1">
                    {item.meta}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

IntelStream.propTypes = {
  supplies: PropTypes.array.isRequired,
  requests: PropTypes.array.isRequired,
};
