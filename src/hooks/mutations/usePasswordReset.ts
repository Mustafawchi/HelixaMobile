import { useMutation } from "@tanstack/react-query";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "../../config/firebase";

interface PasswordResetPayload {
  email?: string;
}

export const usePasswordReset = () => {
  return useMutation<void, Error, PasswordResetPayload | void>({
    mutationFn: async (payload) => {
      const email = payload && "email" in payload ? payload.email : undefined;
      const targetEmail = email || firebaseAuth.currentUser?.email;
      if (!targetEmail) {
        throw new Error("No authenticated user found.");
      }
      await sendPasswordResetEmail(firebaseAuth, targetEmail);
    },
  });
};
