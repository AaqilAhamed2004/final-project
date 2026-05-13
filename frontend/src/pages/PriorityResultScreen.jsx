import React from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityResult from '../components/priority/PriorityResult';

export default function PriorityResultScreen() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#0D0905] p-8 text-white flex flex-col font-sans">
      <button 
        onClick={() => navigate(-1)} 
        className="text-aura-amber text-xs font-mono tracking-widest uppercase hover:underline self-start mb-8"
      >
        &lt; Return to Operations
      </button>
      <PriorityResult isModal={false} onClose={() => navigate(-1)} />
    </div>
  );
}
