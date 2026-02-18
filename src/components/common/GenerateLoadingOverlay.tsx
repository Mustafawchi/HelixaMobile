import React from "react";
import LoadingOverlay from "./LoadingOverlay";

interface GenerateLoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export default function GenerateLoadingOverlay(props: GenerateLoadingOverlayProps) {
  return <LoadingOverlay {...props} />;
}
