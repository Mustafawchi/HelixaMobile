import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type { CustomTemplate } from "../types/user";
import { useUser } from "./queries/useUser";
import { useUpdateUser } from "./mutations/useUpdateUser";

// ─── Seeded template prompts (same as dentalAI desktop) ──────────────────────

const SEED_COMPREHENSIVE_PROMPT = `Verbal consent obtained for audio recording of this consultation.

Reason of Attendance:
CC: "[patient's complaint in quotes]"

Hx of CC:
[ONLY include what was discussed about the presenting complaint. Duration, onset, severity, triggers, relieving factors, medications taken for this issue. If routine check with no complaint, leave empty.]

Dental Hx:
[ONLY include dental history that was actually discussed. Do NOT write about what was not mentioned.]

Medical Hx:
[Medical conditions and surgeries only. Use NRMH if explicitly stated no medical history.]

Medications:
[List all medications mentioned. Include dosage/frequency if stated. If none, write "Nil."]

Allergies:
[List allergies with reaction type if mentioned. Use NKA if explicitly stated no allergies.]

OH Routine:
Brushing: [ONLY the patient's CURRENT stated routine. NOT dentist recommendations. Leave blank if patient did not state.]
Flossing/Interdental: [ONLY the patient's CURRENT stated routine. NOT dentist recommendations. Leave blank if patient did not state.]
Other: [ONLY the patient's CURRENT stated habits. NOT dentist recommendations. Leave blank if patient did not state.]

Other:
[ONLY include this section if there is other relevant information to document. If NOT discussed, OMIT this entire section including the heading.]

Clinical EX:

Extra Oral:
Muscles of mastication: [NAD if examined and normal. Empty if not examined.]
TMJ: [NAD if examined and normal. Empty if not examined.]
Lymph nodes: [NAD if examined and normal. Empty if not examined.]

Intra Oral:
Soft tissue screen: [NAD if examined and normal. Empty if not examined. Include palate, tongue, buccal mucosa, floor of mouth, pharynx findings.]

Oral Cancer Screen: [NAD if screened and normal. Empty if not performed. Document any suspicious lesions, ulcerations, lumps, or discolouration noted during screening.]

Periodontium:
[BOP, calculus, PPDs, recession, mobility.]

Dentition:
[List each tooth finding. E.g., "16 occlusal composite. 15 occlusal amalgam. 14 mesial caries."]

Radiographs:
[Type taken and findings. E.g., "2x BWs taken. No active caries identified."]

Dx:
[Clinical diagnosis/diagnoses if stated or clearly implied.]

Discussed Today:
[ALL advice, recommendations, treatment options discussed, costs mentioned, OHI given, referral discussions, risks/benefits discussed. Be SPECIFIC. Dentist's recommendations belong here, NOT in OH Routine.]

Tx Today:
[Treatment performed. Include LA details, materials, observations, costs discussed.]

NV:
[Follow-up plan, recall timing, planned procedures, referrals.]`;

const SEED_EMERGENCY_PROMPT = `Verbal consent obtained for audio recording of this consultation.

Emergency Presentation
CC: "[Patient's chief complaint in quotes - cleaned up]"
Duration: [How long symptoms present]
Severity: [Pain scale if mentioned, description of severity]
Location: [Tooth number/area if identified]

Hx of Presenting Complaint:
[Brief history of symptoms - onset, progression, triggers, relieving factors]

Medical Hx:
[ONLY include if medical history was discussed. Conditions and surgeries only. Use NRMH if explicitly stated no medical history. OMIT if not discussed.]

Medications:
[List medications mentioned. Include dosage/frequency if stated. OMIT if not discussed.]

Allergies:
[List allergies with reaction type if mentioned. Use NKA if explicitly stated no allergies. OMIT if not discussed.]

Clinical Examination:

Extra Oral:
[Swelling, lymphadenopathy, asymmetry - or NAD]

Intra Oral:
Visual: [Findings on inspection]
Palpation: [Tenderness, swelling]
Percussion: [TTP findings]
Cold test: [Response - positive/negative/lingering/no response]
Mobility: [Grade if present]
Probing: [Pocket depths, BOP if relevant]

Radiographic Findings:
[Type of radiograph]: [Findings]

Diagnosis:
Dx: [Clinical diagnosis]

Treatment Options Discussed:
[ONLY list treatment options that were ACTUALLY discussed in the audio. Number them 1, 2, 3, etc. Include the explanation given for each option. If this section was not discussed, leave it empty.]

Patient Decision:
[What the patient chose to proceed with]

Informed Consent:
[ONLY include if consent was obtained and/or risks were discussed. If NOT discussed, leave this section empty.]

Tx Today:
[Treatment provided, including LA details if applicable]

Post-Op Instructions:
[Instructions given to patient]

Medications Prescribed:
[Rx details or Nil]

NV:`;

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseCustomTemplatesReturn {
  /** All custom templates from the user profile */
  customTemplates: CustomTemplate[];

  /** Currently selected custom instructions (null = using a built-in template) */
  selectedCustomInstructions: string | null;
  setSelectedCustomInstructions: (v: string | null) => void;

  /** Custom template modal state */
  showCustomTemplateModal: boolean;
  customTemplateName: string;
  customTemplatePrompt: string;
  editingCustomTemplateId: string | null;
  isSavingCustomTemplate: boolean;
  setCustomTemplateName: (v: string) => void;
  setCustomTemplatePrompt: (v: string) => void;

  /** Actions */
  openNewCustomTemplate: (type?: "consultation" | "procedure") => void;
  openEditCustomTemplate: (template: CustomTemplate) => void;
  closeCustomTemplateModal: () => void;
  handleSaveCustomTemplate: () => Promise<void>;
  handleDeleteCustomTemplate: (templateId: string) => void;
}

export function useCustomTemplates(): UseCustomTemplatesReturn {
  const { data: userProfile } = useUser();
  const updateUser = useUpdateUser();

  // ─── Seed default custom templates on first load ───────────────────────────
  const hasSeededRef = useRef(false);

  useEffect(() => {
    if (!userProfile || hasSeededRef.current) return;

    const existing = userProfile.customTemplates || [];
    const hasComprehensive = existing.some((t) => t.id === "seed_comprehensive");
    const hasEmergency = existing.some((t) => t.id === "seed_emergency");

    if (hasComprehensive && hasEmergency) {
      hasSeededRef.current = true;
      return;
    }

    const seededTemplates: CustomTemplate[] = [...existing];

    if (!hasComprehensive) {
      seededTemplates.push({
        id: "seed_comprehensive",
        name: "Comprehensive Examination",
        prompt: SEED_COMPREHENSIVE_PROMPT,
        type: "consultation",
        createdAt: new Date().toISOString(),
      });
    }

    if (!hasEmergency) {
      seededTemplates.push({
        id: "seed_emergency",
        name: "Emergency Visit",
        prompt: SEED_EMERGENCY_PROMPT,
        type: "consultation",
        createdAt: new Date().toISOString(),
      });
    }

    hasSeededRef.current = true;
    updateUser.mutateAsync({ customTemplates: seededTemplates }).catch((err) => {
      console.error("Failed to seed default custom templates:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  // ─── Custom template state ─────────────────────────────────────────────────

  const customTemplates: CustomTemplate[] = userProfile?.customTemplates || [];

  const [selectedCustomInstructions, setSelectedCustomInstructions] =
    useState<string | null>(null);

  const [showCustomTemplateModal, setShowCustomTemplateModal] = useState(false);
  const [customTemplateName, setCustomTemplateName] = useState("");
  const [customTemplatePrompt, setCustomTemplatePrompt] = useState("");
  const [editingCustomTemplateId, setEditingCustomTemplateId] = useState<string | null>(null);
  const [customTemplateType, setCustomTemplateType] = useState<"consultation" | "procedure">("consultation");
  const [isSavingCustomTemplate, setIsSavingCustomTemplate] = useState(false);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const openNewCustomTemplate = useCallback((type: "consultation" | "procedure" = "consultation") => {
    setEditingCustomTemplateId(null);
    setCustomTemplateName("");
    setCustomTemplatePrompt("");
    setCustomTemplateType(type);
    setShowCustomTemplateModal(true);
  }, []);

  const openEditCustomTemplate = useCallback((template: CustomTemplate) => {
    setEditingCustomTemplateId(template.id);
    setCustomTemplateName(template.name);
    setCustomTemplatePrompt(template.prompt);
    setCustomTemplateType(template.type);
    setShowCustomTemplateModal(true);
  }, []);

  const closeCustomTemplateModal = useCallback(() => {
    setShowCustomTemplateModal(false);
  }, []);

  const handleSaveCustomTemplate = useCallback(async (): Promise<void> => {
    if (!customTemplateName.trim()) {
      Alert.alert("Missing Name", "Please enter a template name.");
      return;
    }
    if (!customTemplatePrompt.trim()) {
      Alert.alert("Missing Instructions", "Please enter template instructions.");
      return;
    }

    setIsSavingCustomTemplate(true);
    try {
      const existing: CustomTemplate[] = userProfile?.customTemplates || [];
      const updated = editingCustomTemplateId
        ? existing.map((t) =>
            t.id === editingCustomTemplateId
              ? { ...t, name: customTemplateName.trim(), prompt: customTemplatePrompt.trim() }
              : t,
          )
        : [
            ...existing,
            {
              id: `custom_${Date.now()}`,
              name: customTemplateName.trim(),
              prompt: customTemplatePrompt.trim(),
              type: customTemplateType,
              createdAt: new Date().toISOString(),
            },
          ];

      await updateUser.mutateAsync({ customTemplates: updated });
      setShowCustomTemplateModal(false);
      setCustomTemplateName("");
      setCustomTemplatePrompt("");
      setEditingCustomTemplateId(null);
    } catch {
      Alert.alert("Error", "Failed to save template. Please try again.");
    } finally {
      setIsSavingCustomTemplate(false);
    }
  }, [customTemplateName, customTemplatePrompt, customTemplateType, editingCustomTemplateId, userProfile, updateUser]);

  const handleDeleteCustomTemplate = useCallback(
    async (templateId: string) => {
      try {
        const existing: CustomTemplate[] = userProfile?.customTemplates || [];
        const deleted = existing.find((t) => t.id === templateId);
        const updated = existing.filter((t) => t.id !== templateId);
        await updateUser.mutateAsync({ customTemplates: updated });

        // If the deleted template was selected, clear selection
        if (deleted && selectedCustomInstructions === deleted.prompt) {
          setSelectedCustomInstructions(null);
        }
      } catch {
        Alert.alert("Error", "Failed to delete template. Please try again.");
      }
    },
    [userProfile, updateUser, selectedCustomInstructions],
  );

  return {
    customTemplates,
    selectedCustomInstructions,
    setSelectedCustomInstructions,
    showCustomTemplateModal,
    customTemplateName,
    customTemplatePrompt,
    editingCustomTemplateId,
    isSavingCustomTemplate,
    setCustomTemplateName,
    setCustomTemplatePrompt,
    openNewCustomTemplate,
    openEditCustomTemplate,
    closeCustomTemplateModal,
    handleSaveCustomTemplate,
    handleDeleteCustomTemplate,
  };
}
