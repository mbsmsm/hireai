import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActivePage, ResumeAnalysisData, JobAnalysisData, ResumeItem } from '../../types';
import {
  getUserResumeAnalyses,
  getUserJobAnalyses,
  getUserResumes,
} from '../../lib/firestoreService';
import {
  Sparkles,
  TrendingUp,
  Target,
  FileText,
  Briefcase,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  setActivePage: (page: ActivePage) => void;
  setSelectedResumeId?: (id: string | null) => void;
  setSelectedAnalysis?: (analysis: ResumeAnalysisData | null) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActivePage,
  setSelectedResumeId,
  setSelectedAnalysis,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [resumeAnalyses, setResumeAnalyses] = useState<ResumeAnalysisData[]>([]);
  const [jobAnalyses, setJobAnalyses] = useState<JobAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [rList, aList, jList] = await Promise.all([
          getUserResumes(currentUser.uid),
          getUserResumeAnalyses(currentUser.uid),
          getUserJobAnalyses(currentUser.uid),
        ]);
        setResumes(rList);
        setResumeAnalyses(aList);
        setJobAnalyses(jList);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  const latestResumeAnalysis = resumeAnalyses[0] || null;
  const latestJobAnalysis = jobAnalyses[0] || null;

  // Extract top skills from latest analysis
  const detectedSkills = latestResumeAnalysis
    ? [...(latestResumeAnalysis.technicalSkills || []), ...(latestResumeAnalysis.softSkills || [])].slice(0, 10)
    : [];

  const handleViewResume = (analysis: ResumeAnalysisData) => {
    if (setSelectedAnalysis) setSelectedAnalysis(analysis);
    if (setSelectedResumeId) setSelectedResumeId(analysis.resumeId);
    setActivePage('resume-analyzer');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {userProfile?.name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor your ATS visibility, track job description alignments, and practice interview questions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('resume-analyzer')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            Upload New Resume
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm">Loading your dashboard insights...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Resume Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Latest Resume Score
                </span>
                <div className="h-8 w-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {latestResumeAnalysis ? latestResumeAnalysis.overallScore : '--'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ 100</span>
              </div>
              <div className="mt-3">
                {latestResumeAnalysis ? (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${latestResumeAnalysis.overallScore}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {latestResumeAnalysis.overallScore >= 80 ? 'Strong Candidate Profile' : 'Needs Optimization'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No resume analyzed yet</p>
                )}
              </div>
            </div>

            {/* 2. ATS Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ATS Pass Score
                </span>
                <div className="h-8 w-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {latestResumeAnalysis ? latestResumeAnalysis.atsScore : '--'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ 100</span>
              </div>
              <div className="mt-3">
                {latestResumeAnalysis ? (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${latestResumeAnalysis.atsScore}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-purple-400 font-medium">
                      {latestResumeAnalysis.atsScore >= 75 ? 'ATS Friendly Formatting' : 'Formatting Gaps Detected'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Upload resume to calculate</p>
                )}
              </div>
            </div>

            {/* 3. Job Match */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Latest Job Match
                </span>
                <div className="h-8 w-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {latestJobAnalysis ? `${latestJobAnalysis.matchScore}%` : '--'}
                </span>
              </div>
              <div className="mt-3">
                {latestJobAnalysis ? (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${latestJobAnalysis.matchScore}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-emerald-400 truncate block max-w-[200px]">
                      {latestJobAnalysis.jobTitle || 'Target Posting'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Run a match in Job Matcher</p>
                )}
              </div>
            </div>

            {/* 4. Detected Skills */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Detected Skills
                </span>
                <div className="h-8 w-8 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {detectedSkills.length > 0 ? detectedSkills.length : '--'}
                </span>
                <span className="text-xs text-slate-500 font-medium">skills indexed</span>
              </div>
              <div className="mt-3">
                <span className="text-[11px] text-indigo-400 block truncate">
                  {detectedSkills.slice(0, 3).join(', ') || 'No skills indexed yet'}
                </span>
              </div>
            </div>
          </div>

          {/* If No Resumes Uploaded - Helpful Empty State */}
          {resumes.length === 0 && (
            <div className="rounded-3xl border border-dashed border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-purple-950/20 p-8 sm:p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl sm:text-2xl font-bold text-white">
                Upload your first resume to unlock full analysis
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Upload your PDF or Word document. HireAI will extract skills, simulate an ATS screening, and benchmark your fit against target jobs.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActivePage('resume-analyzer')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  Analyze a Resume Now
                </button>
              </div>
            </div>
          )}

          {/* Detected Skills Cloud Card */}
          {detectedSkills.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Detected Skills Cloud</h3>
                  <p className="text-xs text-slate-400">Skills parsed by Gemini AI from your latest resume</p>
                </div>
                <button
                  onClick={() => setActivePage('resume-analyzer')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View Full Breakdown &rarr;
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 text-xs font-medium text-indigo-300"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Analyses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Analysis History */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Resume Analyses</h3>
                </div>
                <button
                  onClick={() => setActivePage('resume-analyzer')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  New Analysis
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-800/60">
                {resumeAnalyses.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">
                    No resume analyses recorded yet.
                  </p>
                ) : (
                  resumeAnalyses.slice(0, 5).map((an, i) => (
                    <div key={i} className="py-3.5 flex items-center justify-between group">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                          Resume Evaluation #{resumeAnalyses.length - i}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(an.createdAt).toLocaleDateString()}
                          </span>
                          <span>&bull;</span>
                          <span className="text-indigo-400 font-medium">Score: {an.overallScore}/100</span>
                          <span>&bull;</span>
                          <span className="text-purple-400 font-medium">ATS: {an.atsScore}/100</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewResume(an)}
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        View Report
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Job Matching History */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">Job Matching History</h3>
                </div>
                <button
                  onClick={() => setActivePage('job-matcher')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Match New Job
                </button>
              </div>

              <div className="mt-4 divide-y divide-slate-800/60">
                {jobAnalyses.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No job matching runs yet. Paste a job description to find keyword alignment!
                  </div>
                ) : (
                  jobAnalyses.slice(0, 5).map((job, i) => (
                    <div key={i} className="py-3.5 flex items-center justify-between group">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                          {job.jobTitle || 'Custom Job Description'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          <span>&bull;</span>
                          <span className="text-emerald-400 font-semibold">{job.matchScore}% Match</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActivePage('job-matcher')}
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-purple-600 hover:text-white transition-all"
                      >
                        View Alignment
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
