import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../../types/colors";
import { borderRadius } from "../../../theme";
import RichTextEditor from "../../../components/common/RichTextEditor";

interface PdfAttachmentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  onFocus?: () => void;
}

export default function PdfAttachmentEditor({
  value,
  onChange,
  placeholder = "Letter content for PDF attachment",
  minHeight = 300,
  onFocus,
}: PdfAttachmentEditorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>PDF Attachment Content</Text>
      <View style={styles.editorWrapper}>
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minHeight={minHeight}
          showZoomControls={false}
          onFocus={onFocus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  editorWrapper: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
});
