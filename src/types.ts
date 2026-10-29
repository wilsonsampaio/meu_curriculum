export interface Education {
  id: string;
  school: string;
  course: string;
  degree?: string;
  startYear: string;
  endYear: string;
  isCurrent?: boolean;
  location?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startYear: string;
  endYear: string;
  isCurrent?: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1 to 5
  category?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
}

export interface Achievement {
  id: string;
  name: string;
  issuer?: string;
  year?: string;
  description?: string;
}

export interface Language {
  id: string;
  name: string;
  level: string; // e.g., "Nativo", "Avançado", "Intermediário", "Básico"
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  instagram?: string;
  github?: string;
  website?: string;
  avatarUrl?: string;
  summary: string;
  languages: Language[];
  areasOfInterest: string[];
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
}

export type ResumeTemplate = "modern" | "tech" | "classic" | "minimal" | "gupy";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  headline?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AtsReport {
  score: number; // 0 - 100
  gupyGrade: "A+" | "A" | "B" | "C";
  summary: string;
  strengths: string[];
  correctionsApplied: string[];
  recommendations: string[];
  detectedKeywords: string[];
  missingCriticalKeywords: string[];
  readabilityAssessment: string;
}

export interface SavedResume {
  id: string;
  userId: string;
  title: string;
  template: ResumeTemplate;
  targetRole?: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
  atsScore?: number;
  lastAtsReport?: AtsReport;
}

export type ImportOptimizationMode = "ultra-ats" | "executive" | "faithful";

export interface ImportOptions {
  mode: ImportOptimizationMode;
  targetRole?: string;
  addMissingKeywords?: boolean;
}

