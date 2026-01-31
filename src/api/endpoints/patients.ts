import { httpsCallable } from "firebase/functions";
import { functions } from "../../config/firebase";
import type {
  Patient,
  GetPatientsListPaginatedRequest,
  GetPatientsListPaginatedResponse,
  GetPatientsListResponse,
  SearchPatientsRequest,
  SearchPatientsResponse,
} from "../../types/patient";

export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    const getPatientsList = httpsCallable<void, GetPatientsListResponse>(
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
    const getPatientsList = httpsCallable<
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
    const searchPatients = httpsCallable<
      SearchPatientsRequest,
      SearchPatientsResponse
    >(functions, "searchPatients");

    const result = await searchPatients(params);

    if (!result.data.success) {
      throw new Error("Failed to search patients");
    }
    return result.data.patients;
  },
};
