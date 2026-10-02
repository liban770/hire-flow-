import React, { useState } from 'react';
import { Job } from '../types';

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (jobTitle: string, company: string) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('Ahmed Hassan');
  const [email, setEmail] = useState('ahmed@hireflow.io');
  const [portfolio, setPortfolio] = useState('https://github.com/ahmed-hassan');
  const [note, setNote] = useState('I bring 8+ years building distributed Python backends, high throughput APIs, and event streaming systems.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSuccess(job.title, job.company);
      setSubmitted(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between pb-4 border-b border-surface-container">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Fast Pipeline Application</span>
            <h2 className="text-xl font-bold text-on-surface mt-0.5">{job.title}</h2>
            <p className="text-xs text-on-surface-variant">
              {job.company} • {job.location} • <span className="text-secondary font-semibold">{job.salary}{job.salaryPeriod}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-secondary-container text-primary flex items-center justify-center mb-3 animate-bounce">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Application Dispatched!</h3>
            <p className="text-sm text-on-surface-variant mt-1 max-w-xs">
              Your verified dossier and resume were delivered to {job.company}'s hiring team with 72h SLA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="p-3 rounded-xl bg-surface-container-low flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                AH
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-on-surface">Ahmed_Hassan_Resume.pdf</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-semibold">96% Matched</span>
                </div>
                <span className="text-xs text-on-surface-variant">Verified Distributed Systems & Python Credential attached</span>
              </div>
              <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                GitHub / Portfolio URL
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Recruiter Direct Note
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">lock</span>
                Direct verified submission
              </span>
              <div className="flex items-center gap-2">
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
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
