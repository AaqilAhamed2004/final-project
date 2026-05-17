import React from 'react';
import PropTypes from 'prop-types';
import { Bell, LogOut, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ title, user, badgeText, badgeColorClass, children, onLogout, onMenuClick }) {
  return (
    <header className="h-20 border-b border-aura-border bg-aura-navbar shadow-aura-nav flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[40] w-full transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-aura-text-muted hover:text-aura-text lg:hidden transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        )}

        <div className="flex items-center gap-4">
          {title === 'AURA' ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-[3px] border-aura-accent flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-aura-accent"></div>
              </div>
              <h1 className="text-xl font-bold tracking-widest uppercase text-aura-accent">AURA</h1>
            </div>
          ) : (
            <h2 className="text-lg lg:text-2xl font-bold text-aura-text tracking-wide truncate max-w-[150px] md:max-w-none">{title}</h2>
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
        <div className="hidden xl:flex items-center gap-8 text-sm font-sans font-medium text-aura-text-muted">
          {children}
        </div>
      )}

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button className="relative text-aura-text-muted hover:text-aura-text transition-colors p-2 rounded-lg hover:bg-aura-surface-hover" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-aura-red rounded-full animate-pulse"></span>
        </button>

        {user && (
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold tracking-widest font-mono uppercase text-aura-text-faint">{user.role?.replace('_', ' ')}</div>
              <div className="text-xs lg:text-sm font-sans truncate max-w-[120px] text-aura-text">{user.full_name || user.name || 'Personnel'}</div>
            </div>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'Personnel'}&backgroundColor=1C1309`}
              alt="User Avatar"
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg border border-aura-border bg-aura-surface object-cover"
            />
            {onLogout && (
              <button onClick={onLogout} className="hidden sm:block text-aura-text-faint hover:text-aura-red transition-colors ml-1" title="Log out">
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
