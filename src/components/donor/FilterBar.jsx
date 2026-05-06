import React from 'react';
import PropTypes from 'prop-types';
import Select from '../common/Select';
import Button from '../common/Button';
import { Filter } from 'lucide-react';
import { PRIORITY_LEVELS, SUPPLY_CATEGORIES } from '../../constants';

export default function FilterBar({ filters, onFilterChange }) {
  const priorityOptions = [
    { value: 'ALL', label: 'Priority: All' },
    ...Object.values(PRIORITY_LEVELS).map(p => ({ value: p, label: `Priority: ${p}` }))
  ];

  const locationOptions = [
    { value: 'ALL', label: 'Location: Worldwide' },
    { value: 'colombo', label: 'Colombo' },
    { value: 'kurunegala', label: 'Kurunegala' },
    { value: 'kandy', label: 'Kandy' },
    { value: 'galle', label: 'Galle' },
    { value: 'jaffna', label: 'Jaffna' },
  ];

  const supplyOptions = [
    { value: 'ALL', label: 'Supply Type: All' },
    ...Object.values(SUPPLY_CATEGORIES).map(cat => ({
      value: cat,
      label: `Supply: ${cat.charAt(0) + cat.slice(1).toLowerCase()}`
    }))
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select 
          id="filter_priority"
          options={priorityOptions}
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="mb-0"
        />
        <Select 
          id="filter_location"
          options={locationOptions}
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="mb-0"
        />
        <Select 
          id="filter_supply"
          options={supplyOptions}
          value={filters.supplyType}
          onChange={(e) => onFilterChange('supplyType', e.target.value)}
          className="mb-0"
        />
      </div>
      <Button className="py-3 px-6 shrink-0 h-[46px]" onClick={() => {/* Update Feed */}}>
        <Filter size={16} />
        Update Feed
      </Button>
    </div>
  );
}

FilterBar.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};
