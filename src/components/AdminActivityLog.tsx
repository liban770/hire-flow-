import React, { useState } from 'react';
import { ActivityLogEntry, ActivityEventType } from '../types';

interface AdminActivityLogProps {
  logs: ActivityLogEntry[];
  onClearLogs?: () => void;
}

export const AdminActivityLog: React.FC<AdminActivityLogProps> = ({ logs, onClearLogs }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ActivityEventType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectEntry, setInspectEntry] = useState<ActivityLogEntry | null>(null);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Compute telemetry metrics
  const totalEvents = logs.length;
  const loginCount = logs.filter((l) => l.type === 'login').length;
  const approvalCount = logs.filter((l) => l.type === 'account_approval').length;
  const jobPostingCount = logs.filter((l) => l.type === 'job_posting').length;

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (selectedCategory !== 'all' && log.type !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        log.actor.name.toLowerCase().includes(q) ||
        log.actor.email.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        (log.target?.name && log.target.name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `hireflow_activity_log_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['Timestamp', 'Type', 'Actor', 'Email', 'Role', 'Action', 'Target', 'IP Address', 'Status'];
      const rows = logs.map((l) => [
        l.timestamp,
        l.type,
        l.actor.name,
        l.actor.email,
        l.actor.role,
        `"${l.action.replace(/"/g, '""')}"`,
        l.target?.name || '',
        l.ipAddress,
        l.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `hireflow_activity_log_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setExportNotice(`Exported ${logs.length} audit entries as ${format.toUpperCase()}`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const getBadgeForType = (type: ActivityEventType) => {
    switch (type) {
      case 'login':
        return {
          icon: 'login',
          label: 'User Login',
          bg: 'bg-primary-container/15 text-primary',
          dot: 'bg-primary',
        };
      case 'account_approval':
        return {
          icon: 'how_to_reg',
          label: 'Account Approval',
          bg: 'bg-secondary-container/60 text-secondary',
          dot: 'bg-secondary',
        };
      case 'job_posting':
        return {
          icon: 'business_center',
          label: 'Job Posting',
          bg: 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant',
          dot: 'bg-tertiary',
        };
      case 'security_event':
        return {
          icon: 'security',
          label: 'Security Flag',
          bg: 'bg-error-container/60 text-on-error-container',
          dot: 'bg-error',
        };
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container/60 p-space-lg flex flex-col gap-space-md">
      {/* Header and Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-xs border-b border-surface-container/60">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[22px]">history_edu</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                Activity & Audit Ledger
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-label-sm font-semibold">
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveStream ? 'bg-primary animate-pulse' : 'bg-outline'}`}></span>
                {isLiveStream ? 'Live Recording Stream' : 'Stream Paused'}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Immutable ledger tracking user authentication sessions, administrative account approvals, and verified requisition publications.
            </p>
          </div>
        </div>

        {/* Live Controls & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {exportNotice && (
            <span className="text-xs font-semibold text-secondary animate-in fade-in flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {exportNotice}
            </span>
          )}

          <button
            onClick={() => setIsLiveStream(!isLiveStream)}
            className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLiveStream
                ? 'border-secondary-container bg-secondary-container/40 text-secondary'
                : 'border-surface-container bg-surface-container-low text-on-surface-variant'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isLiveStream ? 'pause' : 'play_arrow'}
            </span>
            {isLiveStream ? 'Pause Stream' : 'Resume'}
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="h-9 px-3 bg-surface-container-lowest hover:bg-surface-container rounded-lg border border-surface-container text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1.5 font-semibold cursor-pointer shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            CSV Export
          </button>

          <button
            onClick={() => handleExport('json')}
            className="h-9 px-3 bg-surface-container-lowest hover:bg-surface-container rounded-lg border border-surface-container text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1.5 font-semibold cursor-pointer shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            JSON
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              title="Clear temporary buffer"
              className="p-2 rounded-lg text-outline hover:text-error hover:bg-error-container/40 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">clear_all</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Telemetry Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
        <div
          onClick={() => setSelectedCategory('all')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-surface-container border-primary/40 shadow-xs'
              : 'bg-surface-container-low/50 border-surface-container/60 hover:bg-surface-container-low'
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
            Total Logged Events
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-on-surface">{totalEvents}</span>
            <span className="text-[10px] text-secondary font-semibold font-mono">100% SLA</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedCategory('login')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'login'
              ? 'bg-surface-container border-primary/40 shadow-xs'
              : 'bg-surface-container-low/50 border-surface-container/60 hover:bg-surface-container-low'
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
            User Logins (24h)
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-primary">{loginCount}</span>
            <span className="text-[10px] text-primary font-semibold font-mono">2FA Active</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedCategory('account_approval')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'account_approval'
              ? 'bg-surface-container border-primary/40 shadow-xs'
              : 'bg-surface-container-low/50 border-surface-container/60 hover:bg-surface-container-low'
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
            Account Approvals
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-secondary">{approvalCount}</span>
            <span className="text-[10px] text-secondary font-semibold font-mono">Verified Badges</span>
          </div>
        </div>

        <div
          onClick={() => setSelectedCategory('job_posting')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'job_posting'
              ? 'bg-surface-container border-primary/40 shadow-xs'
              : 'bg-surface-container-low/50 border-surface-container/60 hover:bg-surface-container-low'
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
            New Job Postings
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-tertiary">{jobPostingCount}</span>
            <span className="text-[10px] text-tertiary font-semibold font-mono">Direct Recruiter</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Activities', count: totalEvents },
            { id: 'login', label: 'User Logins', count: loginCount },
            { id: 'account_approval', label: 'Approvals', count: approvalCount },
            { id: 'job_posting', label: 'Job Postings', count: jobPostingCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedCategory === tab.id
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, action, IP, or entity..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-surface-container-low text-on-surface rounded-lg border border-surface-container outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-colors"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-on-surface-variant pointer-events-none">
            search
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Structured Activity Feed Table */}
      <div className="overflow-x-auto -mx-space-lg px-space-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
              <th className="py-2.5 px-4 rounded-l-lg font-semibold w-36">Timestamp</th>
              <th className="py-2.5 px-3 font-semibold w-40">Event Type</th>
              <th className="py-2.5 px-4 font-semibold w-56">Actor / User</th>
              <th className="py-2.5 px-4 font-semibold">Action & Target Entity</th>
              <th className="py-2.5 px-3 font-semibold w-36">Client IP</th>
              <th className="py-2.5 px-3 text-right rounded-r-lg font-semibold w-24">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-3xl text-outline">history_toggle_off</span>
                    <span className="font-semibold text-sm text-on-surface">No activity matching filter</span>
                    <p className="text-xs">Adjust your search query or select another category tab above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((entry) => {
                const badge = getBadgeForType(entry.type);
                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                    onClick={() => setInspectEntry(entry)}
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col font-mono">
                        <span className="font-semibold text-on-surface text-xs tabular-nums">
                          {entry.formattedTime}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">{entry.relativeTime}</span>
                      </div>
                    </td>

                    {/* Event Type Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Actor Details */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-on-surface truncate">{entry.actor.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-mono uppercase">
                            {entry.actor.role}
                          </span>
                        </div>
                        <span className="text-outline text-[11px] truncate font-mono">{entry.actor.email}</span>
                      </div>
                    </td>

                    {/* Action & Target Entity */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-medium leading-relaxed">{entry.action}</span>
                        {entry.target && (
                          <div className="flex items-center gap-1 text-[11px] text-primary font-semibold mt-0.5">
                            <span className="material-symbols-outlined text-[13px]">arrow_right_alt</span>
                            <span>{entry.target.name}</span>
                            {entry.target.id && (
                              <span className="text-outline font-mono font-normal">({entry.target.id})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="py-3 px-3 font-mono text-[11px] text-on-surface-variant">
                      <span className="px-2 py-1 rounded bg-surface-container-low text-on-surface">
                        {entry.ipAddress}
                      </span>
                    </td>

                    {/* Action Inspect Button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectEntry(entry);
                        }}
                        className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] transition-colors cursor-pointer"
                        type="button"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Technical Audit Modal */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">policy</span>
                <h3 className="font-bold text-on-surface text-base">Security Audit Record Inspection</h3>
              </div>
              <button
                onClick={() => setInspectEntry(null)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-outline tracking-wider">Event ID</span>
                  <div className="font-mono font-bold text-sm text-on-surface">{inspectEntry.id}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    getBadgeForType(inspectEntry.type).bg
                  }`}
                >
                  {getBadgeForType(inspectEntry.type).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-surface-container-low">
                  <span className="text-outline text-[11px]">Recorded Timestamp:</span>
                  <div className="font-mono font-semibold text-on-surface mt-0.5">{inspectEntry.timestamp}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low">
                  <span className="text-outline text-[11px]">Originating IP:</span>
                  <div className="font-mono font-semibold text-on-surface mt-0.5">{inspectEntry.ipAddress}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low space-y-1.5">
                <span className="text-outline text-[11px] block">Actor Identification:</span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-on-surface">{inspectEntry.actor.name}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase text-[10px] font-mono">
                    {inspectEntry.actor.role}
                  </span>
                </div>
                <div className="font-mono text-primary text-xs">{inspectEntry.actor.email}</div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low space-y-1">
                <span className="text-outline text-[11px] block">Action Execution & Target:</span>
                <p className="text-on-surface font-medium leading-relaxed">{inspectEntry.action}</p>
                {inspectEntry.target && (
                  <div className="text-primary font-semibold text-[11px]">
                    Target: {inspectEntry.target.name} ({inspectEntry.target.type})
                  </div>
                )}
              </div>

              {inspectEntry.details && (
                <div className="p-3 rounded-lg bg-surface-container-low space-y-1">
                  <span className="text-outline text-[11px] block font-mono">Diagnostic Metadata:</span>
                  <pre className="text-[11px] font-mono bg-surface-container p-2 rounded text-on-surface overflow-x-auto">
                    {JSON.stringify(inspectEntry.details, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-2 text-[11px] text-outline flex items-center justify-between border-t border-surface-container">
                <span className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Cryptographic Hash Validated (SHA-256)
                </span>
                <span className="font-mono">Immutable Log Block</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectEntry(null)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
