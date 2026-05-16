import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Settings, LogOut, FileText, X } from 'lucide-react';

export default function Sidebar({ navItems, activeSessionText, onLogout, isOpen, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen z-[70] flex flex-col
        bg-[#0D0905] border-r border-white/5 w-64
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-4 h-4 rounded-full border-[3px] border-aura-amber flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-aura-amber"></div>
            </div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white">AURA</h1>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-1 text-white/40 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>

          <div className="text-aura-amber text-[10px] font-mono tracking-widest uppercase mb-1 mt-6">AURA Control</div>
          <div className="text-white/40 text-[10px] font-mono tracking-wider">Active Session: {activeSessionText}</div>
        </div>
        
        {/* Navigation Section */}
        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase px-4 mb-4">Operations</div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) => 
                  `flex items-center gap-4 px-4 py-3.5 rounded transition-all duration-300 ${
                    isActive 
                      ? 'bg-aura-amber text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'text-white/50 hover:bg-white/[0.03] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={isActive ? 'text-black' : ''} />
                    <span className="text-[11px] font-mono font-bold tracking-widest uppercase">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-1 bg-[#090604]">
          <button className="flex items-center gap-4 px-4 py-3.5 rounded text-white/40 hover:bg-white/[0.03] hover:text-white/80 transition-all duration-300 w-full text-left group">
            <FileText size={18} className="group-hover:text-aura-amber transition-colors" />
            <span className="text-[10px] font-mono tracking-widest uppercase">System Logs</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3.5 rounded text-white/40 hover:bg-white/[0.03] hover:text-white/80 transition-all duration-300 w-full text-left group">
            <Settings size={18} className="group-hover:text-aura-amber transition-colors" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Settings</span>
          </button>
          
          {/* Active Session Info Box */}
          <div className="mt-2 mx-1 p-3 rounded bg-white/[0.02] border border-white/5">
              <div className="text-[8px] font-mono text-white/30 tracking-[0.2em] uppercase mb-1">Active Session</div>
              <div className="text-[10px] font-mono text-aura-amber font-bold tracking-wider">{activeSessionText}</div>
          </div>

          <button 
            onClick={onLogout}
            className="flex items-center gap-4 px-4 py-4 rounded text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 w-full text-left mt-2 group"
          >
            <LogOut size={18} />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  activeSessionText: PropTypes.string.isRequired,
  onLogout: PropTypes.func,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
