import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActivePage, ResumeItem, JobAnalysisData, InterviewSessionData } from '../../types';
import {
  getUserResumes,
  getUserJobAnalyses,
  getUserInterviewSessions,
} from '../../lib/firestoreService';
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  FileText,
  Briefcase,
  MessageSquare,
  Award,
  CheckCircle2,
  HardDrive,
  Cpu,
} from 'lucide-react';

interface ProfilePageProps {
  setActivePage: (page: ActivePage) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setActivePage }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [jobMatches, setJobMatches] = useState<JobAnalysisData[]>([]);
  const [interviews, setInterviews] = useState<InterviewSessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getUserResumes(currentUser.uid),
      getUserJobAnalyses(currentUser.uid),
      getUserInterviewSessions(currentUser.uid),
    ])
      .then(([r, j, i]) => {
        setResumes(r);
        setJobMatches(j);
        setInterviews(i);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    setActivePage('landing');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Candidate Profile & Account Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your account details, authenticated session, and stored application assets.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white uppercase shadow-md shadow-indigo-600/25">
              {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {userProfile?.name || currentUser?.displayName || 'Candidate'}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                {currentUser?.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Authenticated via Firebase
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/30 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 hover:text-white transition-all self-start sm:self-center"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Account Metadata Details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
              Firebase UID
            </span>
            <span className="font-mono text-slate-300 text-xs mt-1 block truncate">
              {currentUser?.uid || 'Not available'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
              Account Created
            </span>
            <span className="text-slate-300 text-xs mt-1 block">
              {userProfile?.createdAt
                ? new Date(userProfile.createdAt).toLocaleDateString()
                : 'Active Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Your Activity Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resumes Saved
              </span>
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">
              {resumes.length}
            </div>
            <span className="mt-1 text-[11px] text-slate-500 block">
              In Firestore & Cloudinary
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Job Matches
              </span>
              <Briefcase className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">
              {jobMatches.length}
            </div>
            <span className="mt-1 text-[11px] text-slate-500 block">
              Descriptions Analyzed
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Prep Sessions
              </span>
              <MessageSquare className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">
              {interviews.length}
            </div>
            <span className="mt-1 text-[11px] text-slate-500 block">
              Question Packs Generated
            </span>
          </div>
        </div>
      </div>

      {/* Security & System Info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-400" />
          Data Isolation & Privacy Guarantee
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          HireAI applies strict Attribute-Based Access Control (ABAC) in Cloud Firestore security rules. Your uploaded resumes, ATS scores, and interview sessions can only be read or modified by your authenticated account UID (<code className="font-mono text-indigo-300">request.auth.uid == userId</code>).
        </p>
        <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            No public document reads
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Zero client Gemini API key leakage
          </span>
        </div>
      </div>
    </div>
  );
};
