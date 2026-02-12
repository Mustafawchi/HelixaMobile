import { Linking } from "react-native";

interface ComposeEmailParams {
  to?: string;
  subject?: string;
  body?: string;
}

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

export const htmlToPlainText = (html: string): string => {
  if (!html) return "";

  const withLineBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\/\s*div\s*>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n");

  const withoutTags = withLineBreaks.replace(/<[^>]*>/g, "");
  return decodeHtmlEntities(withoutTags).replace(/\n{3,}/g, "\n\n").trim();
};

export const composeAndOpenEmail = async ({
  to,
  subject,
  body,
}: ComposeEmailParams): Promise<void> => {
  const recipient = (to || "").trim();
  const params: string[] = [];

  if (subject?.trim()) {
    params.push(`subject=${encodeURIComponent(subject.trim())}`);
  }
  if (body?.trim()) {
    params.push(`body=${encodeURIComponent(body.trim())}`);
  }

  const query = params.length ? `?${params.join("&")}` : "";
  const url = `mailto:${encodeURIComponent(recipient)}${query}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error("No email app is available on this device.");
  }

  await Linking.openURL(url);
};
