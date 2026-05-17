import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Settings, LogOut, FileText, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

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
        bg-aura-sidebar border-r border-aura-border w-64
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-aura-border relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-4 h-4 rounded-full border-[3px] border-aura-accent flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-aura-accent"></div>
            </div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-aura-text">AURA</h1>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1 text-aura-text-faint hover:text-aura-text lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

          <div className="text-aura-accent text-[10px] font-mono tracking-widest uppercase mb-1 mt-6">AURA Control</div>
          <div className="text-aura-text-faint text-[10px] font-mono tracking-wider">Active Session: {activeSessionText}</div>
        </div>

        {/* Navigation Section */}
        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="text-[10px] font-mono tracking-[0.2em] text-aura-text-faint uppercase px-4 mb-4">Operations</div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-aura-accent text-aura-bg font-bold shadow-aura-glow-sm'
                      : 'text-aura-text-muted hover:bg-aura-sidebar-hover hover:text-aura-text'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={isActive ? 'text-aura-bg' : ''} />
                    <span className="text-[11px] font-mono font-bold tracking-widest uppercase">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-aura-border flex flex-col gap-1 bg-aura-bg">
          <button className="flex items-center gap-4 px-4 py-3.5 rounded-lg text-aura-text-faint hover:bg-aura-sidebar-hover hover:text-aura-text-muted transition-all duration-200 w-full text-left group">
            <FileText size={18} className="group-hover:text-aura-accent transition-colors" />
            <span className="text-[10px] font-mono tracking-widest uppercase">System Logs</span>
          </button>
          <button className="flex items-center gap-4 px-4 py-3.5 rounded-lg text-aura-text-faint hover:bg-aura-sidebar-hover hover:text-aura-text-muted transition-all duration-200 w-full text-left group">
            <Settings size={18} className="group-hover:text-aura-accent transition-colors" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Settings</span>
          </button>

          {/* Active Session Info Box */}
          <div className="mt-2 mx-1 p-3 rounded-lg bg-aura-surface border border-aura-border">
            <div className="text-[8px] font-mono text-aura-text-faint tracking-[0.2em] uppercase mb-1">Active Session</div>
            <div className="text-[10px] font-mono text-aura-accent font-bold tracking-wider">{activeSessionText}</div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-4 px-4 py-4 rounded-lg text-aura-red/70 hover:bg-aura-red/10 hover:text-aura-red transition-all duration-200 w-full text-left mt-2 group"
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
