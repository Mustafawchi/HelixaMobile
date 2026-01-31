import { loggedCallable } from "../../utils/networkLogger";
import { functions } from "../../config/firebase";
import type {
  Patient,
  GetPatientsListPaginatedRequest,
  GetPatientsListPaginatedResponse,
  GetPatientsListResponse,
  SearchPatientsRequest,
  SearchPatientsResponse,
  CreatePatientRequest,
  CreatePatientResponse,
  UpdatePatientRequest,
  UpdatePatientResponse,
} from "../../types/patient";

export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    const getPatientsList = loggedCallable<void, GetPatientsListResponse>(
      functions,
      "getPatientsList",
    );
    const result = await getPatientsList();

    if (!result.data.success) {
      throw new Error("Failed to load patients list");
    }
    return result.data.patients;
  },

  getPaginated: async (
    params: GetPatientsListPaginatedRequest,
  ): Promise<GetPatientsListPaginatedResponse> => {
    const getPatientsList = loggedCallable<
      GetPatientsListPaginatedRequest,
      GetPatientsListPaginatedResponse
    >(functions, "getPatientsList");

    const result = await getPatientsList(params);

    if (!result.data.success) {
      throw new Error("Failed to load patients list");
    }
    return result.data;
  },

  search: async (params: SearchPatientsRequest): Promise<Patient[]> => {
    const searchPatients = loggedCallable<
      SearchPatientsRequest,
      SearchPatientsResponse
    >(functions, "searchPatients");

    const result = await searchPatients(params);

    if (!result.data.success) {
      throw new Error("Failed to search patients");
    }
    return result.data.patients;
  },

  create: async (params: CreatePatientRequest): Promise<Patient> => {
    const createPatient = loggedCallable<
      CreatePatientRequest,
      CreatePatientResponse
    >(functions, "createPatient");

    const result = await createPatient(params);

    if (!result.data.success) {
      throw new Error("Failed to create patient");
    }

    const now = new Date().toISOString();
    const fullName = [params.firstName, params.lastName]
      .filter(Boolean)
      .join(" ");

    return {
      patientId: result.data.patientId,
      name: fullName,
      firstName: params.firstName,
      lastName: params.lastName || null,
      noteCount: 0,
      createdAt: now,
      lastModified: now,
    };
  },

  update: async (params: UpdatePatientRequest): Promise<void> => {
    const updatePatient = loggedCallable<
      UpdatePatientRequest,
      UpdatePatientResponse
    >(functions, "updatePatient");

    const result = await updatePatient(params);

    if (!result.data.success) {
      throw new Error("Failed to update patient");
    }
  },

  delete: async (patientId: string): Promise<void> => {
    const deletePatient = loggedCallable<
      { patientId: string },
      { success: boolean }
    >(functions, "deletePatient");

    const result = await deletePatient({ patientId });

    if (!result.data.success) {
      throw new Error("Failed to delete patient");
    }
  },
};
