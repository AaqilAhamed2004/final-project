import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, colorClass = 'text-aura-amber', titleColor = 'text-white/50', valueColorClass = '' }) {
  const displayValueColor = valueColorClass || colorClass;
  
  return (
    <Card className="flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-[10px] font-mono tracking-widest uppercase ${titleColor}`}>
          {title} {title === 'CRITICAL ALERTS' && <span className="inline-block w-1.5 h-1.5 bg-aura-red rounded-full ml-1 animate-pulse"></span>}
        </h3>
        {Icon && <Icon size={18} className={colorClass} />}
      </div>
      <div className={`text-4xl font-sans tracking-tight font-semibold ${displayValueColor}`}>{value}</div>
      {trend && (
        <div className="mt-4 text-xs font-mono flex items-center gap-1">
          <span className="text-green-500">{trend}</span>
          <span className="text-white/40">{trendLabel}</span>
        </div>
      )}
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  trend: PropTypes.string,
  trendLabel: PropTypes.string,
  colorClass: PropTypes.string,
  titleColor: PropTypes.string,
  valueColorClass: PropTypes.string,
};
