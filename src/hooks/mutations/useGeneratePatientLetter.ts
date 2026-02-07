import { useMutation } from "@tanstack/react-query";
import { generateApi } from "../../api/endpoints/generate";
import type { GeneratePatientLetterRequest } from "../../types/generate";

export const useGeneratePatientLetter = () => {
  return useMutation({
    mutationFn: (params: GeneratePatientLetterRequest) =>
      generateApi.patientLetter(params),
  });
};
