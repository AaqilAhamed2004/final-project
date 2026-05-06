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
      // Don't show DELIVERED requests on the live board usually, 
      // but let's just stick to the specific filters asked for.
      if (req.status === 'DELIVERED') return false;

      if (filters.priority !== 'ALL' && req.priority !== filters.priority) return false;
      if (filters.supplyType !== 'ALL' && req.supplyType !== filters.supplyType) return false;
      
      // Basic location string matching
      if (filters.location !== 'ALL' && !req.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [initialRequests, filters]);

  return { filters, handleFilterChange, filteredRequests };
};
