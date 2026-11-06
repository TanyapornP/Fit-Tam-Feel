// สไตล์ที่ใช้ซ้ำหลายหน้าจอ
import { StyleSheet } from "react-native";

import { COLORS, FONTS } from "./theme";

export const ui = StyleSheet.create({
  screen: { padding: 20, paddingBottom: 40 },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  sec: { fontFamily: FONTS.bodyBold, fontSize: 11, letterSpacing: 1.5, color: COLORS.sageDark },
  secGap: { marginTop: 22, marginBottom: 10 },
  hi: { fontFamily: FONTS.head, fontSize: 26, color: COLORS.text },
  h1: { fontFamily: FONTS.head, fontSize: 24, color: COLORS.text, marginTop: 14, marginBottom: 6 },
  p: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.sub, lineHeight: 22, marginBottom: 14 },
  p2: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.sub, marginTop: 2, lineHeight: 19 },
  label: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.sageDark, marginBottom: 8, marginTop: 6 },
  err: { fontFamily: FONTS.body, color: COLORS.rose, fontSize: 13, marginVertical: 8, lineHeight: 18 },
  big: { fontFamily: FONTS.head, fontSize: 44, color: COLORS.sageDark, textAlign: "center" },
  mid: { fontFamily: FONTS.body, textAlign: "center", color: COLORS.sub, fontSize: 14, marginTop: 10 },
  hint: { fontFamily: FONTS.body, textAlign: "center", color: COLORS.sageDark, fontSize: 12, marginTop: 4, lineHeight: 18 },
  link: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 12 },
  pill: { backgroundColor: COLORS.pink, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  rowHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  rowHint: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.sub },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  back: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 13 },
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: 16 },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.pink,
  },
  sumK: { fontFamily: FONTS.body, color: COLORS.sub, fontSize: 13, maxWidth: "45%" },
  sumV: { fontFamily: FONTS.body, color: COLORS.text, fontSize: 13, maxWidth: "55%", textAlign: "right" },
  name: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.sub, marginTop: 1 },
  statNum: { fontFamily: FONTS.head, fontSize: 22, color: COLORS.sageDark, marginTop: 4 },
  statLabel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.sub, marginTop: 2 },
  foot: { fontFamily: FONTS.body, color: COLORS.sub, fontSize: 13, marginTop: 24, textAlign: "center" },
});
