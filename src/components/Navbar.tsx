import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActivePage } from '../types';
import { FileText, Sparkles, Menu, X, ArrowRight, UserCircle, LogOut, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setActivePage('landing');
      setMobileMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav(currentUser ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Hire<span className="text-indigo-400">AI</span></span>
            <span className="hidden sm:inline-block ml-2 rounded-full bg-indigo-950/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-800/60">
              SaaS v1.0
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {!currentUser ? (
            <>
              <button
                onClick={() => handleNav('landing')}
                className={`text-sm font-medium transition-colors ${
                  activePage === 'landing' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                Home
              </button>
              <a
                href="#features"
                onClick={(e) => {
                  if (activePage !== 'landing') {
                    e.preventDefault();
                    setActivePage('landing');
                    setTimeout(() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  if (activePage !== 'landing') {
                    e.preventDefault();
                    setActivePage('landing');
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                How It Works
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('dashboard')}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  activePage === 'dashboard' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => handleNav('resume-analyzer')}
                className={`text-sm font-medium transition-colors ${
                  activePage === 'resume-analyzer' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                Resume Analyzer
              </button>
              <button
                onClick={() => handleNav('job-matcher')}
                className={`text-sm font-medium transition-colors ${
                  activePage === 'job-matcher' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                Job Matcher
              </button>
              <button
                onClick={() => handleNav('interview-prep')}
                className={`text-sm font-medium transition-colors ${
                  activePage === 'interview-prep' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                Interview Prep
              </button>
            </>
          )}
        </nav>

        {/* Desktop CTA / Auth */}
        <div className="hidden md:flex items-center gap-3">
          {!currentUser ? (
            <>
              <button
                onClick={() => handleNav('login')}
                className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => handleNav('register')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('profile')}
                className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700/60 hover:bg-slate-700/80 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white uppercase">
                  {userProfile?.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{userProfile?.name || currentUser.displayName || 'Account'}</span>
              </button>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="rounded-xl p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-900 px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col gap-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => handleNav('landing')}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    handleNav('landing');
                    setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    handleNav('landing');
                    setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  How It Works
                </button>
                <div className="mt-3 flex flex-col gap-2 border-t border-slate-800 pt-3">
                  <button
                    onClick={() => handleNav('login')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNav('register')}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Get Started
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('resume-analyzer')}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Resume Analyzer
                </button>
                <button
                  onClick={() => handleNav('job-matcher')}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Job Matcher
                </button>
                <button
                  onClick={() => handleNav('interview-prep')}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Interview Prep
                </button>
                <button
                  onClick={() => handleNav('profile')}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Profile & Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-lg border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-left text-sm font-medium text-rose-300 hover:bg-rose-900/40"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
