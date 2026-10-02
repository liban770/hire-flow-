import React from 'react';
import { ViewType, User } from '../types';
import { HireFlowLogo } from './HireFlowLogo';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  activeItem?: 'pipeline' | 'candidates' | 'jobs' | 'companies' | 'admin';
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeItem,
  currentUser,
  onLogout,
}) => {
  // Determine which sidebar item is highlighted based on activeItem or currentView
  const currentHighlight =
    activeItem ||
    (currentView === 'candidate-portal'
      ? 'candidates'
      : currentView === 'employer-portal'
      ? 'pipeline'
      : currentView === 'admin'
      ? 'admin'
      : currentView === 'companies'
      ? 'companies'
      : 'jobs');

  const navItems = [
    ...(currentUser?.role === 'employer' || currentUser?.role === 'admin'
      ? [
          {
            id: 'pipeline',
            label: 'Pipeline',
            icon: 'view_kanban',
            targetView: 'employer-portal' as ViewType,
          },
        ]
      : []),
    ...(currentUser?.role === 'candidate' || currentUser?.role === 'admin'
      ? [
          {
            id: 'candidates',
            label: currentUser?.role === 'candidate' ? 'My Portal' : 'Candidates',
            icon: 'group',
            targetView: 'candidate-portal' as ViewType,
          },
        ]
      : []),
    {
      id: 'jobs',
      label: 'Jobs',
      icon: 'business_center',
      targetView: 'find-jobs' as ViewType,
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: 'domain',
      targetView: 'companies' as ViewType,
    },
    ...(currentUser?.role === 'admin'
      ? [
          {
            id: 'admin',
            label: 'Admin & Governance',
            icon: 'tune',
            targetView: 'admin' as ViewType,
          },
          {
            id: 'activity_log',
            label: 'Activity Stream',
            icon: 'manage_search',
            targetView: 'admin' as ViewType,
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex-col justify-between py-space-lg shadow-[1px_0_12px_rgba(23,34,29,0.03)] border-r border-surface-container">
      <div className="flex flex-col">
        {/* Brand Lockup */}
        <div className="px-space-lg mb-space-xl flex items-center gap-space-sm cursor-pointer" onClick={() => onNavigate('find-jobs')}>
          <HireFlowLogo size="md" />
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-space-xs px-space-md">
          {navItems.map((item) => {
            const isActive = currentHighlight === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.targetView)}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors font-label-lg text-label-lg text-left cursor-pointer ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card at Bottom */}
      <div className="px-space-md">
        <div className="p-space-md rounded-xl bg-surface-container flex items-center justify-between gap-space-sm border border-surface-container-high/60 group">
          <div className="flex items-center gap-space-sm min-w-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary font-bold text-xs">
                {currentUser ? currentUser.name.substring(0, 2).toUpperCase() : <span className="material-symbols-outlined text-[18px]">person</span>}
              </div>
            )}
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {currentUser?.name || 'Recruiting Ops'}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                {currentUser?.email || 'enterprise@hireflow.io'}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1 rounded-lg text-outline hover:text-error hover:bg-error-container/40 transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

