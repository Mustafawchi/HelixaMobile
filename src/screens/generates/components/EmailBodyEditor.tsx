import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../../types/colors";
import { borderRadius } from "../../../theme";
import RichTextEditor from "../../../components/common/RichTextEditor";

interface EmailBodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  onFocus?: () => void;
}

export default function EmailBodyEditor({
  value,
  onChange,
  placeholder = "Email content",
  minHeight = 180,
  onFocus,
}: EmailBodyEditorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email Body</Text>
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
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  editorWrapper: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
});
