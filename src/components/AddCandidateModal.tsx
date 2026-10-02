import React, { useState } from 'react';
import { KanbanCandidate } from '../types';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (candidate: KanbanCandidate) => void;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Backend Engineer');
  const [experience, setExperience] = useState('5 yrs');
  const [skills, setSkills] = useState('Python, Django, PostgreSQL, Redis');
  const [stage, setStage] = useState<KanbanCandidate['stage']>('applied');
  const [matchScore, setMatchScore] = useState(90);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCandidate: KanbanCandidate = {
      id: `CAN-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      role: `${role} · ${experience} exp`,
      experience: `${experience} exp`,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      matchScore: Number(matchScore),
      stage,
      appliedTime: 'Just added',
      verified: true,
    };

    onAdd(newCandidate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
            <h2 className="text-lg font-bold text-on-surface">Add Candidate to Pipeline</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              Candidate Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lindqvist"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Role Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Experience
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 6 yrs"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Initial Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              >
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="assessment">Assessment</option>
                <option value="offer">Offer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Match Score (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={matchScore}
                onChange={(e) => setMatchScore(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
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
              Add to Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
