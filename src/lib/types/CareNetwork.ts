export interface CareCircleMember {
  therapistId: string;
  name: string;
  specialty: string;
  crp?: string;
  email: string;
  role: "coordinator" | "member";
  addedAt: string;
  authorizedScopes: ("basic_mood" | "journal_themes" | "clinical_notes" | "general_progress")[];
}

export interface CareCircle {
  id: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  updatedAt: string;
  members: CareCircleMember[];
  status: "active" | "paused" | "archived";
  userConsentIp: string;
  userConsentTimestamp: string;
}

export interface SharedClinicalNote {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorSpecialty: string;
  title: string;
  summary: string; // The clinical overview
  category: "evolution" | "recommendation" | "referral" | "alert";
  createdAt: string;
  sharedWithIds: string[]; // Specific therapist IDs in the circle authorized to read this note
  consentToken: string; // Proof of patient's authorization to share
}
