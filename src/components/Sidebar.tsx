import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActivePage } from '../types';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { currentUser, userProfile, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as ActivePage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'resume-analyzer' as ActivePage,
      label: 'Resume Analyzer',
      icon: FileText,
      badge: 'ATS Score',
    },
    {
      id: 'job-matcher' as ActivePage,
      label: 'Job Matcher',
      icon: Briefcase,
      badge: 'Match %',
    },
    {
      id: 'interview-prep' as ActivePage,
      label: 'Interview Prep',
      icon: MessageSquare,
      badge: 'AI Coach',
    },
    {
      id: 'profile' as ActivePage,
      label: 'Profile',
      icon: User,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Platform
          </p>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-indigo-500/30 text-indigo-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tips / AI Status Card */}
        <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>AI Powered</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            Gemini 3.8 Flash powers semantic matching and ATS scoring in real-time.
          </p>
        </div>
      </div>

      {/* User profile & Logout footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActivePage('profile')}
            className="flex items-center gap-3 text-left overflow-hidden group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white uppercase shadow-sm">
              {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                {userProfile?.name || 'Candidate'}
              </p>
              <p className="text-[11px] text-slate-500 truncate max-w-[120px]">
                {currentUser?.email || ''}
              </p>
            </div>
          </button>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
