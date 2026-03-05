import { loggedCallable } from "../../utils/networkLogger";
import { functions } from "../../config/firebase";
import type {
  Doctor,
  CreateDoctorPayload,
  UpdateDoctorPayload,
} from "../../types/generate";

interface GetDoctorsResponse {
  success: boolean;
  doctors: Doctor[];
}

interface AddDoctorResponse {
  success: boolean;
  doctor: Doctor;
}

interface UpdateDoctorResponse {
  success: boolean;
  doctor: Doctor;
}

interface DeleteDoctorResponse {
  success: boolean;
  message: string;
}

export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    const getDoctors = loggedCallable<void, GetDoctorsResponse>(
      functions,
      "getDoctors",
    );
    const result = await getDoctors();
    if (!result.data.success) {
      throw new Error("Failed to load doctors list");
    }
    return result.data.doctors;
  },

  add: async (payload: CreateDoctorPayload): Promise<Doctor> => {
    const addDoctor = loggedCallable<CreateDoctorPayload, AddDoctorResponse>(
      functions,
      "addDoctor",
    );
    const result = await addDoctor(payload);
    if (!result.data.success) {
      throw new Error("Failed to add doctor");
    }
    return result.data.doctor;
  },

  update: async (id: string, payload: UpdateDoctorPayload): Promise<void> => {
    const updateDoctor = loggedCallable<
      { doctorId: string } & UpdateDoctorPayload,
      UpdateDoctorResponse
    >(functions, "updateDoctor");
    const result = await updateDoctor({ doctorId: id, ...payload });
    if (!result.data.success) {
      throw new Error("Failed to update doctor");
    }
  },

  remove: async (id: string): Promise<void> => {
    const deleteDoctor = loggedCallable<
      { doctorId: string },
      DeleteDoctorResponse
    >(functions, "deleteDoctor");
    const result = await deleteDoctor({ doctorId: id });
    if (!result.data.success) {
      throw new Error("Failed to delete doctor");
    }
  },
};
