import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActivePage, ResumeItem, JobAnalysisData } from '../../types';
import { SAMPLE_JOBS, SAMPLE_RESUMES } from '../../utils/sampleData';
import {
  getUserResumes,
  saveJobAnalysis,
  getUserJobAnalyses,
} from '../../lib/firestoreService';
import {
  Target,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Loader2,
  FileText,
  Building,
  Check,
  X,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

interface JobMatcherPageProps {
  setActivePage: (page: ActivePage) => void;
  selectedResumeId?: string | null;
  setTargetJobForInterview?: (data: { jobTitle: string; jobDescription: string; resumeText: string }) => void;
}

export const JobMatcherPage: React.FC<JobMatcherPageProps> = ({
  setActivePage,
  selectedResumeId,
  setTargetJobForInterview,
}) => {
  const { currentUser } = useAuth();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [chosenResumeId, setChosenResumeId] = useState<string>(selectedResumeId || '');
  const [customResumeText, setCustomResumeText] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('Senior Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState<string>(SAMPLE_JOBS[0].description);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisData | null>(null);
  const [pastJobAnalyses, setPastJobAnalyses] = useState<JobAnalysisData[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    getUserResumes(currentUser.uid).then((items) => {
      setResumes(items);
      if (!chosenResumeId && items.length > 0) {
        setChosenResumeId(items[0].id);
      }
    });

    getUserJobAnalyses(currentUser.uid).then(setPastJobAnalyses);
  }, [currentUser]);

  // If chosen resume changes, set active resume text
  const selectedResume = resumes.find((r) => r.id === chosenResumeId);
  const activeResumeContent = selectedResume ? selectedResume.extractedText : customResumeText || SAMPLE_RESUMES[0].text;

  const handleSelectPresetJob = (sample: typeof SAMPLE_JOBS[0]) => {
    setJobTitle(sample.title);
    setJobDescription(sample.description);
  };

  const handleRunMatch = async () => {
    if (!currentUser) {
      setActivePage('login');
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError('Please provide a complete job description to match against.');
      return;
    }

    if (!activeResumeContent.trim()) {
      setError('Please select or provide a resume.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: activeResumeContent,
          jobDescription,
          jobTitle,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error ${response.status}`);
      }

      const matchData = await response.json();

      // Save analysis in Firestore
      const record: Omit<JobAnalysisData, 'id'> = {
        userId: currentUser.uid,
        resumeId: chosenResumeId || 'custom',
        jobTitle: jobTitle || 'Target Role',
        jobDescription,
        matchScore: matchData.matchScore || 70,
        matchingSkills: matchData.matchingSkills || [],
        missingSkills: matchData.missingSkills || [],
        relevantExperience: matchData.relevantExperience || [],
        jobRequirements: matchData.jobRequirements || [],
        recommendations: matchData.recommendations || [],
        resumeImprovements: matchData.resumeImprovements || [],
        createdAt: new Date().toISOString(),
      };

      const docId = await saveJobAnalysis(record);
      const fullAnalysis: JobAnalysisData = {
        id: docId,
        ...record,
      };

      setAnalysisResult(fullAnalysis);
      getUserJobAnalyses(currentUser.uid).then(setPastJobAnalyses);
    } catch (err: any) {
      console.error('Job match error:', err);
      setError(err.message || 'Failed to analyze job match.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToInterview = () => {
    if (setTargetJobForInterview) {
      setTargetJobForInterview({
        jobTitle: jobTitle || 'Target Role',
        jobDescription,
        resumeText: activeResumeContent,
      });
    }
    setActivePage('interview-prep');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-950/80 border border-purple-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400">
              Module 2
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Job Matcher & Gap Analysis
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Compare your resume against any job description. Get match scores, discover missing keywords, and tailor bullet points.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={() => setAnalysisResult(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Match Another Job
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Input Form (shown if no active result) */}
      {!analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Configuration & Resume Selection */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                1. Select Source Resume
              </h3>

              {resumes.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Your Analyzed Resumes
                  </label>
                  <select
                    value={chosenResumeId}
                    onChange={(e) => setChosenResumeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                    <option value="custom">-- Use Sample / Custom Text --</option>
                  </select>
                </div>
              ) : (
                <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3.5 text-xs text-slate-300">
                  <p className="font-semibold text-indigo-300">No uploaded resumes detected</p>
                  <p className="mt-1 text-slate-400">
                    We'll use a sample engineer resume (Alex Rivera), or you can upload your own in the Resume Analyzer.
                  </p>
                  <button
                    onClick={() => setActivePage('resume-analyzer')}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Upload Resume &rarr;
                  </button>
                </div>
              )}

              {/* Target Job Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Sample Job Presets */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Quick Presets:
                </span>
                <div className="flex flex-col gap-2">
                  {SAMPLE_JOBS.map((j, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPresetJob(j)}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 text-xs text-slate-300 hover:border-indigo-500/60 hover:text-white transition-colors"
                    >
                      <div className="font-semibold text-indigo-300">{j.title}</div>
                      <div className="text-[10px] text-slate-500">{j.company}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Job Description Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-400" />
                  2. Paste Job Description
                </h3>
                <span className="text-[11px] text-slate-500">
                  {jobDescription.length} characters
                </span>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={14}
                placeholder="Paste the full job posting requirements and responsibilities here..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3.5 text-xs text-slate-200 leading-relaxed font-mono placeholder-slate-600 focus:border-purple-500 focus:outline-none"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunMatch}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Matching against resume...</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span>Analyze Job Match</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Result Display */}
      {analysisResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Score Banner */}
          <div className="rounded-3xl border border-purple-900/50 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="rounded-full bg-purple-900/60 border border-purple-700/60 px-3 py-1 text-xs font-bold text-purple-300">
                AI Match Alignment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {analysisResult.jobTitle || 'Target Position'}
              </h2>
              <p className="text-xs text-slate-400 max-w-lg">
                Calculated by semantic vector matching between candidate experience bullets and job criteria.
              </p>
            </div>

            {/* Score Radial / Badge */}
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  {analysisResult.matchScore}%
                </span>
              </div>
              <span className="mt-1 text-xs font-semibold text-emerald-400">
                {analysisResult.matchScore >= 80
                  ? 'Strong Candidate Fit'
                  : analysisResult.matchScore >= 60
                  ? 'Moderate Alignment'
                  : 'Requires Skill Expansion'}
              </span>
            </div>
          </div>

          {/* Matching Skills vs Missing Skills Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-emerald-200">
                    Matching Skills ({analysisResult.matchingSkills?.length || 0})
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400">Verified</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matchingSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-emerald-900/40 border border-emerald-700/60 px-3 py-1 text-xs font-mono text-emerald-200 font-medium flex items-center gap-1.5"
                  >
                    <Check className="h-3 w-3 text-emerald-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-amber-200">
                    Missing Skills Detected ({analysisResult.missingSkills?.length || 0})
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-amber-400">Add to Resume</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-amber-900/40 border border-amber-700/60 px-3 py-1 text-xs font-mono text-amber-200 font-medium flex items-center gap-1.5"
                  >
                    <X className="h-3 w-3 text-amber-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Relevant Experience & Requirements Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relevant Experience */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Candidate's Relevant Experience
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {analysisResult.relevantExperience?.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Job Requirements */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-400" />
                Target Role Requirements
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {analysisResult.jobRequirements?.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tailored Resume Improvements & Strategic Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Suggested Resume Tweaks for This Role
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {analysisResult.resumeImprovements?.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                Strategic Recommendations
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {analysisResult.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Callout: Move to Interview Prep */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white">Ace the Interview for this Position</h4>
              <p className="mt-1 text-xs text-slate-400">
                Let Gemini AI generate custom technical, project, and behavioral questions targeted specifically to this job.
              </p>
            </div>
            <button
              onClick={handleNavigateToInterview}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-[0.98]"
            >
              <MessageSquare className="h-4 w-4" />
              Generate Interview Questions
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
