import React, { useState } from 'react';
import { CandidateApplication, ViewType, Job } from '../types';
import { CANDIDATE_APPLICATIONS, RECOMMENDED_ROLES } from '../data/mockData';

interface CandidatePortalViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenResume: () => void;
  onOpenApply: (job: Job) => void;
  onOpenOffer: (appName: string, isCandidateReview: boolean) => void;
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  onNavigate,
  onOpenResume,
  onOpenApply,
  onOpenOffer,
}) => {
  const [activeTab, setActiveTab] = useState<string>('All (18)');
  const [searchFilter, setSearchFilter] = useState('');
  const [prepModalOpen, setPrepModalOpen] = useState(false);
  const [selectedAppDetail, setSelectedAppDetail] = useState<CandidateApplication | null>(null);

  const tabs = [
    { label: 'All (18)', value: 'All' },
    { label: 'Under Review (6)', value: 'Under Review' },
    { label: 'Shortlisted (4)', value: 'Shortlisted' },
    { label: 'Interviews (3)', value: 'Interviews' },
    { label: 'Offers (1)', value: 'Offers' },
    { label: 'Rejected (4)', value: 'Rejected' },
  ];

  const filteredApplications = CANDIDATE_APPLICATIONS.filter((app) => {
    if (activeTab !== 'All (18)') {
      const match = tabs.find((t) => t.label === activeTab);
      if (match && app.status !== match.value) return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.salary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Subtle Ambient Glow */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-tertiary-fixed/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* 1. Header Welcome Bar & Profile Ribbon */}
        <section className="w-full bg-surface-container-lowest/80 backdrop-blur-md rounded-xl p-space-lg shadow-xs border border-surface-container/60">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="relative shrink-0">
                <img
                  alt="Ahmed headshot"
                  className="w-16 h-16 rounded-full object-cover shadow-xs border border-surface-container"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_V5qcem9mIZDq9IEB7W_PQOUinp_3SHap3HltQny321UzaXpFl9_jg6SvlpFDW5ZNdUZ_p_x5_GJi69MbfRudK5n_bZ0-8OkEur8KH8lvU9WhHKmyp7V9C_vWMuslQl7ur7mnFXYRhXP44hNma1Fdnpp9X893zsIu7dNDMWFU_s5c6HeciFuAuQPd228MNeJhO1KaUqvRGpEX_g-LfzMpJsibNFSEQKp_mTQGfFEXA4nysRvU6bc"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full ring-2 ring-surface-container-lowest flex items-center justify-center text-[10px] text-on-primary">
                  <span className="material-symbols-outlined text-[10px]">check</span>
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <h1 className="font-headline-xl text-headline-xl text-on-surface">Good morning, Ahmed</h1>
                  <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                    Senior Software Engineer
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant truncate">
                  Track your applications and discover your next opportunity.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
              <button
                onClick={onOpenResume}
                className="inline-flex items-center justify-center gap-space-xs px-space-md h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Update Resume
              </button>
              <button
                onClick={() => onNavigate('find-jobs')}
                className="inline-flex items-center justify-center gap-space-xs px-space-md h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                Browse Jobs
              </button>
            </div>
          </div>

          {/* Quick Profile Readiness Bar */}
          <div className="mt-space-md pt-space-md bg-surface-container-low/60 rounded-lg px-space-md py-space-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm border border-surface-container/40">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span className="font-label-md text-label-md text-on-surface">Profile Strength: 92%</span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                • Distributed Systems & Python skills verified
              </span>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="w-48 bg-surface-variant h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: '92%' }}
                ></div>
              </div>
              <button
                onClick={onOpenResume}
                className="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                Complete Profile <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 2. Metric Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Total Applications */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-space-md shadow-xs border border-surface-container/60 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </div>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg text-on-surface">18</span>
            <span className="inline-flex items-center gap-0.5 px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +3 this week
            </span>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">Active search cycle (Q4)</p>
        </div>

        {/* Under Review */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-space-md shadow-xs border border-surface-container/60 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
            </div>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg text-on-surface">6</span>
            <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Screening active
            </span>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">Avg response time: 3.2 days</p>
        </div>

        {/* Interviews Scheduled (Gold Accent) */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-space-md shadow-xs border border-surface-container/60 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Interviews Scheduled
            </span>
            <div className="w-9 h-9 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
            </div>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg text-on-surface">3</span>
            <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-tertiary-fixed/40 text-on-tertiary-fixed-variant font-label-sm text-label-sm">
              <span
                className="material-symbols-outlined text-[13px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>{' '}
              Round 2 & Final
            </span>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">Next: Tomorrow at 2:00 PM</p>
        </div>

        {/* Offers Received */}
        <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-space-md shadow-xs border border-surface-container/60 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Offers Received
            </span>
            <div className="w-9 h-9 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
          </div>
          <div className="mt-space-sm flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg text-on-surface">1</span>
            <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[13px]">celebration</span> Linear Offer
            </span>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">Expires in 6 days (Oct 28)</p>
        </div>
      </section>

      {/* 3. Application Status & Pipeline Tracker */}
      <section className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl shadow-xs border border-surface-container/60 p-space-lg flex flex-col gap-space-lg">
        {/* Header with Tabs and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <h2 className="font-headline-md text-headline-md text-on-surface">Application Pipeline</h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Manage ongoing hiring cycles, scheduled rounds, and decision checkpoints.
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-10 pl-9 pr-space-md rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs w-48 sm:w-64 transition-all"
                placeholder="Filter company or role..."
                type="text"
              />
            </div>
            <button
              aria-label="Sort and Filter"
              className="h-10 px-space-sm bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>

        {/* Filter Pills / Tabs */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-space-md py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Application List Rows */}
        <div className="flex flex-col gap-space-sm">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-surface-container-lowest hover:bg-surface-container-low/40 rounded-xl p-space-md shadow-xs border border-surface-container/60 transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-space-md"
            >
              <div className="flex items-start sm:items-center gap-space-md min-w-0">
                <div className={`w-12 h-12 rounded-xl ${app.iconBg} flex items-center justify-center font-headline-sm shrink-0 shadow-xs`}>
                  <span className="material-symbols-outlined text-[24px]">{app.iconName}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-sm flex-wrap">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{app.company}</span>
                    <span className="text-on-surface-variant">•</span>
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">{app.role}</span>
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {app.workMode}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm mt-1">
                    <span>{app.appliedDate}</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">{app.salary}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-space-lg xl:justify-end">
                <div className="flex flex-col gap-1 min-w-[220px]">
                  <div className="flex items-center gap-space-xs">
                    <span className={`px-space-sm py-0.5 rounded-full ${app.statusBadgeColor} font-label-sm text-label-sm inline-flex items-center gap-1`}>
                      {app.status === 'Offers' && (
                        <span className="material-symbols-outlined text-[14px]">done_all</span>
                      )}
                      {app.status === 'Under Review' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                      )}
                      {app.status === 'Interviews' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      )}
                      {app.statusDetail}
                    </span>
                  </div>
                  <span
                    className={`font-label-sm text-label-sm flex items-center gap-1 ${
                      app.status === 'Offers' ? 'text-error font-medium' : 'text-on-surface-variant'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        app.status === 'Offers' ? 'text-error' : app.status === 'Interviews' ? 'text-tertiary' : ''
                      }`}
                    >
                      {app.nextStepIcon}
                    </span>
                    {app.nextStep}
                  </span>
                </div>

                <div className="flex items-center gap-space-xs">
                  {app.hasOffer ? (
                    <>
                      <button
                        onClick={() => onOpenOffer(app.company, true)}
                        className="h-9 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm shadow-xs transition-all cursor-pointer"
                        type="button"
                      >
                        Review Offer
                      </button>
                      <button
                        onClick={() => onOpenOffer(app.company, true)}
                        className="h-9 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
                        type="button"
                      >
                        Accept/Decline
                      </button>
                    </>
                  ) : app.status === 'Interviews' ? (
                    <>
                      <button
                        onClick={() => setPrepModalOpen(true)}
                        className="h-9 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm shadow-xs transition-all cursor-pointer"
                        type="button"
                      >
                        Prepare
                      </button>
                      <button
                        onClick={() => setSelectedAppDetail(app)}
                        className="h-9 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
                        type="button"
                      >
                        View Application
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedAppDetail(app)}
                      className="h-9 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
                      type="button"
                    >
                      View Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recommended Roles for Ahmed */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">Recommended Roles for You</h2>
              <span className="px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                AI Matched
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Curated based on your mastery in Python, Go, and High-throughput Distributed Systems.
            </span>
          </div>
          <button
            onClick={() => onNavigate('find-jobs')}
            className="text-primary hover:text-primary-container font-label-lg text-label-lg flex items-center gap-1 cursor-pointer"
          >
            Explore All Jobs <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {RECOMMENDED_ROLES.map((role) => (
            <div
              key={role.id}
              className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-space-lg shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-space-lg group border border-surface-container/60"
            >
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">{role.icon}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span> {role.matchScore}% Match
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                    {role.company}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    {role.role}
                  </h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  {role.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {role.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-space-md bg-surface-container-low/40 -mx-space-lg -mb-space-lg p-space-md rounded-b-xl flex items-center justify-between border-t border-surface-container">
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">{role.salary}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{role.location}</span>
                </div>
                <button
                  onClick={() =>
                    onOpenApply({
                      id: role.id,
                      title: role.role,
                      company: role.company,
                      location: role.location,
                      workMode: 'remote',
                      salary: role.salary,
                      salaryPeriod: '',
                      tags: role.skills,
                      postedTime: 'Recommended',
                      type: 'Full-time',
                    })
                  }
                  className="h-9 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  type="button"
                >
                  Quick Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prepare Interview Modal */}
      {prepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">code</span>
                <h3 className="font-bold text-on-surface text-base">Live Coding Interview Checklist</h3>
              </div>
              <button
                onClick={() => setPrepModalOpen(false)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-on-surface-variant">
              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                <span className="font-semibold text-on-surface">TechFlow Round 2: Technical Interview</span>
                <span className="text-primary font-mono font-medium">Tomorrow 2:00 PM</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-on-surface cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                  <span>Review Python AsyncIO & Event Loop Concurrency</span>
                </label>
                <label className="flex items-center gap-2 text-on-surface cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                  <span>PostgreSQL indexing strategies (B-Tree vs GiST)</span>
                </label>
                <label className="flex items-center gap-2 text-on-surface cursor-pointer">
                  <input type="checkbox" className="accent-primary rounded" />
                  <span>Test microphone & screen share on Google Meet</span>
                </label>
                <label className="flex items-center gap-2 text-on-surface cursor-pointer">
                  <input type="checkbox" className="accent-primary rounded" />
                  <span>Prepare question for Engineering Director</span>
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setPrepModalOpen(false)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold"
              >
                Done Prep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <h3 className="font-bold text-on-surface text-base">{selectedAppDetail.role}</h3>
                <span className="text-xs text-on-surface-variant">{selectedAppDetail.company}</span>
              </div>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Pipeline Stage:</span>
                <span className="font-semibold text-primary">{selectedAppDetail.statusDetail}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Compensation Range:</span>
                <span className="font-semibold text-on-surface">{selectedAppDetail.salary}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Next Action:</span>
                <span className="font-semibold text-on-surface">{selectedAppDetail.nextStep}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low text-on-surface-variant leading-relaxed">
                Your verified dossier was routed through HireFlow direct recruiter sync. Response time guaranteed under 72h SLA.
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
