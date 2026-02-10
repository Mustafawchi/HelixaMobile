import type { PdfSettings } from "../types/user";
import type { Note } from "../types/note";

const PRIMARY_COLOR = "#1a4d3e";

function getLogoPositionCSS(position?: "left" | "center" | "right") {
  if (position === "center")
    return "justify-content: center; padding-left: 0; padding-right: 0;";
  if (position === "right")
    return "justify-content: flex-end; padding-left: 0; padding-right: 15mm;";
  return "justify-content: flex-start; padding-left: 15mm; padding-right: 0;";
}

function getContentMargins(settings?: PdfSettings) {
  let top = 10;
  if (settings?.headerLogoUrl) {
    const logoHeight = settings.headerLogoHeight || 20;
    top = logoHeight + 5;
  }

  let bottom = 10;
  if (settings?.footerLogoUrl) {
    const logoHeight = settings.footerLogoHeight || 20;
    bottom = logoHeight + 5;
  }

  return { top, bottom };
}

function buildHeaderHTML(settings?: PdfSettings): string {
  if (!settings?.headerLogoUrl) return "";

  const logoW = settings.headerLogoWidth || 50;
  const logoH = settings.headerLogoHeight || 20;
  const bg = settings.headerBackgroundColor || "transparent";
  const posCSS = getLogoPositionCSS(settings.headerLogoPosition);

  return `
    <div class="pdf-header">
      <div style="display: flex; align-items: center; ${posCSS} background: ${bg}; height: ${logoH}mm; width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <img src="${settings.headerLogoUrl}" style="height: ${logoH}mm; width: ${logoW}mm; object-fit: contain;" />
      </div>
      <div style="width: 100%; height: 0.5px; background: rgb(200,200,200); -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
    </div>
  `;
}

function buildFooterHTML(settings?: PdfSettings, footerHeightMM?: number): string {
  if (!settings?.footerLogoUrl) return "";

  const logoW = settings.footerLogoWidth || 50;
  const logoH = settings.footerLogoHeight || 20;
  const bg = settings.footerBackgroundColor || "transparent";
  const posCSS = getLogoPositionCSS(settings.footerLogoPosition);
  const h = footerHeightMM || (logoH + 1);

  return `
    <div class="pdf-footer" style="height: ${h}mm;">
      <div style="width: 100%; height: 0.5px; background: rgb(200,200,200); -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
      <div style="display: flex; align-items: center; ${posCSS} background: ${bg}; height: ${logoH}mm; width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <img src="${settings.footerLogoUrl}" style="height: ${logoH}mm; width: ${logoW}mm; object-fit: contain;" />
      </div>
    </div>
  `;
}

function buildSignatureHTML(settings?: PdfSettings): string {
  if (!settings?.includeSignature || !settings?.signatureUrl) return "";

  return `
    <div style="margin-top: 24px;">
      <img src="${settings.signatureUrl}" style="max-width: 200px; max-height: 80px; object-fit: contain;" />
    </div>
  `;
}

/**
 * Builds HTML content from an array of notes (each note as a titled section with page breaks).
 */
export function buildNotesContentHtml(notes: Note[], folderName?: string): string {
  const headerHtml = folderName ? `<h2>${folderName}</h2>` : "";

  const sections = notes
    .map((note, index) => {
      const title = note.title || "Untitled";
      const content = note.text || "<p>No content</p>";
      const metaBits = [note.type, note.matter].filter(Boolean).join(" \u2022 ");
      const pageBreak = index > 0 ? '<div class="page-break"></div>' : "";
      const metadataHtml = metaBits
        ? `<div class="note-metadata">${metaBits}</div>`
        : "";
      return `${pageBreak}<div class="note-section"><div class="note-title">${title}</div>${metadataHtml}<div class="note-content">${content}</div></div>`;
    })
    .join("");

  return `${headerHtml}${sections}`;
}

/**
 * Builds a complete HTML document for expo-print PDF generation.
 *
 * Strategy:
 * - @page { margin: 0 } for full page control
 * - Header: position:fixed top:0 (proven to work on iOS WebKit, repeats every page)
 * - Footer: position:fixed top:calc(100vh - footerHeight) — positions at page bottom
 *   using only "top" (which works) and 100vh (actual page height, no hardcoded mm)
 * - Table thead spacer pushes content below header
 * - Table tfoot spacer reserves space above footer so content doesn't overlap
 */
export interface BuildPdfOptions {
  includeSignature?: boolean;
}

export function buildPdfHtml(
  content: string,
  pdfSettings?: PdfSettings,
  options?: BuildPdfOptions,
): string {
  const margins = getContentMargins(pdfSettings);
  const headerHTML = buildHeaderHTML(pdfSettings);
  const signatureHTML = (options?.includeSignature !== false)
    ? buildSignatureHTML(pdfSettings)
    : "";

  const hasHeader = !!pdfSettings?.headerLogoUrl;
  const hasFooter = !!pdfSettings?.footerLogoUrl;

  const headerHeightMM = hasHeader
    ? (pdfSettings!.headerLogoHeight || 20) + 1
    : 0;

  const footerHeightMM = hasFooter
    ? (pdfSettings!.footerLogoHeight || 20) + 1
    : 0;

  const footerHTML = buildFooterHTML(pdfSettings, footerHeightMM);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * { box-sizing: border-box; }

    html, body {
      font-family: 'Times New Roman', Georgia, serif;
      line-height: 1.8;
      margin: 0;
      padding: 0;
      color: #1f2937;
      font-size: 14px;
    }

    /* --- Header: position:fixed top:0 = physical page top, every page --- */
    .pdf-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: ${headerHeightMM}mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* --- Footer: position:fixed using top with calc(100vh - height) --- */
    .pdf-footer {
      position: fixed;
      top: calc(100vh - ${footerHeightMM}mm);
      left: 0;
      right: 0;
      height: ${footerHeightMM}mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* --- Table layout for content spacing --- */
    .pdf-table {
      width: 100%;
      border-collapse: collapse;
    }
    .pdf-table td {
      padding: 0;
      margin: 0;
      border: none;
    }

    /* Invisible spacer in thead - pushes content below fixed header */
    .header-space {
      height: ${margins.top}mm;
    }

    /* Invisible spacer in tfoot - prevents content from overlapping fixed footer */
    .footer-space {
      height: ${margins.bottom}mm;
    }

    /* --- Main content area --- */
    .pdf-content {
      padding-left: 15mm;
      padding-right: 15mm;
    }

    /* --- Content styles (matching desktop getTemplateCSS) --- */
    p { margin-bottom: 0.5em; orphans: 2; widows: 2; }
    h1, h2, h3, h4 {
      color: ${PRIMARY_COLOR};
      font-weight: 600;
      margin-top: 12pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    h1 { font-size: 1.75em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    strong, b { font-weight: 700 !important; }
    em, i { font-style: italic; }
    u { text-decoration: underline; }
    ul, ol { padding-left: 18pt; margin-bottom: 6pt; }
    li { margin-bottom: 0; line-height: 1.6; }

    /* Note sections */
    .note-section { margin-bottom: 18pt; }
    .note-title {
      font-size: 14pt;
      font-weight: bold;
      color: ${PRIMARY_COLOR};
      margin-bottom: 6pt;
      margin-top: 12pt;
      border-bottom: 1px solid ${PRIMARY_COLOR};
      padding-bottom: 3pt;
      page-break-after: avoid;
    }
    .note-metadata {
      font-size: 10pt;
      color: #666666;
      margin-bottom: 6pt;
      font-style: italic;
    }
    .note-content { margin-bottom: 12pt; }
    .page-break { page-break-before: always; }

    /* Quill font sizes */
    .ql-size-10px { font-size: 10px; }
    .ql-size-12px { font-size: 12px; }
    .ql-size-14px { font-size: 14px; }
    .ql-size-16px { font-size: 16px; }
    .ql-size-18px { font-size: 18px; }
    .ql-size-20px { font-size: 20px; }
    .ql-size-24px { font-size: 24px; }

    /* Quill fonts */
    .ql-font-serif { font-family: 'Times New Roman', Georgia, serif; }
    .ql-font-sans-serif { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; }
    .ql-font-monospace { font-family: 'Courier New', Courier, monospace; }

    /* Quill alignment */
    .ql-align-center { text-align: center; }
    .ql-align-right { text-align: right; }
    .ql-align-justify { text-align: justify; }
  </style>
</head>
<body>
  ${headerHTML}
  ${footerHTML}

  <table class="pdf-table">
    <thead><tr><td><div class="header-space"></div></td></tr></thead>
    <tfoot><tr><td><div class="footer-space"></div></td></tr></tfoot>
    <tbody><tr><td>
      <div class="pdf-content">
        ${content}
        ${signatureHTML}
      </div>
    </td></tr></tbody>
  </table>
</body>
</html>`;
}
