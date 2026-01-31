import { httpsCallable as originalHttpsCallable } from "firebase/functions";
import type { Functions, HttpsCallableResult } from "firebase/functions";

let loggingEnabled = false;

export function enableNetworkLogger() {
  loggingEnabled = true;
  console.log("[Network Logger] Enabled");
}

export function disableNetworkLogger() {
  loggingEnabled = false;
  console.log("[Network Logger] Disabled");
}

export function loggedCallable<Req = unknown, Res = unknown>(
  functions: Functions,
  name: string,
) {
  const callable = originalHttpsCallable<Req, Res>(functions, name);

  return async (data?: Req): Promise<HttpsCallableResult<Res>> => {
    if (!loggingEnabled) {
      return callable(data);
    }

    const startTime = Date.now();
    console.log(
      `[Network] → ${name}\n` +
        `  Body: ${JSON.stringify(data, null, 2)}`,
    );

    try {
      const result = await callable(data);
      const duration = Date.now() - startTime;
      console.log(
        `[Network] ← ${name} 200 ${duration}ms\n` +
          `  Response: ${JSON.stringify(result.data, null, 2)}`,
      );
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.log(
        `[Network] ← ${name} ERROR ${duration}ms\n` +
          `  Error: ${error.code || error.message}`,
      );
      throw error;
    }
  };
}
