import React, { useState } from 'react';
import { Job, ViewType } from '../types';

interface FindJobsViewProps {
  jobs: Job[];
  onNavigate: (view: ViewType) => void;
  onOpenApply: (job: Job) => void;
  onOpenPostJob: () => void;
}

export const FindJobsView: React.FC<FindJobsViewProps> = ({
  jobs,
  onNavigate,
  onOpenApply,
}) => {
  const [keyword, setKeyword] = useState('Senior Python Developer');
  const [location, setLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState('remote');
  const [selectedCategory, setSelectedCategory] = useState<'All Roles' | 'Engineering' | 'Product & UX'>('All Roles');
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({});

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedJobs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter jobs based on keyword, location, workMode, and category
  const filteredJobs = jobs.filter((job) => {
    if (selectedCategory === 'Engineering' && job.department !== 'Engineering') return false;
    if (selectedCategory === 'Product & UX' && job.department !== 'Product & UX') return false;

    if (workMode !== 'all' && job.workMode !== workMode) {
      // allow flexible match if remote
      if (workMode === 'remote' && !job.type.toLowerCase().includes('remote')) return false;
      if (workMode === 'hybrid' && !job.type.toLowerCase().includes('hybrid')) return false;
      if (workMode === 'onsite' && !job.type.toLowerCase().includes('new york') && !job.type.toLowerCase().includes('onsite')) return false;
    }

    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      const match =
        job.title.toLowerCase().includes(kw) ||
        job.company.toLowerCase().includes(kw) ||
        job.tags.some((t) => t.toLowerCase().includes(kw));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Atmospheric Canvas Mesh & Subtle Vignette */}
      <section className="relative w-full overflow-hidden px-4 sm:px-margin py-space-xl">
        {/* Subtle Ambient Green Blurs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-48 right-12 w-80 h-80 bg-primary-fixed-dim/15 rounded-full blur-2xl pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Verified Marketplace Milestone Eyebrow */}
          <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md shadow-xs mb-space-md">
            <span
              className="material-symbols-outlined text-[16px] text-tertiary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="font-label-sm text-label-sm text-tertiary font-semibold tracking-wide uppercase">
              Enterprise Talent Exchange • Q2 Verified
            </span>
          </div>

          {/* Core Display Headline */}
          <h1 className="font-display-lg text-display-lg text-on-surface max-w-4xl tracking-tight text-balance">
            Find the right opportunity. <br className="hidden sm:inline" />
            <span className="text-primary">Build the right team.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-md mb-space-lg text-balance">
            HireFlow connects talented professionals with companies looking for their next great hire through curated verification, transparent compensation, and fast pipelines.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-space-md mb-space-xl">
            <a
              href="#browse-jobs"
              className="inline-flex items-center justify-center h-11 px-space-xl rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] mr-space-xs">work</span>
              Find Jobs
            </a>
            <button
              onClick={() => onNavigate('employer-portal')}
              className="inline-flex items-center justify-center h-11 px-space-xl rounded-lg bg-surface-container-lowest/90 hover:bg-surface-container text-on-surface font-label-lg text-label-lg shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] mr-space-xs text-secondary">group_add</span>
              Hire Talent
            </button>
          </div>

          {/* High-Trust Platform Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full max-w-3xl mb-space-xl">
            <div className="flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-lowest/80 shadow-xs backdrop-blur-xs border border-surface-container/60">
              <div className="flex items-center gap-1 font-headline-xl text-headline-xl text-primary font-bold">
                <span>14,000</span>
                <span className="text-secondary-fixed-dim text-2xl">+</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant mt-1">Verified Open Jobs</span>
            </div>
            <div className="flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-lowest/80 shadow-xs backdrop-blur-xs border border-surface-container/60">
              <div className="flex items-center gap-1 font-headline-xl text-headline-xl text-on-surface font-bold">
                <span>3,200</span>
                <span className="text-tertiary-fixed-dim text-2xl">+</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant mt-1">Vetted Top Employers</span>
            </div>
            <div className="flex flex-col items-center justify-center p-space-md rounded-xl bg-surface-container-lowest/80 shadow-xs backdrop-blur-xs border border-surface-container/60">
              <div className="flex items-center gap-1 font-headline-xl text-headline-xl text-secondary font-bold">
                <span>98</span>
                <span className="text-primary-fixed-dim text-2xl">%</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant mt-1">Placement Match Rate</span>
            </div>
          </div>

          {/* Glass Floating Search Cockpit */}
          <div className="w-full max-w-5xl bg-surface-container-lowest/85 backdrop-blur-md rounded-xl p-space-md shadow-md border border-surface-container">
            <form
              className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Keyword Input */}
              <div className="md:col-span-4 relative flex items-center bg-surface-container-low rounded-lg px-space-md py-2 focus-within:bg-surface-container-lowest transition-colors">
                <span className="material-symbols-outlined text-[20px] text-outline mr-space-sm">search</span>
                <input
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                  id="searchKeyword"
                  placeholder="Job title, role, or keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              {/* Location Input */}
              <div className="md:col-span-3 relative flex items-center bg-surface-container-low rounded-lg px-space-md py-2 focus-within:bg-surface-container-lowest transition-colors">
                <span className="material-symbols-outlined text-[20px] text-outline mr-space-sm">location_on</span>
                <input
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                  id="searchLocation"
                  placeholder="City, state, or remote"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Work Mode Dropdown */}
              <div className="md:col-span-3 relative flex items-center bg-surface-container-low rounded-lg px-space-md py-2">
                <span className="material-symbols-outlined text-[20px] text-outline mr-space-sm">tune</span>
                <select
                  aria-label="Filter by work mode"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none appearance-none cursor-pointer pr-4"
                >
                  <option value="all">All Work Modes</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-Site Office</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 pointer-events-none text-outline text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <button
                  className="w-full h-10 px-space-md bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg rounded-lg shadow-xs transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
                  type="submit"
                >
                  <span>Search Jobs</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Quick filter chips beneath input panel */}
            <div className="flex flex-wrap items-center gap-space-xs mt-space-sm pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="text-outline uppercase tracking-wider text-[10px] font-semibold mr-1">Trending:</span>
              <button
                onClick={() => setKeyword('Python FastAPI')}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              >
                Python • FastAPI
              </button>
              <button
                onClick={() => setKeyword('Staff Product Design')}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              >
                Staff Product Design
              </button>
              <button
                onClick={() => setKeyword('Kubernetes SRE')}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              >
                Kubernetes / SRE
              </button>
              <button
                onClick={() => setKeyword('Engineering Leadership')}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              >
                Engineering Leadership
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Discovery Grid Section */}
      <section className="w-full px-4 sm:px-margin py-space-xl bg-surface-container-low/40" id="browse-jobs">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with Meta Filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Real-Time Ingestion</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                Featured Positions
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Directly vetted openings with verified compensation and recruiter SLA.
              </p>
            </div>
            
            <div className="flex items-center gap-space-sm">
              <div className="inline-flex p-1 bg-surface-container rounded-lg">
                {(['All Roles', 'Engineering', 'Product & UX'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-space-md py-1 rounded-md font-label-sm text-label-sm transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'text-on-primary bg-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Scannable Structured Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {filteredJobs.length === 0 ? (
              <div className="col-span-2 py-16 text-center bg-surface-container-lowest rounded-xl border border-surface-container">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">work_off</span>
                <h3 className="font-headline-sm text-on-surface">No positions match your filter</h3>
                <p className="font-body-md text-on-surface-variant mt-1">
                  Try clearing your search terms or selecting 'All Roles'.
                </p>
                <button
                  onClick={() => {
                    setKeyword('');
                    setWorkMode('all');
                    setSelectedCategory('All Roles');
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isBookmarked = bookmarkedJobs[job.id];
                return (
                  <article
                    key={job.id}
                    className="group relative flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-lg shadow-xs hover:shadow-md transition-all duration-200 border border-surface-container/60"
                  >
                    <div>
                      {/* Header: Company Identity & Meta */}
                      <div className="flex items-start justify-between gap-space-md mb-space-md">
                        <div className="flex items-center gap-space-md min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-surface-container-high/50">
                            {job.companyLogo ? (
                              <img
                                className="w-full h-full object-cover"
                                alt={`${job.company} logo`}
                                src={job.companyLogo}
                                onError={(e) => {
                                  // Fallback initial
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="font-bold text-primary text-lg">
                                {job.company.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                                {job.company}
                              </span>
                              {job.verified && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary font-label-sm text-label-sm">
                                  <span
                                    className="material-symbols-outlined text-[13px] text-tertiary"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                  >
                                    verified
                                  </span>
                                  <span>Verified</span>
                                </span>
                              )}
                              {job.badge && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${
                                    job.badge === 'Series B'
                                      ? 'bg-secondary-container text-on-secondary-container'
                                      : 'bg-surface-container text-on-surface-variant'
                                  }`}
                                >
                                  {job.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                              <span className="material-symbols-outlined text-[16px] text-outline">
                                {job.location.includes('Global')
                                  ? 'public'
                                  : job.location.includes('New York')
                                  ? 'location_city'
                                  : job.location.includes('San Francisco')
                                  ? 'apartment'
                                  : 'location_on'}
                              </span>
                              <span>{job.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bookmark Interaction Button */}
                        <button
                          aria-label={`Bookmark ${job.title} role`}
                          onClick={(e) => toggleBookmark(job.id, e)}
                          className={`p-2 rounded-lg hover:bg-surface-container transition-colors shrink-0 cursor-pointer ${
                            isBookmarked ? 'text-primary' : 'text-outline-variant hover:text-primary'
                          }`}
                          type="button"
                        >
                          <span
                            className="material-symbols-outlined text-[22px]"
                            style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            bookmark
                          </span>
                        </button>
                      </div>

                      {/* Role Title & Compensation */}
                      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors mb-space-xs">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-space-sm flex-wrap text-on-surface-variant font-body-md text-body-md mb-space-md">
                        <span className="inline-flex items-center font-semibold text-secondary">
                          {job.salary}
                          <span className="font-normal text-on-surface-variant ml-1">{job.salaryPeriod}</span>
                        </span>
                        <span className="text-outline">•</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                          {job.type}
                        </span>
                      </div>

                      {/* Technology / Capability Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-space-lg">
                        {job.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-md font-label-sm text-label-sm ${
                              idx === job.tags.length - 1
                                ? 'bg-surface-container-high text-primary'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Bar & Timestamp */}
                    <div className="flex items-center justify-between pt-space-md border-t border-surface-container/60 bg-surface-container-lowest">
                      <span className="text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1">
                        <span
                          className={`material-symbols-outlined text-[15px] ${
                            job.postedTime.includes('today') ? 'text-primary' : 'text-outline'
                          }`}
                        >
                          {job.postedTime.includes('today') ? 'fiber_new' : 'history'}
                        </span>
                        {job.postedTime}
                      </span>
                      <button
                        onClick={() => onOpenApply(job)}
                        className="inline-flex items-center justify-center h-9 px-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-xs cursor-pointer"
                        type="button"
                      >
                        Apply Now
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* View All Directory Link */}
          <div className="mt-space-xl flex justify-center">
            <button
              onClick={() => onNavigate('candidate-portal')}
              className="inline-flex items-center gap-space-xs font-label-lg text-label-lg text-primary hover:text-on-surface-variant transition-colors bg-surface-container px-space-lg py-space-sm rounded-lg shadow-xs hover:shadow-sm cursor-pointer"
            >
              <span>Explore 14,000+ open career opportunities</span>
              <span className="material-symbols-outlined text-[18px]">east</span>
            </button>
          </div>
        </div>
      </section>

      {/* Platform Value Pillars Section */}
      <section className="w-full px-4 sm:px-margin py-space-xl bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <div className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-space-xs">
              Engineered for Velocity
            </div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold">
              Recruiting without friction
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              HireFlow replaces outdated black-box applications with an agile, verified communication pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {/* Pillar 1: Verified Companies */}
            <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-surface-container/60">
              <div>
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/30 flex items-center justify-center text-tertiary mb-space-md">
                  <span
                    className="material-symbols-outlined text-[28px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                </div>
                <div className="flex items-center gap-space-xs mb-space-xs">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Verified Companies</h3>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed/40 text-tertiary font-label-sm text-label-sm font-bold">
                    100% Vetted
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                  Every employer completes entity, payroll capability, and hiring authority verification. Zero ghost jobs, zero scam postings.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-surface-container/60 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Tax & Legal Entity Checked
                </span>
                <span className="text-outline">•</span>
                <span>Escrow Guaranteed</span>
              </div>
            </div>

            {/* Pillar 2: Streamlined Pipeline */}
            <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-surface-container/60">
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-primary mb-space-md">
                  <span className="material-symbols-outlined text-[28px]">linear_scale</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
                  Streamlined Pipeline
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                  Transparent multi-step candidate stages. See precisely when your profile is reviewed, scheduled, or passed directly to hiring managers.
                </p>

                {/* Visual Pipeline Stage Indicator */}
                <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg">
                  <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-1.5">
                    <span className="font-semibold text-primary">Applied</span>
                    <span className="font-semibold text-primary">Screening</span>
                    <span className="text-outline">Interview</span>
                    <span className="text-outline">Offer</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full w-1/2 rounded-full transition-all duration-500"></div>
                  </div>
                </div>
              </div>

              <div className="mt-space-lg pt-space-md border-t border-surface-container/60 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[16px]">speed</span>
                  Average 72h SLA
                </span>
                <span className="text-outline">•</span>
                <span>Realtime Alerts</span>
              </div>
            </div>

            {/* Pillar 3: Direct Employer Chat */}
            <div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-surface-container/60">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary-container mb-space-md">
                  <span className="material-symbols-outlined text-[28px]">forum</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
                  Direct Employer Chat
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
                  Skip third-party agencies and middlemen. Direct two-way messaging with technical leaders and in-house recruiting partners.
                </p>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-surface-container/60 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Encrypted Messaging
                </span>
                <span className="text-outline">•</span>
                <span>Calendar Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Platform Navigation Footer Content */}
      <section className="w-full px-4 sm:px-margin py-space-xl bg-surface-container-low border-t border-surface-container">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-space-lg">
          <div className="col-span-2">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">join_inner</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">HireFlow</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm leading-relaxed mb-space-md">
              Next-generation recruiting ecosystem uniting world-class engineering, product, and leadership talent with mission-critical enterprises.
            </p>
            <div className="flex items-center gap-3">
              <button
                aria-label="Share platform"
                className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
              </button>
              <button
                aria-label="RSS Feed"
                className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">rss_feed</span>
              </button>
              <button
                aria-label="Language options"
                className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">language</span>
              </button>
            </div>
          </div>

          {/* Column 1: For Candidates */}
          <div className="flex flex-col gap-2">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold mb-1">For Candidates</span>
            <button
              onClick={() => onNavigate('candidate-portal')}
              className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Explore All Jobs
            </button>
            <button
              onClick={() => setWorkMode('remote')}
              className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Remote Roles
            </button>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Salary Benchmarks 2025
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Candidate Career Guide
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Dossier Portfolio Builder
            </span>
          </div>

          {/* Column 2: For Employers */}
          <div className="flex flex-col gap-2">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold mb-1">For Employers</span>
            <button
              onClick={() => onNavigate('employer-portal')}
              className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Post Open Positions
            </button>
            <button
              onClick={() => onNavigate('employer-portal')}
              className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Talent Pool Search
            </button>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Candidate Screening ATS
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Enterprise Pricing
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Security & Compliance
            </span>
          </div>

          {/* Column 3: Platform */}
          <div className="flex flex-col gap-2">
            <span className="font-label-lg text-label-lg text-on-surface font-semibold mb-1">Platform</span>
            <button
              onClick={() => onNavigate('companies')}
              className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              About HireFlow
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Verified Employer Policy
            </button>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              System Status
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              API Documentation
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              Direct Helpdesk
            </span>
          </div>
        </div>
      </section>

      {/* Sub-footer */}
      <footer className="w-full bg-surface-container-low py-space-xl shadow-[0_-1px_6px_rgba(23,34,29,0.02)] border-t border-surface-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-margin flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">HireFlow</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">© 2025 HireFlow Systems Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-space-lg">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
