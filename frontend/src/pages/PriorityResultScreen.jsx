import React from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityResult from '../components/priority/PriorityResult';

export default function PriorityResultScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-aura-bg p-8 text-aura-text flex flex-col font-sans">
      <button 
        onClick={() => navigate(-1)} 
        className="text-aura-accent text-xs font-mono tracking-widest uppercase hover:text-aura-accent-hover hover:underline self-start mb-8 transition-colors"
      >
        &lt; Return to Operations
      </button>
      <PriorityResult isModal={false} onClose={() => navigate(-1)} />
    </div>
  );
}
