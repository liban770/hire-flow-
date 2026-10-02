import React, { useState } from 'react';
import { User, ViewType } from '../types';
import { HireFlowLogo } from './HireFlowLogo';

interface PendingApprovalViewProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: ViewType) => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  onLogout,
}) => {
  const [showSqlExport, setShowSqlExport] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate T-SQL statement for this user to run in SSMS on DESKTOP-PK86AT
  const userSql = `-- Run this in SQL Server Management Studio (SSMS) on DESKTOP-PK86AT
USE [HireFlowDB];
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = '${user.email}')
BEGIN
    INSERT INTO [dbo].[Users] (
        [Id], [Name], [Email], [PasswordHash], [Role], [RegistrationType], 
        [Status], [Verified], [Company], [Title], [Avatar], [CreatedAt], [UpdatedAt]
    )
    VALUES (
        '${user.id}',
        N'${user.name.replace(/'/g, "''")}',
        N'${user.email.replace(/'/g, "''")}',
        N'password123',
        '${user.role}',
        '${user.registrationType || 'candidate'}',
        'pending_approval',
        0,
        ${user.companyName ? `N'${user.companyName.replace(/'/g, "''")}'` : 'NULL'},
        ${user.title ? `N'${user.title.replace(/'/g, "''")}'` : 'NULL'},
        ${user.avatar ? `N'${user.avatar.replace(/'/g, "''")}'` : 'NULL'},
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
    PRINT 'User successfully inserted into Microsoft SQL Server!';
END
ELSE
BEGIN
    PRINT 'User already exists in Microsoft SQL Server.';
END
GO

SELECT * FROM [dbo].[Users] WHERE [Email] = '${user.email}';
GO`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(userSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between font-['Inter'] relative">
      {/* Ambient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest/80 backdrop-blur-md">
        <HireFlowLogo size="md" />
        <button
          onClick={onLogout}
          className="text-xs font-semibold text-error hover:bg-error-container/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            {/* Hourglass Icon with Pulsing Halo */}
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[36px]">pending_actions</span>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-tertiary rounded-full ring-2 ring-surface-container-lowest animate-ping"></span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-[14px]">shield_lock</span>
              Awaiting Platform Administrator Approval
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Account Verification in Progress
            </h1>
            <p className="text-xs text-on-surface-variant mt-2 max-w-md leading-relaxed">
              Welcome, <strong className="text-on-surface">{user.name}</strong>. Your account has been submitted to the compliance review queue. Only certified Platform Administrators hold approval authority.
            </p>
          </div>

          {/* Dossier Card */}
          <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-container">
              <span className="text-on-surface-variant">Account Category:</span>
              <span className="font-semibold text-primary capitalize">
                {user.registrationType === 'company' ? 'Enterprise Employer' : 'Professional Candidate'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-container">
              <span className="text-on-surface-variant">Submitted Identifier:</span>
              <span className="font-semibold text-on-surface font-mono">{user.email}</span>
            </div>
            {user.companyName && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Company Entity:</span>
                <span className="font-semibold text-on-surface">{user.companyName}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Queue Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed/40 text-tertiary font-semibold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                In Review (Strict Admin Authority)
              </span>
            </div>
          </div>

          {/* Strict Security Policy Callout */}
          <div className="mt-5 p-3.5 rounded-xl bg-surface-container-high/60 border border-surface-container flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
              security
            </span>
            <div className="text-left text-xs">
              <span className="font-semibold text-on-surface">Strict Role Separation Enforced</span>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                Standard users cannot approve themselves or elevate roles. Platform Administrator login credentials (<span className="font-mono text-primary font-bold">admin.m_vance@hireflow.io</span>) are required to grant access.
              </p>
            </div>
          </div>

          {/* Microsoft SQL Server Sync / Export Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-primary-fixed/20 border border-primary-fixed-dim/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">database</span>
                <span className="text-xs font-semibold text-on-surface">Microsoft SQL Server (DESKTOP-PK86AT)</span>
              </div>
              <button
                onClick={() => setShowSqlExport(!showSqlExport)}
                className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
              >
                {showSqlExport ? 'Hide SQL' : 'View SQL for SSMS'}
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-snug">
              Because this app is currently hosted on the cloud, it cannot directly reach your local desktop's port 1433 over the internet. You can copy the SQL insert query below to insert this user into your SQL Server table instantly!
            </p>

            {showSqlExport && (
              <div className="mt-2 space-y-2">
                <pre className="p-3 rounded-lg bg-surface-container-lowest text-[10px] text-on-surface font-mono overflow-x-auto max-h-40 border border-surface-container">
                  {userSql}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copied to Clipboard!' : 'Copy SQL Script for SSMS'}
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-between pt-2">
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Check Approval Status
            </button>
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              Sign out & return to Login
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-on-surface-variant border-t border-surface-container">
        © 2026 HireFlow Systems. Verified Talent Governance Protocol
      </footer>
    </div>
  );
};
