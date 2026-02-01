import { loggedCallable } from "../../utils/networkLogger";
import { functions } from "../../config/firebase";
import type {
  GetPatientNotesRequest,
  GetPatientNotesResponse,
  CreateNoteRequest,
  CreateNoteResponse,
  UpdateNoteRequest,
  UpdateNoteResponse,
  DeleteNoteRequest,
  DeleteNoteResponse,
  DeleteNotesRequest,
  DeleteNotesResponse,
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

  create: async (params: CreateNoteRequest): Promise<CreateNoteResponse> => {
    const createNote = loggedCallable<CreateNoteRequest, CreateNoteResponse>(
      functions,
      "createNote",
    );

    const result = await createNote(params);

    if (!result.data.success) {
      throw new Error(result.data.message || "Failed to create note");
    }

    return result.data;
  },

  update: async (params: UpdateNoteRequest): Promise<UpdateNoteResponse> => {
    const updateNote = loggedCallable<UpdateNoteRequest, UpdateNoteResponse>(
      functions,
      "updateNote",
    );

    const result = await updateNote(params);

    if (!result.data.success) {
      throw new Error(result.data.message || "Failed to update note");
    }

    return result.data;
  },

  delete: async (params: DeleteNoteRequest): Promise<DeleteNoteResponse> => {
    const deleteNote = loggedCallable<DeleteNoteRequest, DeleteNoteResponse>(
      functions,
      "deleteNote",
    );

    const result = await deleteNote(params);

    if (!result.data.success) {
      throw new Error(result.data.message || "Failed to delete note");
    }

    return result.data;
  },

  deleteMany: async (
    params: DeleteNotesRequest,
  ): Promise<DeleteNotesResponse> => {
    const deleteNotes = loggedCallable<DeleteNotesRequest, DeleteNotesResponse>(
      functions,
      "deleteNotes",
    );

    const result = await deleteNotes(params);

    if (!result.data.success) {
      throw new Error(result.data.message || "Failed to delete notes");
    }

    return result.data;
  },
};
