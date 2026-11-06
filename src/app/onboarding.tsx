// ตั้งค่าครั้งแรก 6 ขั้น → บันทึกลงตาราง profile
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BatterySlider from "../components/BatterySlider";
import { Btn, Chips, Field } from "../components/ui";
import { DEFAULT_ANSWERS, birthYearCE, toProfilePatch, type Answers } from "../lib/answers";
import { useAuth } from "../lib/AuthContext";
import { useT } from "../lib/i18n";
import { tierOf } from "../lib/logic";
import { ui } from "../lib/styles";
import { COLORS, FONTS } from "../lib/theme";

const STEPS = 6;

export default function Onboarding() {
  const { t } = useT();
  const { profile, saveProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({ ...DEFAULT_ANSWERS, nick: profile?.username ?? "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set =
    <K extends keyof Answers>(k: K) =>
    (v: Answers[K]) =>
      setA((o) => ({ ...o, [k]: v }));

  const dobFilled = a.yob.length === 4;
  const dobOk = dobFilled && birthYearCE(a.yob) != null;
  const canNext = step !== 0 || (a.nick.trim().length > 0 && dobOk);
  const list = (arr: string[]) => (arr.length ? arr.map((k) => t(k)).join(", ") : "—");

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
            <Field label={t("nick")} value={a.nick} onChangeText={set("nick")} autoCapitalize="words" />
            <Text style={ui.label}>{t("dobQ")}</Text>
            <TextInput
              style={s.dob}
              value={a.yob}
              onChangeText={(v) => set("yob")(v.replace(/\D/g, "").slice(0, 4))}
              placeholder={t("dobY")}
              placeholderTextColor="#C9B3BA"
              keyboardType="number-pad"
              maxLength={4}
            />
            {dobFilled && !dobOk && <Text style={ui.err}>{t("dobErr")}</Text>}
            <Text style={ui.label}>{t("actQ")}</Text>
            <Chips options={["act_new", "act_some", "act_reg"]} value={a.act} onChange={(v) => set("act")(v as string)} />
          </>
        )}
        {step === 1 && (
          <>
            <Text style={ui.h1}>{t("s1h")}</Text>
            <Text style={ui.p}>{t("s1p")}</Text>
            <Text style={ui.label}>{t("dayQ")}</Text>
            <Chips options={["day_work", "day_home", "day_mix", "day_shift"]} value={a.day} onChange={(v) => set("day")(v as string)} />
            <Text style={ui.label}>{t("outQ")}</Text>
            <Chips options={["out_4", "out_8", "out_12", "out_12p"]} value={a.out} onChange={(v) => set("out")(v as string)} />
            <Text style={ui.label}>{t("freeQ")}</Text>
            <Chips options={["fr_morning", "fr_afternoon", "fr_evening", "fr_night"]} value={a.free} onChange={(v) => set("free")(v as string)} />
          </>
        )}
        {step === 2 && (
          <>
            <Text style={ui.h1}>{t("s2h")}</Text>
            <Text style={ui.p}>{t("s2p")}</Text>
            <Text style={ui.label}>{t("drainedQ")}</Text>
            <Chips
              options={["dr_morning", "dr_midday", "dr_after", "dr_evening", "dr_busy"]}
              value={a.drained}
              onChange={(v) => set("drained")(v as string[])}
            />
            <Text style={ui.label}>{t("batteryQ")}</Text>
            <Text style={ui.big}>{a.battery}%</Text>
            <BatterySlider value={a.battery} onChange={set("battery")} />
            <Text style={[ui.mid, { marginBottom: 6 }]}>{t("lv_" + tierOf(a.battery))}</Text>
            <Text style={ui.label}>{t("sleepQ")}</Text>
            <Chips options={["sl_u5", "sl_56", "sl_67", "sl_78", "sl_8p"]} value={a.sleep} onChange={(v) => set("sleep")(v as string)} />
          </>
        )}
        {step === 3 && (
          <>
            <Text style={ui.h1}>{t("s3h")}</Text>
            <Text style={ui.p}>{t("s3p")}</Text>
            <Text style={ui.label}>{t("typesQ")}</Text>
            <Chips options={["c_stretch", "c_yoga", "c_dance", "c_cardio", "c_strength"]} value={a.cats} onChange={(v) => set("cats")(v as string[])} />
            <Text style={ui.label}>{t("lenQ")}</Text>
            <Chips options={["d5", "d10", "d15", "d20"]} value={a.durs} onChange={(v) => set("durs")(v as string[])} />
            <Text style={ui.label}>{t("whereQ")}</Text>
            <Chips options={["w_bed", "w_room", "w_living", "w_out"]} value={a.where} onChange={(v) => set("where")(v as string)} />
            <Text style={ui.label}>{t("limitQ")}</Text>
            <Chips options={["l_none", "l_knee", "l_back", "l_wrist", "l_neck"]} value={a.limits} onChange={(v) => set("limits")(v as string[])} />
          </>
        )}
        {step === 4 && (
          <>
            <Text style={ui.h1}>{t("s4h")}</Text>
            <Text style={ui.p}>{t("s4p")}</Text>
            <Text style={ui.label}>{t("goalQ")}</Text>
            <Chips options={["g2", "g3", "g5", "g7"]} value={a.goal} onChange={(v) => set("goal")(v as string)} />
            <Text style={ui.label}>{t("remindQ")}</Text>
            <Chips options={["r5", "r7", "r9", "r0"]} value={a.remind} onChange={(v) => set("remind")(v as string)} />
            <Text style={ui.label}>{t("whyQ")}</Text>
            <Chips options={["y_feel", "y_sleep", "y_cons", "y_stress"]} value={a.why} onChange={(v) => set("why")(v as string[])} />
            <View style={s.switchRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={ui.name}>{t("selfieT")}</Text>
                <Text style={ui.p2}>{t("selfieS")}</Text>
              </View>
              <Switch value={a.selfie} onValueChange={set("selfie")} trackColor={{ true: COLORS.sage, false: COLORS.line }} />
            </View>
          </>
        )}
        {step === 5 && (
          <>
            <Text style={ui.h1}>{t("s5h", { name: a.nick })}</Text>
            <Text style={ui.p}>{t("s5p")}</Text>
            <View style={ui.card}>
              {[
                [t("sumRoutine"), t(a.day) + " · " + t(a.out)],
                [t("sumFree"), t(a.free)],
                [t("sumBattery"), a.battery + "%"],
                [t("sumLikes"), list(a.cats)],
                [t("sumSessions"), list(a.durs)],
                [t("sumGoal"), t("perWeek", { x: t(a.goal) })],
                [t("sumRemind"), t(a.remind)],
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
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 22, paddingTop: 14, paddingBottom: 10 },
  progressWrap: { height: 6, backgroundColor: COLORS.pink, marginHorizontal: 22, borderRadius: 3 },
  progressBar: { height: 6, backgroundColor: COLORS.sage, borderRadius: 3 },
  dob: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
    fontFamily: FONTS.body,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  bottom: { padding: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: "rgba(255,244,246,0.9)" },
});
