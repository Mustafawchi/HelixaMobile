import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
import {
  exportApi,
  type WordExportMetadata,
  type WordExportNote,
} from "../api/endpoints/export";

const sanitizeFileName = (value: string): string =>
  value.replace(/[/\\:*?"<>|]/g, "-").replace(/\s+/g, "_");

const ensureFileName = (filename: string, isZip: boolean): string => {
  const safe = sanitizeFileName(filename || (isZip ? "export.zip" : "export.docx"));
  if (isZip) return safe.endsWith(".zip") ? safe : `${safe}.zip`;
  return safe.endsWith(".docx") ? safe : `${safe}.docx`;
};

export const useWordExport = () => {
  const [isExportingWord, setIsExportingWord] = useState(false);

  const writeAndShareFile = useCallback(
    async (
      data: ArrayBuffer,
      filename: string,
      contentType: string,
    ): Promise<void> => {
      if (!Paths.cache?.uri) {
        throw new Error("Cache directory is not available.");
      }

      const isZip = contentType.includes("zip");
      const normalizedFileName = ensureFileName(filename, isZip);
      const file = new File(Paths.cache, normalizedFileName);
      const base64 = Buffer.from(data).toString("base64");

      if (!file.exists) {
        file.create({ overwrite: true });
      }
      file.write(base64, { encoding: "base64" });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Word Saved", `File saved to: ${file.uri}`);
        return;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: isZip
          ? "application/zip"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        UTI: isZip ? "public.zip-archive" : "org.openxmlformats.wordprocessingml.document",
        dialogTitle: normalizedFileName,
      });
    },
    [],
  );

  const exportSingleWord = useCallback(
    async (note: WordExportNote, metadata: WordExportMetadata) => {
      if (isExportingWord) return;
      setIsExportingWord(true);

      try {
        const result = await exportApi.exportSingleWord(note, metadata);
        await writeAndShareFile(result.data, result.filename, result.contentType);
      } catch (error: any) {
        Alert.alert(
          "Export Failed",
          error?.message || "Failed to export Word document",
        );
      } finally {
        setIsExportingWord(false);
      }
    },
    [isExportingWord, writeAndShareFile],
  );

  const exportMultipleWord = useCallback(
    async (
      notes: WordExportNote[],
      metadata: WordExportMetadata,
      separateFiles = false,
    ) => {
      if (isExportingWord || notes.length === 0) return;
      setIsExportingWord(true);

      try {
        const result = await exportApi.exportMultipleWord(
          notes,
          metadata,
          separateFiles,
        );
        await writeAndShareFile(result.data, result.filename, result.contentType);
      } catch (error: any) {
        Alert.alert(
          "Export Failed",
          error?.message || "Failed to export Word document",
        );
      } finally {
        setIsExportingWord(false);
      }
    },
    [isExportingWord, writeAndShareFile],
  );

  const exportLetterWord = useCallback(
    async (
      note: WordExportNote,
      metadata: WordExportMetadata,
      fallbackFileBaseName: string,
    ) => {
      if (isExportingWord) return;
      setIsExportingWord(true);

      try {
        const result = await exportApi.exportLetterWord(
          note,
          metadata,
          fallbackFileBaseName,
        );
        await writeAndShareFile(result.data, result.filename, result.contentType);
      } catch (error: any) {
        Alert.alert(
          "Export Failed",
          error?.message || "Failed to export Word document",
        );
      } finally {
        setIsExportingWord(false);
      }
    },
    [isExportingWord, writeAndShareFile],
  );

  return {
    exportSingleWord,
    exportMultipleWord,
    exportLetterWord,
    isExportingWord,
  };
};
