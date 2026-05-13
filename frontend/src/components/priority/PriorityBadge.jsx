import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

export default function PriorityBadge({ isSpecial }) {
  const isCritical = isSpecial;
  const bgColor = isCritical ? 'bg-[#200D0E]' : 'bg-[#1F1206]';
  const borderColor = isCritical ? 'border-aura-red' : 'border-aura-orange';
  const dotColor = isCritical ? 'bg-aura-red' : 'bg-aura-orange';
  const textColor = isCritical ? 'text-[#FF8A8A]' : 'text-aura-orange';
  const label = isCritical ? 'CRITICAL RED' : 'MODERATE ORANGE';

  return (
    <Card className={`py-5 px-6 ${borderColor} ${bgColor}`}>
      <div className="flex justify-between items-start mb-1.5">
        <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Priority Level</div>
        <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`}></div>
      </div>
      <div className={`text-2xl font-bold ${textColor} mb-1.5 tracking-wider font-sans`}>{label}</div>
      <div className="text-[9px] font-mono tracking-widest text-white/40 uppercase">Immediate Deployment Required</div>
    </Card>
  );
}

PriorityBadge.propTypes = {
  isSpecial: PropTypes.bool.isRequired,
};
