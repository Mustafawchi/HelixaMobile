import { useMutation } from "@tanstack/react-query";
import { generateApi } from "../../api/endpoints/generate";
import type { GenerateReferralLetterRequest } from "../../types/generate";

export const useGenerateReferralLetter = () => {
  return useMutation({
    mutationFn: (params: GenerateReferralLetterRequest) =>
      generateApi.referralLetter(params),
  });
};
