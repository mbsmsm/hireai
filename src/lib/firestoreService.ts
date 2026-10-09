import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ResumeItem, ResumeAnalysisData, JobAnalysisData, InterviewSessionData } from '../types';
import { uploadResumeToCloudinary } from './cloudinary';

export { uploadResumeToCloudinary };

// ==================== RESUMES ====================
export async function createResumeRecord(
  data: Omit<ResumeItem, 'id'>
): Promise<string> {
  const path = 'resumes';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserResumes(userId: string): Promise<ResumeItem[]> {
  const path = 'resumes';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ResumeItem, 'id'>),
    }));
  } catch (error) {
    // If composite index is building or order fails, try basic query
    try {
      const fallbackQ = query(collection(db, path), where('userId', '==', userId));
      const snapshot = await getDocs(fallbackQ);
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ResumeItem, 'id'>),
      }));
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (fallbackError) {
      handleFirestoreError(fallbackError, OperationType.LIST, path);
    }
  }
}

export async function updateResumeStatus(
  resumeId: string,
  status: 'pending' | 'completed' | 'failed'
): Promise<void> {
  const path = `resumes/${resumeId}`;
  try {
    await updateDoc(doc(db, 'resumes', resumeId), { analysisStatus: status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== RESUME ANALYSES ====================
export async function saveResumeAnalysis(
  data: Omit<ResumeAnalysisData, 'id'>
): Promise<string> {
  const path = 'resumeAnalyses';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getAnalysisByResumeId(
  resumeId: string
): Promise<ResumeAnalysisData | null> {
  const path = 'resumeAnalyses';
  try {
    const q = query(collection(db, path), where('resumeId', '==', resumeId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<ResumeAnalysisData, 'id'>),
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getUserResumeAnalyses(
  userId: string
): Promise<ResumeAnalysisData[]> {
  const path = 'resumeAnalyses';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ResumeAnalysisData, 'id'>),
    }));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==================== JOB ANALYSES ====================
export async function saveJobAnalysis(
  data: Omit<JobAnalysisData, 'id'>
): Promise<string> {
  const path = 'jobAnalyses';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserJobAnalyses(
  userId: string
): Promise<JobAnalysisData[]> {
  const path = 'jobAnalyses';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<JobAnalysisData, 'id'>),
    }));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==================== INTERVIEW SESSIONS ====================
export async function saveInterviewSession(
  data: Omit<InterviewSessionData, 'id'>
): Promise<string> {
  const path = 'interviewSessions';
  try {
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserInterviewSessions(
  userId: string
): Promise<InterviewSessionData[]> {
  const path = 'interviewSessions';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<InterviewSessionData, 'id'>),
    }));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
