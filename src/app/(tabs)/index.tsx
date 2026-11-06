// หน้าหลัก: เลื่อนแบต → ได้คลิปที่ตรงพลังงาน → กด "ทำแล้ว" บันทึกลง user_did_it
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddClipForm from "../../components/AddClipForm";
import BatterySlider from "../../components/BatterySlider";
import Bell from "../../components/Bell";
import { ClipCard, ClipRow } from "../../components/ClipCard";
import { EmptyText, ErrorBox, LoadingView } from "../../components/ui";
import { useAuth } from "../../lib/AuthContext";
import { useData } from "../../lib/DataContext";
import { DAYS, useT } from "../../lib/i18n";
import { LEVELS, calcStreak, levelIdx, orderClips, tierOf, weekDone } from "../../lib/logic";
import { ui } from "../../lib/styles";
import { COLORS, FONTS } from "../../lib/theme";
import type { Clip } from "../../lib/types";

export default function Home() {
  const { t, lang } = useT();
  const { profile } = useAuth();
  const d = useData();
  const [adding, setAdding] = useState(false);
  const [lastSettled, setLastSettled] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState("");

  if (d.loading && !d.clips.length) return <LoadingView />;

  const nick = profile?.username || "";
  const tier = tierOf(d.battery);
  const li = levelIdx(tier);
  const days = new Set(d.logs.map((e) => e.day));
  const streak = calcStreak(days, d.today);
  const week = weekDone(days, d.today);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayLogs = d.logs.filter((e) => e.day === d.today);
  const todayIds = todayLogs.map((e) => e.clipId ?? "");
  const todayMin = todayLogs.reduce((a, e) => a + e.min, 0);
  const plays = (c: Clip) => d.stats[c.id]?.count ?? 0;

  // จัดลำดับคลิป: ระดับเดียวกัน + ระดับข้างเคียง (ไม่กระโดดจากแบต 10% ไป HIIT)
  const pool = d.clips.filter((c) => !c.mine && c.mode === d.mode);
  const prefMins = profile?.preferred_durations ?? [];
  const order = (key: string) =>
    orderClips(
      pool.filter((c) => c.energy === key),
      { today: d.today, stats: d.stats, prefMins, rot: d.rot[d.mode + ":" + key] ?? 0 },
    );
  const sameLevel = order(tier);
  const best = sameLevel[0];
  const easier = li > 0 ? order(LEVELS[li - 1].key) : [];
  const harder = li < LEVELS.length - 1 ? order(LEVELS[li + 1].key) : [];
  const mine = d.clips
    .filter((c) => c.mine)
    .sort((a, b) => Math.abs((a.pct ?? 50) - d.battery) - Math.abs((b.pct ?? 50) - d.battery));

  // ปล่อยนิ้วจากแถบแบต: ถ้ากลับมาระดับที่เคยเลือก ให้แสดงคลิปถัดไป
  const onSettle = () => {
    const k = d.mode + ":" + tier;
    if (lastSettled && lastSettled !== k) d.bumpRot(k);
    setLastSettled(k);
  };

  const run = async (fn: () => Promise<void>) => {
    try {
      setActionErr("");
      await fn();
    } catch (e) {
      setActionErr(t("saveFail") + " (" + (e as Error).message + ")");
    }
  };

  const share = () => {
    const titled = todayLogs.filter((e) => e.title !== "—");
    d.setDraft(
      titled.length > 1
        ? t("shareMany", { n: titled.length, m: todayMin })
        : t("shareText", { title: titled[0]?.title ?? "" }),
    );
    router.push("/community");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={ui.screen}>
        <View style={ui.topRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={ui.hi}>{t("hi", { name: nick })}</Text>
            <Text style={ui.p2}>{t("welcomeBack")}</Text>
          </View>
          <Bell />
        </View>

        {d.error && <ErrorBox message={d.error} onRetry={d.reload} />}

        {/* ความต่อเนื่อง + ปฏิทินสัปดาห์ */}
        <View style={s.streakCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 34 }}>🔥</Text>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={s.streakNum}>{t("streak", { n: streak })}</Text>
              <Text style={ui.p2}>{todayLogs.length ? t("doneToday") : t("moveToday")}</Text>
            </View>
          </View>
          <View style={s.dots}>
            {DAYS[lang].map((label, i) => (
              <View key={i} style={{ alignItems: "center" }}>
                <View style={[s.dot, week[i] && s.dotOn, i === todayIdx && s.dotToday]}>
                  {week[i] && <Text style={{ color: COLORS.white, fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={s.dotLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* แบตวันนี้ + โหมด */}
        <View style={ui.card}>
          <Text style={ui.sec}>{t("batteryToday")}</Text>
          <Text style={ui.big}>{d.battery}%</Text>
          <BatterySlider value={d.battery} onChange={d.setBattery} onRelease={onSettle} />
          <Text style={ui.mid}>{t("lv_" + tier)}</Text>
          <Text style={ui.hint}>{t((d.mode === "dance" ? "dhint_" : "hint_") + tier)}</Text>
          <View style={ui.divider} />
          <Text style={[ui.sec, { marginBottom: 8 }]}>{t("modeQ")}</Text>
          <View style={s.modeWrap}>
            {(["workout", "dance"] as const).map((m) => (
              <Pressable key={m} onPress={() => d.setMode(m)} style={[s.modeBtn, d.mode === m && s.modeOn]}>
                <Text style={[s.modeText, d.mode === m && { color: COLORS.white }]}>
                  {t(m === "workout" ? "modeWorkout" : "modeDance")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {!!actionErr && <Text style={ui.err}>{actionErr}</Text>}

        {/* สรุปวันนี้ (หายเองเมื่อขึ้นวันใหม่) */}
        {todayLogs.length > 0 && (
          <View style={s.doneCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={s.doneTitle}>✅ {t("doneSum", { n: todayLogs.length, m: todayMin })}</Text>
                <Text style={[ui.meta, { color: COLORS.sageDark }]}>{t("doneMore")}</Text>
              </View>
              <Pressable onPress={share} style={s.shareBtn}>
                <Text style={s.shareText}>{t("shareBtn")}</Text>
              </Pressable>
            </View>
            {todayLogs.map((e, i) => (
              <View key={e.id} style={s.doneRow}>
                <Text style={s.doneIdx}>{i + 1}</Text>
                <Text style={[ui.name, { flex: 1, fontSize: 13 }]} numberOfLines={1}>
                  {e.title}
                </Text>
                <Text style={ui.meta}>
                  🔋{e.battery}% · {t("min", { n: e.min })}
                </Text>
                <Pressable onPress={() => run(() => d.undoLog(e.id))} style={{ marginLeft: 8 }}>
                  <Text style={ui.link}>↩︎ {t("undo")}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* คลิปแนะนำ */}
        <View style={[ui.rowHead, { marginTop: 22 }]}>
          <Text style={ui.sec}>{t("picked")}</Text>
          {sameLevel.length > 1 && (
            <Pressable onPress={() => d.bumpRot(d.mode + ":" + tier)} style={ui.pill}>
              <Text style={ui.link}>{t("otherClip")}</Text>
            </Pressable>
          )}
        </View>
        {best ? (
          <ClipCard
            clip={best}
            best
            plays={plays(best)}
            doneToday={todayIds.includes(best.id)}
            onDone={() => run(() => d.logClip(best))}
          />
        ) : (
          <EmptyText text={t("noClipsLevel")} />
        )}
        <ClipRow title={t("sameLevel")} items={sameLevel.slice(1)} todayIds={todayIds} plays={plays} onDone={(c) => run(() => d.logClip(c))} />
        <ClipRow title={t("easier")} items={easier} todayIds={todayIds} plays={plays} onDone={(c) => run(() => d.logClip(c))} />
        <ClipRow title={t("harder")} items={harder} todayIds={todayIds} plays={plays} onDone={(c) => run(() => d.logClip(c))} />

        {/* คลิปของฉัน */}
        <View style={[ui.rowHead, { marginTop: 22, marginBottom: 4 }]}>
          <Text style={ui.sec}>{t("myClips")}</Text>
          {!adding && (
            <Pressable onPress={() => setAdding(true)} style={ui.pill}>
              <Text style={ui.link}>{t("addClip")}</Text>
            </Pressable>
          )}
        </View>
        {adding && <AddClipForm onDone={() => setAdding(false)} />}
        {!adding && mine.length === 0 && <EmptyText text={t("noClips")} />}
        <ClipRow
          items={mine}
          todayIds={todayIds}
          plays={plays}
          matchKey={tier}
          onDone={(c) => run(() => d.logClip(c))}
          onRemove={(c) => run(() => d.removeClip(c.id))}
        />
        <Text style={ui.foot}>{t("foot")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  streakCard: {
    backgroundColor: "rgba(255,229,236,0.82)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.pinkDeep,
  },
  streakNum: { fontFamily: FONTS.head, fontSize: 22, color: COLORS.sageDark },
  dots: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  dotOn: { backgroundColor: COLORS.sage, borderColor: COLORS.sage },
  dotToday: { borderColor: COLORS.sageDark, borderWidth: 2 },
  dotLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.sub, marginTop: 4 },
  modeWrap: { flexDirection: "row", backgroundColor: COLORS.pink, borderRadius: 999, padding: 4, borderWidth: 1, borderColor: COLORS.line },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  modeOn: { backgroundColor: COLORS.sage },
  modeText: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 14 },
  doneCard: {
    backgroundColor: "rgba(237,244,237,0.95)",
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.sage,
  },
  doneTitle: { fontFamily: FONTS.head, fontSize: 14, color: COLORS.text },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(129,166,132,0.25)",
  },
  doneIdx: { fontFamily: FONTS.head, fontSize: 13, color: COLORS.sage, width: 20 },
  shareBtn: { backgroundColor: COLORS.sage, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
  shareText: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 12 },
});
