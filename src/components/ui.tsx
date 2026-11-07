// ชิ้นส่วนเล็ก ๆ ที่ใช้ซ้ำ: ปุ่ม, ช่องกรอก, ปุ่มตัวเลือก, หน้าโหลด/ผิดพลาด, สลับภาษา
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useT } from "../lib/i18n";
import { ui } from "../lib/styles";
import { COLORS, FONTS } from "../lib/theme";

export function Btn({ label, onPress, disabled, busy }: { label: string; onPress: () => void; disabled?: boolean; busy?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [s.btn, (disabled || busy) && { opacity: 0.45 }, pressed && { opacity: 0.85 }]}
    >
      {busy ? <ActivityIndicator color={COLORS.white} /> : <Text style={s.btnText}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={ui.label}>{label}</Text>
      <TextInput placeholderTextColor="#C9B3BA" style={s.input} autoCapitalize="none" {...props} />
    </View>
  );
}

/** ช่องรหัสผ่าน + ปุ่ม "แสดง/ซ่อน" ให้ตรวจว่าพิมพ์ถูกไหม */
export function PasswordField({ label, ...props }: { label: string } & TextInputProps) {
  const { t } = useT();
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={ui.label}>{label}</Text>
      <View style={s.pwRow}>
        <TextInput
          placeholderTextColor="#C9B3BA"
          style={[s.input, { flex: 1, borderWidth: 0, backgroundColor: "transparent" }]}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
          secureTextEntry={!show}
        />
        <Pressable onPress={() => setShow(!show)} hitSlop={10} style={s.pwToggle} accessibilityRole="button" accessibilityLabel={t(show ? "hidePw" : "showPw")}>
          <Text style={s.pwToggleText}>{t(show ? "hidePw" : "showPw")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** ปุ่มตัวเลือกแบบชิป — multi = เลือกได้หลายอัน */
export function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  const { t } = useT();
  const multi = Array.isArray(value);
  const isOn = (o: string) => (multi ? value.includes(o) : value === o);
  const toggle = (o: string) => {
    if (!multi) return onChange(o);
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  };
  return (
    <View style={s.chipRow}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => toggle(o)} style={[s.chip, isOn(o) && s.chipOn]}>
          <Text style={[s.chipText, isOn(o) && { color: COLORS.white }]}>{t(o)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** สถานะ "กำลังโหลด" */
export function LoadingView({ text }: { text?: string }) {
  const { t } = useT();
  return (
    <View style={s.center}>
      <ActivityIndicator color={COLORS.sage} size="large" />
      <Text style={[ui.p2, { marginTop: 10 }]}>{text ?? t("loading")}</Text>
    </View>
  );
}

/** สถานะ "ผิดพลาด" + ปุ่มลองใหม่ */
export function ErrorBox({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  const { t } = useT();
  return (
    <View style={s.errBox}>
      <Text style={s.errTitle}>{t("loadFail")}</Text>
      {!!message && <Text style={ui.p2}>{message}</Text>}
      {onRetry && (
        <Pressable onPress={onRetry} style={[ui.pill, { alignSelf: "flex-start", marginTop: 10 }]}>
          <Text style={ui.link}>{t("retry")}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** สถานะ "ว่าง" */
export function EmptyText({ text }: { text: string }) {
  return <Text style={[ui.p2, { textAlign: "center", marginVertical: 12, lineHeight: 20 }]}>{text}</Text>;
}

export function LangToggle() {
  const { lang, setLang } = useT();
  return (
    <View style={s.langWrap}>
      {(["th", "en"] as const).map((l) => (
        <Pressable key={l} onPress={() => setLang(l)} style={[s.langBtn, lang === l && s.langOn]}>
          <Text style={[s.langText, lang === l && { color: COLORS.white }]}>{l === "en" ? "EN" : "ไทย"}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: 999,
    minHeight: 48,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.sage,
  },
  btnText: { color: COLORS.white, fontSize: 15, fontFamily: FONTS.bodyBold },
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: FONTS.body,
  },
  pwRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingRight: 14,
  },
  pwToggle: { paddingLeft: 8 },
  pwToggleText: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.sageDark },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 999,
    backgroundColor: COLORS.pink,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.pinkDeep,
  },
  chipOn: { backgroundColor: COLORS.sage, borderColor: COLORS.sage },
  chipText: { fontFamily: FONTS.body, color: COLORS.sageDark, fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  errBox: {
    backgroundColor: COLORS.roseBg,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.pinkDeep,
    marginVertical: 10,
  },
  errTitle: { fontFamily: FONTS.bodyBold, color: COLORS.rose, fontSize: 14 },
  langWrap: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignSelf: "flex-start",
  },
  langBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999 },
  langOn: { backgroundColor: COLORS.sage },
  langText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.sageDark },
});
