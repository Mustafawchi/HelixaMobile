import type { PdfSettings } from "../types/user";
import type { Note } from "../types/note";

const PRIMARY_COLOR = "#1a4d3e";
const MIN_LOGO_MM = 8;
const MAX_LOGO_HEIGHT_MM = 35;
const MAX_LOGO_WIDTH_MM = 180;

function clampMm(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getHeaderLogoSize(settings?: PdfSettings) {
  return {
    width: clampMm(settings?.headerLogoWidth || 50, MIN_LOGO_MM, MAX_LOGO_WIDTH_MM),
    height: clampMm(
      settings?.headerLogoHeight || 20,
      MIN_LOGO_MM,
      MAX_LOGO_HEIGHT_MM,
    ),
  };
}

function getFooterLogoSize(settings?: PdfSettings) {
  return {
    width: clampMm(settings?.footerLogoWidth || 50, MIN_LOGO_MM, MAX_LOGO_WIDTH_MM),
    height: clampMm(
      settings?.footerLogoHeight || 20,
      MIN_LOGO_MM,
      MAX_LOGO_HEIGHT_MM,
    ),
  };
}

function getLogoPositionCSS(position?: "left" | "center" | "right") {
  if (position === "center") {
    return "justify-content:center;padding-left:0;padding-right:0;";
  }
  if (position === "right") {
    return "justify-content:flex-end;padding-left:0;padding-right:15mm;";
  }
  return "justify-content:flex-start;padding-left:15mm;padding-right:0;";
}

function buildHeaderHTML(settings?: PdfSettings): string {
  if (!settings?.headerLogoUrl) return "";

  const { width, height } = getHeaderLogoSize(settings);
  const bg = settings.headerBackgroundColor || "transparent";
  const posCSS = getLogoPositionCSS(settings.headerLogoPosition);

  return `
    <div class="pdf-header">
      <div class="pdf-header-inner" style="${posCSS}background:${bg};height:${height}mm;">
        <img src="${escapeHtmlAttr(settings.headerLogoUrl)}" alt="" style="height:${height}mm;width:${width}mm;max-height:${height}mm;max-width:${width}mm;object-fit:contain;display:block;" />
      </div>
      <div class="pdf-header-line"></div>
    </div>
  `;
}

function buildFooterHTML(
  settings?: PdfSettings,
  footerTotalMM?: number,
): string {
  const hasLogo = !!settings?.footerLogoUrl;
  if (!hasLogo) return "";

  const { width, height } = getFooterLogoSize(settings);
  const bg = settings?.footerBackgroundColor || "transparent";
  const posCSS = getLogoPositionCSS(settings?.footerLogoPosition);
  const wrapperHeight = footerTotalMM || height + 2;

  return `
    <div class="pdf-footer" style="height:${wrapperHeight}mm;">
      <div class="pdf-footer-line"></div>
      <div class="pdf-footer-inner" style="${posCSS}background:${bg};height:${height}mm;">
        <img src="${escapeHtmlAttr(settings!.footerLogoUrl!)}" alt="" style="height:${height}mm;width:${width}mm;max-height:${height}mm;max-width:${width}mm;object-fit:contain;display:block;" />
      </div>
    </div>
  `;
}

function buildSignatureHTML(settings?: PdfSettings): string {
  if (!settings?.includeSignature || !settings?.signatureUrl) return "";

  return `
    <div style="margin-top:24px;">
      <img src="${escapeHtmlAttr(settings.signatureUrl)}" alt="" style="max-width:200px;max-height:80px;object-fit:contain;" />
    </div>
  `;
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function stripLeadingLabelBlocks(content: string, labels: string[]): string {
  let result = content || "";
  const normalizedLabels = labels
    .map((label) => (label || "").trim())
    .filter(Boolean)
    .filter((value, idx, arr) => arr.indexOf(value) === idx);

  normalizedLabels.forEach((label) => {
    const escaped = escapeRegExp(label);
    // Remove leading plain-text lines: "Emergency Visit"
    result = result.replace(
      new RegExp(`^\\s*(?:${escaped})\\s*(?:<br\\s*\\/?>\\s*)*`, "i"),
      "",
    );
    // Remove leading paragraph blocks: <p>Emergency Visit</p>
    result = result.replace(
      new RegExp(
        `^\\s*<p[^>]*>\\s*(?:<strong>|<b>)?\\s*${escaped}\\s*(?:<\\/strong>|<\\/b>)?\\s*<\\/p>\\s*`,
        "i",
      ),
      "",
    );
  });

  return result.trim();
}

function sanitizePdfNoteContent(content: string): string {
  let result = content || "";

  // Remove explicit pagination markers that may come from copied/exported HTML.
  result = result
    .replace(/<div[^>]*class="[^"]*\bpage-break\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<p[^>]*class="[^"]*\bpage-break\b[^"]*"[^>]*>[\s\S]*?<\/p>/gi, "")
    .replace(/<div[^>]*class="[^"]*\bnote-page-break\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<p[^>]*class="[^"]*\bnote-page-break\b[^"]*"[^>]*>[\s\S]*?<\/p>/gi, "");

  // Remove empty nodes carrying forced page break styles.
  result = result.replace(
    /<(div|p|section)[^>]*style="[^"]*(?:page-break-before|page-break-after|break-before|break-after)\s*:\s*[^";]+[^"]*"[^>]*>\s*(?:&nbsp;|\u00A0|<br\s*\/?>|\s)*<\/\1>/gi,
    "",
  );

  // Remove trailing empty paragraphs/breaks that can push an extra blank page.
  result = result
    .replace(/<p>\s*(?:&nbsp;|\u00A0|<br\s*\/?>|\s)*<\/p>\s*$/gi, "")
    .replace(/(?:<br\s*\/?>\s*)+$/gi, "");

  return result.trim() || "<p>No content</p>";
}

/**
 * Builds HTML content from an array of notes with page breaks.
 * NoteList export intentionally avoids repeating title/type labels because
 * those labels often already exist in note body ("Patient Note" template).
*/
export function buildNotesContentHtml(notes: Note[], folderName?: string): string {
  const headerHtml = folderName ? `<h2>${folderName}</h2>` : "";

  const sections = notes
    .map((note, index) => {
      const content = sanitizePdfNoteContent(
        stripLeadingLabelBlocks(note.text || "<p>No content</p>", [
          note.title || "",
          note.type || "",
          note.matter || "",
        ]),
      );
      const pageStartStyle =
        index > 0 ? ' style="break-before: page; page-break-before: always;"' : "";
      return `<div class="note-section"${pageStartStyle}><div class="note-content">${content}</div></div>`;
    })
    .join("");

  return `${headerHtml}${sections}`;
}

export interface BuildPdfOptions {
  includeSignature?: boolean;
}

/**
 * Mobile PDF strategy using position:fixed for header/footer.
 *
 * iOS WebKit (expo-print) rules:
 * - position:fixed; top:0       → renders at physical page top on EVERY page
 * - position:fixed; bottom:0 → renders at physical page bottom on EVERY page
 * - Content flows naturally with margins to avoid overlapping header/footer
 * - No explicit page sections needed; browser handles page breaks
 */
export function buildPdfHtml(
  content: string,
  pdfSettings?: PdfSettings,
  options?: BuildPdfOptions,
): string {
  const signatureHTML =
    options?.includeSignature !== false ? buildSignatureHTML(pdfSettings) : "";
  const fullContent = content + signatureHTML;

  const hasHeader = !!pdfSettings?.headerLogoUrl;
  const hasFooterLogo = !!pdfSettings?.footerLogoUrl;
  const hasFooter = hasFooterLogo;

  const headerLogoH = hasHeader ? getHeaderLogoSize(pdfSettings).height : 0;
  const footerLogoH = hasFooterLogo ? getFooterLogoSize(pdfSettings).height : 0;

  const headerTotalMM = hasHeader ? headerLogoH + 2 : 0;
  const footerTotalMM = hasFooterLogo ? footerLogoH + 2 : 0;

  // Content margins to avoid overlapping with fixed header/footer
  const contentTopMM = hasHeader ? headerTotalMM + 3 : 10;
  const contentBottomMM = hasFooter ? footerTotalMM + 3 : 10;

  const headerFixedHTML = hasHeader ? buildHeaderHTML(pdfSettings) : "";
  const footerFixedHTML = hasFooter
    ? buildFooterHTML(pdfSettings, footerTotalMM)
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }

    html, body {
      font-family: 'Times New Roman', Georgia, serif;
      line-height: 1.8;
      margin: 0;
      padding: 0;
      color: #1f2937;
      font-size: 14px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Fixed header: positioned in the top page margin ── */
    .pdf-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 10;
    }
    .pdf-header-inner {
      display: flex;
      align-items: center;
      width: 100%;
      overflow: hidden;
    }
    .pdf-header-line {
      width: 100%;
      height: 0.5px;
      background: rgb(200,200,200);
    }

    /* ── Fixed footer: positioned in the bottom page margin ── */
    .pdf-footer {
      position: fixed !important;
      top: auto !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      z-index: 1000 !important;
    }
    .pdf-footer-line {
      width: 100%;
      height: 0.5px;
      background: rgb(200,200,200);
    }
    .pdf-footer-inner {
      display: flex;
      align-items: center;
      width: 100%;
      overflow: hidden;
    }

    /* ── Content area ── */
    .pdf-content {
      padding-top: ${contentTopMM}mm;
      padding-bottom: ${contentBottomMM}mm;
      padding-left: 15mm;
      padding-right: 15mm;
      min-height: calc(100vh - ${headerTotalMM + footerTotalMM}mm);
    }

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

    .note-section { margin-bottom: 18pt; }
    .note-section:last-child { margin-bottom: 0; }
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
    .ql-size-10px { font-size: 10px; }
    .ql-size-12px { font-size: 12px; }
    .ql-size-14px { font-size: 14px; }
    .ql-size-16px { font-size: 16px; }
    .ql-size-18px { font-size: 18px; }
    .ql-size-20px { font-size: 20px; }
    .ql-size-24px { font-size: 24px; }
    .ql-font-serif { font-family: 'Times New Roman', Georgia, serif; }
    .ql-font-sans-serif { font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; }
    .ql-font-monospace { font-family: 'Courier New', Courier, monospace; }
    .ql-align-center { text-align: center; }
    .ql-align-right { text-align: right; }
    .ql-align-justify { text-align: justify; }
  </style>
</head>
<body>
  ${headerFixedHTML}
  ${footerFixedHTML}
  <div class="pdf-content">
    ${fullContent}
  </div>
</body>
</html>`;
}
