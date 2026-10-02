import React, { useState } from 'react';
import { ViewType } from '../types';

interface CompaniesViewProps {
  onNavigate: (view: ViewType) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const companies = [
    {
      id: 'comp-1',
      name: 'TechFlow Global',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCokkNZ8_gq6yJeVhTZJIJs7X5SgZulwZqMAQFgw8jlS67R_C_94IXD9vnkTKgxDJCffh1wm4j6h1UPPrfJMmP_ahEQ0MY8YqAhoYOFZ93XqxnnhSVQsVx8oshN8xhf-196dJmzabRn8rtqeDaB4yXMSpn5X7xwNnIP_TTSgL8v7rsQFltFsa04lhklMZaMb2H8-1tgbnvViJeUE3EV9VZoVCLCw6vnnMGt9KLgSJehe_wUi0cXcjU',
      industry: 'Cloud Infrastructure',
      location: 'Hargeisa / Global Remote',
      verified: true,
      openJobs: 4,
      employees: '120-250',
      description: 'Architecting scalable distributed cloud compute runtimes and developer databases.',
    },
    {
      id: 'comp-2',
      name: 'FinScale Corp',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9Fu6oiYU7b6zI3TGDFSFNcQfL5LiLoGVgfAMyUbGzFFc3X3U5i2tKYxEwnnNpIhBE5FeqNgy9qzbvSfDARQZj9kZiijHsywV2xcMtgot-spsa5XgsFLWFWHBl5nW54DZKdGwlaIgT_GgsujPGQRaBx7PToaUE4qPldXhArZ6plgKVgXbS_fZgcDcH5d5i-Mf_B1WDevSa8Jw4ZgOVJi6ctCBbj-w5rh584F1SbKS0HNAc6CoPUVE',
      industry: 'Fintech & Rails',
      location: 'San Francisco, CA',
      verified: true,
      openJobs: 6,
      employees: '350-500',
      description: 'Institutional-grade asset liquidity settlement and next-generation banking workflows.',
    },
    {
      id: 'comp-3',
      name: 'CloudPulse Systems',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkrpS7cRDfigLLHNXY04EVmzUea19bzNLT3ibA3MSus2KVTeSipaQhiRCCQkt8ZaL4UOagB418_MR31e9MAWJiZl-RxxJkfbMVWBeVh1r4dseCRtRO6DqtwyuUbbQC596Mge_0OqDfCS1ooE1AB_GwlCg-aFK2gXP51WNp3st1sPJ3RoKJ-f42ysGTBaZJ6eAbfexr1tefm_WlkFrOBXJbK0dYHax77REe8CcBEsWb13v5W2Xud2s',
      industry: 'Developer Tools',
      location: 'Global Remote',
      verified: true,
      openJobs: 3,
      employees: '80-150',
      description: 'Observability and automated incident response telemetry engines for high-scale teams.',
    },
    {
      id: 'comp-4',
      name: 'BioHealth AI',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVKSL-cB4hLy3LUBX0sE6o9GBrN1lDKrdyqe_A5IjLV4OepiJmYiSp9VkT1LW3_aai34--OWZN3L325DiNkP0NzR19erthZGUYiqS2wGJu3KPbwIJbHY-HfMfLw-SvMP5Sp-ySsiSUeLBIwEpcTw8QFhOnPUD-Bsto7gh2yDGNMOWpMAt24UN8MHGjb3QIU9X-TXwJWA7GiYkFYQr1JfuHKNnBjyeLapgLx5JZzB5VS0mqkWOdAms',
      industry: 'Biotech & Health',
      location: 'New York, NY',
      verified: true,
      openJobs: 5,
      employees: '200-300',
      description: 'Applying deep foundation models to accelerate oncology research and clinical trial discovery.',
    },
    {
      id: 'comp-5',
      name: 'Datadog',
      industry: 'Observability & Cloud',
      location: 'San Francisco, CA / Remote',
      verified: true,
      openJobs: 12,
      employees: '5,000+',
      description: 'Unified monitoring and security platform for cloud-scale applications.',
    },
    {
      id: 'comp-6',
      name: 'Snowflake',
      industry: 'Data Cloud',
      location: 'Bellevue, WA / Hybrid',
      verified: true,
      openJobs: 8,
      employees: '7,000+',
      description: 'Mobilizing the world’s data with Snowflake Data Cloud.',
    },
  ];

  const filtered = companies.filter((c) => {
    if (selectedIndustry !== 'All' && c.industry !== selectedIndustry) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-lg px-4 md:px-0">
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold w-max mb-1">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          Tier-1 Vetted Enterprises
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Verified Employer Directory</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Browse verified companies with guaranteed payroll capabilities, active engineering roadmaps, and audited hiring pipelines.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search verified companies by name, domain, or location..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low text-on-surface text-sm outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Cloud Infrastructure', 'Fintech & Rails', 'Biotech & Health'].map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedIndustry === ind
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filtered.map((company) => (
          <div
            key={company.id}
            className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs hover:shadow-md transition-all border border-surface-container/60 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center font-bold text-primary text-base overflow-hidden border border-surface-container-high/60 shrink-0">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      company.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {company.name}
                      </h3>
                      {company.verified && (
                        <span
                          className="material-symbols-outlined text-[16px] text-tertiary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Verified Employer"
                        >
                          verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">{company.location}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">
                  {company.openJobs} Open Roles
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                {company.description}
              </p>
            </div>

            <div className="pt-3 border-t border-surface-container/60 flex items-center justify-between">
              <span className="text-[11px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">domain</span>
                {company.industry}
              </span>
              <button
                onClick={() => onNavigate('find-jobs')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View Roles <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
