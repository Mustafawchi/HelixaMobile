import { loggedCallable } from "../../utils/networkLogger";
import { functions } from "../../config/firebase";
import type {
  GetPatientNotesRequest,
  GetPatientNotesResponse,
} from "../../types/note";

export const notesApi = {
  getPatientNotes: async (
    params: GetPatientNotesRequest,
  ): Promise<GetPatientNotesResponse> => {
    const getPatientNotes = loggedCallable<
      GetPatientNotesRequest,
      GetPatientNotesResponse
    >(functions, "getPatientNotes");

    const result = await getPatientNotes(params);

    if (!result.data.success) {
      throw new Error("Failed to load patient notes");
    }

    return result.data;
  },
};
