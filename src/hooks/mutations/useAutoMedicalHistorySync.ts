import { useMutation, useQueryClient } from "@tanstack/react-query";
import { medicalHistoryApi } from "../../api/endpoints/medicalHistory";
import { notesApi } from "../../api/endpoints/notes";
import { patientsApi } from "../../api/endpoints/patients";

interface SyncMedicalHistoryParams {
  patientId: string;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 50;

export const useAutoMedicalHistorySync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SyncMedicalHistoryParams) => {
      const notesResponse = await notesApi.getPatientNotes({
        patientId: params.patientId,
        pageSize: params.pageSize || DEFAULT_PAGE_SIZE,
      });

      const notes = notesResponse.notes || [];
      if (notes.length === 0) {
        return null;
      }

      const existingHistory =
        notesResponse.patientDetails?.medicalHistorySummary || "";
      const lastNoteId = notes[notes.length - 1]?.id || "";

      const extraction = await medicalHistoryApi.extract({
        notes,
        existingHistory,
      });

      await patientsApi.update({
        patientId: params.patientId,
        medicalHistorySummary: extraction.medicalHistory,
        medicalHistoryLastUpdated: extraction.extractedAt,
        medicalHistoryLastNoteId: lastNoteId,
      });

      return {
        ...extraction,
        lastNoteId,
      };
    },
    onSettled: (_data, _error, variables) => {
      if (!variables?.patientId) return;
      queryClient.invalidateQueries({
        queryKey: ["notes", "list", variables.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notes", "search", variables.patientId],
      });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    retry: 1,
  });
};
