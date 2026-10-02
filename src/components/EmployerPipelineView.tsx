import React, { useState } from 'react';
import { KanbanCandidate } from '../types';

interface EmployerPipelineViewProps {
  candidates: KanbanCandidate[];
  onOpenAddCandidate: () => void;
  onOpenResume: () => void;
  onOpenSchedule: (candidateName: string) => void;
  onOpenOffer: (candidateName: string, isCandidateReview: boolean) => void;
  onAdvanceCandidate: (candidateId: string, targetStage: KanbanCandidate['stage']) => void;
}

export const EmployerPipelineView: React.FC<EmployerPipelineViewProps> = ({
  candidates,
  onOpenAddCandidate,
  onOpenResume,
  onOpenSchedule,
  onOpenOffer,
  onAdvanceCandidate,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('CAN-9021');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamNotes, setTeamNotes] = useState<Array<{ author: string; time: string; text: string }>>([
    {
      author: 'Sarah Jenkins (Engineering VP)',
      time: 'Yesterday at 5:12 PM',
      text: '"Candidate demonstrated exceptional depth in concurrent task scheduling and database indexing strategies. Easily navigated our distributed locking case study. Recommend speeding up next round."',
    },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) ||
    candidates.find((c) => c.id === 'CAN-9021') ||
    candidates[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setTeamNotes((prev) => [
      ...prev,
      {
        author: 'Recruiting Ops (You)',
        time: 'Just now',
        text: `"${newNoteText.trim()}"`,
      },
    ]);
    setNewNoteText('');
  };

  const handleRejectCandidate = () => {
    setFeedbackToast(`Feedback & debrief notes dispatched for ${selectedCandidate.name}`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Filter candidates if search active
  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  const getCandidatesByStage = (stage: KanbanCandidate['stage']) =>
    filteredCandidates.filter((c) => c.stage === stage);

  return (
    <div className="flex flex-col w-full">
      {/* Dynamic Top Bar & Pipeline Executive Header */}
      <section className="flex flex-col gap-space-md mb-space-lg">
        {/* Breadcrumb & Control Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Active Requisition
            </span>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                Senior Python Developer
              </h2>
              <span className="font-body-md text-body-md text-outline font-normal">(Full-time · Remote)</span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                setFeedbackToast('Requisition link copied to clipboard!');
                setTimeout(() => setFeedbackToast(null), 3000);
              }}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface shadow-xs hover:bg-surface-container-high transition-colors font-label-lg text-label-lg border border-surface-container cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share Pipeline
            </button>
            <button
              onClick={() => {
                setFeedbackToast('Exporting pipeline audit ledger (CSV / JSON)...');
                setTimeout(() => setFeedbackToast(null), 3000);
              }}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface shadow-xs hover:bg-surface-container-high transition-colors font-label-lg text-label-lg border border-surface-container cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Data
            </button>
            <button
              onClick={() => {
                setFeedbackToast('Requisition configuration & SLA rules opened');
                setTimeout(() => setFeedbackToast(null), 3000);
              }}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface shadow-xs hover:bg-surface-container-high transition-colors font-label-lg text-label-lg border border-surface-container cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Job Settings
            </button>
            <button
              onClick={onOpenAddCandidate}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-xs hover:bg-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              + Add Candidate
            </button>
          </div>
        </div>

        {/* Vital Requisition Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-space-md border border-surface-container/60">
            <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">apartment</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-outline">Department</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Engineering</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-space-md border border-surface-container/60">
            <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-outline">Total Pool</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">48 Candidates</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-space-md border border-surface-container/60">
            <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">speed</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-outline">Avg. Time to Hire</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">18 Days</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-space-md border border-surface-container/60">
            <div className="w-11 h-11 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px]">event_seat</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-outline">Open Positions</span>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">2 Headcount</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                  High Priority
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Utility Toolbar Strip */}
      <div className="mb-space-md p-space-sm rounded-xl bg-surface-container-lowest/80 backdrop-blur-md shadow-xs border border-surface-container flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm flex-1 min-w-[280px]">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest transition-colors outline-none border border-transparent focus:border-primary/30"
              placeholder="Search candidate, skill, tags..."
              type="text"
            />
          </div>
          <button
            className="h-10 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center gap-2 font-label-md text-label-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter (3)
          </button>
          <button
            className="h-10 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center gap-2 font-label-md text-label-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Score: High to Low
          </button>
        </div>

        {/* Pipeline Visual Stats Breakdown */}
        <div className="flex items-center gap-4 text-body-sm font-body-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
            <span>
              Match ≥ 90%: <strong>12</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div>
            <span>
              Under Assessment: <strong>9</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
            <span>
              Ready for Offer: <strong>2</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="mb-4 p-3 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {feedbackToast}
          </span>
          <button onClick={() => setFeedbackToast(null)} className="text-on-secondary-container">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Workspace Container: Kanban Columns + Slide-over Drawer Frame */}
      <div className="relative flex w-full gap-space-lg items-start">
        {/* 7 Kanban Columns Scroll Stage */}
        <div
          className="flex items-start gap-space-md overflow-x-auto pb-6 w-full select-none scrollbar-none"
          id="kanban-scroll-track"
        >
          {/* 1. Applied (14) */}
          <div className="flex flex-col w-[308px] shrink-0 rounded-xl bg-surface-container-low/70 p-space-sm shadow-xs border border-surface-container/60">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-outline"></span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Applied</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  14
                </span>
              </div>
              <button className="text-outline hover:text-on-surface p-1 rounded" type="button">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              {getCandidatesByStage('applied').map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCandidateId(c.id);
                    setDrawerOpen(true);
                  }}
                  className={`p-space-md rounded-xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all cursor-pointer border ${
                    selectedCandidateId === c.id
                      ? 'ring-2 ring-primary border-transparent'
                      : 'border-surface-container/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {c.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                      {c.matchScore}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{c.role}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-outline font-label-sm text-label-sm pt-2 border-t border-surface-container/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> {c.appliedTime}
                    </span>
                    {c.verified && (
                      <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Under Review (10) */}
          <div className="flex flex-col w-[308px] shrink-0 rounded-xl bg-surface-container-low/70 p-space-sm shadow-xs border border-surface-container/60">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Under Review</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  10
                </span>
              </div>
              <button className="text-outline hover:text-on-surface p-1 rounded" type="button">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              {getCandidatesByStage('under_review').map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCandidateId(c.id);
                    setDrawerOpen(true);
                  }}
                  className={`p-space-md rounded-xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all cursor-pointer border ${
                    selectedCandidateId === c.id
                      ? 'ring-2 ring-primary border-transparent'
                      : 'border-surface-container/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {c.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                      {c.matchScore}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{c.role}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-outline font-label-sm text-label-sm pt-2 border-t border-surface-container/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">visibility</span> {c.appliedTime}
                    </span>
                    {c.rating && (
                      <span className="text-tertiary flex items-center text-[12px]">
                        <span className="material-symbols-outlined text-[14px]">star</span> {c.rating}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Shortlisted (8) */}
          <div className="flex flex-col w-[308px] shrink-0 rounded-xl bg-surface-container-low/70 p-space-sm shadow-xs border border-surface-container/60">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-fixed-dim"></span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Shortlisted</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  8
                </span>
              </div>
              <button className="text-outline hover:text-on-surface p-1 rounded" type="button">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              {getCandidatesByStage('shortlisted').map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCandidateId(c.id);
                    setDrawerOpen(true);
                  }}
                  className={`p-space-md rounded-xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all cursor-pointer border ${
                    selectedCandidateId === c.id
                      ? 'ring-2 ring-primary border-transparent'
                      : 'border-surface-container/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {c.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                      {c.matchScore}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{c.role}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-outline font-label-sm text-label-sm pt-2 border-t border-surface-container/60">
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm">
                      Ready to Book
                    </span>
                    <span className="text-outline-variant font-label-sm text-label-sm">{c.appliedTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Interview (5) - HIGHLIGHT COLUMN */}
          <div className="flex flex-col w-[320px] shrink-0 rounded-xl bg-secondary-container/20 p-space-sm shadow-xs ring-1 ring-primary/20 border border-primary/20">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span className="font-label-lg text-label-lg text-primary font-semibold">Interview</span>
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold">
                  5
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold">Round 2 active</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              {/* Ahmed Hassan Key Card */}
              {getCandidatesByStage('interview').map((c) => {
                const isAhmed = c.id === 'CAN-9021';
                return isAhmed ? (
                  <div
                    key={c.id}
                    id="card-ahmed"
                    onClick={() => {
                      setSelectedCandidateId(c.id);
                      setDrawerOpen(true);
                    }}
                    className={`p-space-md rounded-xl bg-surface-container-lowest shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 relative ${
                      selectedCandidateId === c.id ? 'ring-primary' : 'ring-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-space-sm mb-3">
                      <img
                        alt="Ahmed Hassan portrait"
                        className="w-12 h-12 rounded-full object-cover shrink-0 shadow-xs border border-primary/20"
                        src={c.avatar}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                            {c.name}
                          </span>
                          <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {c.role}
                        </span>
                      </div>
                    </div>

                    {/* Match Metric & Metadata */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        {c.matchScore}% Match
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">{c.appliedTime}</span>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface mb-3 line-clamp-2">
                      {c.experience}
                    </p>

                    {/* Interview Calendar Ribbon */}
                    <div className="p-2 rounded-lg bg-surface-container mb-3 flex items-center gap-2 text-primary font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      <span className="font-semibold truncate">{c.interviewNote}</span>
                    </div>

                    {/* Quick Action Icons Strip */}
                    <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                      <div className="flex items-center gap-1">
                        <button
                          aria-label="Quick Notes"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidateId(c.id);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-primary transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">sticky_note_2</span>
                        </button>
                        <button
                          aria-label="Send Email"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFeedbackToast(`Direct email client opening for ${c.name}`);
                            setTimeout(() => setFeedbackToast(null), 3000);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-primary transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">mail</span>
                        </button>
                        <button
                          aria-label="Advance Stage"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvanceCandidate(c.id, 'assessment');
                            setFeedbackToast(`${c.name} advanced to Assessment stage`);
                            setTimeout(() => setFeedbackToast(null), 3000);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-primary transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">move_up</span>
                        </button>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-0.5">
                        Inspect <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCandidateId(c.id);
                      setDrawerOpen(true);
                    }}
                    className={`p-space-md rounded-xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all cursor-pointer border ${
                      selectedCandidateId === c.id
                        ? 'ring-2 ring-primary border-transparent'
                        : 'border-surface-container/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                        {c.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                        {c.matchScore}%
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{c.role}</p>
                    <div className="p-2 rounded-lg bg-surface-container-low mb-2 flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{c.appliedTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Assessment (4) */}
          <div className="flex flex-col w-[308px] shrink-0 rounded-xl bg-surface-container-low/70 p-space-sm shadow-xs border border-surface-container/60">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Assessment</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  4
                </span>
              </div>
              <button className="text-outline hover:text-on-surface p-1 rounded" type="button">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              {getCandidatesByStage('assessment').map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCandidateId(c.id);
                    setDrawerOpen(true);
                  }}
                  className={`p-space-md rounded-xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all cursor-pointer border ${
                    selectedCandidateId === c.id
                      ? 'ring-2 ring-primary border-transparent'
                      : 'border-surface-container/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {c.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                      {c.matchScore}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{c.role}</p>
                  <div className="mb-3">
                    <div className="flex justify-between font-label-sm text-label-sm mb-1">
                      <span className="text-on-surface-variant">Live Coding Challenge</span>
                      <span className="font-semibold text-primary">In Progress</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-outline font-label-sm text-label-sm pt-1 border-t border-surface-container/60">
                    <span>{c.appliedTime}</span>
                    <span className="text-on-surface font-medium">Due in 24h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Offer (2) */}
          <div className="flex flex-col w-[308px] shrink-0 rounded-xl bg-surface-container-low/70 p-space-sm shadow-xs border border-surface-container/60">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Offer</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                  2
                </span>
              </div>
              <button className="text-outline hover:text-on-surface p-1 rounded" type="button">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              {getCandidatesByStage('offer').map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCandidateId(c.id);
                    setDrawerOpen(true);
                  }}
                  className={`p-space-md rounded-xl bg-surface-container-lowest shadow-xs hover:shadow-md transition-all cursor-pointer border ${
                    selectedCandidateId === c.id
                      ? 'ring-2 ring-primary border-transparent'
                      : 'border-surface-container/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {c.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                      {c.matchScore}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{c.role}</p>
                  <div className="p-2 rounded-lg bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm mb-3">
                    Offer Package Sent · Expiring in 4 days
                  </div>
                  <div className="flex items-center justify-between text-outline font-label-sm text-label-sm border-t border-surface-container/60 pt-2">
                    <span className="font-semibold text-on-surface">$1,450 / mo</span>
                    <span className="text-primary font-medium">Pending Signing</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Hired (3) */}
          <div className="flex flex-col w-[308px] shrink-0 rounded-xl bg-surface-container-low/70 p-space-sm shadow-xs border border-surface-container/60">
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Hired</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">
                  3
                </span>
              </div>
              <button className="text-outline hover:text-on-surface p-1 rounded" type="button">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              {getCandidatesByStage('hired').map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCandidateId(c.id);
                    setDrawerOpen(true);
                  }}
                  className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs opacity-90 border border-surface-container/60"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      {c.name}
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">{c.role}</p>
                  <div className="p-2 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    {c.appliedTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Slide-Over Dossier Drawer: Ahmed Hassan */}
        {drawerOpen && (
          <aside
            className="w-full max-w-[460px] shrink-0 rounded-2xl bg-surface-container-lowest shadow-xl border border-surface-container p-space-lg flex flex-col gap-space-md transition-all duration-300 z-30 animate-in fade-in slide-in-from-right-5"
            id="candidate-drawer"
          >
            {/* Drawer Header Bar */}
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {selectedCandidate.stage.replace('_', ' ').toUpperCase()} Stage
                </span>
                <span className="font-label-sm text-label-sm text-outline">ID: #{selectedCandidate.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label="Pop-out View"
                  onClick={onOpenResume}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                </button>
                <button
                  aria-label="Close Drawer"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  id="close-drawer-btn"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Ahmed Profile Identity Header */}
            <div className="flex items-start gap-space-md">
              {selectedCandidate.avatar ? (
                <img
                  alt={`${selectedCandidate.name} Portrait`}
                  className="w-16 h-16 rounded-2xl object-cover shadow-xs ring-2 ring-primary/20 shrink-0"
                  src={selectedCandidate.avatar}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-bold text-xl shrink-0">
                  {selectedCandidate.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold truncate">
                    {selectedCandidate.name}
                  </h3>
                  {selectedCandidate.verified && (
                    <span className="material-symbols-outlined text-tertiary text-[20px]">verified</span>
                  )}
                </div>
                <span className="font-body-md text-body-md text-primary font-medium">
                  {selectedCandidate.role.split('·')[0]}
                </span>
                <span className="font-body-sm text-body-sm text-outline">Cairo, Egypt · Remote Available</span>
              </div>
            </div>

            {/* Match Score & Core Metadata Cards */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col border border-surface-container/60">
                <span className="font-label-sm text-label-sm uppercase text-outline">Salary Expectation</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {selectedCandidate.salaryExpectation || '$1,200 - $1,500'}
                  <span className="font-body-sm text-body-sm text-outline">/mo</span>
                </span>
              </div>
              <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col border border-surface-container/60">
                <span className="font-label-sm text-label-sm uppercase text-outline">AI Alignment</span>
                <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                  {selectedCandidate.matchScore}% High Fit
                </span>
              </div>
            </div>

            {/* Document & Portfolio Assets */}
            <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low border border-surface-container/60">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {selectedCandidate.name.replace(' ', '_')}_Resume.pdf
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Updated 3 days ago · 1.4 MB</span>
                </div>
              </div>
              <button
                onClick={onOpenResume}
                className="h-8 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md transition-colors flex items-center gap-1 shadow-xs border border-surface-container cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Preview
              </button>
            </div>

            {/* Interview Scorecard (Breakdown Visual) */}
            <div className="flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">Interview Scorecard</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  Overall: 4.65 / 5.0
                </span>
              </div>

              {/* Metric 1: Coding */}
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Live Coding & Python Idioms</span>
                  <span className="font-semibold text-on-surface">4.8 / 5.0</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '96%' }}></div>
                </div>
              </div>

              {/* Metric 2: Architecture */}
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">System Architecture & Scalability</span>
                  <span className="font-semibold text-on-surface">4.5 / 5.0</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '90%' }}></div>
                </div>
              </div>

              {/* Metric 3: Collaboration & Cultural Fit */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Async Communication & Leadership</span>
                  <span className="font-semibold text-on-surface">4.7 / 5.0</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary-fixed-dim rounded-full transition-all duration-500"
                    style={{ width: '94%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Private Hiring Team Notes (Clearly Delimited) */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs border border-surface-container/60">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">lock</span>
                  <span className="font-label-md text-label-md font-semibold">Private Hiring Team Notes</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm font-semibold">
                  Internal Only
                </span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {teamNotes.map((note, index) => (
                  <div
                    key={index}
                    className="p-space-sm rounded-lg bg-surface-container-lowest shadow-xs flex flex-col gap-1 border border-surface-container/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {note.author}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">{note.time}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="relative mt-2">
                <input
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full h-9 pl-3 pr-10 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm placeholder:text-outline outline-none shadow-xs border border-surface-container focus:ring-1 focus:ring-primary"
                  placeholder="Add confidential team note..."
                  type="text"
                />
                <button
                  aria-label="Send Note"
                  className="absolute right-1.5 top-1 p-1 text-primary hover:text-on-surface cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>

            {/* Action Triggers: Decision Workflow */}
            <div className="flex flex-col gap-space-xs pt-space-xs border-t border-surface-container">
              <span className="font-label-sm text-label-sm uppercase text-outline">Recruitment Decision</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onOpenSchedule(selectedCandidate.name)}
                  className="w-full h-11 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                  Schedule Next Round (VP Architecture)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenOffer(selectedCandidate.name, false)}
                    className="h-10 rounded-lg bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    Make Offer
                  </button>
                  <button
                    onClick={handleRejectCandidate}
                    className="h-10 rounded-lg bg-surface-container-low hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    Reject with Feedback
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
