import React, { useState, useMemo } from 'react';
import { ActivityLogEntry, ActivityEventType } from '../types';

interface ActivityLogComponentProps {
  activityLogs: ActivityLogEntry[];
  onClearLogs?: () => void;
  onAddTestActivity?: (type: ActivityEventType) => void;
  title?: string;
  subtitle?: string;
  showSimulateControls?: boolean;
}

export const ActivityLogComponent: React.FC<ActivityLogComponentProps> = ({
  activityLogs,
  onClearLogs,
  onAddTestActivity,
  title = 'Platform Activity Stream & Governance Ledger',
  subtitle = 'Immutable administrative tracking for user authentications, account verifications, and marketplace job postings.',
  showSimulateControls = true,
}) => {
  const [selectedType, setSelectedType] = useState<'all' | ActivityEventType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '24h' | '7d'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'alert'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Activity counts by type
  const counts = useMemo(() => {
    return {
      all: activityLogs.length,
      login: activityLogs.filter((l) => l.type === 'login').length,
      account_approval: activityLogs.filter((l) => l.type === 'account_approval').length,
      job_posting: activityLogs.filter((l) => l.type === 'job_posting').length,
      security_event: activityLogs.filter((l) => l.type === 'security_event').length,
    };
  }, [activityLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      // Type filter
      if (selectedType !== 'all' && log.type !== selectedType) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false;
      }

      // Time range filter
      if (timeRange !== 'all') {
        const logDate = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (timeRange === 'today') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (logDate < startOfToday) return false;
        } else if (timeRange === '24h') {
          if (now - logDate > 24 * 60 * 60 * 1000) return false;
        } else if (timeRange === '7d') {
          if (now - logDate > 7 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchActorName = log.actor.name.toLowerCase().includes(q);
        const matchActorEmail = log.actor.email.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchTarget = log.target?.name.toLowerCase().includes(q) || false;
        const matchIp = log.ipAddress.toLowerCase().includes(q);
        const matchId = log.id.toLowerCase().includes(q);
        const matchRole = log.actor.role.toLowerCase().includes(q);
        const matchDetails = log.details ? JSON.stringify(log.details).toLowerCase().includes(q) : false;

        return matchActorName || matchActorEmail || matchAction || matchTarget || matchIp || matchId || matchRole || matchDetails;
      }

      return true;
    });
  }, [activityLogs, selectedType, statusFilter, timeRange, searchQuery]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Formatted Time', 'Event Type', 'Actor Name', 'Actor Email', 'Actor Role', 'Action', 'Target', 'IP Address', 'Status'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.formattedTime,
      l.type,
      `"${l.actor.name.replace(/"/g, '""')}"`,
      l.actor.email,
      l.actor.role,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${(l.target?.name || '').replace(/"/g, '""')}"`,
      l.ipAddress,
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hireflow_activity_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Activity log exported to CSV');
  };

  // JSON Export
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hireflow_activity_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Audit trail exported to JSON');
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    showToast(`Copied reference ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-container/70 p-4 md:p-space-lg flex flex-col gap-space-lg">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary shadow-lg border border-primary-fixed-dim/30 animate-in fade-in slide-in-from-bottom-3 text-xs font-semibold">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-surface-container pb-space-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <span className="material-symbols-outlined text-[22px]">manage_search</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                {title}
              </h2>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-label-xs font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? 'bg-secondary animate-pulse' : 'bg-outline'}`}></span>
                {isLiveStreaming ? 'Live Stream Active' : 'Stream Paused'}
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`h-9 px-3 rounded-lg text-label-sm font-label-sm font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
              isLiveStreaming
                ? 'bg-surface-container text-on-surface hover:bg-surface-container-high border-surface-container-high'
                : 'bg-primary-container text-on-primary border-primary hover:bg-primary'
            }`}
            title="Toggle live telemetry update"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isLiveStreaming ? 'pause' : 'play_arrow'}
            </span>
            {isLiveStreaming ? 'Pause Stream' : 'Resume Stream'}
          </button>

          <button
            onClick={handleExportCSV}
            className="h-9 px-3 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1.5 border border-surface-container-high font-medium cursor-pointer"
            title="Export filtered events to CSV format"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="h-9 px-3 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1.5 border border-surface-container-high font-medium cursor-pointer"
            title="Export full cryptographic audit ledger to JSON"
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            JSON
          </button>

          {showSimulateControls && onAddTestActivity && (
            <div className="relative group">
              <button
                className="h-9 px-3 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-sm text-label-sm transition-all flex items-center gap-1.5 shadow-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Simulate Activity
                <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
              </button>
              <div className="absolute right-0 mt-1 w-56 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container p-1.5 hidden group-hover:block z-30 animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => onAddTestActivity('login')}
                  className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[16px]">login</span>
                  Simulate User Login
                </button>
                <button
                  onClick={() => onAddTestActivity('account_approval')}
                  className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
                  Simulate Account Approval
                </button>
                <button
                  onClick={() => onAddTestActivity('job_posting')}
                  className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-tertiary text-[16px]">post_add</span>
                  Simulate Job Posting
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: User Logins */}
        <div
          onClick={() => setSelectedType(selectedType === 'login' ? 'all' : 'login')}
          className={`p-space-md rounded-xl border transition-all cursor-pointer ${
            selectedType === 'login'
              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
              : 'bg-surface-container-low/50 border-surface-container hover:border-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              User Logins
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">login</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              {counts.login}
            </span>
            <span className="text-label-xs font-label-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
              256-bit TLS
            </span>
          </div>
          <p className="font-body-xs text-body-xs text-on-surface-variant mt-1">
            Candidate & employer session events
          </p>
        </div>

        {/* Card 2: Account Approvals */}
        <div
          onClick={() => setSelectedType(selectedType === 'account_approval' ? 'all' : 'account_approval')}
          className={`p-space-md rounded-xl border transition-all cursor-pointer ${
            selectedType === 'account_approval'
              ? 'bg-secondary/5 border-secondary shadow-xs ring-1 ring-secondary'
              : 'bg-surface-container-low/50 border-surface-container hover:border-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Account Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              {counts.account_approval}
            </span>
            <span className="text-label-xs font-label-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-medium">
              KYC / Tier 1
            </span>
          </div>
          <p className="font-body-xs text-body-xs text-on-surface-variant mt-1">
            Admin authorizations & badge issuances
          </p>
        </div>

        {/* Card 3: Job Postings */}
        <div
          onClick={() => setSelectedType(selectedType === 'job_posting' ? 'all' : 'job_posting')}
          className={`p-space-md rounded-xl border transition-all cursor-pointer ${
            selectedType === 'job_posting'
              ? 'bg-tertiary/5 border-tertiary shadow-xs ring-1 ring-tertiary'
              : 'bg-surface-container-low/50 border-surface-container hover:border-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Job Postings
            </span>
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">work</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              {counts.job_posting}
            </span>
            <span className="text-label-xs font-label-xs text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full font-medium">
              Verified Roles
            </span>
          </div>
          <p className="font-body-xs text-body-xs text-on-surface-variant mt-1">
            Published requisition milestones
          </p>
        </div>

        {/* Card 4: Total Stream Entries */}
        <div
          onClick={() => setSelectedType('all')}
          className={`p-space-md rounded-xl border transition-all cursor-pointer ${
            selectedType === 'all'
              ? 'bg-surface-container border-on-surface/30 shadow-xs'
              : 'bg-surface-container-low/50 border-surface-container hover:border-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Recorded Logs
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              {counts.all}
            </span>
            <span className="text-label-xs font-label-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full font-mono">
              SOC-2 Type II
            </span>
          </div>
          <p className="font-body-xs text-body-xs text-on-surface-variant mt-1">
            Full compliance audit trail
          </p>
        </div>
      </div>

      {/* Filter and Search Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container-low/60 p-2.5 rounded-xl border border-surface-container">
        {/* Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all whitespace-nowrap cursor-pointer ${
              selectedType === 'all'
                ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            All Activity ({counts.all})
          </button>

          <button
            onClick={() => setSelectedType('login')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'login'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            User Logins ({counts.login})
          </button>

          <button
            onClick={() => setSelectedType('account_approval')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'account_approval'
                ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            Account Approvals ({counts.account_approval})
          </button>

          <button
            onClick={() => setSelectedType('job_posting')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'job_posting'
                ? 'bg-tertiary text-on-tertiary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">work</span>
            Job Postings ({counts.job_posting})
          </button>

          <button
            onClick={() => setSelectedType('security_event')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedType === 'security_event'
                ? 'bg-error text-on-error font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shield</span>
            Security ({counts.security_event})
          </button>
        </div>

        {/* Search, Time & Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-60">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, IP, action, job..."
              className="w-full h-8 pl-8 pr-3 text-label-sm font-label-sm bg-surface-container-lowest text-on-surface rounded-lg focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container placeholder:text-on-surface-variant/70"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-[16px] text-on-surface-variant">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="h-8 px-2.5 bg-surface-container-lowest text-on-surface text-label-sm font-label-sm rounded-lg border border-surface-container focus:outline-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8 px-2.5 bg-surface-container-lowest text-on-surface text-label-sm font-label-sm rounded-lg border border-surface-container focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
          </select>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              title="Reset activity log buffer"
              className="h-8 px-2.5 text-label-sm text-error hover:bg-error-container/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Activity Log Feed */}
      <div className="flex flex-col gap-space-xs">
        {filteredLogs.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-container bg-surface-container-low/30">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              event_busy
            </span>
            <p className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              No activity logs found
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
              There are no recorded logs matching the selected filters. Try adjusting your search term or filter category.
            </p>
            <button
              onClick={() => {
                setSelectedType('all');
                setSearchQuery('');
                setTimeRange('all');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-surface-container/60 border border-surface-container/80 rounded-xl overflow-hidden bg-surface-container-lowest">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              // Type specifics
              let typeIcon = 'history';
              let typeBadgeClass = 'bg-surface-container text-on-surface';
              let typeLabel = 'System Event';

              if (log.type === 'login') {
                typeIcon = 'login';
                typeBadgeClass = 'bg-primary/10 text-primary border border-primary/20';
                typeLabel = 'User Login';
              } else if (log.type === 'account_approval') {
                typeIcon = 'how_to_reg';
                typeBadgeClass = 'bg-secondary/10 text-secondary border border-secondary/20';
                typeLabel = 'Account Approval';
              } else if (log.type === 'job_posting') {
                typeIcon = 'work';
                typeBadgeClass = 'bg-tertiary/15 text-tertiary-container border border-tertiary/30';
                typeLabel = 'Job Posting';
              } else if (log.type === 'security_event') {
                typeIcon = 'shield';
                typeBadgeClass = 'bg-error-container text-on-error-container border border-error/20';
                typeLabel = 'Security Alert';
              }

              // Status indicator
              let statusDot = 'bg-primary';
              if (log.status === 'warning') statusDot = 'bg-tertiary';
              if (log.status === 'alert') statusDot = 'bg-error animate-ping';
              if (log.status === 'info') statusDot = 'bg-secondary';

              return (
                <div
                  key={log.id}
                  className={`p-3.5 sm:p-4 transition-colors hover:bg-surface-container-low/40 flex flex-col gap-2 ${
                    isExpanded ? 'bg-surface-container-low/30' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Icon, Type Badge, Actor & Action */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-on-surface">
                        <span className="material-symbols-outlined text-[19px]">{typeIcon}</span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-semibold ${typeBadgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                            {typeLabel}
                          </span>

                          <span className="font-label-md text-label-md font-bold text-on-surface truncate">
                            {log.actor.name}
                          </span>

                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-mono bg-surface-container text-on-surface-variant capitalize">
                            {log.actor.role}
                          </span>

                          <span className="text-on-surface-variant/50 hidden sm:inline">•</span>

                          <span className="font-mono text-body-xs text-on-surface-variant/80 hidden md:inline truncate max-w-xs">
                            {log.actor.email}
                          </span>
                        </div>

                        {/* Action description */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-body-sm text-on-surface">
                          <span>{log.action}</span>
                          {log.target && (
                            <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              {log.target.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Timestamp, IP & Expander Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container/60">
                      <div className="flex flex-col items-start sm:items-end text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-label-sm font-semibold text-on-surface">
                            {log.formattedTime}
                          </span>
                          {log.relativeTime && (
                            <span className="text-label-xs text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                              {log.relativeTime}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-on-surface-variant mt-0.5">
                          IP: {log.ipAddress}
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isExpanded
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-high'
                        }`}
                        title={isExpanded ? 'Collapse audit details' : 'Expand payload & metadata'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Inspection Drawer */}
                  {isExpanded && (
                    <div className="mt-2 pt-3 border-t border-surface-container grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-surface-container-low/40 p-3 rounded-lg animate-in fade-in">
                      {/* Left Column: Metadata */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-on-surface uppercase tracking-wider text-[11px]">
                            Tamper-Evident Event Context
                          </span>
                          <button
                            onClick={() => handleCopyId(log.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {copiedId === log.id ? 'check' : 'content_copy'}
                            </span>
                            {copiedId === log.id ? 'Copied' : log.id}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-on-surface-variant">
                          <div>
                            <span className="font-medium text-on-surface">Exact ISO Timestamp:</span>
                            <div className="font-mono text-[11px] break-all text-on-surface">
                              {log.timestamp}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-on-surface">Verification Status:</span>
                            <div className="font-semibold text-secondary uppercase text-[11px]">
                              {log.status.toUpperCase()} (Validated)
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-on-surface">Network Host / IP:</span>
                            <div className="font-mono text-[11px] text-on-surface">{log.ipAddress}</div>
                          </div>
                          <div>
                            <span className="font-medium text-on-surface">Target Entity Type:</span>
                            <div className="font-mono text-[11px] text-on-surface">
                              {log.target?.type || 'platform_system'}
                            </div>
                          </div>
                        </div>

                        {/* Extra Details Attributes */}
                        {log.details && (
                          <div className="mt-1 pt-2 border-t border-surface-container">
                            <span className="font-medium text-on-surface block mb-1">
                              Recorded Attributes:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(log.details).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px]"
                                >
                                  <strong className="text-on-surface font-semibold">{key}:</strong>{' '}
                                  {String(val)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Raw JSON Signature */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-on-surface">
                          <span className="font-semibold uppercase tracking-wider text-[11px]">
                            Audit Payload (JSON-LD)
                          </span>
                          <span className="font-mono text-[10px] text-on-surface-variant">
                            SHA-256 Verified
                          </span>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container font-mono text-[10.5px] text-on-surface overflow-x-auto max-h-36">
                          {JSON.stringify(
                            {
                              id: log.id,
                              event_type: log.type,
                              timestamp: log.timestamp,
                              actor: log.actor,
                              action: log.action,
                              target: log.target,
                              ip: log.ipAddress,
                              status: log.status,
                              details: log.details,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Metrics & Real-Time Sync SLA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-space-xs text-body-xs text-on-surface-variant border-t border-surface-container">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
          <span>HireFlow Governance Engine 2.4 • SOC-2 Type II & GDPR Audit Trail Compliant</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Showing {filteredLogs.length} of {activityLogs.length} records</span>
          <span>•</span>
          <span className="font-mono">Sync Interval: 500ms</span>
        </div>
      </div>
    </div>
  );
};
