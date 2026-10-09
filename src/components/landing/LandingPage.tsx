import React from 'react';
import {
  Sparkles,
  ArrowRight,
  FileCheck2,
  Target,
  Search,
  MessageSquareCode,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Star,
  Award,
} from 'lucide-react';
import { ActivePage } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage }) => {
  const { currentUser } = useAuth();

  const handleStart = () => {
    if (currentUser) {
      setActivePage('resume-analyzer');
    } else {
      setActivePage('register');
    }
  };

  const features = [
    {
      title: '1. AI Resume Analysis',
      description:
        'Deep semantic evaluation of your resume content, experience impact, and structural clarity powered by Gemini 3.8 Flash.',
      icon: FileCheck2,
      tag: 'Comprehensive Audit',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: '2. ATS Score & Parsing',
      description:
        'Simulates top Applicant Tracking Systems (Workday, Greenhouse, Taleo) to score keyword density and machine readability.',
      icon: TrendingUp,
      tag: 'ATS Optimization',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: '3. Precision Job Matching',
      description:
        'Paste any target job description to compute a quantitative alignment percentage and see exactly how your credentials stack up.',
      icon: Target,
      tag: 'Fit Percentage',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: '4. Missing Skill Detection',
      description:
        'Instantly isolates crucial hard and soft skills demanded by employers that are currently missing from your resume bullets.',
      icon: Search,
      tag: 'Keyword Radar',
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: '5. AI Interview Preparation',
      description:
        'Generates role-specific technical, project-based, behavioral, and HR questions tailored specifically to your background.',
      icon: MessageSquareCode,
      tag: 'Practice Coach',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Resume',
      desc: 'Drop in your PDF or DOCX file. Our parser securely extracts text and validates structure.',
    },
    {
      number: '02',
      title: 'AI Analyzes Resume',
      desc: 'Gemini AI calculates your overall and ATS score, cataloging your strengths, gaps, and skills.',
    },
    {
      number: '03',
      title: 'Add Job Description',
      desc: 'Paste a target job posting from LinkedIn, Indeed, or your dream company careers page.',
    },
    {
      number: '04',
      title: 'Get Match Score',
      desc: 'Receive an instant match score breakdown highlighting verified matches and missing keywords.',
    },
    {
      number: '05',
      title: 'Improve & Ace Interviews',
      desc: 'Implement tailored bullet-point fixes and practice custom-generated interview scenarios.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Next-Gen Career Intelligence Platform</span>
              </div>

              {/* Headline */}
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Analyze your resume.{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Match your dream job.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                Stop submitting resumes into the hiring black hole. HireAI uses Google Gemini to score your ATS compliance, benchmark qualifications against job descriptions, and generate targeted interview questions.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => setActivePage(currentUser ? 'resume-analyzer' : 'login')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="h-5 w-5" />
                  Analyze My Resume
                </button>
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-700/80 hover:text-white transition-all"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Free-Tier Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>Firebase Data Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span>Powered by Gemini 3.8 Flash</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-slate-700/80 bg-slate-800/90 p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl">
                {/* Mock Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-slate-400">HireAI_Analysis_Report.pdf</span>
                  </div>
                  <span className="rounded bg-emerald-950 border border-emerald-800 text-[10px] font-bold text-emerald-400 px-2 py-0.5">
                    Analyzed
                  </span>
                </div>

                {/* Score Meters */}
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-indigo-900/60 bg-indigo-950/40 p-4 text-center">
                    <div className="text-3xl font-extrabold text-indigo-400">87<span className="text-sm font-normal text-slate-400">/100</span></div>
                    <div className="mt-1 text-xs font-medium text-slate-300">Overall Score</div>
                    <div className="mt-2 h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[87%]" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-purple-900/60 bg-purple-950/40 p-4 text-center">
                    <div className="text-3xl font-extrabold text-purple-400">82<span className="text-sm font-normal text-slate-400">/100</span></div>
                    <div className="mt-1 text-xs font-medium text-slate-300">ATS Pass Score</div>
                    <div className="mt-2 h-1.5 w-full bg-purple-950 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full w-[82%]" />
                    </div>
                  </div>
                </div>

                {/* Detected Skills pills */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">Key Extracted Skills</span>
                    <span className="text-[11px] text-emerald-400 font-mono">14 Detected</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'Tailwind'].map((skill) => (
                      <span key={skill} className="rounded-md bg-slate-900/90 border border-slate-700 px-2 py-0.5 text-xs text-indigo-300 font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Job Match snippet */}
                <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Target Role Match: Full Stack Lead</span>
                    <span className="text-xs font-bold text-emerald-400">86% Fit</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>2 Missing Keywords: Redis, GraphQL</span>
                  </div>
                </div>

                {/* Action button inside mockup */}
                <button
                  onClick={() => setActivePage('resume-analyzer')}
                  className="mt-5 w-full rounded-xl bg-indigo-600/80 hover:bg-indigo-600 py-2.5 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  Try With Your Resume
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full bg-indigo-950/80 border border-indigo-800/60 px-3 py-1 text-xs font-semibold text-indigo-300">
              Powerful Feature Suite
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to bypass filters and land interviews
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Built with industry-grade ATS benchmarks and Gemini AI reasoning to give you an unfair advantage in the hiring market.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/40 hover:bg-slate-900 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${feature.color} flex items-center justify-center text-white shadow-md shadow-indigo-600/10`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-800/90 border border-slate-700/60 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}

            {/* Interactive Bonus Card */}
            <div className="rounded-2xl border border-dashed border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 p-6 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">
                  CSE Portfolio Ready
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Engineered with production Firebase rules, server-side secret isolation, and clean TypeScript architecture.
                </p>
              </div>
              <button
                onClick={() => setActivePage('resume-analyzer')}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Launch Resume Analyzer Now <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full bg-purple-950/80 border border-purple-800/60 px-3 py-1 text-xs font-semibold text-purple-300">
              5 Simple Steps
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How HireAI Accelerates Your Job Hunt
            </h2>
            <p className="mt-3 text-base text-slate-400">
              From an unoptimized draft to a high-converting resume tailored for your target role.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-all"
              >
                <div className="text-2xl font-black font-mono text-indigo-500/80">
                  {step.number}
                </div>
                <h4 className="mt-3 text-base font-bold text-white">
                  {step.title}
                </h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/50 p-8 sm:p-12 shadow-2xl shadow-indigo-950/40">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to land more interviews with HireAI?
            </h2>
            <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join students, engineers, and professionals using AI to eliminate resume guesswork and tailor their applications with precision.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setActivePage(currentUser ? 'resume-analyzer' : 'register')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98]"
              >
                Analyze My Resume Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
