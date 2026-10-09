export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ResumeItem {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string; // Cloudinary secure_url
  publicId?: string; // Cloudinary public_id
  fileSize?: number; // File size in bytes
  fileType: string;
  extractedText: string;
  analysisStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface ResumeAnalysisData {
  id?: string;
  userId: string;
  resumeId: string;
  overallScore: number;
  atsScore: number;
  summary: string;
  technicalSkills: string[];
  softSkills: string[];
  education: string[];
  experience: string[];
  projects: string[];
  certifications: string[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendedSkills: string[];
  createdAt: string;
}

export interface JobAnalysisData {
  id?: string;
  userId: string;
  resumeId: string;
  jobTitle?: string;
  jobDescription: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  relevantExperience: string[];
  jobRequirements: string[];
  recommendations: string[];
  resumeImprovements: string[];
  createdAt: string;
}

export interface InterviewQuestion {
  question: string;
  whyAsked: string;
  suggestedPrep: string;
}

export interface InterviewSessionData {
  id?: string;
  userId: string;
  resumeId: string;
  jobTitle?: string;
  jobDescription?: string;
  technicalQuestions: InterviewQuestion[];
  projectQuestions: InterviewQuestion[];
  hrQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  createdAt: string;
}

export type ActivePage =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'resume-analyzer'
  | 'job-matcher'
  | 'interview-prep'
  | 'profile';
