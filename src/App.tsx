import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActivePage, ResumeAnalysisData } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ResumeAnalyzerPage } from './components/resume/ResumeAnalyzerPage';
import { JobMatcherPage } from './components/job/JobMatcherPage';
import { InterviewPrepPage } from './components/interview/InterviewPrepPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysisData | null>(null);
  const [targetJobForInterview, setTargetJobForInterview] = useState<{
    jobTitle: string;
    jobDescription: string;
    resumeText: string;
  } | null>(null);

  // Auto-redirect to dashboard when newly logged in if currently on login/register/landing
  useEffect(() => {
    if (currentUser && (activePage === 'login' || activePage === 'register')) {
      setActivePage('dashboard');
    }
  }, [currentUser]);

  // Protected route enforcement
  const isProtectedPage = [
    'dashboard',
    'resume-analyzer',
    'job-matcher',
    'interview-prep',
    'profile',
  ].includes(activePage);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Initializing HireAI Platform...</p>
        </div>
      </div>
    );
  }

  // If user is accessing protected page while logged out, show Login page
  const effectivePage = isProtectedPage && !currentUser ? 'login' : activePage;

  const showSidebar = currentUser && isProtectedPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activePage={effectivePage} setActivePage={setActivePage} />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar on Authenticated Pages */}
        {showSidebar && (
          <Sidebar activePage={effectivePage} setActivePage={setActivePage} />
        )}

        {/* Content View */}
        <main className="flex-1 overflow-y-auto">
          {effectivePage === 'landing' && <LandingPage setActivePage={setActivePage} />}
          {effectivePage === 'login' && <LoginPage setActivePage={setActivePage} />}
          {effectivePage === 'register' && <RegisterPage setActivePage={setActivePage} />}
          {effectivePage === 'dashboard' && (
            <DashboardPage
              setActivePage={setActivePage}
              setSelectedResumeId={setSelectedResumeId}
              setSelectedAnalysis={setSelectedAnalysis}
            />
          )}
          {effectivePage === 'resume-analyzer' && (
            <ResumeAnalyzerPage
              setActivePage={setActivePage}
              selectedResumeId={selectedResumeId}
              setSelectedResumeId={setSelectedResumeId}
              selectedAnalysis={selectedAnalysis}
              setSelectedAnalysis={setSelectedAnalysis}
            />
          )}
          {effectivePage === 'job-matcher' && (
            <JobMatcherPage
              setActivePage={setActivePage}
              selectedResumeId={selectedResumeId}
              setTargetJobForInterview={setTargetJobForInterview}
            />
          )}
          {effectivePage === 'interview-prep' && (
            <InterviewPrepPage
              setActivePage={setActivePage}
              selectedResumeId={selectedResumeId}
              targetJobForInterview={targetJobForInterview}
            />
          )}
          {effectivePage === 'profile' && <ProfilePage setActivePage={setActivePage} />}
        </main>
      </div>

      {/* Global Footer (shown on public landing or non-dashboard screens) */}
      {!showSidebar && <Footer setActivePage={setActivePage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
