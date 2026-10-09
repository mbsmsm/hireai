import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActivePage, ResumeItem, InterviewQuestion, InterviewSessionData } from '../../types';
import { SAMPLE_JOBS, SAMPLE_RESUMES } from '../../utils/sampleData';
import {
  getUserResumes,
  saveInterviewSession,
  getUserInterviewSessions,
} from '../../lib/firestoreService';
import {
  MessageSquare,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  FileText,
  Briefcase,
  Layers,
  BookOpen,
} from 'lucide-react';

interface InterviewPrepPageProps {
  setActivePage: (page: ActivePage) => void;
  selectedResumeId?: string | null;
  targetJobForInterview?: { jobTitle: string; jobDescription: string; resumeText: string } | null;
}

export const InterviewPrepPage: React.FC<InterviewPrepPageProps> = ({
  setActivePage,
  selectedResumeId,
  targetJobForInterview,
}) => {
  const { currentUser } = useAuth();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [chosenResumeId, setChosenResumeId] = useState<string>(selectedResumeId || '');
  const [jobTitle, setJobTitle] = useState<string>(
    targetJobForInterview?.jobTitle || 'Senior Full Stack Engineer'
  );
  const [jobDescription, setJobDescription] = useState<string>(
    targetJobForInterview?.jobDescription || SAMPLE_JOBS[0].description
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'technical' | 'project' | 'hr' | 'behavioral'>('all');
  const [sessionData, setSessionData] = useState<InterviewSessionData | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<{ [key: string]: boolean }>({});
  const [pastSessions, setPastSessions] = useState<InterviewSessionData[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    getUserResumes(currentUser.uid).then((items) => {
      setResumes(items);
      if (!chosenResumeId && items.length > 0) {
        setChosenResumeId(items[0].id);
      }
    });

    getUserInterviewSessions(currentUser.uid).then(setPastSessions);
  }, [currentUser]);

  const selectedResume = resumes.find((r) => r.id === chosenResumeId);
  const activeResumeContent = targetJobForInterview?.resumeText || selectedResume?.extractedText || SAMPLE_RESUMES[0].text;

  const handleGenerateQuestions = async () => {
    if (!currentUser) {
      setActivePage('login');
      return;
    }

    if (!activeResumeContent.trim()) {
      setError('Please provide or select a resume.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-interview', {
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
        throw new Error(errData.error || `Failed to generate questions (status ${response.status})`);
      }

      const raw = await response.json();

      const sessionRecord: Omit<InterviewSessionData, 'id'> = {
        userId: currentUser.uid,
        resumeId: chosenResumeId || 'custom',
        jobTitle: jobTitle || 'Target Role',
        jobDescription,
        technicalQuestions: raw.technicalQuestions || [],
        projectQuestions: raw.projectQuestions || [],
        hrQuestions: raw.hrQuestions || [],
        behavioralQuestions: raw.behavioralQuestions || [],
        createdAt: new Date().toISOString(),
      };

      const docId = await saveInterviewSession(sessionRecord);
      const fullSession: InterviewSessionData = {
        id: docId,
        ...sessionRecord,
      };

      setSessionData(fullSession);
      getUserInterviewSessions(currentUser.uid).then(setPastSessions);
    } catch (err: any) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIndex((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compile question list based on active tab
  const getDisplayedQuestions = () => {
    if (!sessionData) return [];
    let list: { category: string; item: InterviewQuestion; uid: string }[] = [];

    if (activeTab === 'all' || activeTab === 'technical') {
      sessionData.technicalQuestions?.forEach((q, i) =>
        list.push({ category: 'Technical', item: q, uid: `tech-${i}` })
      );
    }
    if (activeTab === 'all' || activeTab === 'project') {
      sessionData.projectQuestions?.forEach((q, i) =>
        list.push({ category: 'Project Deep-Dive', item: q, uid: `proj-${i}` })
      );
    }
    if (activeTab === 'all' || activeTab === 'behavioral') {
      sessionData.behavioralQuestions?.forEach((q, i) =>
        list.push({ category: 'Behavioral & Leadership', item: q, uid: `behav-${i}` })
      );
    }
    if (activeTab === 'all' || activeTab === 'hr') {
      sessionData.hrQuestions?.forEach((q, i) =>
        list.push({ category: 'HR & Culture Fit', item: q, uid: `hr-${i}` })
      );
    }

    return list;
  };

  const displayedQuestions = getDisplayedQuestions();

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              Module 3
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Interview Preparation Coach
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Generate tailored technical, architectural, behavioral, and HR questions based directly on your resume and target role.
          </p>
        </div>

        {sessionData && (
          <button
            onClick={() => setSessionData(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Configure Another Session
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Configuration Form (shown when not viewing active session) */}
      {!sessionData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                1. Select Resume
              </h3>

              {resumes.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Uploaded Resumes
                  </label>
                  <select
                    value={chosenResumeId}
                    onChange={(e) => setChosenResumeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fileName}
                      </option>
                    ))}
                    <option value="custom">-- Use Sample Engineer Resume --</option>
                  </select>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 text-xs text-slate-300">
                  <p className="font-semibold text-emerald-300">Defaulting to sample resume</p>
                  <p className="mt-1 text-slate-400">
                    You can practice with our preloaded Full Stack Engineer resume right away!
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Preset Roles:
                </span>
                <div className="flex flex-col gap-2">
                  {SAMPLE_JOBS.map((j, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setJobTitle(j.title);
                        setJobDescription(j.description);
                      }}
                      className="text-left rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 text-xs text-slate-300 hover:border-emerald-500/60 hover:text-white transition-colors"
                    >
                      <div className="font-semibold text-emerald-300">{j.title}</div>
                      <div className="text-[10px] text-slate-500">{j.company}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-400" />
                2. Target Job Description Context
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini will cross-reference your specific bullet points with the keywords and responsibilities in this job posting to generate highly realistic interview questions.
              </p>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={13}
                placeholder="Paste the job description here..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3.5 text-xs text-slate-200 leading-relaxed font-mono placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating interview questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Interview Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Questions View */}
      {sessionData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Session Banner */}
          <div className="rounded-3xl border border-emerald-900/50 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-emerald-900/60 border border-emerald-700/60 px-3 py-1 text-xs font-bold text-emerald-300">
                Prep Session Active
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-white">
                {sessionData.jobTitle || 'Target Position'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Custom questions formulated for your background by Gemini AI. Expand each question for rationale and strategic talking points.
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'technical', label: 'Technical' },
              { id: 'project', label: 'Project Deep-Dives' },
              { id: 'behavioral', label: 'Behavioral & Leadership' },
              { id: 'hr', label: 'HR & Culture' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Question Cards Accordion */}
          <div className="space-y-4">
            {displayedQuestions.map((qObj, index) => {
              const isExpanded = !!expandedIndex[qObj.uid];
              return (
                <div
                  key={qObj.uid}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-all hover:border-slate-700"
                >
                  {/* Header / Question Line */}
                  <button
                    onClick={() => toggleExpand(qObj.uid)}
                    className="w-full flex items-start justify-between p-5 text-left gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          {qObj.category}
                        </span>
                        <span className="text-[11px] text-slate-500">Question {index + 1}</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        "{qObj.item.question}"
                      </h4>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Expanded Body: Why Asked + Preparation Points */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                      {/* Why it may be asked */}
                      <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3.5 text-xs">
                        <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
                          <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Why this question is asked:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{qObj.item.whyAsked}</p>
                      </div>

                      {/* Suggested Preparation Points */}
                      <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 text-xs">
                        <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-1">
                          <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Suggested Preparation Points & Talking Strategy:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{qObj.item.suggestedPrep}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ethical AI Disclaimer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 text-center">
            <span className="font-semibold text-slate-300">Interview Integrity Notice:</span>{' '}
            HireAI provides conceptual preparation points to help you articulate your genuine experience using structured communication frameworks. Always speak honestly and represent your authentic skills in interviews.
          </div>
        </div>
      )}
    </div>
  );
};
