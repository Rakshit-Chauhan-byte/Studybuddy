// ──────────────────────────────────────────────
// StudyBuddy – Firebase client initialisation and helpers
// ──────────────────────────────────────────────
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Singleton Firebase app instance */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Firestore database reference */
export const db = getFirestore(app);

// ──────────────────────────────────────────────
// Firestore Schema and Helpers
// ──────────────────────────────────────────────

export interface StudentDocument {
  name: string | null;
  goal: string | null;
  deadline: string | null;
  dailyMinutes: number | null;
  constraints: string | null;
  strongTopics: string[] | null;
  weakTopics: string[] | null;
  planMessage: string | null;
  version: number | null;
  tasks: any[] | null; // Using any[] for tasks to keep it flexible for now
  adaptations: any[] | null;
  createdAt: string | null;
}

/**
 * Creates or overwrites a student document.
 */
export async function setStudentDocument(studentId: string, data: Partial<StudentDocument>) {
  const docRef = doc(db, "students", studentId);
  // Replace undefined with null as requested
  const sanitizedData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value])
  );
  await setDoc(docRef, sanitizedData, { merge: true });
}

/**
 * Reads a student document.
 */
export async function getStudentDocument(studentId: string): Promise<StudentDocument | null> {
  const docRef = doc(db, "students", studentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as StudentDocument;
  } else {
    return null;
  }
}

/**
 * Updates the tasks for a specific student.
 */
export async function updateStudentTasks(studentId: string, tasks: any[]) {
  const docRef = doc(db, "students", studentId);
  await updateDoc(docRef, {
    tasks: tasks === undefined ? null : tasks,
  });
}

export default app;
