import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { SUPPLY_CATEGORIES } from '../../constants';
import { PackagePlus } from 'lucide-react';

export default function AddSupplyModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(Object.values(SUPPLY_CATEGORIES)[0]);
  const [quantity, setQuantity] = useState('');

  const categoryOptions = Object.values(SUPPLY_CATEGORIES).map(cat => ({
    value: cat,
    label: cat.charAt(0) + cat.slice(1).toLowerCase()
  }));

  const handleSubmit = () => {
    if (name && quantity) {
      const generatedKey = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      onAdd({
        item_name: name,
        name,
        category,
        quantity: parseInt(quantity, 10),
        location: "Main Hub",
        prolog_item_key: generatedKey
      });
      setName('');
      setQuantity('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <PackagePlus className="text-aura-amber" size={24} />
          <h2 className="text-2xl font-bold font-sans tracking-tight">Add New Supply</h2>
        </div>
        
        <Input 
          id="supplyName" 
          label="Supply Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Field Medical Kit"
          className="mb-5"
        />
        
        <Select 
          id="supplyCategory" 
          label="Category" 
          options={categoryOptions} 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          className="mb-5"
        />
        
        <Input 
          id="supplyQuantity" 
          label="Initial Quantity" 
          type="number" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)} 
          placeholder="Units"
        />

        <div className="flex gap-4 mt-8">
          <Button variant="secondary" className="flex-1 py-3 text-xs border-aura-border text-aura-text-muted" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 py-3 text-xs" onClick={handleSubmit}>Add Supply</Button>
        </div>
      </div>
    </Modal>
  );
}

AddSupplyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};
