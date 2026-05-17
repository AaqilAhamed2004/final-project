import React from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { Settings } from 'lucide-react';

export default function PrologSummary({ analysis, summaryLines }) {
  // Use analysis reasoning if provided, otherwise default fallback lines
  const lines = analysis?.reasoning || summaryLines || [
    "Analysis: Casualty density exceeds local threshold (8.2/km²).",
    "Resource conflict: Overlapping medic requests in Zone-4.",
    "Environmental: Category 4 storm surge imminent (T-14m).",
    "Recommendation: Prioritize airborne extraction over ground fleet."
  ];

  return (
    <Card className="h-full border-aura-border bg-aura-surface flex flex-col justify-between py-5 px-6">
      <div>
        <div className="flex items-center gap-2 mb-5 text-[10px] font-mono tracking-widest uppercase text-aura-text-muted">
          <Settings size={14} className="text-aura-amber" />
          Prolog Engine: Logic Summary
        </div>
        <div className="space-y-3.5 text-[11px] font-mono text-aura-text-faint leading-relaxed tracking-wide">
          {lines.map((line, index) => (
            <p key={index}>&gt; {line}</p>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-8 text-[8px] font-mono text-aura-text-faint uppercase tracking-widest">
        <span>PROLOG_KERNEL_V4.2.1</span>
        <span className="text-aura-amber">LOGIC_STABLE</span>
      </div>
    </Card>
  );
}

PrologSummary.propTypes = {
  summaryLines: PropTypes.arrayOf(PropTypes.string),
};
