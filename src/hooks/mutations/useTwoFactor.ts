import { useMutation } from "@tanstack/react-query";
import { twoFactorApi } from "../../api/endpoints/2faAuth";
import type {
  GenerateTotpSecretResponse,
  VerifyAndEnableTwoFactorRequest,
  VerifyAndEnableTwoFactorResponse,
  DisableTwoFactorResponse,
  VerifyTwoFactorLoginRequest,
  VerifyTwoFactorLoginResponse,
} from "../../api/endpoints/2faAuth";

export const useGenerateTotpSecret = () => {
  return useMutation<GenerateTotpSecretResponse, Error, void>({
    mutationFn: twoFactorApi.generateTotpSecret,
  });
};

export const useVerifyAndEnableTwoFactor = () => {
  return useMutation<
    VerifyAndEnableTwoFactorResponse,
    Error,
    VerifyAndEnableTwoFactorRequest
  >({
    mutationFn: twoFactorApi.verifyAndEnableTwoFactor,
  });
};

export const useDisableTwoFactor = () => {
  return useMutation<DisableTwoFactorResponse, Error, void>({
    mutationFn: twoFactorApi.disableTwoFactor,
  });
};

export const useVerifyTwoFactorLogin = () => {
  return useMutation<
    VerifyTwoFactorLoginResponse,
    Error,
    VerifyTwoFactorLoginRequest
  >({
    mutationFn: twoFactorApi.verifyTwoFactorLogin,
  });
};
