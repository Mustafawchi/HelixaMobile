import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import { COLORS } from "../../types/colors";
import { spacing, borderRadius } from "../../theme";
import type { PatientsStackParamList } from "../../types/navigation";
import { usePdfExport } from "../../hooks/usePdfExport";
import { useWordExport } from "../../hooks/useWordExport";
import { htmlToPlainText } from "../../utils/email";

type SmartSummaryRoute = RouteProp<PatientsStackParamList, "SmartSummary">;

interface SummarySection {
  title?: string;
  lines: string[];
}

const DATE_FRAGMENT_REGEX =
  /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{1,2}\s(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s\d{4})\b/gi;

const formatGeneratedAt = (value?: string): string => {
  if (!value) return "Just now";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Just now";
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeLine = (line: string): string =>
  line
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\-\s+/, "• ")
    .trim();

const parseSections = (content: string): SummarySection[] => {
  const plain = htmlToPlainText(content || "").trim();
  if (!plain) return [{ lines: ["No smart summary content available."] }];

  const blocks = plain
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split("\n").map(normalizeLine).filter(Boolean);

    if (lines.length === 0) {
      return { lines: [] };
    }

    const first = lines[0];
    const looksLikeTitle =
      !first.startsWith("• ") &&
      !first.endsWith(".") &&
      first.split(" ").length <= 7;

    if (looksLikeTitle && lines.length > 1) {
      return {
        title: first.replace(/:$/, ""),
        lines: lines.slice(1),
      };
    }

    return { lines };
  });
};

const renderLineWithBoldDates = (line: string) => {
  const matches = Array.from(line.matchAll(DATE_FRAGMENT_REGEX));
  if (matches.length === 0) return line;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const matchIndex = match.index ?? 0;
    const matchText = match[0];

    if (matchIndex > cursor) {
      nodes.push(line.slice(cursor, matchIndex));
    }

    nodes.push(
      <Text key={`date-${matchIndex}-${index}`} style={styles.dateBoldText}>
        {matchText}
      </Text>,
    );

    cursor = matchIndex + matchText.length;
  });

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  return nodes;
};

export default function SmartSummaryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<SmartSummaryRoute>();

  const { patientName, generatedContent, notesCount, generatedAt, folderType } =
    route.params;

  const { exportPdf, isExporting } = usePdfExport();
  const { exportLetterWord, isExportingWord } = useWordExport();

  const summaryHtml =
    generatedContent || "<p>No smart summary content available.</p>";

  const sections = useMemo(() => parseSections(summaryHtml), [summaryHtml]);

  const handleExportPdf = useCallback(() => {
    exportPdf(summaryHtml, `SmartSummary_${patientName}`);
  }, [exportPdf, summaryHtml, patientName]);

  const handleExportWord = useCallback(() => {
    void exportLetterWord(
      {
        id: `smart-summary-${Date.now()}`,
        title: `SmartSummary_${patientName}`,
        text: summaryHtml,
        type: "Smart Summary",
        createdAt: generatedAt || new Date().toISOString(),
        lastEdited: generatedAt || new Date().toISOString(),
      },
      {
        folderName: patientName,
        folderType: folderType || "Patient Notes",
      },
      `SmartSummary_${patientName}_${new Date().toISOString().slice(0, 10)}`,
    );
  }, [exportLetterWord, summaryHtml, generatedAt, patientName, folderType]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <View style={styles.iconWrap}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View>
              <Text style={styles.title}>Smart Summary</Text>
              <Text style={styles.subtitle}>
                {patientName}
                {folderType ? ` • ${folderType}` : " •"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeIconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={26} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metaBar}>
        <Text style={styles.metaText}>
          {notesCount ?? 0} notes analyzed • Generated{" "}
          {formatGeneratedAt(generatedAt)}
        </Text>
      </View>

      <View style={styles.contentCard}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, sectionIndex) => (
            <View key={`section-${sectionIndex}`} style={styles.section}>
              {section.title ? (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              ) : null}
              {section.lines.map((line, lineIndex) => {
                const isBullet = line.startsWith("• ");
                return (
                  <Text
                    key={`line-${sectionIndex}-${lineIndex}`}
                    style={[styles.bodyText, isBullet && styles.bulletText]}
                  >
                    {renderLineWithBoldDates(line)}
                  </Text>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(4, (insets.bottom || spacing.sm) - 12) },
        ]}
      >
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.secondaryButton, isExporting && { opacity: 0.6 }]}
            onPress={handleExportPdf}
            disabled={isExporting}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={COLORS.pdf}
            />
            <Text style={[styles.secondaryButtonText, { color: COLORS.pdf }]}>
              {isExporting ? "Exporting..." : "Export PDF"}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.secondaryButton,
              isExportingWord && { opacity: 0.6 },
            ]}
            onPress={handleExportWord}
            disabled={isExportingWord}
          >
            <Ionicons name="document-outline" size={18} color={COLORS.word} />
            <Text style={[styles.secondaryButtonText, { color: COLORS.word }]}>
              {isExportingWord ? "Exporting..." : "Export Word"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    gap: 0,
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  metaBar: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  contentCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    minHeight: 260,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  dateBoldText: {
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  bulletText: {
    paddingLeft: 2,
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    alignSelf: "flex-end",
    minWidth: 120,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
});
