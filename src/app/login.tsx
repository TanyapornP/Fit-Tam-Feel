// หน้า Lock in: สมัครสมาชิก / เข้าสู่ระบบด้วย Supabase Auth (อีเมล หรือ Google)
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Btn, Field, LangToggle } from "../components/ui";
import { useT } from "../lib/i18n";
import { ui } from "../lib/styles";
import { supabase } from "../lib/supabase";
import { COLORS, FONTS } from "../lib/theme";

export default function Login() {
  const { t } = useT();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [gBusy, setGBusy] = useState(false);

  const submit = async () => {
    const mail = email.trim().toLowerCase();
    setErr("");
    setInfo("");
    if (mode === "signup" && (!name.trim() || !mail.includes("@") || pw.length < 6)) return setErr(t("errSignup"));
    if (mode === "login" && (!mail.includes("@") || !pw)) return setErr(t("errLogin"));
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password: pw,
          options: { data: { name: name.trim() } }, // trigger ในฐานข้อมูลใช้ชื่อนี้สร้าง profile
        });
        if (error) return setErr(/registered|exists/i.test(error.message) ? t("errExists") : error.message);
        // ถ้าเปิด "Confirm email" ไว้ใน Supabase จะยังไม่มี session จนกว่าจะกดลิงก์ในอีเมล
        if (!data.session) {
          setInfo(t("checkEmail"));
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password: pw });
        if (error) setErr(/invalid/i.test(error.message) ? t("errLogin") : error.message);
      }
      // สำเร็จ → AuthGate ใน _layout.tsx พาไปหน้าถัดไปเอง
    } finally {
      setBusy(false);
    }
  };

  // เข้าสู่ระบบด้วย Google (ต้องเปิด Google provider ใน Supabase ก่อน)
  const google = async () => {
    setErr("");
    setInfo("");
    setGBusy(true);
    try {
      const redirectTo = Linking.createURL("/"); // เว็บ = http://localhost:8081/ · มือถือ = fittamfeel:// หรือ exp://
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: Platform.OS !== "web" },
      });
      if (error) return setErr(error.message);
      if (Platform.OS === "web") return; // เว็บ: เบราว์เซอร์ไปหน้า Google แล้วกลับมาเอง

      // มือถือ: เปิดหน้า Google ในแอป แล้วแลก code ที่ได้กลับมาเป็น session
      if (!data.url) return setErr(t("errGoogle"));
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type !== "success") return; // ผู้ใช้กดปิดเอง
      const code = new URL(res.url).searchParams.get("code");
      if (!code) return setErr(t("errGoogle"));
      const { error: e2 } = await supabase.auth.exchangeCodeForSession(code);
      if (e2) setErr(e2.message);
    } catch {
      setErr(t("errGoogle"));
    } finally {
      setGBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
          <View style={{ alignSelf: "flex-end" }}>
            <LangToggle />
          </View>
          <Image source={require("../../assets/images/logo-mark.png")} style={s.mark} accessibilityLabel="Fit-Tam-Feel" />
          <Text style={s.logo}>
            Fit<Text style={{ color: COLORS.rose }}>-</Text>Tam<Text style={{ color: COLORS.rose }}>-</Text>Feel
          </Text>
          <Text style={s.tag}>{t("appTag")}</Text>
          <Text style={s.sub}>{t("lockSub")}</Text>

          <View style={[ui.card, { maxWidth: 420 }]}>
            <View style={s.tabs}>
              {(["login", "signup"] as const).map((k) => (
                <Pressable
                  key={k}
                  onPress={() => {
                    setMode(k);
                    setErr("");
                  }}
                  style={[s.tab, mode === k && s.tabOn]}
                >
                  <Text style={[s.tabText, mode === k && { color: COLORS.white }]}>{t(k)}</Text>
                </Pressable>
              ))}
            </View>
            {mode === "signup" && (
              <Field label={t("yourName")} value={name} onChangeText={setName} placeholder={t("namePh")} autoCapitalize="words" />
            )}
            <Field label={t("email")} value={email} onChangeText={setEmail} placeholder={t("emailPh")} keyboardType="email-address" />
            <Field label={t("password")} value={pw} onChangeText={setPw} placeholder="••••••" secureTextEntry />
            {!!err && <Text style={ui.err}>{err}</Text>}
            {!!info && <Text style={s.info}>{info}</Text>}
            <Btn label={mode === "signup" ? t("create") : t("lockIn")} onPress={submit} busy={busy} />
            <View style={s.orRow}>
              <View style={s.orLine} />
              <Text style={s.orText}>{t("orWith")}</Text>
              <View style={s.orLine} />
            </View>
            <Pressable
              onPress={google}
              disabled={gBusy || busy}
              style={({ pressed }) => [s.gBtn, (gBusy || busy) && { opacity: 0.5 }, pressed && { opacity: 0.8 }]}
            >
              {gBusy ? (
                <ActivityIndicator color={COLORS.sageDark} />
              ) : (
                <>
                  <Text style={s.gLogo}>G</Text>
                  <Text style={s.gText}>{t("google")}</Text>
                </>
              )}
            </Pressable>
          </View>
          <Text style={ui.foot}>{t("madeWith")}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 24, alignItems: "center", flexGrow: 1 },
  mark: { width: 76, height: 76, borderRadius: 20, marginTop: 12, marginBottom: 6 },
  logo: { fontFamily: FONTS.headBold, fontSize: 34, letterSpacing: -0.5, color: "#2E4A3A", marginTop: 6 },
  tag: { fontFamily: FONTS.body, letterSpacing: 1.5, fontSize: 11, color: COLORS.sage, marginTop: 2, textAlign: "center" },
  sub: { fontFamily: FONTS.body, textAlign: "center", color: COLORS.sub, fontSize: 14, lineHeight: 22, marginVertical: 18, maxWidth: 300 },
  tabs: { flexDirection: "row", backgroundColor: COLORS.pink, borderRadius: 16, padding: 4, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabOn: { backgroundColor: COLORS.sage },
  tabText: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 14 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: COLORS.line },
  orText: { fontFamily: FONTS.body, color: COLORS.sub, fontSize: 12 },
  gBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
  },
  gLogo: { fontFamily: FONTS.headBold, fontSize: 18, color: "#4285F4" },
  gText: { fontFamily: FONTS.bodyBold, color: COLORS.text, fontSize: 15 },
  info: { fontFamily: FONTS.body, color: COLORS.sageDark, fontSize: 13, marginVertical: 8, lineHeight: 19 },
});
