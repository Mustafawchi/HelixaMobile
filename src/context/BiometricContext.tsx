import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { BiometricService } from "../services/biometricService";
import { SecureStorage } from "../services/secureStorage";

interface BiometricContextValue {
  isUnlocked: boolean;
  isCheckingBiometric: boolean;
  biometricEnabled: boolean;
  biometryType: "face" | "fingerprint" | "none";
  biometricAvailable: boolean;
  toggleBiometric: () => Promise<boolean>;
}

const BiometricContext = createContext<BiometricContextValue>({
  isUnlocked: true,
  isCheckingBiometric: true,
  biometricEnabled: false,
  biometryType: "none",
  biometricAvailable: false,
  toggleBiometric: async () => false,
});

export const useBiometric = () => useContext(BiometricContext);

interface Props {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

/** Try Face ID first; if it fails, ask passcode up to 2 times. */
async function authenticateChain(): Promise<boolean> {
  try {
    const result = await BiometricService.authenticateBiometric();
    if (result.success) return true;
  } catch {}
  // Face ID failed — fall back to passcode (2 attempts)
  for (let i = 0; i < 2; i++) {
    try {
      const success = await BiometricService.authenticateWithPasscode();
      if (success) return true;
    } catch {}
  }
  return false;
}

export function BiometricProvider({ children, isAuthenticated }: Props) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometryType, setBiometryType] = useState<
    "face" | "fingerprint" | "none"
  >("none");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const isAuthenticating = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [available, type, enabled] = await Promise.all([
        BiometricService.isAvailable(),
        BiometricService.getBiometryType(),
        SecureStorage.getBiometricEnabled(),
      ]);

      if (cancelled) return;

      setBiometricAvailable(available);
      setBiometryType(type);
      setBiometricEnabled(enabled);

      if (!enabled || !isAuthenticated) {
        setIsUnlocked(true);
        setIsCheckingBiometric(false);
        return;
      }

      setIsCheckingBiometric(false);
      if (!isAuthenticating.current) {
        isAuthenticating.current = true;
        try {
          const success = await authenticateChain();
          if (!cancelled) setIsUnlocked(success);
        } catch {
          if (!cancelled) setIsUnlocked(false);
        } finally {
          isAuthenticating.current = false;
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!biometricEnabled || !isAuthenticated) return;

    let previousState: AppStateStatus = AppState.currentState;

    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (
          previousState === "background" &&
          nextState === "active" &&
          !isAuthenticating.current
        ) {
          isAuthenticating.current = true;
          setIsUnlocked(false);
          try {
            const success = await authenticateChain();
            setIsUnlocked(success);
          } catch {
            setIsUnlocked(false);
          } finally {
            isAuthenticating.current = false;
          }
        }
        previousState = nextState;
      },
    );

    return () => subscription.remove();
  }, [biometricEnabled, isAuthenticated]);

  const toggleBiometric = useCallback(async () => {
    if (biometricEnabled) {
      await SecureStorage.setBiometricEnabled(false);
      setBiometricEnabled(false);
      setIsUnlocked(true);
      return true;
    }

    const available = await BiometricService.isAvailable();
    if (!available) return false;

    const result = await BiometricService.authenticateBiometric(
      "Verify to enable biometric lock",
    );
    if (!result.success) return false;

    await SecureStorage.setBiometricEnabled(true);
    setBiometricEnabled(true);
    setIsUnlocked(true);
    return true;
  }, [biometricEnabled]);

  return (
    <BiometricContext.Provider
      value={{
        isUnlocked,
        isCheckingBiometric,
        biometricEnabled,
        biometryType,
        biometricAvailable,
        toggleBiometric,
      }}
    >
      {children}
    </BiometricContext.Provider>
  );
}
