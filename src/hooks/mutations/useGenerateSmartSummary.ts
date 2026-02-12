import { useMutation } from "@tanstack/react-query";
import { generateApi } from "../../api/endpoints/generate";
import type { GenerateSummaryRequest } from "../../types/generate";

export const useGenerateSmartSummary = () => {
  return useMutation({
    mutationFn: (params: GenerateSummaryRequest) =>
      generateApi.smartSummary(params),
  });
};
