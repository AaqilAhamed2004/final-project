import React from 'react';
import PropTypes from 'prop-types';
import { Bell, LogOut } from 'lucide-react';

export default function Navbar({ title, user, badgeText, badgeColorClass, children, onLogout }) {
  return (
    <header className="h-20 border-b border-white/5 bg-[#0D0905] flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {title === 'AURA' ? (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-[3px] border-aura-amber flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-aura-amber"></div>
            </div>
            <h1 className="text-xl font-bold tracking-widest uppercase text-aura-amber">AURA</h1>
          </div>
        ) : (
          <h2 className="text-2xl font-bold text-aura-amber tracking-wide">{title}</h2>
        )}
        {badgeText && (
          <span className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider border flex items-center gap-2 ${badgeColorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badgeColorClass.includes('red') ? 'bg-aura-red' : 'bg-current'} animate-pulse`}></span>
            {badgeText}
          </span>
        )}
      </div>

      {children && (
        <div className="hidden md:flex items-center gap-8 text-sm font-sans font-medium text-white/70">
          {children}
        </div>
      )}

      
      <div className="flex items-center gap-8">
        <button className="relative text-white/70 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-aura-red rounded-full animate-pulse"></span>
        </button>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold tracking-widest font-mono uppercase text-white/70">{user.role.replace('_', ' ')}</div>
              <div className="text-sm font-sans">{user.name}</div>
            </div>
            <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded border border-white/10 bg-[#1C1309]" />
            {onLogout && (
              <button onClick={onLogout} className="text-white/40 hover:text-aura-red transition-colors ml-2" title="Log out">
                <LogOut size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
  }),
  badgeText: PropTypes.string,
  badgeColorClass: PropTypes.string,
  children: PropTypes.node,
  onLogout: PropTypes.func,
};
