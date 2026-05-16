import React from 'react';
import PropTypes from 'prop-types';
import { Bell, LogOut, Menu } from 'lucide-react';

export default function Navbar({ title, user, badgeText, badgeColorClass, children, onLogout, onMenuClick }) {
  return (
    <header className="h-20 border-b border-white/5 bg-[#0D0905] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[40] w-full">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 text-white/70 hover:text-white lg:hidden"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        )}

        <div className="flex items-center gap-4">
          {title === 'AURA' ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-[3px] border-aura-amber flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-aura-amber"></div>
              </div>
              <h1 className="text-xl font-bold tracking-widest uppercase text-aura-amber">AURA</h1>
            </div>
          ) : (
            <h2 className="text-lg lg:text-2xl font-bold text-aura-amber tracking-wide truncate max-w-[150px] md:max-w-none">{title}</h2>
          )}
          {badgeText && (
            <span className={`hidden sm:flex px-3 py-1 rounded-full text-[10px] font-mono tracking-wider border items-center gap-2 ${badgeColorClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badgeColorClass?.includes('red') ? 'bg-aura-red' : 'bg-current'} animate-pulse`}></span>
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {children && (
        <div className="hidden xl:flex items-center gap-8 text-sm font-sans font-medium text-white/70">
          {children}
        </div>
      )}

      
      <div className="flex items-center gap-4 lg:gap-8">
        <button className="relative text-white/70 hover:text-white transition-colors p-2">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-aura-red rounded-full animate-pulse"></span>
        </button>
        
        {user && (
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold tracking-widest font-mono uppercase text-white/30">{user.role?.replace('_', ' ')}</div>
              <div className="text-xs lg:text-sm font-sans truncate max-w-[120px]">{user.full_name || user.name || 'Personnel'}</div>
            </div>
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'Personnel'}&backgroundColor=1C1309`} 
              alt="User Avatar" 
              className="w-8 h-8 lg:w-10 h-10 rounded border border-white/10 bg-[#1C1309]" 
            />
            {onLogout && (
              <button onClick={onLogout} className="hidden sm:block text-white/40 hover:text-aura-red transition-colors ml-2" title="Log out">
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
    email: PropTypes.string,
    role: PropTypes.string.isRequired,
    name: PropTypes.string,
    full_name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  badgeText: PropTypes.string,
  badgeColorClass: PropTypes.string,
  children: PropTypes.node,
  onLogout: PropTypes.func,
  onMenuClick: PropTypes.func,
};
