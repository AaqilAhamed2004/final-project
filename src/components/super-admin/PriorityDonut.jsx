import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PRIORITY_LEVELS } from '../../constants';

export default function PriorityDonut({ requests }) {
  const activeRequests = requests.filter(r => r.status !== 'DELIVERED');
  const total = activeRequests.length;
  
  const critical = activeRequests.filter(r => r.priority === PRIORITY_LEVELS.CRITICAL).length;
  const moderate = activeRequests.filter(r => r.priority === PRIORITY_LEVELS.MODERATE).length;
  const low = activeRequests.filter(r => r.priority === PRIORITY_LEVELS.LOW).length;

  const data = [
    { name: 'Critical', value: critical, color: '#DC2626' }, // text-aura-red
    { name: 'Moderate', value: moderate, color: '#EA580C' }, // text-aura-orange
    { name: 'Low', value: low, color: '#CA8A04' }, // text-aura-yellow
  ];

  return (
    <Card className="flex flex-col h-full bg-[#140D07] border-white/5 p-6">
      <h3 className="text-xl font-bold font-sans mb-6">Priority Distribution</h3>
      
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center -ml-32 mt-2">
            <div className="text-4xl font-bold font-sans tracking-tighter text-white/90">{total}</div>
            <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase mt-0.5">Total</div>
          </div>
        </div>

        <div className="w-full h-48 flex items-center justify-between pl-2 pr-6">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-col gap-4">
            {data.map(item => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div className="text-sm font-sans flex items-center gap-2">
                  <span className="text-white/80">{item.name}</span>
                  <span className="text-white/40 font-mono text-xs">({total ? Math.round((item.value/total)*100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

PriorityDonut.propTypes = {
  requests: PropTypes.array.isRequired,
};
