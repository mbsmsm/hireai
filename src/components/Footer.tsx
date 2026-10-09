import React from 'react';
import { Sparkles, Heart, Github, Linkedin, ShieldCheck, Cpu } from 'lucide-react';
import { ActivePage } from '../types';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-md shadow-indigo-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Hire<span className="text-indigo-400">AI</span></span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              "Analyze your resume. Match your dream job."
            </p>
            <p className="mt-2 text-xs text-slate-500">
              AI-powered ATS scoring, semantic job matching, and tailored interview coach built for ambitious candidates.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase & Gemini Active
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Product Solutions</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActivePage('resume-analyzer')} className="hover:text-indigo-400 transition-colors">
                  AI Resume Analyzer
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('resume-analyzer')} className="hover:text-indigo-400 transition-colors">
                  ATS Score Checker
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('job-matcher')} className="hover:text-indigo-400 transition-colors">
                  Job Matcher & Gap Analysis
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('interview-prep')} className="hover:text-indigo-400 transition-colors">
                  AI Interview Prep Coach
                </button>
              </li>
            </ul>
          </div>

          {/* Tech Stack / CSE Project details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Architecture & Tech Stack</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                <span>Google Gemini 3.8 Flash (Server-Side)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>Firebase Auth & Cloud Firestore</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Cloudinary Resume Storage</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>React 19 + TypeScript + Tailwind CSS</span>
              </li>
            </ul>
          </div>

          {/* Academic / Portfolio Badge */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Portfolio & Capstone</h3>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-400">
              <p className="font-medium text-slate-200">CSE Final-Year Capstone Project</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Engineered as a full-stack SaaS reference with secure API handling, zero client key leaks, and free-tier optimization.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded bg-indigo-900/60 border border-indigo-700/50 px-2 py-0.5 text-[10px] text-indigo-300 font-mono">
                  Production Ready
                </span>
                <span className="rounded bg-purple-900/60 border border-purple-700/50 px-2 py-0.5 text-[10px] text-purple-300 font-mono">
                  LinkedIn Portfolio
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} HireAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Free Tier Optimized</span>
            <span>&bull;</span>
            <span>Zero Data Selling</span>
            <span>&bull;</span>
            <span>Strict ABAC Firestore Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
