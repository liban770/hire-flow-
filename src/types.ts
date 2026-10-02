export type ViewType = 'find-jobs' | 'companies' | 'candidate-portal' | 'employer-portal' | 'admin';

export type UserRole = 'candidate' | 'employer' | 'admin';
export type AccountStatus = 'active' | 'pending_approval' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  companyName?: string;
  title?: string;
  avatar?: string;
  status: AccountStatus;
  createdAt: string;
  verified?: boolean;
  registrationType: 'candidate' | 'company';
  bio?: string;
  dossierSummary?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  logoBg?: string;
  verified?: boolean;
  badge?: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  salary: string;
  salaryPeriod: string;
  tags: string[];
  postedTime: string;
  type: string;
  description?: string;
  department?: string;
}

export interface CandidateApplication {
  id: string;
  company: string;
  role: string;
  workMode: string;
  appliedDate: string;
  salary: string;
  status: 'Under Review' | 'Shortlisted' | 'Interviews' | 'Offers' | 'Rejected';
  statusDetail: string;
  statusBadgeColor?: string;
  nextStep: string;
  nextStepIcon: string;
  priority?: string;
  hasOffer?: boolean;
  iconName: string;
  iconBg: string;
  decisionDeadline?: string;
}

export interface KanbanCandidate {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  experience: string;
  skills: string[];
  matchScore: number;
  stage: 'applied' | 'under_review' | 'shortlisted' | 'interview' | 'assessment' | 'offer' | 'hired';
  appliedTime: string;
  verified?: boolean;
  salaryExpectation?: string;
  assessmentStatus?: string;
  interviewNote?: string;
  offerDetails?: string;
  isKey?: boolean;
  rating?: number;
}

export interface VerificationQueueItem {
  id: string;
  companyName: string;
  businessType: string;
  initials: string;
  domain: string;
  regNumber: string;
  dossierFiles: { name: string; type: string; verified?: boolean }[];
  status: 'Pending Review' | 'Document Verified' | 'Incomplete Submission';
  isElite?: boolean;
  missingDocs?: boolean;
}

export interface ModerationJobItem {
  id: string;
  title: string;
  company: string;
  initials: string;
  salary: string;
  location: string;
  postedTime: string;
  qualityScore: number;
  status: 'clean' | 'flagged';
  flagReason?: string;
  riskScore?: number;
  verifiedEmployer?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  category: 'Identity KYC' | 'Security Alert' | 'Access Grant' | 'Compliance';
  dotColor: 'primary' | 'error' | 'secondary' | 'tertiary';
}

export type ActivityEventType = 'login' | 'account_approval' | 'job_posting' | 'security_event';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  formattedTime: string;
  relativeTime?: string;
  type: ActivityEventType;
  actor: {
    name: string;
    email: string;
    role: UserRole | 'system';
  };
  action: string;
  target?: {
    name: string;
    type?: string;
    id?: string;
  };
  status: 'success' | 'warning' | 'alert' | 'info';
  ipAddress: string;
  details?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'interview' | 'offer' | 'application' | 'security';
}
