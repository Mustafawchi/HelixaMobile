import { COLORS } from "../../types/colors";
import { spacing } from "../../theme";

export const styles: { [key: string]: React.CSSProperties } = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  footer: {
    //paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
  },
  errorDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: "center" as const,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
};
