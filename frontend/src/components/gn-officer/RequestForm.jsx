import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';
import { SUPPLY_CATEGORIES } from '../../constants';
import { MapPin, PlusSquare, Send, Trash2, Plus, AlertTriangle } from 'lucide-react';

const ROAD_STATUS_OPTIONS = [
  { value: 'clear',   label: 'Clear' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'flooded', label: 'Flooded' },
];

const POPULATION_OPTIONS = [
  { value: 'small',  label: 'Small (<500)' },
  { value: 'medium', label: 'Medium (500–5000)' },
  { value: 'large',  label: 'Large (>5000)' },
];

const categoryOptions = Object.values(SUPPLY_CATEGORIES);

const emptyItem = () => ({ item_name: '', category: 'medicine', quantity: 1, quantity_needed: 1 });

export default function RequestForm({ onSubmit, isSubmitting }) {
  const [location, setLocation]         = useState('');
  const [description, setDescription]   = useState('');
  const [roadStatus, setRoadStatus]     = useState('clear');
  const [popSize, setPopSize]           = useState('medium');
  const [isPublic, setIsPublic]         = useState(true);
  const [items, setItems]               = useState([emptyItem()]);
  const [formError, setFormError]       = useState('');

  // ── Item helpers ──────────────────────────────────────────────────────────
  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const removeItem = (idx) => {
    if (items.length === 1) return; // always keep at least one item
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setFormError('');

    if (!location.trim()) {
      setFormError('Deployment location is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Urgency description is required.');
      return;
    }
    if (items.some(it => !it.item_name.trim())) {
      setFormError('All supply items must have a name.');
      return;
    }

    // Build the exact payload the backend expects
    const payload = {
      location: location.trim(),
      description: description.trim(),
      road_status: roadStatus,
      population_size: popSize,
      is_public: isPublic,
      items: items.map(it => {
        const cleanedKey = it.item_name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/(^_+|_+$)/g, '');
        const availableStock = parseInt(it.quantity, 10);
        return {
          item_name: it.item_name.trim(),
          category: it.category,
          quantity: isNaN(availableStock) ? 0 : availableStock,
          quantity_needed: parseInt(it.quantity_needed, 10) || 1,
          current_stock: isNaN(availableStock) ? 0 : availableStock,
          prolog_item_key: cleanedKey || null,
        };
      }),
    };

    onSubmit(payload);
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <Card className="flex flex-col border-aura-border bg-aura-surface">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight">Submit New Request</h2>
          <p className="text-[10px] font-mono text-aura-text-faint uppercase tracking-[0.2em] mt-1">Initialize Deployment Order</p>
        </div>
        <PlusSquare className="text-aura-amber" size={22} strokeWidth={1.5} />
      </div>

      <div className="flex-1 space-y-5">

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-aura-text-muted uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} className="text-aura-amber" /> Deployment Location *
          </label>
          <input
            type="text"
            placeholder="Sector / Coordinates / Zone name..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-aura-bg border border-aura-border rounded px-4 py-2.5 text-sm font-sans focus:border-aura-accent/50 outline-none transition-colors placeholder:text-aura-text-faint text-aura-text"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-aura-text-muted uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={12} className="text-aura-red" /> Urgency Description *
          </label>
          <textarea
            rows={3}
            placeholder="Describe immediate threats, civilian needs, and critical conditions..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-aura-bg border border-aura-border rounded px-4 py-2.5 text-sm font-sans focus:border-aura-accent/50 outline-none transition-colors placeholder:text-aura-text-faint resize-none text-aura-text"
          />
        </div>

        {/* Road & Population */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-aura-text-muted uppercase tracking-widest">Road Status</label>
            <select
              value={roadStatus}
              onChange={e => setRoadStatus(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-aura-bg border border-aura-border rounded px-3 py-2.5 text-xs font-mono text-aura-text focus:border-aura-accent/50 outline-none transition-colors"
            >
              {ROAD_STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-aura-text-muted uppercase tracking-widest">Population Size</label>
            <select
              value={popSize}
              onChange={e => setPopSize(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-aura-bg border border-aura-border rounded px-3 py-2.5 text-xs font-mono text-aura-text focus:border-aura-accent/50 outline-none transition-colors"
            >
              {POPULATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Supply Items */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono font-bold text-aura-text-muted uppercase tracking-widest">
              Supply Items *
            </label>
            <button
              type="button"
              onClick={addItem}
              disabled={isSubmitting}
              className="flex items-center gap-1 text-[9px] font-mono text-aura-amber hover:text-aura-amber/80 uppercase tracking-widest transition-colors"
            >
              <Plus size={12} /> Add Item
            </button>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {items.map((item, idx) => (
              <div key={idx} className="bg-aura-bg border border-aura-border rounded p-3 space-y-2">
                {/* Item Name + Remove */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Item name (e.g. Insulin, Rice, Tent)"
                    value={item.item_name}
                    onChange={e => updateItem(idx, 'item_name', e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 bg-aura-surface border border-aura-border rounded px-3 py-2 text-xs font-sans focus:border-aura-accent/50 outline-none transition-colors placeholder:text-aura-text-faint text-aura-text"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={isSubmitting || items.length === 1}
                    className="text-aura-text-faint hover:text-aura-red transition-colors disabled:opacity-30 px-1"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {/* Category + Qty */}
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={item.category}
                    onChange={e => updateItem(idx, 'category', e.target.value)}
                    disabled={isSubmitting}
                    className="bg-aura-surface border border-aura-border rounded px-2 py-2 text-[10px] font-mono text-aura-text-muted focus:border-aura-accent/50 outline-none transition-colors"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-aura-text-faint mb-0.5 uppercase">Available</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      disabled={isSubmitting}
                      className="bg-aura-surface border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-text focus:border-aura-accent/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-aura-text-faint mb-0.5 uppercase">Needed</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={item.quantity_needed}
                      onChange={e => updateItem(idx, 'quantity_needed', e.target.value)}
                      disabled={isSubmitting}
                      className="bg-aura-surface border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-text focus:border-aura-accent/50 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Toggle */}
        <div className="flex items-center justify-between p-3 bg-aura-surface border border-aura-border rounded">
          <div>
            <div className="text-xs text-aura-text-muted font-sans">Public Relief Board</div>
            <div className="text-[9px] font-mono tracking-widest text-aura-text-faint uppercase mt-0.5">Visible to donors & public</div>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(p => !p)}
            disabled={isSubmitting}
            className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? 'bg-aura-accent' : 'bg-aura-border-strong'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-aura-bg shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="text-aura-red text-[10px] font-mono uppercase tracking-wider animate-pulse flex items-center gap-2">
            <AlertTriangle size={12} /> {formError}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        className="w-full mt-6 py-3.5 flex justify-center items-center"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
