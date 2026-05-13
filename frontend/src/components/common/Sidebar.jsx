import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Settings, LogOut, FileText } from 'lucide-react';

export default function Sidebar({ navItems, activeSessionText, onLogout }) {
  return (
    <aside className="w-64 border-r border-white/5 bg-[#0D0905] h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-4 h-4 rounded-full border-[3px] border-aura-amber flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-aura-amber"></div>
          </div>
          <h1 className="text-xl font-bold tracking-widest uppercase">AURA</h1>
        </div>
        <div className="text-aura-amber text-sm font-sans mb-1">AURA Control</div>
        <div className="text-white/40 text-xs font-sans">Active Session: {activeSessionText}</div>
      </div>
      
      <nav className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded font-sans text-sm transition-colors duration-200 ${
                isActive ? 'bg-aura-amber text-black font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/5 flex flex-col gap-2">
        <button className="flex items-center gap-4 px-4 py-3 rounded font-sans text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-200 w-full text-left">
          <FileText size={18} />
          System Logs
        </button>
        <button className="flex items-center gap-4 px-4 py-3 rounded font-sans text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-200 w-full text-left">
          <Settings size={18} />
          Settings
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-4 px-4 py-3 rounded font-sans text-sm text-red-300 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 w-full text-left"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
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
};
