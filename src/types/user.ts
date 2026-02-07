export interface PdfSettings {
  includePageNumbers?: boolean;
  headerLogoUrl?: string;
  headerLogoPosition?: "left" | "center" | "right";
  headerLogoWidth?: number;
  headerLogoHeight?: number;
  headerImageRatio?: number;
  headerBackgroundColor?: string;
  footerLogoUrl?: string;
  footerLogoPosition?: "left" | "center" | "right";
  footerLogoWidth?: number;
  footerLogoHeight?: number;
  footerImageRatio?: number;
  footerBackgroundColor?: string;
  signatureUrl?: string;
  includeSignature?: boolean;
}

export interface CustomTemplate {
  id: string;
  name: string;
  prompt: string;
  type: "consultation" | "procedure";
  createdAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  positionInPractice?: string;
  practiceName?: string;
  role?: string;
  folders?: string[];
  createdAt?: string;
  updatedAt?: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
  pdfSettings?: PdfSettings;
  twoFactorEnabled?: boolean;
  totpSecret?: string;
  backupCodes?: string[];
  twoFactorEnabledAt?: string;
  customTemplates?: CustomTemplate[];
}
