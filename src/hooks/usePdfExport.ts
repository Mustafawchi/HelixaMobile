import { useState, useCallback } from "react";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
import { File, Paths } from "expo-file-system";
import { Alert } from "react-native";
import { useUser } from "./queries/useUser";
import type { PdfSettings } from "../types/user";
import { exportApi } from "../api/endpoints/export";

interface PdfExportOptions {
  includeSignature?: boolean;
  isLetter?: boolean;
}

async function resolveLogoUrl(url: string | undefined): Promise<string | undefined> {
  if (!url || url.startsWith("data:")) return url;
  if (!url.startsWith("file://")) return url;
  try {
    const file = new File(url);
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const ext = url.split(".").pop()?.toLowerCase() || "png";
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${base64}`;
  } catch {
    return url;
  }
}

async function resolvePdfSettings(settings: PdfSettings | undefined): Promise<PdfSettings | undefined> {
  if (!settings) return settings;
  const [headerLogoUrl, footerLogoUrl, signatureUrl] = await Promise.all([
    resolveLogoUrl(settings.headerLogoUrl),
    resolveLogoUrl(settings.footerLogoUrl),
    resolveLogoUrl(settings.signatureUrl),
  ]);
  return {
    ...settings,
    headerLogoUrl: headerLogoUrl ?? settings.headerLogoUrl,
    footerLogoUrl: footerLogoUrl ?? settings.footerLogoUrl,
    signatureUrl: signatureUrl ?? settings.signatureUrl,
  };
}

const normalizeBase64Pdf = (input: string): string => {
  let value = String(input || "").trim();
  value = value.replace(/^data:application\/pdf;base64,/i, "");
  value = value.replace(/\s+/g, "");
  const remainder = value.length % 4;
  if (remainder > 0) {
    value = value + "=".repeat(4 - remainder);
  }
  return value;
};

async function writePdfFile(base64: string, filename: string): Promise<string> {
  if (!Paths.cache?.uri) {
    throw new Error("Cache directory is not available.");
  }
  const normalizedBase64 = normalizeBase64Pdf(base64);
  if (!normalizedBase64 || normalizedBase64.length < 100) {
    throw new Error("Invalid PDF response from server.");
  }
  const buffer = Buffer.from(normalizedBase64, "base64");
  if (!buffer || buffer.length < 100) {
    throw new Error("Failed to decode PDF data.");
  }
  const isPdfSignature =
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d;
  if (!isPdfSignature) {
    throw new Error("Server returned invalid PDF content.");
  }
  const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  const file = new File(Paths.cache, safeFilename);
  file.create({ overwrite: true, intermediates: true });
  file.write(new Uint8Array(buffer));
  return file.uri;
}

async function callServerAndShare(
  content: string,
  filename: string,
  pdfSettings: PdfSettings | undefined,
  options: PdfExportOptions | undefined,
): Promise<void> {
  const response = await exportApi.exportLetterPdf(content, pdfSettings, options, filename);
  const uri = await writePdfFile(response.base64, response.filename);
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: filename,
    });
  } else {
    Alert.alert("PDF Saved", `PDF saved to: ${uri}`);
  }
}

export const usePdfExport = () => {
  const { data: user } = useUser();
  const [isExporting, setIsExporting] = useState(false);

  // Tüm export'lar server (Puppeteer/Chromium) üzerinden gider — tutarlı sonuç için
  const exportPdf = useCallback(
    async (content: string, filename: string, options?: PdfExportOptions) => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        const pdfSettings = await resolvePdfSettings(user?.pdfSettings);
        await callServerAndShare(content, filename, pdfSettings, options);
      } catch (error: any) {
        Alert.alert("Export Failed", error?.message || "Failed to export PDF");
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting, user?.pdfSettings],
  );

  const exportPdfViaServer = exportPdf;

  const createPdfFileViaServer = useCallback(
    async (content: string, filename: string, options?: PdfExportOptions): Promise<string> => {
      const pdfSettings = await resolvePdfSettings(user?.pdfSettings);
      const response = await exportApi.exportLetterPdf(content, pdfSettings, options, filename);
      return writePdfFile(response.base64, response.filename);
    },
    [user?.pdfSettings],
  );

  return {
    exportPdf,
    exportPdfViaServer,
    createPdfFileViaServer,
    isExporting,
    isServerExporting: isExporting,
  };
};
