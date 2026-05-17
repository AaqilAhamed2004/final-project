import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

/**
 * StatCard — KPI metric card.
 * Uses theme tokens; trend / value colors are passed in as Tailwind classes
 * (still using aura-* tokens from tailwind.config.js).
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  colorClass = 'text-aura-accent',
  titleColor = 'text-aura-text-faint',
  valueColorClass = '',
}) {
  const displayValueColor = valueColorClass || colorClass;

  return (
    <Card className="flex flex-col h-full justify-between hover:border-aura-border-strong transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-[10px] font-mono tracking-widest uppercase ${titleColor} flex items-center gap-1.5`}>
          {title}
          {title === 'CRITICAL ALERTS' && (
            <span className="inline-block w-1.5 h-1.5 bg-aura-red rounded-full animate-pulse" />
          )}
        </h3>
        {Icon && <Icon size={18} className={`${colorClass} opacity-80`} />}
      </div>
      <div className={`text-4xl font-sans tracking-tight font-semibold ${displayValueColor}`}>
        {value}
      </div>
      {trend && (
        <div className="mt-4 text-xs font-mono flex items-center gap-1.5">
          <span className="text-aura-green">{trend}</span>
          <span className="text-aura-text-faint">{trendLabel}</span>
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
