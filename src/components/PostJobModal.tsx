import React, { useState } from 'react';
import { Job } from '../types';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostJob: (job: Job) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onPostJob }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [salary, setSalary] = useState('$140,000 - $175,000');
  const [salaryPeriod, setSalaryPeriod] = useState('/yr');
  const [tags, setTags] = useState('Python, Distributed Systems, FastAPI');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company) return;

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      company,
      verified: true,
      location: workMode === 'remote' ? `${location} (Remote)` : location,
      workMode,
      salary,
      salaryPeriod,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      postedTime: 'Just now',
      type: `Full-time • ${workMode === 'remote' ? 'Remote' : workMode === 'hybrid' ? 'Hybrid' : 'On-Site'}`,
      description: description || 'Exciting verified opportunity looking for high impact engineers.',
    };

    onPostJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">post_add</span>
            <h2 className="text-xl font-semibold text-on-surface">Post a Verified Position</h2>
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
              Job Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Nexus Tech"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Work Mode
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors text-sm"
              >
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Compensation Range
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $140,000 - $175,000"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Cadence
              </label>
              <select
                value={salaryPeriod}
                onChange={(e) => setSalaryPeriod(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors text-sm"
              >
                <option value="/yr">Per Year (/yr)</option>
                <option value="/mo">Per Month (/mo)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              Required Skills / Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Python, Django, AWS, Kubernetes"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
              Position Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline mission, key responsibilities, and team structure..."
              className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              Publish Verified Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
