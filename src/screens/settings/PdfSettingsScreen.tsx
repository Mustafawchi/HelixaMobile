import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Switch,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../config/firebase";
import { useUser } from "../../hooks/queries/useUser";
import { useUpdateUser } from "../../hooks/mutations/useUpdateUser";
import { COLORS, spacing, borderRadius } from "../../theme";
import type { PdfSettings } from "../../types/user";

const PREVIEW_SCALE = 2.5; // 2.5px per mm — matches lex-protocol for cross-platform consistency

const CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
type Corner = (typeof CORNERS)[number];

const CORNER_POSITIONS: Record<Corner, object> = {
  "top-left": { top: -8, left: -8 },
  "top-right": { top: -8, right: -8 },
  "bottom-left": { bottom: -8, left: -8 },
  "bottom-right": { bottom: -8, right: -8 },
};

export default function PdfSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: userProfile } = useUser();
  const updateUser = useUpdateUser();

  const [settings, setSettings] = useState<PdfSettings>({
    includePageNumbers: true,
    headerLogoUrl: "",
    headerLogoPosition: "left",
    headerLogoWidth: 50,
    headerLogoHeight: 20,
    headerImageRatio: 0.2,
    headerLogoOpacity: 1.0,
    headerBackgroundColor: "",
    footerLogoUrl: "",
    footerLogoPosition: "left",
    footerLogoWidth: 50,
    footerLogoHeight: 20,
    footerImageRatio: 0.2,
    footerLogoOpacity: 1.0,
    footerBackgroundColor: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [isUploadingFooter, setIsUploadingFooter] = useState(false);

  // Keep a ref to current settings so PanResponder closures always read the latest
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Initialize from user profile
  useEffect(() => {
    if (!userProfile?.pdfSettings) return;
    const ps = userProfile.pdfSettings;
    setSettings({
      includePageNumbers: ps.includePageNumbers ?? true,
      headerLogoUrl: ps.headerLogoUrl || "",
      headerLogoPosition: ps.headerLogoPosition || "left",
      headerLogoWidth: ps.headerLogoWidth || 50,
      headerLogoHeight: ps.headerLogoHeight || 20,
      headerImageRatio: ps.headerImageRatio || 0.2,
      headerLogoOpacity: ps.headerLogoOpacity ?? 1.0,
      headerBackgroundColor: ps.headerBackgroundColor || "",
      footerLogoUrl: ps.footerLogoUrl || "",
      footerLogoPosition: ps.footerLogoPosition || "left",
      footerLogoWidth: ps.footerLogoWidth || 50,
      footerLogoHeight: ps.footerLogoHeight || 20,
      footerImageRatio: ps.footerImageRatio || 0.2,
      footerLogoOpacity: ps.footerLogoOpacity ?? 1.0,
      footerBackgroundColor: ps.footerBackgroundColor || "",
      signatureUrl: ps.signatureUrl || "",
      includeSignature: ps.includeSignature ?? false,
    });
  }, [userProfile]);

  // ─── Image picker + upload ────────────────────────────────────────────
  const pickAndUploadLogo = async (type: "header" | "footer") => {
    const setUploading =
      type === "header" ? setIsUploadingHeader : setIsUploadingFooter;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mimeType = asset.mimeType || "image/jpeg";
      const aspectRatio = (asset.height || 1) / (asset.width || 1);
      const initialWidth = Math.min((asset.width || 500) / 10, 150);
      const initialHeight = Math.round(initialWidth * aspectRatio);

      const uploadFn = httpsCallable<
        { imageBase64: string; mimeType: string; logoType: string },
        { downloadUrl: string }
      >(functions, "uploadPdfLogo");

      const response = await uploadFn({
        imageBase64: base64,
        mimeType,
        logoType: type,
      });

      const downloadUrl = response.data.downloadUrl;

      if (type === "header") {
        setSettings((prev) => ({
          ...prev,
          headerLogoUrl: downloadUrl,
          headerLogoWidth: initialWidth,
          headerLogoHeight: initialHeight,
          headerImageRatio: aspectRatio,
        }));
      } else {
        setSettings((prev) => ({
          ...prev,
          footerLogoUrl: downloadUrl,
          footerLogoWidth: initialWidth,
          footerLogoHeight: initialHeight,
          footerImageRatio: aspectRatio,
        }));
      }

      Alert.alert(
        "Success",
        `${type === "header" ? "Header" : "Footer"} logo uploaded`,
      );
    } catch (error) {
      console.error("Logo upload error:", error);
      Alert.alert("Error", "Failed to upload logo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = (type: "header" | "footer") => {
    if (type === "header") {
      setSettings((prev) => ({ ...prev, headerLogoUrl: "" }));
    } else {
      setSettings((prev) => ({ ...prev, footerLogoUrl: "" }));
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser.mutateAsync({ pdfSettings: settings });
      Alert.alert("Success", "PDF settings saved", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save PDF settings");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Corner drag PanResponders (stable — created once, read from ref) ─
  const makePanResponder = (type: "header" | "footer", corner: Corner) => {
    let startWidth = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const cur = settingsRef.current;
        startWidth =
          type === "header"
            ? cur.headerLogoWidth || 50
            : cur.footerLogoWidth || 50;
      },
      onPanResponderMove: (_evt, gs) => {
        let deltaX = gs.dx;
        if (corner === "top-left" || corner === "bottom-left") {
          deltaX = -deltaX;
        }
        const widthDelta = deltaX / PREVIEW_SCALE;
        let newWidth = Math.round(startWidth + widthDelta);
        newWidth = Math.max(20, Math.min(150, newWidth));
        newWidth = Math.round(newWidth / 5) * 5;

        const cur = settingsRef.current;
        const ratio =
          type === "header"
            ? cur.headerImageRatio || 0.2
            : cur.footerImageRatio || 0.2;
        const newHeight = Math.round(newWidth * ratio);

        if (type === "header") {
          setSettings((prev) => ({
            ...prev,
            headerLogoWidth: newWidth,
            headerLogoHeight: newHeight,
          }));
        } else {
          setSettings((prev) => ({
            ...prev,
            footerLogoWidth: newWidth,
            footerLogoHeight: newHeight,
          }));
        }
      },
      onPanResponderRelease: () => {},
    });
  };

  // Create all 8 PanResponders once and keep them stable
  const panResponders = useMemo(
    () => ({
      header: {
        "top-left": makePanResponder("header", "top-left"),
        "top-right": makePanResponder("header", "top-right"),
        "bottom-left": makePanResponder("header", "bottom-left"),
        "bottom-right": makePanResponder("header", "bottom-right"),
      },
      footer: {
        "top-left": makePanResponder("footer", "top-left"),
        "top-right": makePanResponder("footer", "top-right"),
        "bottom-left": makePanResponder("footer", "bottom-left"),
        "bottom-right": makePanResponder("footer", "bottom-right"),
      },
    }),
    [], // Created once — reads current values from settingsRef
  );

  const isAnyUploading = isUploadingHeader || isUploadingFooter;

  // ─── Render helpers (not components — just JSX builders) ──────────────

  const renderCornerHandles = (type: "header" | "footer") =>
    CORNERS.map((corner) => (
      <View
        key={corner}
        {...panResponders[type][corner].panHandlers}
        style={[styles.cornerHandle, CORNER_POSITIONS[corner]]}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      />
    ));

  const renderPositionSelector = (type: "header" | "footer") => {
    const currentPos =
      type === "header"
        ? settings.headerLogoPosition
        : settings.footerLogoPosition;
    const field =
      type === "header" ? "headerLogoPosition" : "footerLogoPosition";

    return (
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Position</Text>
        <View style={styles.positionButtons}>
          {(["left", "center", "right"] as const).map((pos) => (
            <Pressable
              key={pos}
              style={[
                styles.positionBtn,
                currentPos === pos && styles.positionBtnActive,
              ]}
              onPress={() =>
                setSettings((prev) => ({ ...prev, [field]: pos }))
              }
            >
              <Text
                style={[
                  styles.positionBtnText,
                  currentPos === pos && styles.positionBtnTextActive,
                ]}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderResizableLogo = (type: "header" | "footer") => {
    const isHeader = type === "header";
    const url = isHeader ? settings.headerLogoUrl : settings.footerLogoUrl;
    const width = isHeader
      ? settings.headerLogoWidth || 50
      : settings.footerLogoWidth || 50;
    const height = isHeader
      ? settings.headerLogoHeight || 20
      : settings.footerLogoHeight || 20;
    const opacity = isHeader
      ? settings.headerLogoOpacity ?? 1.0
      : settings.footerLogoOpacity ?? 1.0;

    if (!url) return null;

    return (
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Logo Size</Text>
        <Text style={styles.settingHint}>Drag the corners to resize</Text>
        <View style={styles.resizeContainer}>
          <View
            style={{
              position: "relative",
              width: width * PREVIEW_SCALE,
              height: height * PREVIEW_SCALE,
            }}
          >
            <Image
              source={{ uri: url }}
              style={{ width: "100%", height: "100%", opacity }}
              resizeMode="contain"
            />
            {renderCornerHandles(type)}
          </View>
        </View>
        <View style={styles.sizeLabels}>
          <Text style={styles.sizeLabel}>Width: {width}mm</Text>
          <Text style={styles.sizeLabelMuted}>Height: {height}mm</Text>
        </View>
      </View>
    );
  };

  const renderOpacitySlider = (type: "header" | "footer") => {
    const isHeader = type === "header";
    const url = isHeader ? settings.headerLogoUrl : settings.footerLogoUrl;
    const opacity = isHeader
      ? settings.headerLogoOpacity ?? 1.0
      : settings.footerLogoOpacity ?? 1.0;
    const field = isHeader ? "headerLogoOpacity" : "footerLogoOpacity";

    if (!url) return null;

    return (
      <View style={styles.settingRow}>
        <View style={styles.sliderHeader}>
          <Text style={styles.settingLabel}>Opacity</Text>
          <Text style={styles.sliderValue}>
            {Math.round(opacity * 100)}%
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0.1}
          maximumValue={1}
          step={0.1}
          value={opacity}
          onSlidingComplete={(val: number) =>
            setSettings((prev) => ({
              ...prev,
              [field]: Math.round(val * 10) / 10,
            }))
          }
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.borderDark}
          thumbTintColor={COLORS.primary}
        />
      </View>
    );
  };

  const renderLogoSection = (
    type: "header" | "footer",
    label: string,
  ) => {
    const isHeader = type === "header";
    const url = isHeader ? settings.headerLogoUrl : settings.footerLogoUrl;
    const isUploading = isHeader ? isUploadingHeader : isUploadingFooter;

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>{label}</Text>

        {url ? (
          <View style={styles.logoPreviewRow}>
            <Image
              source={{ uri: url }}
              style={styles.logoThumbnail}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Pressable
                style={styles.changeBtn}
                onPress={() => pickAndUploadLogo(type)}
                disabled={isUploading}
              >
                <Text style={styles.changeBtnText}>
                  {isUploading ? "Uploading..." : "Change"}
                </Text>
              </Pressable>
              <Pressable
                style={styles.removeBtn}
                onPress={() => removeLogo(type)}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.uploadBtn}
            onPress={() => pickAndUploadLogo(type)}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload"
                  size={22}
                  color={COLORS.primary}
                />
                <Text style={styles.uploadBtnText}>Upload Logo</Text>
              </>
            )}
          </Pressable>
        )}

        {url && renderPositionSelector(type)}
        {renderResizableLogo(type)}
        {renderOpacitySlider(type)}
      </View>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.screenTitle}>PDF Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Logo */}
        {renderLogoSection("header", "Header Logo")}

        {/* Footer Logo */}
        {renderLogoSection("footer", "Footer Logo")}

        {/* Page Numbers */}
        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionCardTitle}>Page Numbers</Text>
              <Text style={styles.settingHint}>
                Show page numbers in the footer
              </Text>
            </View>
            <Switch
              value={settings.includePageNumbers}
              onValueChange={(val) =>
                setSettings((prev) => ({ ...prev, includePageNumbers: val }))
              }
              trackColor={{
                false: COLORS.borderDark,
                true: COLORS.primaryLight,
              }}
              thumbColor={
                settings.includePageNumbers ? COLORS.primary : COLORS.surface
              }
            />
          </View>
        </View>

        {/* Preview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Preview</Text>
          <View style={styles.previewContainer}>
            {/* Header */}
            <View
              style={[
                styles.previewHeader,
                settings.headerBackgroundColor
                  ? { backgroundColor: settings.headerBackgroundColor }
                  : undefined,
              ]}
            >
              {settings.headerLogoUrl ? (
                <View
                  style={{
                    width: "100%",
                    alignItems:
                      settings.headerLogoPosition === "center"
                        ? "center"
                        : settings.headerLogoPosition === "right"
                          ? "flex-end"
                          : "flex-start",
                    paddingHorizontal: 10,
                  }}
                >
                  <Image
                    source={{ uri: settings.headerLogoUrl }}
                    style={{
                      width:
                        (settings.headerLogoWidth || 50) * PREVIEW_SCALE,
                      height:
                        (settings.headerLogoHeight || 20) * PREVIEW_SCALE,
                      opacity: settings.headerLogoOpacity ?? 1,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
            </View>

            {/* Content */}
            <View style={styles.previewContent}>
              <Ionicons name="document" size={28} color={COLORS.borderDark} />
              <Text style={styles.previewContentText}>PDF Content</Text>
            </View>

            {/* Footer */}
            <View
              style={[
                styles.previewFooter,
                settings.footerBackgroundColor
                  ? { backgroundColor: settings.footerBackgroundColor }
                  : undefined,
              ]}
            >
              {settings.footerLogoUrl ? (
                <View
                  style={{
                    width: "100%",
                    alignItems:
                      settings.footerLogoPosition === "center"
                        ? "center"
                        : settings.footerLogoPosition === "right"
                          ? "flex-end"
                          : "flex-start",
                    paddingHorizontal: 10,
                  }}
                >
                  <Image
                    source={{ uri: settings.footerLogoUrl }}
                    style={{
                      width:
                        (settings.footerLogoWidth || 50) * PREVIEW_SCALE,
                      height:
                        (settings.footerLogoHeight || 20) * PREVIEW_SCALE,
                      opacity: settings.footerLogoOpacity ?? 1,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
              {settings.includePageNumbers && (
                <Text style={styles.previewPageNum}>Page 1 of 3</Text>
              )}
            </View>
          </View>
        </View>

        {/* Save / Cancel */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.saveBtn,
              (isSaving || isAnyUploading) && styles.btnDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving || isAnyUploading}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>
                {isAnyUploading ? "Uploading..." : "Save Settings"}
              </Text>
            )}
          </Pressable>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: spacing.base,
  },
  settingRow: {
    marginTop: spacing.base,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  // Upload button
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.borderDark,
    borderRadius: borderRadius.md,
    backgroundColor: COLORS.surfaceSecondary,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // Logo preview + buttons
  logoPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
  },
  logoThumbnail: {
    width: 80,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: COLORS.surfaceSecondary,
  },
  changeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primaryLighter,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    marginBottom: 6,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.error,
  },
  // Position selector
  positionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  positionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  positionBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.successLight,
  },
  positionBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  positionBtnTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  // Corner drag resize
  resizeContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.borderDark,
    marginTop: spacing.sm,
  },
  cornerHandle: {
    position: "absolute",
    width: 16,
    height: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 2,
    zIndex: 10,
  },
  sizeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  sizeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sizeLabelMuted: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  // Opacity slider
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  // Switch row
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Preview
  previewContainer: {
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },
  previewHeader: {
    minHeight: 40,
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: spacing.sm,
  },
  previewContent: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: spacing.lg,
  },
  previewContentText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: spacing.sm,
  },
  previewFooter: {
    minHeight: 36,
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingVertical: spacing.xs,
  },
  previewPageNum: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  // Action buttons
  actionButtons: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
