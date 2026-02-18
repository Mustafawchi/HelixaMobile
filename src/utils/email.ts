import { ActionSheetIOS, Alert, Linking, Platform } from "react-native";
import * as Sharing from "expo-sharing";

interface ComposeEmailParams {
  to?: string;
  subject?: string;
  body?: string;
  showAppChooser?: boolean;
}

interface ComposeEmailWithAttachmentParams extends ComposeEmailParams {
  attachments?: string[];
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
    .replace(/<\/\s*(p|div|h1|h2|h3|h4|h5|h6)\s*>/gi, "\n\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<\/\s*li\s*>/gi, "\n");

  const withoutTags = withLineBreaks.replace(/<[^>]*>/g, "");
  const decoded = decodeHtmlEntities(withoutTags).replace(/\r\n/g, "\n");
  const cleaned = decoded
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
};

export const composeAndOpenEmail = async ({
  to,
  subject,
  body,
  showAppChooser = true,
}: ComposeEmailParams): Promise<void> => {
  const recipient = (to || "").trim();
  const encodedRecipient = encodeURIComponent(recipient);
  const trimmedSubject = subject?.trim() || "";
  const trimmedBody = body?.trim() || "";
  const encodedSubject = encodeURIComponent(trimmedSubject);
  const encodedBody = encodeURIComponent(trimmedBody);

  const queryParts: string[] = [];
  if (trimmedSubject) queryParts.push(`subject=${encodedSubject}`);
  if (trimmedBody) queryParts.push(`body=${encodedBody}`);
  const query = queryParts.length ? `?${queryParts.join("&")}` : "";

  const appCandidates = [
    {
      label: "Mail",
      url: `mailto:${encodedRecipient}${query}`,
    },
    {
      label: "Gmail",
      url: `googlegmail://co?to=${encodedRecipient}&subject=${encodedSubject}&body=${encodedBody}`,
    },
    {
      label: "Outlook",
      url: `ms-outlook://compose?to=${encodedRecipient}&subject=${encodedSubject}&body=${encodedBody}`,
    },
    {
      label: "Yahoo Mail",
      url: `ymail://mail/compose?to=${encodedRecipient}&subject=${encodedSubject}&body=${encodedBody}`,
    },
    {
      label: "Spark",
      url: `readdle-spark://compose?recipient=${encodedRecipient}&subject=${encodedSubject}&body=${encodedBody}`,
    },
  ];

  const availability = await Promise.all(
    appCandidates.map(async (candidate) => ({
      ...candidate,
      canOpen: await Linking.canOpenURL(candidate.url),
    })),
  );
  const availableApps = availability.filter((item) => item.canOpen);

  if (availableApps.length === 0) {
    throw new Error("No email app is available on this device.");
  }

  if (!showAppChooser || availableApps.length === 1) {
    await Linking.openURL(availableApps[0].url);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const mailtoUrl = `mailto:${encodedRecipient}${query}`;
    const openApp = async (url: string) => {
      try {
        await Linking.openURL(url);
        resolve();
      } catch {
        if (url !== mailtoUrl) {
          try {
            await Linking.openURL(mailtoUrl);
            resolve();
          } catch (fallbackError) {
            reject(fallbackError);
          }
        } else {
          reject(new Error("No email app is available on this device."));
        }
      }
    };

    if (Platform.OS === "ios") {
      const options = availableApps.map((app) => app.label).concat("Cancel");
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: "Choose Email App",
        },
        (buttonIndex) => {
          if (buttonIndex === options.length - 1) {
            resolve();
            return;
          }
          void openApp(availableApps[buttonIndex].url);
        },
      );
      return;
    }

    Alert.alert(
      "Choose Email App",
      "Select an app to continue",
      [
        ...availableApps.map((app) => ({
          text: app.label,
          onPress: () => {
            void openApp(app.url);
          },
        })),
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(),
        },
      ],
      { cancelable: true, onDismiss: () => resolve() },
    );
  });
};

export const composeAndOpenEmailWithAttachment = async ({
  to,
  subject,
  body,
  attachments = [],
  showAppChooser = false,
}: ComposeEmailWithAttachmentParams): Promise<void> => {
  const hasAttachment = attachments.length > 0;

  if (!hasAttachment) {
    await composeAndOpenEmail({ to, subject, body, showAppChooser });
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    await composeAndOpenEmail({ to, subject, body, showAppChooser });
    return;
  }

  await Sharing.shareAsync(attachments[0], {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: subject?.trim() || "Send Email",
  });
};
