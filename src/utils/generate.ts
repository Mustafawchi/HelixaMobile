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
 * Convert plain text to HTML paragraphs for the RichTextEditor (Quill.js).
 * Double newlines become separate <p> tags; single newlines become <br>.
 */
export function plainTextToHtml(text: string): string {
  if (!text) return "";
  return text
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * Wrap a patient letter summary from the API into a full letter template,
 * matching the desktop flow: greeting → thank you → summary → sign-off.
 * Returns HTML ready for the RichTextEditor.
 */
export function buildPatientLetterHtml(params: {
  summary: string;
  patientName: string;
  practiceName: string;
  doctorName: string;
}): string {
  const greeting = `Dear ${params.patientName || "[Patient Name]"},`;
  const thankYou = params.practiceName
    ? `Thank you for visiting us at ${params.practiceName}.`
    : "Thank you for visiting us at our practice.";
  const signOff = `Kind regards,<br>Dr ${params.doctorName || "[Your Name]"}`;

  return (
    `<p>${greeting}</p>` +
    `<p>${thankYou}</p>` +
    plainTextToHtml(params.summary) +
    `<p>${signOff}</p>`
  );
}

/**
 * Build a short email body template for the patient summary email tab.
 * Returns HTML ready for the RichTextEditor.
 */
export function buildPatientEmailBodyHtml(params: {
  patientName: string;
  practiceName?: string;
}): string {
  const team = params.practiceName || "Your Healthcare Team";
  return (
    `<p>Dear ${params.patientName || "Patient"},</p>` +
    `<p>Thank you for visiting our practice. Please find attached a summary letter from your recent appointment.</p>` +
    `<p>If you have any questions about the information provided, please don't hesitate to contact our office.</p>` +
    `<p>Kind regards,<br>${team}</p>`
  );
}

/**
 * Build a short email body template for the referral email tab.
 * Returns HTML ready for the RichTextEditor.
 */
export function buildReferralEmailBodyHtml(params: {
  patientName: string;
  senderName?: string;
  doctorName?: string;
}): string {
  const doctorGreeting = params.doctorName
    ? `Dear Dr. ${params.doctorName},`
    : "Dear Doctor,";
  return (
    `<p>${doctorGreeting}</p>` +
    `<p>Please find attached a referral letter for ${params.patientName || "the patient"}.</p>` +
    `<p>I would appreciate your professional opinion on this case. Please do not hesitate to contact me if you require any further information.</p>` +
    `<p>Kind regards,<br>${params.senderName || "[Your Name]"}</p>`
  );
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
