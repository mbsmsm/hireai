import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActivePage, ResumeItem, ResumeAnalysisData } from '../../types';
import { extractTextFromFile } from '../../utils/textExtractor';
import { SAMPLE_RESUMES } from '../../utils/sampleData';
import {
  createResumeRecord,
  saveResumeAnalysis,
  updateResumeStatus,
  getUserResumes,
  getAnalysisByResumeId,
} from '../../lib/firestoreService';
import { uploadResumeToCloudinary } from '../../lib/cloudinary';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  RefreshCw,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Loader2,
  Check,
  X,
  Target,
  MessageSquare,
  BookOpen,
} from 'lucide-react';

interface ResumeAnalyzerPageProps {
  setActivePage: (page: ActivePage) => void;
  selectedResumeId?: string | null;
  setSelectedResumeId?: (id: string | null) => void;
  selectedAnalysis?: ResumeAnalysisData | null;
  setSelectedAnalysis?: (analysis: ResumeAnalysisData | null) => void;
}

export const ResumeAnalyzerPage: React.FC<ResumeAnalyzerPageProps> = ({
  setActivePage,
  selectedResumeId,
  setSelectedResumeId,
  selectedAnalysis,
  setSelectedAnalysis,
}) => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [showTextEditor, setShowTextEditor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [pastResumes, setPastResumes] = useState<ResumeItem[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysisData | null>(selectedAnalysis || null);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(selectedResumeId || null);

  // Load user's previous resumes
  useEffect(() => {
    if (!currentUser) return;
    getUserResumes(currentUser.uid)
      .then((items) => setPastResumes(items))
      .catch((e) => console.warn('Could not load user resumes:', e));
  }, [currentUser]);

  // If a resumeId was passed, load its analysis
  useEffect(() => {
    if (selectedResumeId && !activeAnalysis) {
      getAnalysisByResumeId(selectedResumeId).then((res) => {
        if (res) setActiveAnalysis(res);
      });
    }
  }, [selectedResumeId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Check size (< 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum allowed resume size is 5MB.');
      return;
    }

    const lower = selected.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.txt') && !lower.endsWith('.md')) {
      setError('Unsupported file type. Please upload a PDF (.pdf), Word document (.docx), or text file.');
      return;
    }

    setFile(selected);

    // Extract text in browser immediately
    setLoading(true);
    setLoadingStep('Extracting readable resume text...');
    try {
      const text = await extractTextFromFile(selected);
      setExtractedText(text);
    } catch (err: any) {
      setError(err.message || 'Could not parse text from this resume file.');
      setFile(null);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_RESUMES[0]) => {
    setError(null);
    // Create a virtual text file
    const virtualFile = new File([sample.text], `${sample.name.replace(/\s+/g, '_')}.txt`, {
      type: 'text/plain',
    });
    setFile(virtualFile);
    setExtractedText(sample.text);
  };

  const handleAnalyze = async () => {
    if (!currentUser) {
      setActivePage('login');
      return;
    }

    if (!extractedText || extractedText.trim().length < 20) {
      setError('Please provide a resume with sufficient text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fileUrl = '';
      let publicId = '';
      const fileSize = file ? file.size : 0;
      const fileName = file ? file.name : 'Pasted_Resume.txt';
      const fileType = file ? file.name.split('.').pop() || 'txt' : 'txt';

      // Step 1: Upload PDF/DOCX file directly to Cloudinary (unsigned upload)
      if (file) {
        setLoadingStep('Uploading resume to Cloudinary...');
        try {
          const uploadRes = await uploadResumeToCloudinary(file);
          fileUrl = uploadRes.secure_url;
          publicId = uploadRes.public_id;
        } catch (uploadErr: any) {
          console.warn('Cloudinary upload warning:', uploadErr);
          // If Cloudinary upload failed due to network/preset, keep processing resume text
        }
      }

      // Step 2: Create Resume Record in Firestore with Cloudinary metadata & Firebase UID
      setLoadingStep('Saving resume record...');
      let resumeDocId = await createResumeRecord({
        userId: currentUser.uid,
        fileName,
        fileType,
        fileSize,
        fileUrl,
        publicId,
        extractedText,
        analysisStatus: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Step 3: Call Server-Side Gemini API
      setLoadingStep('Running Gemini AI Resume & ATS Evaluation...');
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: extractedText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const analysisResult = await response.json();

      // Step 4: Persist analysis in Firestore (Free tier optimization: stored once, re-used)
      setLoadingStep('Finalizing ATS audit report...');
      const analysisData: Omit<ResumeAnalysisData, 'id'> = {
        userId: currentUser.uid,
        resumeId: resumeDocId,
        overallScore: analysisResult.overallScore,
        atsScore: analysisResult.atsScore,
        summary: analysisResult.summary || '',
        technicalSkills: analysisResult.technicalSkills || [],
        softSkills: analysisResult.softSkills || [],
        education: analysisResult.education || [],
        experience: analysisResult.experience || [],
        projects: analysisResult.projects || [],
        certifications: analysisResult.certifications || [],
        strengths: analysisResult.strengths || [],
        weaknesses: analysisResult.weaknesses || [],
        improvements: analysisResult.improvements || [],
        recommendedSkills: analysisResult.recommendedSkills || [],
        createdAt: new Date().toISOString(),
      };

      const analysisId = await saveResumeAnalysis(analysisData);
      await updateResumeStatus(resumeDocId, 'completed');

      const fullAnalysis: ResumeAnalysisData = {
        id: analysisId,
        ...analysisData,
      };

      setActiveAnalysis(fullAnalysis);
      setActiveResumeId(resumeDocId);
      if (setSelectedAnalysis) setSelectedAnalysis(fullAnalysis);
      if (setSelectedResumeId) setSelectedResumeId(resumeDocId);

      // Refresh past resumes list
      getUserResumes(currentUser.uid).then(setPastResumes);
    } catch (err: any) {
      console.error('Error during analysis:', err);
      setError(err.message || 'An unexpected error occurred during resume analysis.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectPastResume = async (resume: ResumeItem) => {
    setLoading(true);
    setError(null);
    try {
      const savedAnalysis = await getAnalysisByResumeId(resume.id);
      if (savedAnalysis) {
        setActiveAnalysis(savedAnalysis);
        setActiveResumeId(resume.id);
        if (setSelectedAnalysis) setSelectedAnalysis(savedAnalysis);
        if (setSelectedResumeId) setSelectedResumeId(resume.id);
      } else {
        // Resume exists but analysis pending, load extracted text for one-click re-analysis
        setExtractedText(resume.extractedText);
        setActiveResumeId(resume.id);
      }
    } catch (e: any) {
      setError('Could not load analysis for this resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400">
              Module 1
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Resume Analyzer & ATS Score
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Upload your resume in PDF or DOCX format for an exhaustive ATS and skills inspection powered by Gemini AI.
          </p>
        </div>

        {activeAnalysis && (
          <button
            onClick={() => {
              setActiveAnalysis(null);
              setFile(null);
              setExtractedText('');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Upload Another Resume
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Analysis Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Upload Area (Only if no active analysis or user wants to re-upload) */}
      {!activeAnalysis && (
        <div className="space-y-6">
          {/* Previous uploaded resumes quick picker */}
          {pastResumes.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <span className="text-xs font-semibold text-slate-300">Previously Uploaded Resumes:</span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {pastResumes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectPastResume(r)}
                    className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500 hover:text-white transition-all"
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="max-w-[150px] truncate">{r.fileName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="relative rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-8 sm:p-12 text-center hover:border-indigo-500/60 transition-colors">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileChange}
              disabled={loading}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400">
              <UploadCloud className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-white">
              {file ? file.name : 'Upload your Resume to Begin Analysis'}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Drag and drop your file here, or browse. Supports{' '}
              <span className="text-indigo-300 font-mono">PDF (.pdf)</span> and{' '}
              <span className="text-purple-300 font-mono">Word (.docx)</span> up to 5MB.
            </p>

            {file && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800/90 border border-indigo-500/40 px-3.5 py-1.5 text-xs text-indigo-300 font-medium">
                <FileCheck className="h-4 w-4 text-emerald-400" />
                <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <span className="text-slate-500">&bull; Click to replace</span>
              </div>
            )}
          </div>

          {/* Quick Presets / Try Sample */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Or try a sample resume:</span>
              {SAMPLE_RESUMES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 border border-slate-700 hover:border-indigo-500 hover:text-white transition-colors"
                >
                  {sample.role}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTextEditor(!showTextEditor)}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              {showTextEditor ? 'Hide Extracted Text' : 'View / Paste Resume Text Manually'}
            </button>
          </div>

          {/* Manual Text Drawer */}
          {showTextEditor && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Extracted Resume Text (Editable)
                </label>
                <span className="text-[11px] text-slate-500">
                  {extractedText.length} characters
                </span>
              </div>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Paste your resume text directly here if you prefer..."
                rows={8}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-xs text-slate-200 font-mono placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Primary Action Button */}
          {extractedText.length > 20 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{loadingStep || 'Analyzing with Gemini AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze Resume Now</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results View */}
      {activeAnalysis && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="rounded-3xl border border-indigo-900/50 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Overall Candidate Score
                </span>
                <span className="rounded-full bg-indigo-900/60 border border-indigo-700/60 px-3 py-1 text-xs font-bold text-indigo-300">
                  {activeAnalysis.overallScore >= 80 ? 'Tier 1 Strong' : 'Tier 2 Emerging'}
                </span>
              </div>
              <div className="my-6 flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black text-white">
                  {activeAnalysis.overallScore}
                </span>
                <span className="text-xl font-bold text-slate-500">/ 100</span>
              </div>
              <div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${activeAnalysis.overallScore}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Evaluated across experience impact, bullet point metrics, leadership signals, and formatting standards.
                </p>
              </div>
            </div>

            {/* ATS Score */}
            <div className="rounded-3xl border border-purple-900/50 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  ATS Parse Score
                </span>
                <span className="rounded-full bg-purple-900/60 border border-purple-700/60 px-3 py-1 text-xs font-bold text-purple-300">
                  Machine Readable
                </span>
              </div>
              <div className="my-6 flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black text-white">
                  {activeAnalysis.atsScore}
                </span>
                <span className="text-xl font-bold text-slate-500">/ 100</span>
              </div>
              <div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
                    style={{ width: `${activeAnalysis.atsScore}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Measures compatibility with Workday, Greenhouse, and Taleo parsing algorithms.
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Summary */}
          {activeAnalysis.summary && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Candidate Executive Summary</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeAnalysis.summary}
              </p>
            </div>
          )}

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Technical Skills ({activeAnalysis.technicalSkills?.length || 0})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeAnalysis.technicalSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-indigo-950/70 border border-indigo-800/60 px-3 py-1 text-xs font-mono text-indigo-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  Soft & Leadership Skills ({activeAnalysis.softSkills?.length || 0})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeAnalysis.softSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-purple-950/70 border border-purple-800/60 px-3 py-1 text-xs text-purple-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/15 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-emerald-200">Key Strengths Identified</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {activeAnalysis.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="rounded-2xl border border-amber-900/40 bg-amber-950/15 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-amber-200">Critical Areas for Improvement</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {activeAnalysis.weaknesses?.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Improvement Suggestions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Actionable Recommendations to Boost Callbacks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeAnalysis.improvements?.map((imp, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-1.5">
                    <span className="h-5 w-5 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>Action Item</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{imp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Skills */}
          {activeAnalysis.recommendedSkills?.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-400" />
                Recommended In-Demand Skills to Add
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeAnalysis.recommendedSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-300 font-mono"
                  >
                    + {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Buttons */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white">Next: Match against your dream job</h4>
              <p className="mt-1 text-xs text-slate-400">
                Paste a specific job posting to test alignment and generate tailored interview prep.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('job-matcher')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <Target className="h-4 w-4" />
                Match A Job
              </button>
              <button
                onClick={() => setActivePage('interview-prep')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Prepare Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
