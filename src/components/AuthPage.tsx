import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { HireFlowLogo } from './HireFlowLogo';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  userList: User[];
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  userList,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [regType, setRegType] = useState<'candidate' | 'company'>('candidate');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Quick switch role selector state (collapsible to keep UI secure)
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = userList.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!user) {
        setErrorMsg('Invalid email or credentials. Please check your credentials or register an account.');
        return;
      }

      if (user.password && user.password !== password) {
        setErrorMsg('Invalid credentials provided. Please check and try again.');
        return;
      }

      onLogin(user);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (userList.some((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setErrorMsg('An account with this email address already exists.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long for enterprise security compliance.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const role: UserRole = regType === 'company' ? 'employer' : 'candidate';
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role,
        companyName: regType === 'company' ? regCompanyName.trim() : undefined,
        title: regType === 'company' ? 'Recruiter / Hiring Lead' : regTitle.trim(),
        status: 'pending_approval',
        createdAt: 'Just now',
        registrationType: regType,
        bio: regBio.trim(),
        dossierSummary:
          regType === 'company'
            ? `New company submission: ${regCompanyName}. Corporate domain: ${regEmail.split('@')[1] || 'domain'}. Awaiting tax & entity audit.`
            : `Individual talent profile: ${regTitle}. Identity KYC submitted, awaiting background verification approval.`,
      };

      onRegister(newUser);
      setRegSuccess(
        `Account successfully created! For platform security, all new ${
          regType === 'company' ? 'company' : 'professional'
        } accounts require Administrator verification before full marketplace access is granted.`
      );
      // Pre-fill email in sign-in mode
      setEmail(newUser.email);
      setPassword(regPassword);
      setMode('signin');
    }, 800);
  };

  const fillQuickLogin = (selectedUser: User) => {
    setEmail(selectedUser.email);
    setPassword(selectedUser.password || 'password123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between relative overflow-hidden font-['Inter']">
      {/* Ambient background glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[780px] h-[380px] bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-fixed-dim/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Simple Header */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-surface-container/60 bg-surface-container-lowest/60 backdrop-blur-md">
        <HireFlowLogo size="md" />
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/60 text-secondary text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            SOC2 Type II & 256-Bit TLS Secured
          </span>
        </div>
      </header>

      {/* Main Form Center Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header & Mode Switcher */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              {mode === 'signin' ? 'Sign in to HireFlow' : 'Create an Account'}
            </h1>
            <p className="text-xs text-on-surface-variant mt-1.5">
              {mode === 'signin'
                ? 'Enter your verified credentials to access your talent workspace'
                : 'Join the verified talent exchange for elite professionals and employers'}
            </p>

            {/* Segmented Mode Selector */}
            <div className="mt-4 p-1 bg-surface-container-low rounded-xl flex items-center border border-surface-container/60">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {regSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-secondary-container/80 text-on-secondary-container text-xs flex items-start gap-2 border border-secondary-container">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
                verified
              </span>
              <p className="leading-relaxed">{regSuccess}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-error-container/60 text-on-error-container text-xs flex items-start gap-2 border border-error-container">
              <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">
                error
              </span>
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline pointer-events-none">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(
                        'For security, password reset tokens are sent to registered emails with active admin approval.'
                      );
                    }}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-outline hover:text-on-surface cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-on-surface-variant">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" />
                  <span>Remember this device</span>
                </label>
                <span className="text-secondary flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  Encrypted
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Account Type Toggle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegType('candidate')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regType === 'candidate'
                        ? 'border-primary bg-secondary-container/40 text-primary shadow-xs'
                        : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Professional Talent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegType('company')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regType === 'company'
                        ? 'border-primary bg-secondary-container/40 text-primary shadow-xs'
                        : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">domain</span>
                    Hiring Company
                  </button>
                </div>
              </div>

              {/* Full Name / Contact */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  {regType === 'company' ? 'Authorized Recruiter / Contact Name' : 'Full Legal Name'}
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={regType === 'company' ? 'e.g. Alex Morgan' : 'e.g. Maya Lindqvist'}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors"
                />
              </div>

              {/* Company Specific: Company Name */}
              {regType === 'company' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Company Legal Entity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    placeholder="e.g. Synthetix Labs Inc."
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors"
                  />
                </div>
              )}

              {/* Candidate Specific: Role Title */}
              {regType === 'candidate' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Primary Specialization / Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder="e.g. Staff Distributed Systems Engineer"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  {regType === 'company' ? 'Corporate Work Email' : 'Professional Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder={regType === 'company' ? 'recruiting@company.io' : 'name@email.com'}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Create Secure Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full h-10 px-3 pr-10 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-outline hover:text-on-surface cursor-pointer p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Brief Bio / Mission */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  {regType === 'company' ? 'Hiring Scope / Mission' : 'Key Technical Focus Areas'}
                </label>
                <textarea
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder={
                    regType === 'company'
                      ? 'e.g. Scaling cloud platform team across US & Europe'
                      : 'e.g. Python AsyncIO, Kubernetes, Kafka, high-throughput APIs'
                  }
                  className="w-full p-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none border border-transparent focus:border-primary focus:bg-surface-container-lowest transition-colors resize-none"
                />
              </div>

              {/* Admin Approval Notice */}
              <div className="p-3 rounded-xl bg-surface-container-low/70 border border-surface-container text-xs text-on-surface-variant leading-relaxed">
                <span className="font-semibold text-primary flex items-center gap-1 mb-0.5">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  Admin Verification Protocol
                </span>
                New accounts are placed in the Admin Verification Queue. Once reviewed, you will be approved with full verified badge permissions.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    Registering Account...
                  </>
                ) : (
                  <>
                    <span>Submit Account for Verification</span>
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Access / Persona Switcher Drawer (To facilitate seamless testing without guessing) */}
          <div className="mt-6 pt-5 border-t border-surface-container">
            <button
              type="button"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="w-full flex items-center justify-between text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-primary">key</span>
                Quick Demo Persona Sign-In
              </span>
              <span className="material-symbols-outlined text-[16px]">
                {showRoleSelector ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showRoleSelector && (
              <div className="mt-3 space-y-2 animate-in fade-in">
                <p className="text-[11px] text-on-surface-variant mb-2">
                  Select a test account to auto-fill credentials:
                </p>

                {/* 1. Admin */}
                <div
                  onClick={() => fillQuickLogin(userList.find((u) => u.role === 'admin') || userList[0])}
                  className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors flex items-center justify-between border border-surface-container/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                      AD
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-on-surface">Platform Administrator</span>
                      <span className="text-[10px] text-on-surface-variant">admin.m_vance@hireflow.io</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded bg-surface-container-lowest">
                    Approves Accounts
                  </span>
                </div>

                {/* 2. Candidate (Ahmed) */}
                <div
                  onClick={() => fillQuickLogin(userList.find((u) => u.email === 'ahmed@hireflow.io') || userList[1])}
                  className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors flex items-center justify-between border border-surface-container/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-secondary text-on-secondary text-[10px] font-bold flex items-center justify-center">
                      AH
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-on-surface">Ahmed Hassan (Candidate)</span>
                      <span className="text-[10px] text-on-surface-variant">ahmed@hireflow.io</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-secondary px-2 py-0.5 rounded bg-surface-container-lowest">
                    Candidate Portal
                  </span>
                </div>

                {/* 3. Employer */}
                <div
                  onClick={() => fillQuickLogin(userList.find((u) => u.role === 'employer') || userList[2])}
                  className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors flex items-center justify-between border border-surface-container/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-tertiary text-on-tertiary text-[10px] font-bold flex items-center justify-center">
                      TG
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-on-surface">TechFlow Ops (Employer)</span>
                      <span className="text-[10px] text-on-surface-variant">enterprise@hireflow.io</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-tertiary px-2 py-0.5 rounded bg-surface-container-lowest">
                    Pipeline Kanban
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Clean Trust Footer */}
      <footer className="py-4 text-center text-xs text-on-surface-variant border-t border-surface-container/60 bg-surface-container-lowest/60">
        <span>© 2025 HireFlow Systems Inc. Enterprise Security Gateway • All Rights Reserved</span>
      </footer>
    </div>
  );
};
