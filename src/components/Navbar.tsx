import React, { useState } from 'react';
import { ViewType, NotificationItem, User } from '../types';
import { HireFlowLogo } from './HireFlowLogo';
import { MssqlHealthStatus } from '../lib/api';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenPostJob: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  hasSidebar?: boolean;
  currentUser?: User | null;
  onLogout?: () => void;
  mssqlStatus?: MssqlHealthStatus | null;
  onSyncDatabase?: () => void;
  isSyncingDb?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenPostJob,
  notifications,
  onMarkNotificationRead,
  hasSidebar = false,
  currentUser,
  onLogout,
  mssqlStatus,
  onSyncDatabase,
  isSyncingDb = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { label: string; view: ViewType }[] = [
    { label: 'Find Jobs', view: 'find-jobs' },
    { label: 'Companies', view: 'companies' },
    ...(currentUser?.role === 'candidate'
      ? [{ label: 'My Career Portal', view: 'candidate-portal' as ViewType }]
      : []),
    ...(currentUser?.role === 'employer'
      ? [{ label: 'Employer Pipeline', view: 'employer-portal' as ViewType }]
      : []),
    ...(currentUser?.role === 'admin'
      ? [
          { label: 'Candidate Portal', view: 'candidate-portal' as ViewType },
          { label: 'Employer Portal', view: 'employer-portal' as ViewType },
          { label: 'Admin Governance', view: 'admin' as ViewType },
        ]
      : []),
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-40 h-16 bg-surface-container-lowest/85 backdrop-blur-md shadow-[0_1px_8px_rgba(23,34,29,0.04)] transition-all ${
        hasSidebar ? 'left-0 md:left-64' : 'left-0'
      }`}
    >
      <div className="h-full max-w-7xl mx-auto px-4 md:px-space-xl flex items-center justify-between gap-space-md">
        {/* Left Side: Brand Logo (only if no sidebar) & Navigation */}
        <div className="flex items-center gap-space-lg">
          {!hasSidebar && (
            <button
              onClick={() => onNavigate('find-jobs')}
              className="flex items-center text-left focus:outline-none"
            >
              <HireFlowLogo size="md" />
            </button>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-space-lg">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`font-label-lg text-label-lg transition-colors cursor-pointer py-1 ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Actions, Notifications, Profile */}
        <div className="flex items-center gap-space-md">
          {/* Microsoft SQL Server Live Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/60 border border-surface-container text-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">database</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  mssqlStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></span>
              <span className="font-semibold text-on-surface">
                {mssqlStatus?.connected ? 'SQL Server Live' : 'MSSQL Ready'}
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono px-1.5 py-0.5 rounded bg-surface-container">
                {mssqlStatus?.server || 'DESKTOP-PK86AT'}
              </span>
            </div>
            {onSyncDatabase && (
              <button
                onClick={onSyncDatabase}
                disabled={isSyncingDb}
                title="Synchronize with Microsoft SQL Server"
                className="ml-1 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-0.5 rounded hover:bg-surface-container cursor-pointer disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isSyncingDb ? 'animate-spin text-primary' : ''
                  }`}
                >
                  sync
                </span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              aria-label="Notifications"
              className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-4 animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-on-surface text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-primary font-medium cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>

                <div className="mt-2 divide-y divide-surface-container max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className={`py-3 px-2 flex items-start gap-3 rounded-lg transition-colors cursor-pointer ${
                        notif.read
                          ? 'opacity-70 hover:bg-surface-container-low'
                          : 'bg-surface-container-low/50 hover:bg-surface-container-low'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                          notif.type === 'offer'
                            ? 'bg-secondary-container text-secondary'
                            : notif.type === 'interview'
                            ? 'bg-tertiary-fixed/40 text-tertiary'
                            : 'bg-surface-container text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {notif.type === 'offer'
                            ? 'celebration'
                            : notif.type === 'interview'
                            ? 'event_available'
                            : 'shield'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-on-surface truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Post a Job Button */}
          <button
            onClick={onOpenPostJob}
            className="inline-flex items-center justify-center h-10 px-space-md bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg rounded-lg shadow-xs transition-colors cursor-pointer"
            type="button"
          >
            Post a Job
          </button>

          {/* User Profile Avatar with Online Dot */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-space-sm cursor-pointer p-0.5 rounded-full hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
              type="button"
            >
              <div className="relative">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover shadow-xs border border-primary/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-xs shadow-xs">
                    {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : <span className="material-symbols-outlined text-[18px]">person</span>}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary-fixed border-2 border-surface-container-lowest"></span>
              </div>
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-3 animate-in fade-in zoom-in-95 duration-150 z-50">
                <div className="p-2 border-b border-surface-container">
                  <div className="flex items-center gap-2.5">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-full object-cover border border-primary/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                        {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : 'AH'}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-on-surface truncate">
                        {currentUser?.name || 'Ahmed Hassan'}
                      </span>
                      <span className="text-xs text-on-surface-variant truncate">
                        {currentUser?.email || 'ahmed@hireflow.io'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    {currentUser?.role === 'admin'
                      ? 'Platform Administrator'
                      : currentUser?.role === 'employer'
                      ? 'Verified Employer Partner'
                      : 'Vetted Senior Engineer'}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => {
                      onNavigate('candidate-portal');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      account_circle
                    </span>
                    Candidate Portal
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('employer-portal');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      view_kanban
                    </span>
                    Employer Pipeline
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-tertiary">
                      shield
                    </span>
                    Platform Admin
                  </button>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          manage_search
                        </span>
                        <span>Activity & Audit Stream</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    </button>
                  )}

                  <div className="pt-2 border-t border-surface-container">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-error hover:bg-error-container/40 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container px-4 py-3 shadow-lg space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === item.view
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
