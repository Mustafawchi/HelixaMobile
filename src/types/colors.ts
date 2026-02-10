// ============================================================================
// COLORS - Helixa AI Mobile Color System
// Merkezi renk tanimlari - Tum renkler buradan yonetilir
// Desktop (colors.ts) ile uyumlu
// ============================================================================

export const COLORS = {
  // ---- Primary (Emerald Green) ----
  primary: "#1a4d3e",
  primaryMid: "#2d6a53",
  primaryLight: "#3d8b6e",
  primaryLighter: "rgba(26, 77, 62, 0.1)",

  // ---- Background & Surface ----
  background: "#f8f9fa",
  backgroundSecondary: "#f5f5f5",
  surface: "#ffffff",
  surfaceSecondary: "#f3f4f6",

  // ---- Text ----
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  textDisabled: "#999999",

  // ---- Border ----
  border: "#e5e7eb",
  borderLight: "#f0f0f0",
  borderSecondary: "#e9ecef",
  borderDark: "#d1d5db",

  // ---- Error ----
  error: "#dc2626",
  errorLight: "#fef2f2",
  errorBorder: "#fecaca",
  errorDark: "#b91c1c",

  // ---- Success ----
  success: "#22c55e",
  successLight: "#f0fdf4",
  successBorder: "#dcfce7",
  successDark: "#166534",

  // ---- Warning ----
  warning: "#f59e0b",
  warningLight: "#fffbeb",
  warningBorder: "#fef3c7",
  warningDark: "#92400e",

  // ---- Info ----
  info: "#2563eb",
  infoLight: "#eff6ff",
  infoBorder: "#bfdbfe",
  infoDark: "#1e40af",

  // ---- Tab / Navigation ----
  tabActive: "#1a4d3e",
  tabInactive: "#666666",

  // ---- Accent ----
  gold: "#c7a56c",
  goldLight: "rgba(199, 165, 108, 0.1)",

  // ---- File Types ----
  pdf: "#8f120b",
  word: "#2b579a",

  // ---- Overlay ----
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.06)",

  // ---- Base ----
  white: "#ffffff",
  black: "#000000",
  disabled: "#adb5bd",
} as const;

export type ColorKey = keyof typeof COLORS;
