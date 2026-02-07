import type { Note, PatientDetails } from "../types/note";

/**
 * Strip HTML tags and decode common entities for React Native.
 * (DOM API is not available in RN, so we use regex-based stripping.)
 */
export function htmlToPlainText(html: string): string {
  let text = html
    // Replace block-level closing tags with newlines
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, "\n")
    // Replace <br> with newlines
    .replace(/<br\s*\/?>/gi, "\n")
    // Replace <hr> with separator
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    // Strip remaining tags
    .replace(/<[^>]*>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Normalize excessive newlines (3+ → 2)
    .replace(/\n\s*\n\s*\n/g, "\n\n");

  return text.trim();
}

/**
 * Combine multiple notes into a single clinical notes string.
 */
export function buildClinicalNotes(notes: Note[]): string {
  let clinicalNotes = "";
  for (const note of notes) {
    if (note?.text) {
      clinicalNotes += htmlToPlainText(note.text) + "\n\n---\n\n";
    }
  }
  return clinicalNotes.trim();
}

/**
 * Check whether a patient's medical history is outdated relative to their notes.
 */
export function getMedicalHistoryOutdatedInfo(
  patient?: PatientDetails | null,
  notes?: Note[] | null,
): { outdated: boolean; newNotesCount: number } {
  if (!patient || !notes) {
    return { outdated: false, newNotesCount: 0 };
  }
  if (!patient.medicalHistoryLastNoteId) {
    return {
      outdated: !patient.medicalHistorySummary,
      newNotesCount: notes.length,
    };
  }
  const lastNoteIndex = notes.findIndex(
    (note) => note.id === patient.medicalHistoryLastNoteId,
  );
  const newNotesCount =
    lastNoteIndex >= 0 ? notes.length - lastNoteIndex - 1 : 0;
  return { outdated: newNotesCount > 0, newNotesCount };
}

/**
 * Build a fallback referral letter body when AI generation fails.
 */
export function buildReferralFallbackBody(params: {
  doctorSurname?: string;
  patientFullName: string;
  patientDOB: string;
  medicalHistory: string;
  senderName: string;
  senderPosition?: string;
}): string {
  const historyBlock = params.medicalHistory
    ? `Medical & Dental History:\n${params.medicalHistory}\n\n`
    : "";

  return `Dear Dr. ${params.doctorSurname || "[Doctor Name]"},

I am writing to refer ${params.patientFullName} (DOB: ${params.patientDOB}) for your expert consultation.

${historyBlock}Please see the attached clinical notes for further details.

I would appreciate your professional opinion on this case.

Kind regards,
${params.senderName}${params.senderPosition ? `\n${params.senderPosition}` : ""}`;
}
