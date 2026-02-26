import * as Sentry from '@sentry/react-native';
import { registerRootComponent } from 'expo';

import App from './App';

// PHI field patterns — keys whose values must never reach Sentry
const PHI_KEYS = /name|email|phone|dob|birth|address|patient|tc|ssn|nhs|national|identity|passport|insurance|diagnosis|symptom|note|complaint|treatment|medication|prescription|allergy/i;

function scrubObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (PHI_KEYS.test(k)) {
      result[k] = '[Filtered]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      result[k] = scrubObject(v as Record<string, unknown>);
    } else {
      result[k] = v;
    }
  }
  return result;
}

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__,
  tracesSampleRate: 0.2,
  beforeSend(event) {
    // Scrub PHI from extra / contexts
    if (event.extra) event.extra = scrubObject(event.extra as Record<string, unknown>);
    if (event.user) {
      // Keep only safe user fields
      event.user = { id: event.user.id };
    }
    return event;
  },
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Sentry.wrap(App));
