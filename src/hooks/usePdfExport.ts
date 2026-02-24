import { useState, useCallback } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { File, Paths } from "expo-file-system";
import { useUser } from "./queries/useUser";
import { buildPdfHtml, type BuildPdfOptions } from "../utils/pdfTemplate";
import { exportApi } from "../api/endpoints/export";

const sanitizeFileName = (value: string): string =>
  value.replace(/[/\\:*?"<>|]/g, "-").replace(/\s+/g, "_");

export const usePdfExport = () => {
  const { data: user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isServerExporting, setIsServerExporting] = useState(false);

  const exportPdf = useCallback(
    async (content: string, filename: string, options?: BuildPdfOptions) => {
      if (isExporting) return;
      setIsExporting(true);

      try {
        const html = buildPdfHtml(content, user?.pdfSettings, options);
        const { uri } = await Print.printToFileAsync({ html });

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
      } catch (error: any) {
        Alert.alert("Export Failed", error?.message || "Failed to export PDF");
      } finally {
        setIsExporting(false);
      }
    },
    [user?.pdfSettings, isExporting],
  );

  const exportPdfViaServer = useCallback(
    async (
      content: string,
      filename: string,
      options?: { includeSignature?: boolean },
    ) => {
      if (isServerExporting) return;
      setIsServerExporting(true);

      try {
        const result = await exportApi.exportLetterPdf(
          content,
          user?.pdfSettings,
          options,
          filename,
        );

        if (!Paths.cache?.uri) {
          throw new Error("Cache directory is not available.");
        }

        const normalizedFileName = `${sanitizeFileName(result.filename || filename)}.pdf`.replace(
          /\.pdf\.pdf$/,
          ".pdf",
        );
        const file = new File(Paths.cache, normalizedFileName);

        if (!file.exists) {
          file.create({ overwrite: true });
        }
        file.write(result.base64, { encoding: "base64" });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(file.uri, {
            mimeType: "application/pdf",
            UTI: "com.adobe.pdf",
            dialogTitle: normalizedFileName,
          });
        } else {
          Alert.alert("PDF Saved", `PDF saved to: ${file.uri}`);
        }
      } catch (error: any) {
        Alert.alert("Export Failed", error?.message || "Failed to export PDF");
      } finally {
        setIsServerExporting(false);
      }
    },
    [user?.pdfSettings, isServerExporting],
  );

  const createPdfFileViaServer = useCallback(
    async (content: string, filename: string): Promise<string> => {
      const result = await exportApi.exportLetterPdf(
        content,
        user?.pdfSettings,
        undefined,
        filename,
      );

      if (!Paths.cache?.uri) {
        throw new Error("Cache directory is not available.");
      }

      const normalizedFileName = `${sanitizeFileName(result.filename || filename)}.pdf`.replace(
        /\.pdf\.pdf$/,
        ".pdf",
      );
      const file = new File(Paths.cache, normalizedFileName);

      if (!file.exists) {
        file.create({ overwrite: true });
      }
      file.write(result.base64, { encoding: "base64" });

      return file.uri;
    },
    [user?.pdfSettings],
  );

  return {
    exportPdf,
    isExporting,
    exportPdfViaServer,
    createPdfFileViaServer,
    isServerExporting,
  };
};
