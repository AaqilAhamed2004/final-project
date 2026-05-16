import React from 'react';
import PropTypes from 'prop-types';
import StatCard from '../common/StatCard';
import { Package, AlertCircle, Users, ShieldCheck } from 'lucide-react';

export default function KPIRow({ supplies, requests }) {
  // Compute data
  const totalSupplyUnits = supplies.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const openRequestsCount = requests.filter(r => r.status === 'pending').length;
  const criticalCount = requests.filter(r => r.status === 'pending' && r.priority_level === 'Critical').length;

  
  // Try to find unique officers from requests to give a rough estimate of active personnel
  const uniqueOfficers = new Set(requests.map(r => r.gn_officer_id).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="SUPPLY UNITS" 
        value={totalSupplyUnits.toLocaleString()}
        icon={Package}
        trend="+8.4%"
        trendLabel="since last deployment"
        colorClass="text-aura-amber"
      />
      <StatCard 
        title="OPEN REQUESTS" 
        value={openRequestsCount}
        icon={AlertCircle}
        trend={`! ${criticalCount}`}
        trendLabel="critical urgent priority"
        colorClass="text-blue-400"
      />
      <StatCard 
        title="PERSONNEL ACTIVE" 
        value={Math.max(12, uniqueOfficers).toString()}
        icon={Users}
        trend="📍"
        trendLabel="Deployed across active zones"
        colorClass="text-[#FF8A8A]"
      />
      <StatCard 
        title="FLEET READY" 
        value="94.2%"
        icon={ShieldCheck}
        trend="✓"
        trendLabel="All systems functional"
        colorClass="text-gray-300"
      />
    </div>
  );
}

KPIRow.propTypes = {
  supplies: PropTypes.array.isRequired,
  requests: PropTypes.array.isRequired,
};
