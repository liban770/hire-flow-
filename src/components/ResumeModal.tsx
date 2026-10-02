import React from 'react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top PDF Reader Header */}
        <div className="h-14 px-6 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[22px]">description</span>
            <div>
              <span className="font-semibold text-on-surface text-sm">Ahmed_Hassan_Resume.pdf</span>
              <span className="text-xs text-on-surface-variant ml-2 font-mono">1.4 MB · Verified Dossier #CAN-9021</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Print"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable PDF Document Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f5f8f6] font-['Inter']">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-neutral-200 text-[#131e19]">
            {/* Header */}
            <div className="border-b border-neutral-200 pb-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Ahmed Hassan</h1>
                  <p className="text-base font-semibold text-[#005f3a] mt-0.5">Senior Backend & Distributed Systems Engineer</p>
                  <p className="text-xs text-neutral-500 mt-1">Cairo, Egypt · Remote Available · ahmed@hireflow.io · linkedin.com/in/ahmed-hassan</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#a8f3c5] text-[#27714d] text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  HireFlow Vetted
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Executive Summary</h2>
              <p className="text-xs leading-relaxed text-neutral-700">
                Staff-level backend engineer with 8+ years specializing in asynchronous Python architecture, high-throughput microservices,
                and scalable database infrastructure. Proven track record managing 45M+ daily requests with 99.99% uptime, distributed locking algorithms,
                and cloud migration on AWS/GCP.
              </p>
            </div>

            {/* Skills Matrix */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Technical Mastery</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-semibold text-neutral-900">Languages:</span> Python (AsyncIO, FastAPI, Django), Go, Rust (basics), SQL
                </div>
                <div>
                  <span className="font-semibold text-neutral-900">Data Stores:</span> PostgreSQL, Redis, Cassandra, DynamoDB, Elasticsearch
                </div>
                <div>
                  <span className="font-semibold text-neutral-900">Cloud & DevOps:</span> AWS (ECS, EKS, Lambda, SQS), Kubernetes, Docker, Terraform
                </div>
                <div>
                  <span className="font-semibold text-neutral-900">Architecture:</span> Event-driven, Distributed Consensus, gRPC, REST, Kafka
                </div>
              </div>
            </div>

            {/* Work History */}
            <div className="mb-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Professional Experience</h2>
              
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">Lead Backend Engineer — FinEdge Global</span>
                  <span className="text-neutral-500 font-mono">2021 – Present</span>
                </div>
                <p className="text-xs text-[#005f3a] font-medium">Enterprise Payments & Ledger Infrastructure</p>
                <ul className="list-disc list-inside text-xs text-neutral-700 mt-1 space-y-1">
                  <li>Architected distributed transaction settlement system processing $40M weekly in volume with zero ledger discrepancies.</li>
                  <li>Migrated monolithic Django service to containerized FastAPI microservices, reducing p99 latency by 64%.</li>
                  <li>Engineered Redis-backed distributed locking engine preventing double-spend anomalies across concurrent worker nodes.</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">Senior Software Engineer — CloudScale Technologies</span>
                  <span className="text-neutral-500 font-mono">2018 – 2021</span>
                </div>
                <p className="text-xs text-[#005f3a] font-medium">Distributed Data Pipeline Solutions</p>
                <ul className="list-disc list-inside text-xs text-neutral-700 mt-1 space-y-1">
                  <li>Built high-speed telemetry ingestion gateway processing 15,000 events/sec using Python AsyncIO and Kafka streams.</li>
                  <li>Optimized PostgreSQL queries and table partitioning strategies, shrinking database storage footprint by 40%.</li>
                </ul>
              </div>
            </div>

            {/* Education & Certs */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Education & Certifications</h2>
              <div className="text-xs text-neutral-800 space-y-1">
                <div className="flex justify-between">
                  <span><strong>B.Sc. in Computer Science & Engineering</strong> — Cairo University</span>
                  <span className="text-neutral-500">Graduated with Honors</span>
                </div>
                <div className="text-neutral-600">
                  AWS Certified Solutions Architect (Professional) · CKAD Kubernetes Application Developer
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-between">
          <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
            Identity & Education Verified on HireFlow Enterprise
          </span>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
