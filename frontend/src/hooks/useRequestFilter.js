import { useState, useMemo } from 'react';

export const useRequestFilter = (initialRequests) => {
  const [filters, setFilters] = useState({
    priority: 'ALL',
    location: 'ALL',
    supplyType: 'ALL',
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredRequests = useMemo(() => {
    return initialRequests.filter(req => {
      // Don't show FULFILLED or CANCELLED requests on the live board usually
      if (req.status === 'fulfilled' || req.status === 'cancelled') return false;

      // Handle old format fallback just in case
      const reqPriority = (req.prolog_analysis?.priority_level || req.priority || '').toLowerCase();
      const reqSupplyType = (req.supply_type || req.supplyType || '').toLowerCase();
      const reqLocation = (req.location_name || req.location || '').toLowerCase();

      if (filters.priority !== 'ALL' && reqPriority !== filters.priority.toLowerCase()) return false;
      if (filters.supplyType !== 'ALL' && reqSupplyType !== filters.supplyType.toLowerCase()) return false;
      
      // Basic location string matching
      if (filters.location !== 'ALL' && !reqLocation.includes(filters.location.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [initialRequests, filters]);

  return { filters, handleFilterChange, filteredRequests };
};
