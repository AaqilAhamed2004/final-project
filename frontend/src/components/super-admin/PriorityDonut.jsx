import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { PieChart, Pie, Cell } from 'recharts';
import { PRIORITY_LEVELS } from '../../constants';

export default function PriorityDonut({ requests }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeRequests = requests.filter(r => r.status === 'pending');
  const total = activeRequests.length;
  
  const critical = activeRequests.filter(r => r.priority_level === PRIORITY_LEVELS.CRITICAL).length;
  const moderate = activeRequests.filter(r => r.priority_level === PRIORITY_LEVELS.URGENT).length;
  const low = activeRequests.filter(r => r.priority_level === PRIORITY_LEVELS.STANDARD).length;

  const data = [
    { name: 'Critical', value: critical, color: '#DC2626' }, // text-aura-red
    { name: 'Moderate', value: moderate, color: '#EA580C' }, // text-aura-orange
    { name: 'Low', value: low, color: '#CA8A04' }, // text-aura-yellow
  ];

  return (
    <Card className="flex flex-col h-full bg-[#140D07] border-white/5 p-6 min-h-[320px]">
      <h3 className="text-xl font-bold font-sans mb-6 tracking-tight">Priority Distribution</h3>
      
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Chart Container with Centered Label */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          {/* Central Label - Now perfectly aligned inside the chart container */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="text-3xl lg:text-4xl font-bold font-sans tracking-tighter text-white/90 leading-none">{total}</div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mt-1">Total</div>
          </div>

          {isMounted && total > 0 ? (
            <PieChart width={180} height={180}>
              <Pie
                data={data}
                cx={90}
                cy={90}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationDuration={800}
                startAngle={90}
                endAngle={450}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <div className="w-full h-full rounded-full border-[6px] border-white/5 flex items-center justify-center text-white/10 font-mono text-[9px] uppercase tracking-[0.3em]">
              {total === 0 ? 'No Data' : 'Initializing'}
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex flex-col gap-5 w-full sm:w-auto">
          {data.map(item => (
            <div key={item.name} className="flex items-center gap-4 group">
              <div 
                className="w-3 h-3 rounded-sm transition-transform duration-300 group-hover:scale-125 shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-widest text-white/80 uppercase">{item.name}</span>
                  <span className="text-[10px] font-mono text-white/30 tracking-wider">
                    {total ? Math.round((item.value/total)*100) : 0}%
                  </span>
                </div>
                <div className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                  {item.value} Tactical Requests
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

PriorityDonut.propTypes = {
  requests: PropTypes.array.isRequired,
};
