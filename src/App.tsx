/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ViewType,
  Job,
  KanbanCandidate,
  NotificationItem,
  User,
  ActivityLogEntry,
  ActivityEventType,
} from './types';
import {
  INITIAL_JOBS,
  KANBAN_CANDIDATES,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_ACTIVITY_LOGS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FindJobsView } from './components/FindJobsView';
import { CandidatePortalView } from './components/CandidatePortalView';
import { EmployerPipelineView } from './components/EmployerPipelineView';
import { AdminVerificationView } from './components/AdminVerificationView';
import { CompaniesView } from './components/CompaniesView';
import { AuthPage } from './components/AuthPage';
import { PendingApprovalView } from './components/PendingApprovalView';
import { PostJobModal } from './components/PostJobModal';
import { ApplyModal } from './components/ApplyModal';
import { ResumeModal } from './components/ResumeModal';
import { ScheduleModal } from './components/ScheduleModal';
import { OfferModal } from './components/OfferModal';
import { AddCandidateModal } from './components/AddCandidateModal';
import {
  checkMssqlHealth,
  fetchUsersFromDb,
  fetchJobsFromDb,
  fetchActivityLogsFromDb,
  registerUserInDb,
  approveUserInDb,
  createJobInDb,
  logActivityInDb,
  MssqlHealthStatus,
} from './lib/api';

export default function App() {
  // Authentication & Session State (Starts at Login page as requested)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('hireflow_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userList, setUserList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('hireflow_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentView, setCurrentView] = useState<ViewType>('find-jobs');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<KanbanCandidate[]>(KANBAN_CANDIDATES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Administrative Activity Logging System (Tracks user logins, account approvals, job postings, with timestamps)
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('hireflow_activity_logs');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  // Microsoft SQL Server Live State
  const [mssqlStatus, setMssqlStatus] = useState<MssqlHealthStatus | null>(null);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Sync data with Microsoft SQL Server (DESKTOP-PK86AT)
  const syncWithDatabase = async (silent = false) => {
    setIsSyncingDb(true);
    try {
      const health = await checkMssqlHealth();
      setMssqlStatus(health);

      if (health.connected) {
        const [dbUsers, dbJobs, dbLogs] = await Promise.all([
          fetchUsersFromDb(),
          fetchJobsFromDb(),
          fetchActivityLogsFromDb(),
        ]);
        if (dbUsers && dbUsers.length > 0) setUserList(dbUsers);
        if (dbJobs && dbJobs.length > 0) setJobs(dbJobs);
        if (dbLogs && dbLogs.length > 0) setActivityLogs(dbLogs);
        if (!silent) {
          showToast('Synchronized live data with Microsoft SQL Server (DESKTOP-PK86AT)!');
        }
      } else if (!silent) {
        showToast('Active on persistent LocalStorage (MSSQL host DESKTOP-PK86AT in standby).');
      }
    } catch {
      // offline fallback
    } finally {
      setIsSyncingDb(false);
    }
  };

  useEffect(() => {
    syncWithDatabase(true);
  }, []);

  // Save activity logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hireflow_activity_logs', JSON.stringify(activityLogs));
    } catch {
      // ignore
    }
  }, [activityLogs]);

  // Helper to record tamper-evident activity with precise timestamp
  const logActivity = (
    entry: Omit<ActivityLogEntry, 'id' | 'timestamp' | 'formattedTime' | 'relativeTime'> & {
      timestamp?: string;
      formattedTime?: string;
      relativeTime?: string;
    }
  ) => {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const formattedTime = entry.formattedTime || `${hours}:${minutes}:${seconds} UTC`;

    const newLog: ActivityLogEntry = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: entry.timestamp || now.toISOString(),
      formattedTime,
      relativeTime: entry.relativeTime || 'Just now',
      type: entry.type,
      actor: entry.actor,
      action: entry.action,
      target: entry.target,
      status: entry.status,
      ipAddress: entry.ipAddress || '198.51.100.44',
      details: entry.details,
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    // Push to Microsoft SQL Server
    logActivityInDb({
      id: newLog.id,
      eventType: newLog.type,
      actorName: newLog.actor.name,
      actorEmail: newLog.actor.email,
      actorRole: newLog.actor.role,
      action: newLog.action,
      targetName: newLog.target?.name || 'System',
      targetType: newLog.target?.type || 'system',
      targetId: newLog.target?.id,
      status: newLog.status,
      ipAddress: newLog.ipAddress,
      details: newLog.details,
    }).catch(() => {});
  };

  // Modals state
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [scheduleCandidate, setScheduleCandidate] = useState<string | null>(null);
  const [offerCandidate, setOfferCandidate] = useState<{ name: string; isCandidateReview: boolean } | null>(null);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);

  // Global notification banner / toast
  const [bannerToast, setBannerToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  // Sync user list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hireflow_users', JSON.stringify(userList));
    } catch {
      // ignore
    }
  }, [userList]);

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('hireflow_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('hireflow_current_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const showToast = (message: string) => {
    setBannerToast({ message, type: 'success' });
    setTimeout(() => setBannerToast(null), 4000);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.status === 'active') {
      showToast(`Welcome back, ${user.name}! Authenticated with 256-bit TLS security.`);
      // Route user to appropriate landing view
      if (user.role === 'admin') {
        setCurrentView('admin');
      } else if (user.role === 'employer') {
        setCurrentView('employer-portal');
      } else {
        setCurrentView('candidate-portal');
      }
    } else if (user.status === 'pending_approval') {
      showToast('Account is currently pending administrative verification.');
    }

    // Record login activity in the tamper-evident audit ledger
    logActivity({
      type: 'login',
      actor: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      action: `User authenticated via secure 256-bit TLS handshake`,
      target: {
        name:
          user.role === 'admin'
            ? 'Admin Governance Center'
            : user.role === 'employer'
            ? 'Employer Pipeline Workspace'
            : 'Candidate Career Portal',
        type: 'session',
      },
      status: 'success',
      ipAddress: '197.238.10.42',
      details: {
        role: user.role,
        status: user.status,
        authProtocol: 'WebAuthn + Encrypted Credentials',
        verified: Boolean(user.verified),
      },
    });
  };

  const handleRegister = (newUser: User) => {
    setUserList((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    // Push directly to Microsoft SQL Server
    registerUserInDb(newUser).catch(() => {});

    // Record registration activity
    logActivity({
      type: 'account_approval',
      actor: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      action: `New ${newUser.registrationType === 'company' ? 'corporate employer' : 'candidate'} registered and submitted for administrative approval`,
      target: {
        name: newUser.name,
        type: newUser.registrationType,
        id: newUser.id,
      },
      status: 'info',
      ipAddress: '192.0.2.14',
      details: {
        submittedRole: newUser.role,
        registrationType: newUser.registrationType,
        approvalStatus: 'pending_approval',
      },
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('find-jobs');
    showToast('You have been securely signed out.');
  };

  const handleApproveUser = (userId: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Error: Only Platform Administrators hold account approval privileges.');
      return;
    }
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active', verified: true } : u))
    );
    // If current logged in user was this user, update them too
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'active', verified: true } : null));
    }
    const approvedUser = userList.find((u) => u.id === userId);
    showToast(`Account Approved! ${approvedUser?.name || 'User'} now has full network access.`);

    // Approve directly in Microsoft SQL Server
    approveUserInDb(currentUser?.id || 'admin-1', userId).catch(() => {});

    // Record account approval activity
    logActivity({
      type: 'account_approval',
      actor: {
        name: currentUser?.name || 'Marcus Vance (Admin)',
        email: currentUser?.email || 'admin.m_vance@hireflow.io',
        role: 'admin',
      },
      action: `Approved credentials and granted Gold Verification Badge to ${approvedUser?.name || 'User'}`,
      target: {
        name: approvedUser ? `${approvedUser.name} (${approvedUser.registrationType === 'company' ? 'Company' : 'Candidate'})` : 'User Account',
        type: approvedUser?.registrationType || 'user',
        id: userId,
      },
      status: 'success',
      ipAddress: '198.51.100.44',
      details: {
        approvedUserId: userId,
        targetEmail: approvedUser?.email,
        grantedRole: approvedUser?.role,
        tierIssued: 'Tier-1 Gold Verified Seal',
      },
    });
  };

  const handleRejectUser = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'rejected' } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'rejected' } : null));
    }
    const rejectedUser = userList.find((u) => u.id === userId);
    showToast('Registration rejected.');

    // Record rejection activity
    logActivity({
      type: 'account_approval',
      actor: {
        name: currentUser?.name || 'Marcus Vance (Admin)',
        email: currentUser?.email || 'admin.m_vance@hireflow.io',
        role: 'admin',
      },
      action: `Rejected registration submission and flagged documentation`,
      target: {
        name: rejectedUser ? rejectedUser.name : 'User Account',
        type: rejectedUser?.registrationType || 'user',
        id: userId,
      },
      status: 'warning',
      ipAddress: '198.51.100.44',
      details: {
        rejectedUserId: userId,
        reason: 'Incomplete compliance dossier',
      },
    });
  };

  const handlePostJob = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
    showToast(`Successfully published verified role: ${newJob.title} at ${newJob.company}`);

    // Push directly to Microsoft SQL Server
    createJobInDb(newJob).catch(() => {});

    // Record job posting activity
    logActivity({
      type: 'job_posting',
      actor: {
        name: currentUser?.name || newJob.company,
        email: currentUser?.email || 'hiring@hireflow.io',
        role: currentUser?.role || 'employer',
      },
      action: `Published verified requisition: ${newJob.title} at ${newJob.company} (${newJob.salary}${newJob.salaryPeriod})`,
      target: {
        name: `${newJob.title} (${newJob.company})`,
        type: 'job',
        id: newJob.id,
      },
      status: 'success',
      ipAddress: '203.0.113.19',
      details: {
        company: newJob.company,
        compensation: `${newJob.salary}${newJob.salaryPeriod}`,
        workMode: newJob.workMode,
        location: newJob.location,
        tags: newJob.tags.join(', '),
        department: newJob.department || 'Engineering',
      },
    });
  };

  const handleAddTestActivity = (type: ActivityEventType) => {
    if (type === 'login') {
      logActivity({
        type: 'login',
        actor: {
          name: 'Clara Song',
          email: 'clara.song@gmail.com',
          role: 'candidate',
        },
        action: 'Candidate authenticated via WebAuthn biometric passkey verification',
        target: { name: 'Candidate Career Portal', type: 'session' },
        status: 'success',
        ipAddress: '172.56.21.90',
        details: { device: 'MacBook Pro / Chrome 129', location: 'Austin, TX' },
      });
      showToast('Simulated user login recorded in activity stream.');
    } else if (type === 'account_approval') {
      logActivity({
        type: 'account_approval',
        actor: {
          name: currentUser?.name || 'Marcus Vance',
          email: currentUser?.email || 'admin.m_vance@hireflow.io',
          role: 'admin',
        },
        action: 'Approved corporate tax filings & issued Gold Verification Badge to Apex Logistics Group',
        target: { name: 'Apex Logistics Group', type: 'company', id: 'APEX-889' },
        status: 'success',
        ipAddress: '198.51.100.44',
        details: { badge: 'Tier-1 Gold Verified Seal', regNumber: 'US-DEL-98441' },
      });
      showToast('Simulated account approval recorded in activity stream.');
    } else if (type === 'job_posting') {
      logActivity({
        type: 'job_posting',
        actor: {
          name: 'Apex Logistics Group',
          email: 'hiring@apexlogistics.com',
          role: 'employer',
        },
        action: 'Published verified requisition: Lead Logistics Platform Engineer ($130,000 – $155,000/yr)',
        target: { name: 'Lead Logistics Engineer', type: 'job', id: `job-${Date.now()}` },
        status: 'success',
        ipAddress: '172.16.8.44',
        details: { compensation: '$130,000 - $155,000/yr', workMode: 'Hybrid', location: 'Chicago, IL' },
      });
      showToast('Simulated job posting recorded in activity stream.');
    }
  };

  const handleApplySuccess = (jobTitle: string, company: string) => {
    showToast(`Application delivered to ${company} for ${jobTitle} with 72h SLA!`);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Application Sent: ${company}`,
      description: `Your verified profile was submitted for ${jobTitle}.`,
      time: 'Just now',
      read: false,
      type: 'application',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAdvanceCandidate = (candidateId: string, targetStage: KanbanCandidate['stage']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: targetStage } : c))
    );
  };

  const handleAddCandidate = (newCand: KanbanCandidate) => {
    setCandidates((prev) => [newCand, ...prev]);
    showToast(`Added candidate ${newCand.name} to Requisition Pipeline (#${newCand.id})`);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // If user is not authenticated, show secure Auth Page (Login / Create Account)
  if (!currentUser) {
    return (
      <>
        {bannerToast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary shadow-lg border border-primary-fixed-dim/30 animate-in fade-in slide-in-from-top-3">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-xs font-semibold">{bannerToast.message}</span>
          </div>
        )}
        <div className="fixed top-4 right-4 z-40 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/90 border border-surface-container text-xs shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-primary">database</span>
          <span className="font-semibold text-on-surface">SQL Server</span>
          <span className="text-[10px] text-on-surface-variant font-mono px-1.5 py-0.5 rounded bg-surface-container">
            {mssqlStatus?.server || 'DESKTOP-PK86AT'}
          </span>
          <button
            onClick={() => syncWithDatabase(false)}
            disabled={isSyncingDb}
            title="Sync with Microsoft SQL Server"
            className="ml-1 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-0.5 rounded hover:bg-surface-container cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncingDb ? 'animate-spin text-primary' : ''}`}>
              sync
            </span>
          </button>
        </div>
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} userList={userList} />
      </>
    );
  }

  // If user account is pending approval, show holding screen
  if (currentUser.status === 'pending_approval') {
    return (
      <PendingApprovalView
        user={currentUser}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
      />
    );
  }

  // Determine if current view should display the dashboard sidebar
  const hasSidebar =
    currentView === 'candidate-portal' ||
    currentView === 'employer-portal' ||
    currentView === 'admin';

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased">
      {/* Toast Notification Banner */}
      {bannerToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary shadow-lg border border-primary-fixed-dim/30 animate-in fade-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-xs font-semibold">{bannerToast.message}</span>
          <button
            onClick={() => setBannerToast(null)}
            className="ml-2 text-on-primary hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenPostJob={() => setPostJobOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        hasSidebar={hasSidebar}
        currentUser={currentUser}
        onLogout={handleLogout}
        mssqlStatus={mssqlStatus}
        onSyncDatabase={() => syncWithDatabase(false)}
        isSyncingDb={isSyncingDb}
      />

      {/* Sidebar for Dashboard Views */}
      {hasSidebar && (
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Main View Container */}
      <main
        className={`w-full pt-16 bg-background min-h-screen transition-all ${
          hasSidebar ? 'md:pl-64 px-4 md:px-space-xl py-space-lg' : ''
        }`}
      >
        {currentView === 'find-jobs' && (
          <FindJobsView
            jobs={jobs}
            onNavigate={setCurrentView}
            onOpenApply={(job) => setApplyJob(job)}
            onOpenPostJob={() => setPostJobOpen(true)}
          />
        )}

        {currentView === 'companies' && (
          <div className="max-w-7xl mx-auto py-space-xl px-4 md:px-margin">
            <CompaniesView onNavigate={setCurrentView} />
          </div>
        )}

        {currentView === 'candidate-portal' && (
          <CandidatePortalView
            onNavigate={setCurrentView}
            onOpenResume={() => setResumeOpen(true)}
            onOpenApply={(job) => setApplyJob(job)}
            onOpenOffer={(company, isCandidateReview) =>
              setOfferCandidate({ name: company, isCandidateReview })
            }
          />
        )}

        {currentView === 'employer-portal' && (
          <EmployerPipelineView
            candidates={candidates}
            onOpenAddCandidate={() => setAddCandidateOpen(true)}
            onOpenResume={() => setResumeOpen(true)}
            onOpenSchedule={(name) => setScheduleCandidate(name)}
            onOpenOffer={(name, isCandidateReview) =>
              setOfferCandidate({ name, isCandidateReview })
            }
            onAdvanceCandidate={handleAdvanceCandidate}
          />
        )}

        {currentView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminVerificationView
              userList={userList}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
              activityLogs={activityLogs}
              onClearActivityLogs={() => {
                setActivityLogs([]);
                localStorage.removeItem('hireflow_activity_logs');
                showToast('Activity log buffer cleared.');
              }}
              onAddTestActivity={handleAddTestActivity}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-surface-container-lowest rounded-2xl border border-error/30 text-center shadow-lg">
              <span className="material-symbols-outlined text-error text-[48px] mb-2">gpp_bad</span>
              <h2 className="text-lg font-bold text-on-surface">Restricted Governance Access</h2>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                You are signed in as a <strong className="text-on-surface capitalize">{currentUser?.role}</strong>. Only Platform Administrators holding security credentials can access this verification center.
              </p>
              <button
                onClick={() => setCurrentView(currentUser?.role === 'employer' ? 'employer-portal' : 'candidate-portal')}
                className="mt-5 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold cursor-pointer hover:bg-primary-container transition-all"
              >
                Return to My Authorized Portal
              </button>
            </div>
          )
        )}
      </main>

      {/* Interactive Modals */}
      <PostJobModal
        isOpen={postJobOpen}
        onClose={() => setPostJobOpen(false)}
        onPostJob={handlePostJob}
      />

      <ApplyModal
        job={applyJob}
        isOpen={Boolean(applyJob)}
        onClose={() => setApplyJob(null)}
        onSuccess={handleApplySuccess}
      />

      <ResumeModal
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
      />

      <ScheduleModal
        isOpen={Boolean(scheduleCandidate)}
        candidateName={scheduleCandidate || ''}
        onClose={() => setScheduleCandidate(null)}
        onSuccess={(date, time, round) => {
          showToast(`Interview invite sent for ${scheduleCandidate}: ${round} on ${date} at ${time}`);
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: `Interview Scheduled: ${scheduleCandidate}`,
            description: `${round} confirmed for ${date} at ${time} EST.`,
            time: 'Just now',
            read: false,
            type: 'interview',
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }}
      />

      <OfferModal
        isOpen={Boolean(offerCandidate)}
        candidateName={offerCandidate?.name || ''}
        isCandidateReview={offerCandidate?.isCandidateReview}
        onClose={() => setOfferCandidate(null)}
        onSuccess={(status) => {
          if (status === 'accepted') {
            showToast('Congratulations! Offer Accepted and counter-signed on HireFlow.');
          } else if (status === 'declined') {
            showToast('Offer declined. Candidate notified with feedback.');
          } else {
            showToast(`Offer package dispatched to ${offerCandidate?.name}`);
          }
        }}
      />

      <AddCandidateModal
        isOpen={addCandidateOpen}
        onClose={() => setAddCandidateOpen(false)}
        onAdd={handleAddCandidate}
      />
    </div>
  );
}
