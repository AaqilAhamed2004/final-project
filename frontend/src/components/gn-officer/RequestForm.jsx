import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import ToggleSwitch from '../common/ToggleSwitch';
import Button from '../common/Button';
import { SUPPLY_CATEGORIES } from '../../constants';
import { MapPin, PlusSquare, Send } from 'lucide-react';

export default function RequestForm({ onSubmit, isSubmitting }) {
  const [location, setLocation] = useState('');
  const [supplyType, setSupplyType] = useState(Object.values(SUPPLY_CATEGORIES)[0]);
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);

  const supplyOptions = Object.values(SUPPLY_CATEGORIES).map(cat => ({
    value: cat,
    label: cat.charAt(0) + cat.slice(1).toLowerCase() + ' Supplies',
  }));

  const handleSubmit = () => {
    if (!location || !quantity) return alert("Location and quantity are required.");
    onSubmit({
      location_name: location,
      supply_type: supplyType,
      quantity_requested: parseInt(quantity, 10),
      urgency_description: description,
      is_special: isSpecial
    });
    // Reset form after successful submission logic is typically handled by parent, 
    // but we can clear it here if we assume success or wait for a ref callback.
    // For now we'll let parent handle modal pop and then user closes.
  };

  return (
    <Card className="flex flex-col h-full bg-[#140D07] border-white/5">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold font-sans tracking-tight">Submit New<br/>Request</h2>
        <PlusSquare className="text-aura-amber" size={24} strokeWidth={1.5} />
      </div>

      <div className="flex-1 space-y-4">
        <Input 
          id="location"
          label="Deployment Location"
          placeholder="Enter sector or coordinates..."
          iconLeft={MapPin}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mb-0"
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select 
            id="supply_type"
            label="Supply Type"
            options={supplyOptions}
            value={supplyType}
            onChange={(e) => setSupplyType(e.target.value)}
            className="mb-0"
            disabled={isSubmitting}
          />
          <Input 
            id="quantity"
            label="Quantity"
            placeholder="Units"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mb-0"
            disabled={isSubmitting}
          />
        </div>

        <Textarea 
          id="urgency_desc"
          label="Urgency Description"
          placeholder="Identify critical threats or immediate needs..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-0"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded mt-4">
          <div>
            <div className="text-xs text-white/70 font-sans">Request Type</div>
            <div className="text-[9px] font-mono tracking-widest text-white/40 uppercase mt-0.5">Protocol Level</div>
          </div>
          <ToggleSwitch isSpecial={isSpecial} onChange={setIsSpecial} disabled={isSubmitting} />
        </div>
      </div>

      <Button className="w-full mt-8 py-3.5 flex justify-center items-center" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : <Send size={16} className="mr-2" />}
        {isSubmitting ? 'INITIALIZING...' : 'INITIALIZE DEPLOYMENT'}
      </Button>
    </Card>
  );
}

RequestForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};
