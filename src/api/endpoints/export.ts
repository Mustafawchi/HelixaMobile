import { functionsApiClient } from "../client";
import type { PdfSettings } from "../../types/user";

export interface WordExportNote {
  id: string;
  title?: string;
  text?: string;
  type?: string;
  matter?: string;
  createdAt: string;
  lastEdited?: string;
  updatedAt?: string;
}

export interface WordExportMetadata {
  folderName: string;
  folderType?: string;
  includeLastEditedInFooter?: boolean;
  userTimezone?: string;
  timezoneOffset?: number;
}

interface WordExportResponse {
  data: ArrayBuffer;
  filename: string;
  contentType: string;
}

interface PdfExportResponse {
  base64: string;
  filename: string;
  contentType: string;
}

interface WordExportOptions {
  separateFiles?: boolean;
  documentType?: "notes" | "letter";
}

const WORD_EXPORT_ENDPOINT = "/generateDocx/generate-docx";
const PDF_EXPORT_ENDPOINT = "/generatePdf/generate-pdf";

const sanitizeFileName = (value: string): string =>
  value.replace(/[/\\:*?"<>|]/g, "-").replace(/\s+/g, "_");

const extractFilename = (contentDisposition?: string): string | null => {
  if (!contentDisposition) return null;
  const filenameMatch = contentDisposition.match(/filename="(.+)"/);
  return filenameMatch?.[1] || null;
};

const buildPayload = (
  notes: WordExportNote[],
  metadata: WordExportMetadata,
  options: WordExportOptions,
  filename?: string,
) => ({
  notes: notes.map((note) => ({
    id: note.id,
    title: note.title,
    text: note.text,
    type: note.type,
    matter: note.matter,
    createdAt: note.createdAt,
    lastEdited: note.lastEdited || note.updatedAt,
  })),
  metadata: {
    folderName: metadata.folderName,
    folderType: metadata.folderType,
    includeLastEditedInFooter: metadata.includeLastEditedInFooter ?? false,
    userTimezone:
      metadata.userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset:
      metadata.timezoneOffset !== undefined
        ? metadata.timezoneOffset
        : new Date().getTimezoneOffset(),
  },
  options,
  filename,
});

const exportDocx = async (
  notes: WordExportNote[],
  metadata: WordExportMetadata,
  options: WordExportOptions,
  fallbackFileBaseName: string,
): Promise<WordExportResponse> => {
  const separateFiles = !!options.separateFiles;
  console.log("[WordExport] Request start:", {
    baseURL: functionsApiClient.defaults.baseURL,
    endpoint: WORD_EXPORT_ENDPOINT,
    notesCount: notes.length,
    separateFiles,
    documentType: options.documentType || "notes",
    folderName: metadata.folderName,
  });
  const response = await functionsApiClient.post<ArrayBuffer>(
    WORD_EXPORT_ENDPOINT,
    buildPayload(
      notes,
      metadata,
      options,
      sanitizeFileName(fallbackFileBaseName),
    ),
    {
      timeout: 120000,
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const disposition = response.headers["content-disposition"] as
    | string
    | undefined;
  const contentType =
    (response.headers["content-type"] as string | undefined) ||
    (separateFiles ? "application/zip" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  const fallbackFilename = `${sanitizeFileName(fallbackFileBaseName)}${
    separateFiles ? ".zip" : ".docx"
  }`;

  console.log("[WordExport] Request success:", {
    usedUrl: WORD_EXPORT_ENDPOINT,
    status: response.status,
    contentType,
    filenameFromHeader: extractFilename(disposition),
  });

  return {
    data: response.data,
    filename: extractFilename(disposition) || fallbackFilename,
    contentType,
  };
};

const exportPdf = async (
  content: string,
  pdfSettings: PdfSettings | undefined,
  options: { includeSignature?: boolean } | undefined,
  fallbackFileBaseName: string,
): Promise<PdfExportResponse> => {
  const response = await functionsApiClient.post<PdfExportResponse>(
    PDF_EXPORT_ENDPOINT,
    {
      content,
      pdfSettings,
      options,
      returnBase64: true,
      filename: sanitizeFileName(fallbackFileBaseName),
    },
    {
      timeout: 120000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const contentType =
    response.data?.contentType ||
    (response.headers["content-type"] as string | undefined) ||
    "application/pdf";
  const fallbackFilename = `${sanitizeFileName(fallbackFileBaseName)}.pdf`;

  return {
    base64: response.data?.base64 || "",
    filename: response.data?.filename || fallbackFilename,
    contentType,
  };
};

export const exportApi = {
  exportSingleWord: async (
    note: WordExportNote,
    metadata: WordExportMetadata,
  ): Promise<WordExportResponse> => {
    return exportDocx(
      [note],
      metadata,
      { separateFiles: false, documentType: "notes" },
      note.title || metadata.folderName || "FileNote",
    );
  },

  exportMultipleWord: async (
    notes: WordExportNote[],
    metadata: WordExportMetadata,
    separateFiles = false,
  ): Promise<WordExportResponse> => {
    const dateString = new Date().toISOString().slice(0, 10);
    const baseName = `${metadata.folderName || "Patient"}_${dateString}`;
    return exportDocx(
      notes,
      metadata,
      { separateFiles, documentType: "notes" },
      baseName,
    );
  },

  exportLetterWord: async (
    note: WordExportNote,
    metadata: WordExportMetadata,
    fallbackFileBaseName: string,
  ): Promise<WordExportResponse> => {
    return exportDocx(
      [note],
      metadata,
      { separateFiles: false, documentType: "letter" },
      fallbackFileBaseName,
    );
  },

  exportLetterPdf: async (
    content: string,
    pdfSettings: PdfSettings | undefined,
    options: { includeSignature?: boolean } | undefined,
    fallbackFileBaseName: string,
  ): Promise<PdfExportResponse> => {
    return exportPdf(content, pdfSettings, options, fallbackFileBaseName);
  },
};
