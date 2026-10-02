import React, { useState } from 'react';
import {
  User,
  VerificationQueueItem,
  ModerationJobItem,
  AuditLogItem,
  ActivityLogEntry,
  ActivityEventType,
} from '../types';
import {
  VERIFICATION_QUEUE,
  MODERATION_JOBS,
  AUDIT_LOGS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/mockData';
import { ActivityLogComponent } from './ActivityLogComponent';

interface AdminVerificationViewProps {
  userList?: User[];
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
  activityLogs?: ActivityLogEntry[];
  onClearActivityLogs?: () => void;
  onAddTestActivity?: (type: ActivityEventType) => void;
}

export const AdminVerificationView: React.FC<AdminVerificationViewProps> = ({
  userList = [],
  onApproveUser,
  onRejectUser,
  activityLogs = INITIAL_ACTIVITY_LOGS,
  onClearActivityLogs,
  onAddTestActivity,
}) => {
  const [adminStageTab, setAdminStageTab] = useState<'overview' | 'activity_logs' | 'approvals' | 'sql_server'>('overview');
  const [copiedSql, setCopiedSql] = useState(false);
  const [queueItems, setQueueItems] = useState<VerificationQueueItem[]>(VERIFICATION_QUEUE);
  const [moderationJobs, setModerationJobs] = useState<ModerationJobItem[]>(MODERATION_JOBS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(AUDIT_LOGS);
  const [filterQueueTab, setFilterQueueTab] = useState<'All' | 'Needs Docs' | 'Verified'>('All');
  const [userApprovalFilter, setUserApprovalFilter] = useState<'all' | 'candidate' | 'company'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRunning, setAuditRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingUsers = userList.filter((u) => u.status === 'pending_approval');
  const filteredPendingUsers = pendingUsers.filter((u) => {
    if (userApprovalFilter === 'candidate') return u.registrationType === 'candidate';
    if (userApprovalFilter === 'company') return u.registrationType === 'company';
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generateAllUsersSql = () => {
    return `-- ============================================================================
-- Sync All Registered Users into Microsoft SQL Server (DESKTOP-PK86AT)
-- Database: [HireFlowDB] | Table: [dbo].[Users]
-- Generated on: ${new Date().toISOString()}
-- ============================================================================
USE [HireFlowDB];
GO

${userList.map((u) => `
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = '${u.email.replace(/'/g, "''")}')
BEGIN
    INSERT INTO [dbo].[Users] (
        [Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], 
        [Status], [Verified], [Company], [Title], [Avatar], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        '${u.id}',
        N'${u.name.replace(/'/g, "''")}',
        N'${u.email.replace(/'/g, "''")}',
        N'password123',
        '${u.role}',
        '${u.registrationType || 'candidate'}',
        '${u.status}',
        ${u.verified ? 1 : 0},
        ${u.companyName ? `N'${u.companyName.replace(/'/g, "''")}'` : 'NULL'},
        ${u.title ? `N'${u.title.replace(/'/g, "''")}'` : 'NULL'},
        ${u.avatar ? `N'${u.avatar.replace(/'/g, "''")}'` : 'NULL'},
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
    PRINT 'Inserted: ${u.email.replace(/'/g, "''")}';
END
ELSE
BEGIN
    UPDATE [dbo].[Users]
    SET [Status] = '${u.status}',
        [Verified] = ${u.verified ? 1 : 0},
        [UpdatedAt] = SYSUTCDATETIME()
    WHERE [Email] = '${u.email.replace(/'/g, "''")}';
    PRINT 'Updated: ${u.email.replace(/'/g, "''")}';
END
GO`).join('\n')}

-- Verification Query: Check all users in your table
SELECT [Id], [Name], [Email], [Role], [RegistrationType], [Status], [Verified], [CreatedAt] 
FROM [dbo].[Users]
ORDER BY [CreatedAt] DESC;
GO`;
  };

  const handleVerifyCompany = (id: string, name: string) => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Document Verified', isElite: true } : item
      )
    );
    showToast(`Verification Seal & Gold Status granted to ${name}`);
  };

  const handleApproveJob = (id: string, title: string) => {
    setModerationJobs((prev) => prev.filter((j) => j.id !== id));
    showToast(`Approved & published: "${title}" to global marketplace`);
  };

  const handleSuspendJob = (id: string, company: string) => {
    setModerationJobs((prev) => prev.filter((j) => j.id !== id));
    showToast(`Domain suspended & quarantined: ${company}`);
  };

  const handleRunSecurityAudit = () => {
    setAuditRunning(true);
    setTimeout(() => {
      setAuditRunning(false);
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        user: 'admin.m_vance',
        action: 'completed scheduled ecosystem integrity sweep with zero anomalies across',
        target: '48,250 verified accounts',
        ip: '198.51.100.44',
        category: 'Identity KYC',
        dotColor: 'primary',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      showToast('Ecosystem Security Audit Completed: 100% Integrity Verified');
    }, 1200);
  };

  const filteredQueue = queueItems.filter((item) => {
    if (filterQueueTab === 'Needs Docs') return item.missingDocs;
    if (filterQueueTab === 'Verified') return item.status === 'Document Verified';
    return true;
  });

  const filteredAudit = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.user.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.category.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Governance Stage: Title & Atmospheric Stats Meta */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container font-medium text-on-surface">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Live Admin Governance Node 04
            </span>
            <span>•</span>
            <span className="font-mono text-body-sm">v2.4.9-sec</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            HireFlow Administration & Platform Verification
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Monitor ecosystem health, moderate job postings, verify employers, and manage platform safety.
          </p>
        </div>

        {/* Quick Operations Toolbar */}
        <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
          <button
            onClick={() => setAdminStageTab(adminStageTab === 'activity_logs' ? 'overview' : 'activity_logs')}
            className={`inline-flex items-center gap-2 h-10 px-space-md rounded-lg shadow-xs transition-colors border cursor-pointer font-label-lg text-label-lg ${
              adminStageTab === 'activity_logs'
                ? 'bg-primary text-on-primary border-primary font-semibold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-surface-container'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">manage_search</span>
            Activity Stream
            <span className={`px-1.5 py-0.2 rounded-full text-xs font-mono font-bold ${
              adminStageTab === 'activity_logs'
                ? 'bg-on-primary/20 text-on-primary'
                : 'bg-primary/10 text-primary'
            }`}>
              {activityLogs.length}
            </span>
          </button>

          <button
            onClick={() => {
              showToast('Compliance audit packet exported successfully (CSV / SOC2 format)');
            }}
            className="inline-flex items-center gap-2 h-10 px-space-md bg-surface-container-lowest text-on-surface font-label-lg text-label-lg rounded-lg shadow-xs hover:bg-surface-container transition-colors border border-surface-container cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Log
          </button>
          <button
            onClick={handleRunSecurityAudit}
            disabled={auditRunning}
            className="inline-flex items-center gap-2 h-10 px-space-md bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg shadow-xs hover:bg-primary transition-all cursor-pointer"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${auditRunning ? 'animate-spin' : ''}`}
            >
              {auditRunning ? 'sync' : 'shield'}
            </span>
            {auditRunning ? 'Running Audit...' : 'Run Security Audit'}
          </button>
        </div>
      </div>

      {/* Admin Governance Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminStageTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label-md font-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
            adminStageTab === 'overview'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Ecosystem Overview & Queues
        </button>

        <button
          onClick={() => setAdminStageTab('activity_logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label-md font-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
            adminStageTab === 'activity_logs'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">manage_search</span>
          Live Activity & Audit Logs
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-secondary-container text-on-secondary-container">
            {activityLogs.length} events
          </span>
        </button>

        <button
          onClick={() => setAdminStageTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label-md font-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
            adminStageTab === 'approvals'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
          Account Approvals Queue
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-tertiary text-on-tertiary">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminStageTab('sql_server')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-label-md font-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
            adminStageTab === 'sql_server'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">database</span>
          SQL Server Sync (DESKTOP-PK86AT)
        </button>
      </div>

      {/* SQL Server Management Studio Direct Sync Tab */}
      {adminStageTab === 'sql_server' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[28px]">database</span>
                  <h2 className="text-xl font-bold text-on-surface">Microsoft SQL Server Sync & Export</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-mono text-xs font-bold">
                    DESKTOP-PK86AT
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                  Why didn't newly created accounts appear inside your SQL Server table automatically? 
                  This preview app is currently running in a <strong>Google Cloud Run cloud container</strong>. 
                  A public cloud server cannot reach through your home/office router into your personal Windows PC (<code className="text-primary font-semibold">DESKTOP-PK86AT:1433</code>) without a tunnel.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const sql = generateAllUsersSql();
                    navigator.clipboard.writeText(sql);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 hover:bg-primary-container transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copiedSql ? 'check' : 'content_copy'}
                  </span>
                  {copiedSql ? 'Copied All Users SQL!' : 'Copy Users T-SQL for SSMS'}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1 */}
            <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-2">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  Option 1: 1-Click Sync into SSMS (Immediate)
                </div>
                <h3 className="text-sm font-bold text-on-surface mb-2">Run Generated T-SQL in SSMS</h3>
                <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Click <strong>"Copy Users T-SQL for SSMS"</strong> above.</li>
                  <li>Open <strong>SQL Server Management Studio (SSMS)</strong> on <code className="font-semibold text-on-surface">DESKTOP-PK86AT</code>.</li>
                  <li>Click <strong>New Query</strong>, paste the script, and press <strong className="text-primary">F5 (Execute)</strong>.</li>
                  <li>Every user registered in the app will instantly exist in your <code className="font-semibold text-on-surface">[HireFlowDB].[dbo].[Users]</code> table!</li>
                </ol>
              </div>
            </div>

            {/* Option 2 */}
            <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-secondary font-semibold text-xs mb-2">
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                  Option 2: Run HireFlow on your PC (Live Direct Socket)
                </div>
                <h3 className="text-sm font-bold text-on-surface mb-2">Run Locally on DESKTOP-PK86AT</h3>
                <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">
                  When you run this project directly on your Windows PC, the Express server connects to <code className="font-semibold text-on-surface">localhost:1433</code> directly. Every click in the browser writes to SQL Server in real time!
                </p>
                <div className="p-2.5 rounded-lg bg-surface-container-high/60 font-mono text-[11px] text-on-surface">
                  npm install && npm run dev
                </div>
              </div>
            </div>
          </div>

          {/* Generated T-SQL Preview Box */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-surface-container">
              <div>
                <span className="text-xs font-bold text-on-surface">Generated T-SQL Script for Registered Users</span>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Includes all {userList.length} accounts currently in memory and local storage.
                </p>
              </div>
              <button
                onClick={() => {
                  const sql = generateAllUsersSql();
                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3000);
                }}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                {copiedSql ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-surface-container-low font-mono text-[11px] text-on-surface max-h-96 overflow-y-auto overflow-x-auto leading-relaxed border border-surface-container">
              {generateAllUsersSql()}
            </pre>
          </div>
        </div>
      )}

      {/* Dedicated Activity Logs Tab */}
      {adminStageTab === 'activity_logs' && (
        <ActivityLogComponent
          activityLogs={activityLogs}
          onClearLogs={onClearActivityLogs}
          onAddTestActivity={onAddTestActivity}
          title="Administrative Activity & Audit Trail"
          subtitle="Real-time chronological tracker for user logins, administrative account approvals, and verified job postings with immutable timestamps."
        />
      )}

      {/* Overview & Queues Tab */}
      {adminStageTab !== 'activity_logs' && adminStageTab !== 'sql_server' && (
        <>
          {/* KPI Ecosystem Metrics Array */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {/* Metric 1: Total Users */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">groups</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">48,250</span>
              <span className="inline-flex items-center text-label-sm font-label-sm text-secondary bg-secondary-container/60 px-1.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[12px]">arrow_upward</span>12.4%
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">MoM ecosystem expansion</span>
          </div>
          <div className="mt-3 w-full bg-surface-container rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Metric 2: Active Job Postings */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Active Jobs
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">work_outline</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">3,420</span>
              <span className="inline-flex items-center text-label-sm font-label-sm text-secondary bg-secondary-container/60 px-1.5 py-0.5 rounded-full">
                94% fill
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">182 roles published today</span>
          </div>
          <div className="mt-3 w-full bg-surface-container rounded-full h-1">
            <div className="bg-secondary h-1 rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        {/* Metric 3: Verified Companies */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Verified Co.
            </span>
            <div className="w-7 h-7 rounded-lg bg-tertiary-fixed/40 flex items-center justify-center text-tertiary">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">1,890</span>
              <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-tertiary bg-tertiary-fixed/30 px-1.5 py-0.5 rounded-full">
                <span
                  className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  stars
                </span>
                Elite
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Gold Badge credentialed</span>
          </div>
          <div className="mt-3 w-full bg-surface-container rounded-full h-1">
            <div className="bg-tertiary-fixed-dim h-1 rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* Metric 4: Pending Verifications */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Pending Audit
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">14</span>
              <span className="inline-flex items-center text-label-sm font-label-sm text-error bg-error-container/60 px-1.5 py-0.5 rounded-full">
                Action Req.
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Avg review SLA: 3.2 hrs</span>
          </div>
          <div className="mt-3 w-full bg-surface-container rounded-full h-1">
            <div className="bg-error h-1 rounded-full" style={{ width: '35%' }}></div>
          </div>
        </div>

        {/* Metric 5: Flagged Applications / Fraud Alert */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Fraud Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[16px]">gshield</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">2</span>
              <span className="inline-flex items-center text-label-sm font-label-sm text-secondary bg-secondary-container/60 px-1.5 py-0.5 rounded-full">
                Low Risk
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">99.98% clean traffic</span>
          </div>
          <div className="mt-3 w-full bg-surface-container rounded-full h-1">
            <div className="bg-secondary-fixed-dim h-1 rounded-full" style={{ width: '8%' }}></div>
          </div>
        </div>
      </div>

      {/* Primary Governance Two-Column Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Left Column: Pending Employer Verifications Queue & QA Feed (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-md">
          {/* User & Company Account Approvals Section */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container/60 p-space-lg flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                      Account Approvals & Identity Verification
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-label-sm font-semibold">
                      {pendingUsers.length} Pending Approval
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Review and authorize new candidate and employer registrations before marketplace activation.
                  </p>
                </div>
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                {(['all', 'candidate', 'company'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setUserApprovalFilter(tab)}
                    className={`px-3 py-1 text-label-sm font-label-sm rounded transition-colors cursor-pointer capitalize ${
                      userApprovalFilter === tab
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    {tab === 'all' ? 'All Registrations' : tab === 'candidate' ? 'Candidates' : 'Companies'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pending Users List */}
            {filteredPendingUsers.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface-container-low/40 border border-surface-container/60">
                <span className="material-symbols-outlined text-3xl text-secondary mb-1">task_alt</span>
                <p className="font-semibold text-sm text-on-surface">All Registration Queues Cleared</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  No pending candidate or company registrations require administrative approval right now.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPendingUsers.map((pUser) => {
                  const isComp = pUser.registrationType === 'company';
                  return (
                    <div
                      key={pUser.id}
                      className="p-4 rounded-xl bg-surface-container-low/40 border border-surface-container/60 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm ${
                            isComp
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-primary-container text-on-primary'
                          }`}
                        >
                          {isComp ? (
                            <span className="material-symbols-outlined text-[20px]">domain</span>
                          ) : (
                            pUser.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                              {isComp ? pUser.companyName || pUser.name : pUser.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                isComp
                                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                                  : 'bg-surface-container-highest text-on-surface'
                              }`}
                            >
                              {isComp ? 'Employer / Company' : 'Individual Talent'}
                            </span>
                            <span className="text-xs text-outline font-mono">• {pUser.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                            <span className="font-medium text-primary">{pUser.email}</span>
                            {pUser.title && <span>• {pUser.title}</span>}
                          </div>

                          {pUser.dossierSummary && (
                            <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2">
                              {pUser.dossierSummary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => {
                            if (onRejectUser) onRejectUser(pUser.id);
                            showToast(`Registration rejected for ${pUser.name}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant text-xs font-semibold transition-colors cursor-pointer"
                          type="button"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            if (onApproveUser) onApproveUser(pUser.id);
                            showToast(`Account Approved! ${pUser.name} now has full network access.`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Approve Account
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Employer Verification Queue */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container/60 p-space-lg flex flex-col gap-space-md">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">domain_verification</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                      Employer Verification Queue
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-label-sm">
                      {filteredQueue.length} Queue items
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Validate corporate legal entities, tax numbers, and verified badge grant rights.
                  </p>
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                {(['All', 'Needs Docs', 'Verified'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterQueueTab(tab)}
                    className={`px-3 py-1 text-label-sm font-label-sm rounded transition-colors cursor-pointer ${
                      filterQueueTab === tab
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    {tab === 'All' ? 'All Pending' : tab === 'Needs Docs' ? 'Needs Docs' : 'Verified (Review)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Table */}
            <div className="overflow-x-auto -mx-space-lg px-space-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-lg font-semibold">Company Entity</th>
                    <th className="py-3 px-4 font-semibold">Official Domain / Reg</th>
                    <th className="py-3 px-4 font-semibold">Uploaded Dossier</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 text-right rounded-r-lg font-semibold">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                  {filteredQueue.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-container-low/60 transition-colors group ${
                        item.isElite ? 'bg-surface-container-low/30' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-headline-sm text-headline-sm font-bold ${
                              item.isElite
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container-high text-primary'
                            }`}
                          >
                            {item.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                                {item.companyName}
                              </span>
                              {item.isElite && (
                                <span
                                  className="material-symbols-outlined text-tertiary text-[16px]"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                  title="Eligible for Gold Verified Badge"
                                >
                                  verified
                                </span>
                              )}
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                              {item.businessType}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-label-md text-label-md text-primary hover:underline cursor-pointer">
                            <span className="material-symbols-outlined text-[14px]">link</span>
                            {item.domain}
                          </div>
                          <span className="font-mono text-label-sm text-on-surface-variant">
                            Reg #{item.regNumber}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.dossierFiles.map((file, fIdx) => (
                            <span
                              key={fIdx}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-label-sm font-label-sm ${
                                item.missingDocs
                                  ? 'bg-error-container/40 text-on-error-container font-semibold'
                                  : file.verified
                                  ? 'bg-secondary-container/50 text-secondary font-semibold'
                                  : 'bg-surface-container text-on-surface'
                              }`}
                              title={file.type}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {item.missingDocs
                                  ? 'warning'
                                  : file.verified
                                  ? 'task_alt'
                                  : 'description'}
                              </span>
                              {file.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                            item.status === 'Document Verified'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : item.missingDocs
                              ? 'bg-surface-variant text-on-surface-variant'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Document Verified'
                                ? 'bg-primary'
                                : item.missingDocs
                                ? 'bg-error'
                                : 'bg-outline'
                            }`}
                          ></span>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {item.isElite ? (
                            <button
                              onClick={() => handleVerifyCompany(item.id, item.companyName)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-label-sm font-label-sm shadow-xs transition-all font-semibold cursor-pointer"
                              type="button"
                            >
                              <span
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                stars
                              </span>
                              Approve & Grant Badge
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => showToast(`Requested additional W-9 / Tax documentation from ${item.companyName}`)}
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                title="Request Additional Docs"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">contact_support</span>
                              </button>
                              <button
                                onClick={() => {
                                  setQueueItems((prev) => prev.filter((q) => q.id !== item.id));
                                  showToast(`Rejected submission: ${item.companyName}`);
                                }}
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-error-container text-on-surface-variant hover:text-on-error-container transition-colors cursor-pointer"
                                title="Reject Application"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                              <button
                                onClick={() => handleVerifyCompany(item.id, item.companyName)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-sm font-label-sm hover:bg-primary-container transition-colors shadow-xs font-semibold cursor-pointer"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[14px]">check</span>Verify
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs text-body-sm text-on-surface-variant border-t border-surface-container">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Automated KYC Check: 100% Identity Integrity
              </div>
              <div className="flex items-center gap-1">
                <span className="font-label-md text-label-md">
                  Showing {filteredQueue.length} of 14 queue entries
                </span>
                <button
                  onClick={() => showToast('Opening complete verification registry')}
                  className="ml-2 font-label-md text-label-md text-primary font-semibold hover:underline cursor-pointer"
                  type="button"
                >
                  View All Verifications →
                </button>
              </div>
            </div>
          </div>

          {/* Job Moderation & Quality Assurance Feed */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container/60 p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">policy</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                    Job Moderation & Quality Assurance Feed
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Live postings passing algorithmic safety filters; flagged for rapid human clearance.
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                Auto-Scorer Active
              </span>
            </div>

            {/* Job Cards Feed List */}
            <div className="flex flex-col gap-space-sm">
              {moderationJobs.map((job) => {
                const isFlagged = job.status === 'flagged';
                return (
                  <div
                    key={job.id}
                    className={`rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-colors border ${
                      isFlagged
                        ? 'bg-error-container/20 border-error-container/50 hover:bg-error-container/30'
                        : 'bg-surface-container-low/40 border-surface-container/60 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start gap-space-md min-w-0">
                      <div
                        className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center font-bold font-headline-sm text-headline-sm ${
                          isFlagged
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-highest text-primary'
                        }`}
                      >
                        {isFlagged ? (
                          <span className="material-symbols-outlined text-[24px]">flag</span>
                        ) : (
                          job.initials
                        )}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {job.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-mono ${
                              isFlagged
                                ? 'bg-error-container text-on-error-container font-semibold'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {job.salary}
                          </span>
                          {job.verifiedEmployer && (
                            <span className="px-2 py-0.5 rounded bg-secondary-container/50 text-secondary font-label-sm text-label-sm font-semibold">
                              Verified Employer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant flex-wrap">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.postedTime}</span>
                          <span>•</span>
                          {isFlagged ? (
                            <span className="text-error font-medium inline-flex items-center">
                              <span className="material-symbols-outlined text-[14px] mr-1">report</span>
                              Risk Score: High ({job.riskScore})
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-secondary font-medium">
                              <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>
                              Quality Score {job.qualityScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {isFlagged ? (
                        <>
                          <button
                            onClick={() => handleSuspendJob(job.id, job.company)}
                            className="px-3.5 py-1.5 rounded-lg bg-error hover:bg-on-error-container text-on-error font-label-md text-label-md transition-colors shadow-xs font-semibold cursor-pointer"
                            type="button"
                          >
                            Suspend & Ban Domain
                          </button>
                          <button
                            onClick={() => showToast(`Initiated security inquiry with poster from ${job.company}`)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                            type="button"
                          >
                            Contact Poster
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => showToast(`Inspection dossier opened for: ${job.title}`)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors cursor-pointer"
                            type="button"
                          >
                            Inspect Details
                          </button>
                          <button
                            onClick={() => showToast(`Post flagged for secondary human audit: ${job.title}`)}
                            className="px-3 py-1.5 rounded-lg bg-error-container/40 hover:bg-error-container text-on-error-container font-label-md text-label-md transition-colors cursor-pointer"
                            title="Flag role for human review"
                            type="button"
                          >
                            Flag
                          </button>
                          <button
                            onClick={() => handleApproveJob(job.id, job.title)}
                            className="px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-xs font-semibold cursor-pointer"
                            type="button"
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Verification Standards & Platform Activity Analytics (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          {/* Activity Trends & Funnel Chart Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container/60 p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Weekly Pipeline Activity
                  </h2>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Applications vs. Placed Hires
                  </span>
                </div>
              </div>
              <span className="font-mono text-label-sm text-secondary font-semibold bg-secondary-container/50 px-2 py-0.5 rounded">
                Wk 42
              </span>
            </div>

            {/* Inline SVG Visualization Chart */}
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-primary"></span>
                  <span>Applications (k)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-secondary-fixed"></span>
                  <span>Final Placements</span>
                </div>
              </div>

              {/* Weekly Chart Area */}
              <div className="relative w-full h-44 bg-surface-container-low/40 rounded-lg p-3 flex items-end border border-surface-container">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 320 120">
                  {/* Grid lines */}
                  <line stroke="#d9e6dd" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="20" y2="20"></line>
                  <line stroke="#d9e6dd" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="60" y2="60"></line>
                  <line stroke="#d9e6dd" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="100" y2="100"></line>

                  {/* Application Trend Polyline (Emerald Primary) */}
                  <path
                    d="M 10 90 Q 55 45, 110 50 T 210 28 T 310 15"
                    fill="none"
                    stroke="#005f3a"
                    strokeLinecap="round"
                    strokeWidth="3"
                  ></path>

                  {/* Placements Filled Trend Area */}
                  <path
                    d="M 10 110 Q 55 95, 110 88 T 210 65 T 310 40 L 310 120 L 10 120 Z"
                    fill="#a8f3c5"
                    fillOpacity="0.4"
                  ></path>
                  <path
                    d="M 10 110 Q 55 95, 110 88 T 210 65 T 310 40"
                    fill="none"
                    stroke="#206b47"
                    strokeWidth="2"
                  ></path>

                  {/* High Watermark Points */}
                  <circle cx="210" cy="28" fill="#005f3a" r="4"></circle>
                  <circle cx="310" cy="15" fill="#005f3a" r="4"></circle>
                  <circle cx="310" cy="40" fill="#206b47" r="3.5"></circle>
                </svg>
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between font-mono text-label-sm text-on-surface-variant px-1 pt-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Weekly Summary Metrics Table */}
            <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">New Ingestion</span>
                <span className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  14,892
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-medium">+8.1% vs prev week</span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col border border-surface-container/60">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Offers Extended</span>
                <span className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  1,248
                </span>
                <span className="font-label-sm text-label-sm text-primary font-medium">91.4% acceptance</span>
              </div>
            </div>
          </div>

          {/* Trust & Verification Protocol Guide */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container/60 p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Tier 1 Verification Protocol
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Automated validation criteria
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div className="flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low/50 border border-surface-container/40">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Government Registry Match
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    State chamber business identity validated via official API.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low/50 border border-surface-container/40">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">mark_email_read</span>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    DKIM/SPF Domain Auth
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Recruiter emails must resolve to authenticated root corporate MX records.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-space-sm rounded-lg bg-surface-container-low/50 border border-surface-container/40">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">award_star</span>
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                    Gold Verified Seal
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Grants high search placement priority and verified talent access.
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Health Progress */}
            <div className="pt-space-xs flex flex-col gap-1.5">
              <div className="flex justify-between text-label-sm font-label-sm">
                <span className="text-on-surface-variant font-medium">Platform Integrity Health</span>
                <span className="text-primary font-semibold font-mono">99.4%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '99.4%' }}></div>
              </div>
            </div>
          </div>

          {/* Human Moderation SLA Status */}
          <div className="bg-primary-container text-on-primary rounded-xl p-space-lg flex flex-col justify-between relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-primary-container font-semibold">
                Moderation Queue SLA
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-on-primary-container animate-ping"></span>
            </div>
            <div className="my-4 flex flex-col">
              <span className="font-display-lg text-display-lg font-bold tracking-tight">18 min</span>
              <span className="font-body-sm text-body-sm text-on-primary-container mt-1">
                Average resolution time for reported postings
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-on-primary/10 text-label-sm font-label-sm">
              <span>Active Reviewers on Duty: 8</span>
              <button
                onClick={() => showToast('Opening Shift Scheduling Roster')}
                className="font-semibold underline cursor-pointer hover:text-on-primary-container"
              >
                Shift Schedule →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time System Activity & Audit Trail Component */}
      <ActivityLogComponent
        activityLogs={activityLogs}
        onClearLogs={onClearActivityLogs}
        onAddTestActivity={onAddTestActivity}
        title="Real-Time System Governance & Activity Trail"
        subtitle="Immutable administrative action recording compliant with SOC2 and GDPR audit parameters. Tracks user logins, account approvals, and job postings with timestamps."
      />
        </>
      )}
    </div>
  );
};
