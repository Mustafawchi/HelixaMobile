import { useState, useCallback } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { useUser } from "./queries/useUser";
import { buildPdfHtml, type BuildPdfOptions } from "../utils/pdfTemplate";

export const usePdfExport = () => {
  const { data: user } = useUser();
  const [isExporting, setIsExporting] = useState(false);

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

  return { exportPdf, isExporting };
};
