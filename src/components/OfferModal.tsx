import React, { useState } from 'react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  isCandidateReview?: boolean;
  onSuccess: (offerDetails: string) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  isCandidateReview = false,
  onSuccess,
}) => {
  const [baseSalary, setBaseSalary] = useState(isCandidateReview ? '$210,000' : '$1,450');
  const [equity, setEquity] = useState(isCandidateReview ? '0.15% Options' : 'Annual Performance Bonus');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [deadline, setDeadline] = useState('2026-10-28');

  if (!isOpen) return null;

  const handleAction = (status: string) => {
    onSuccess(status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
            <h2 className="text-lg font-bold text-on-surface">
              {isCandidateReview ? 'Review Official Offer Package' : 'Extend Verified Offer Package'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-secondary-container/40 border border-secondary-container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">military_tech</span>
              </div>
              <div>
                <span className="text-sm font-bold text-on-secondary-container">
                  {candidateName}
                </span>
                <p className="text-xs text-secondary font-medium">Requisition: Senior Python Developer</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary font-semibold text-xs shadow-xs">
              Verified Pipeline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-surface-container-low">
              <label className="block text-[11px] font-semibold uppercase text-on-surface-variant mb-1">
                Base Compensation
              </label>
              <input
                type="text"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                disabled={isCandidateReview}
                className="w-full text-base font-bold text-primary bg-transparent outline-none"
              />
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low">
              <label className="block text-[11px] font-semibold uppercase text-on-surface-variant mb-1">
                Equity / Incentives
              </label>
              <input
                type="text"
                value={equity}
                onChange={(e) => setEquity(e.target.value)}
                disabled={isCandidateReview}
                className="w-full text-base font-bold text-on-surface bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-container-low">
              <span className="text-on-surface-variant">Target Start Date:</span>
              <div className="font-semibold text-on-surface mt-0.5">{startDate}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low">
              <span className="text-error font-medium">Decision Deadline:</span>
              <div className="font-semibold text-error mt-0.5">{deadline} (6 days left)</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[16px]">lock</span>
              HireFlow Escrow & Employment Guarantee
            </div>
            <p>
              Includes entity verification, payroll bonding, automated direct deposit settlement, and 30-day trial protection.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {isCandidateReview ? (
              <>
                <button
                  type="button"
                  onClick={() => handleAction('declined')}
                  className="h-10 px-4 rounded-lg bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant font-semibold text-xs transition-colors"
                >
                  Decline Offer
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('accepted')}
                  className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-sm transition-all"
                >
                  Accept Offer Package
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('dispatched')}
                  className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-sm transition-all"
                >
                  Dispatch Offer Package
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
