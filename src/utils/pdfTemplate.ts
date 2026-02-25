import type { Note } from "../types/note";

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
    result = result.replace(
      new RegExp(`^\\s*(?:${escaped})\\s*(?:<br\\s*\\/?>\\s*)*`, "i"),
      "",
    );
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
  const emptyParagraphPattern =
    /<p[^>]*>\s*(?:&nbsp;|\u00A0|<br\s*\/?>|\s)*<\/p>/gi;

  result = result
    .replace(
      /<div[^>]*class="[^"]*\bpage-break\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      "",
    )
    .replace(
      /<p[^>]*class="[^"]*\bpage-break\b[^"]*"[^>]*>[\s\S]*?<\/p>/gi,
      "",
    )
    .replace(
      /<div[^>]*class="[^"]*\bnote-page-break\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      "",
    )
    .replace(
      /<p[^>]*class="[^"]*\bnote-page-break\b[^"]*"[^>]*>[\s\S]*?<\/p>/gi,
      "",
    );

  result = result.replace(
    /<(div|p|section)[^>]*style="[^"]*(?:page-break-before|page-break-after|break-before|break-after)\s*:\s*[^";]+[^"]*"[^>]*>\s*(?:&nbsp;|\u00A0|<br\s*\/?>|\s)*<\/\1>/gi,
    "",
  );

  // Collapse multiple empty paragraphs/br blocks to a single empty paragraph.
  result = result.replace(
    new RegExp(`(?:${emptyParagraphPattern.source}\\s*){2,}`, "gi"),
    "<p><br></p>",
  );

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
