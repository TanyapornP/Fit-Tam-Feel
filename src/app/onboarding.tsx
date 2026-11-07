// ตั้งค่าครั้งแรก 4 ขั้น (ถามเฉพาะที่แอปใช้จริง) → บันทึกลงตาราง profile
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../components/Avatar";
import BatterySlider from "../components/BatterySlider";
import Icon from "../components/Icon";
import { Btn, Chips, Field } from "../components/ui";
import { DEFAULT_ANSWERS, MODE_CHIPS, birthYearCE, chipMode, fromProfile, modeChip, toProfilePatch, type Answers } from "../lib/answers";
import { uploadImage } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { useT } from "../lib/i18n";
import { tierOf } from "../lib/logic";
import { ui } from "../lib/styles";
import { COLORS, FONTS } from "../lib/theme";

const STEPS = 4;

export default function Onboarding() {
  const { t } = useT();
  const { userId, profile, saveProfile } = useAuth();
  const [step, setStep] = useState(0);
  // เคยตอบแล้ว (กด "ตั้งค่าเริ่มต้นใหม่" จากโปรไฟล์) → เติมคำตอบเดิมให้ · ผู้ใช้ใหม่ → ค่าเริ่มต้น
  const [a, setA] = useState<Answers>(() =>
    profile?.activity_level ? fromProfile(profile) : { ...DEFAULT_ANSWERS, nick: profile?.username ?? "" },
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set =
    <K extends keyof Answers>(k: K) =>
    (v: Answers[K]) =>
      setA((o) => ({ ...o, [k]: v }));

  const [photoBusy, setPhotoBusy] = useState(false);
  const yobFilled = a.yob.length === 4;
  const yobOk = birthYearCE(a.yob) != null;
  const canNext = step !== 0 || (a.nick.trim().length > 0 && yobOk);

  // เลือกรูปโปรไฟล์ (ไม่บังคับ) → อัปโหลดขึ้น Storage แล้วบันทึกทันที
  const pickPhoto = async () => {
    setErr("");
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return setErr(t("errPhotoPerm"));
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
      if (res.canceled || !res.assets[0] || !userId) return;
      setPhotoBusy(true);
      const url = await uploadImage("avatars", userId, res.assets[0].uri, res.assets[0].mimeType);
      await saveProfile({ avatar_url: url });
    } catch {
      setErr(t("errPhoto"));
    } finally {
      setPhotoBusy(false);
    }
  };

  // บันทึก (กด "ข้าม" ก็บันทึกค่าที่มีอยู่ เพื่อไม่ต้องตอบซ้ำ)
  const finish = async () => {
    setBusy(true);
    setErr("");
    try {
      await saveProfile({ ...toProfilePatch(a), onboarding_completed: true });
      // AuthGate จะพาไปหน้าหลักเองเมื่อ onboarding_completed = true
    } catch (e) {
      setErr(t("saveFail") + " (" + (e as Error).message + ")");
    } finally {
      setBusy(false);
    }
  };
  const next = () => (step === STEPS - 1 ? finish() : setStep(step + 1));

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={s.top}>
        {step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)}>
            <Text style={ui.back}>{t("back")}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
        <Text style={ui.rowHint}>{t("step", { a: step + 1, b: STEPS })}</Text>
        <Pressable onPress={finish}>
          <Text style={ui.back}>{t("skip")}</Text>
        </Pressable>
      </View>
      <View style={s.progressWrap}>
        <View style={[s.progressBar, { width: `${((step + 1) / STEPS) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Text style={ui.h1}>{t("s0h")}</Text>
            <Text style={ui.p}>{t("s0p")}</Text>
            <View style={s.photoWrap}>
              <View>
                <Avatar name={a.nick || profile?.username || null} uri={profile?.avatar_url} seed={userId ?? "me"} size={96} onPress={pickPhoto} />
                <Pressable onPress={pickPhoto} style={s.camBadge} disabled={photoBusy}>
                  <Icon name="camera" size={16} />
                </Pressable>
              </View>
              <Text style={[ui.rowHint, { marginTop: 8 }]}>{photoBusy ? t("uploading") : t("photoOpt")}</Text>
            </View>
            <Field label={t("nick")} value={a.nick} onChangeText={set("nick")} autoCapitalize="words" maxLength={30} />
            <Text style={ui.label}>{t("dobQ")}</Text>
            <TextInput
              style={s.yob}
              value={a.yob}
              onChangeText={(v) => set("yob")(v.replace(/\D/g, "").slice(0, 4))}
              placeholder={t("dobY")}
              placeholderTextColor="#C9B3BA"
              keyboardType="number-pad"
              maxLength={4}
            />
            {yobFilled && !yobOk && <Text style={ui.err}>{t("dobErr")}</Text>}
            <Text style={ui.label}>{t("actQ")}</Text>
            <Chips options={["act_new", "act_some", "act_reg"]} value={a.act} onChange={(v) => set("act")(v as string)} />
          </>
        )}
        {step === 1 && (
          <>
            <Text style={ui.h1}>{t("s2h")}</Text>
            <Text style={ui.p}>{t("s2p")}</Text>
            <Text style={ui.label}>{t("modePrefQ")}</Text>
            <Chips options={MODE_CHIPS} value={modeChip(a.mode)} onChange={(v) => set("mode")(chipMode(v as string))} />
            <Text style={[ui.hint, { textAlign: "left" }]}>{t("modePrefWhy")}</Text>
            <Text style={ui.label}>{t("batteryQ")}</Text>
            <Text style={ui.big}>{a.battery}%</Text>
            <BatterySlider value={a.battery} onChange={set("battery")} />
            <Text style={ui.mid}>{t("lv_" + tierOf(a.battery))}</Text>
            <Text style={ui.hint}>{t("batteryWhy")}</Text>
            <Text style={ui.label}>{t("lenQ")}</Text>
            <Chips options={["d5", "d10", "d15", "d20"]} value={a.durs} onChange={(v) => set("durs")(v as string[])} />
            <Text style={[ui.hint, { textAlign: "left" }]}>{t("lenWhy")}</Text>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={ui.h1}>{t("s4h")}</Text>
            <Text style={ui.p}>{t("s4p")}</Text>
            <Text style={ui.label}>{t("goalQ")}</Text>
            <Chips options={["g2", "g3", "g5", "g7"]} value={a.goal} onChange={(v) => set("goal")(v as string)} />
            <Text style={[ui.hint, { textAlign: "left" }]}>{t("goalWhy")}</Text>
          </>
        )}
        {step === 3 && (
          <>
            <Text style={ui.h1}>{t("s5h", { name: a.nick })}</Text>
            <Text style={ui.p}>{t("s5p")}</Text>
            <View style={ui.card}>
              {[
                [t("sumName"), a.nick],
                [t("sumYob"), a.yob],
                [t("sumAct"), t(a.act)],
                [t("sumMode"), t(modeChip(a.mode))],
                [t("sumBattery"), a.battery + "%"],
                [t("sumSessions"), a.durs.length ? a.durs.map((d) => t(d)).join(", ") : "—"],
                [t("sumGoal"), t("perWeek", { x: t(a.goal) })],
              ].map(([k, v]) => (
                <View key={k} style={ui.sumRow}>
                  <Text style={ui.sumK}>{k}</Text>
                  <Text style={ui.sumV}>{v}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        {!!err && <Text style={ui.err}>{err}</Text>}
      </ScrollView>

      <View style={s.bottom}>
        <Btn label={step === STEPS - 1 ? t("startFirst") : t("cont")} onPress={next} disabled={!canNext} busy={busy} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  photoWrap: { alignItems: "center", marginTop: 6, marginBottom: 14 },
  camBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  yob: {
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
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 22, paddingTop: 14, paddingBottom: 10 },
  progressWrap: { height: 6, backgroundColor: COLORS.pink, marginHorizontal: 22, borderRadius: 3 },
  progressBar: { height: 6, backgroundColor: COLORS.sage, borderRadius: 3 },
  bottom: { padding: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: "rgba(255,244,246,0.9)" },
});
