import React, { useState } from 'react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  onSuccess: (date: string, time: string, round: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  onSuccess,
}) => {
  const [round, setRound] = useState('VP Architecture Round');
  const [date, setDate] = useState('2026-10-24');
  const [time, setTime] = useState('14:00');
  const [interviewer, setInterviewer] = useState('Sarah Jenkins (Engineering VP)');
  const [notes, setNotes] = useState('Deep dive into distributed locking, database sharding, and fault tolerance.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(date, time, round);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
            <h2 className="text-lg font-bold text-on-surface">Schedule Interview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
            Candidate: <strong className="text-on-surface">{candidateName}</strong> (#CAN-9021)
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              Interview Stage / Round
            </label>
            <select
              value={round}
              onChange={(e) => setRound(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            >
              <option value="VP Architecture Round">VP Architecture Round (Technical)</option>
              <option value="System Design Deep-Dive">System Design Deep-Dive</option>
              <option value="Cultural Leadership & Team Fit">Cultural Leadership & Team Fit</option>
              <option value="Executive Final Decision">Executive Final Decision</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Time (EST)
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              Lead Interviewer
            </label>
            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              Pre-brief / Focus Areas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all"
            >
              Confirm & Dispatch Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
