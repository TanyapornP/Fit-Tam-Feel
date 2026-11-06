// หน้าโปรไฟล์: รูป · สถิติ · เป้าหมายสัปดาห์ · พลังงาน · คลิปที่เล่นบ่อย · ประวัติ · ความชอบ · ตั้งค่า
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../../components/Avatar";
import Icon, { type IconName } from "../../components/Icon";
import { Chips, ErrorBox, Field, LangToggle, LoadingView } from "../../components/ui";
import { MODE_CHIPS, chipMode, fromProfile, modeChip, toProfilePatch, type Answers } from "../../lib/answers";
import { uploadImage } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { useData } from "../../lib/DataContext";
import { useT } from "../../lib/i18n";
import { calcStreak, daysBetween, longestStreak, tierOf, toDate, weekDone } from "../../lib/logic";
import { ui } from "../../lib/styles";
import { supabase } from "../../lib/supabase";
import { COLORS, FONTS } from "../../lib/theme";

function Stat({ n, l, onPress }: { n: number | string; l: string; onPress?: () => void }) {
  const body = (
    <View style={{ alignItems: "center", marginHorizontal: 14 }}>
      <Text style={ui.statNum}>{n}</Text>
      <Text style={ui.statLabel}>{l}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export default function ProfileScreen() {
  const { t } = useT();
  const { profile, userId, email, saveProfile, signOut, error: authErr, reloadProfile } = useAuth();
  const { logs, stats, today } = useData();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Answers | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState({ posts: 0, followers: 0, following: 0 });

  // จำนวนโพสต์ / ผู้ติดตาม / กำลังติดตาม (นับในฐานข้อมูล ไม่ต้องดึงข้อมูลทั้งหมด)
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      const count = (table: "posts" | "follows", col: string) =>
        supabase.from(table).select("*", { count: "exact", head: true }).eq(col, userId).then((r) => r.count ?? 0);
      Promise.all([count("posts", "user_id"), count("follows", "following_id"), count("follows", "follower_id")])
        .then(([posts, followers, following]) => setCounts({ posts, followers, following }))
        .catch(() => {});
    }, [userId]),
  );

  if (!profile) return authErr ? <ErrorBox message={authErr} onRetry={reloadProfile} /> : <LoadingView />;

  const a = draft ?? fromProfile(profile);
  const set =
    <K extends keyof Answers>(k: K) =>
    (v: Answers[K]) =>
      setDraft({ ...a, [k]: v });

  const save = async () => {
    setBusy(true);
    setMsg("");
    try {
      await saveProfile(toProfilePatch(a));
      setEditing(false);
      setDraft(null);
    } catch (e) {
      setMsg(t("saveFail") + " (" + (e as Error).message + ")");
    } finally {
      setBusy(false);
    }
  };

  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return setMsg(t("errPhotoPerm"));
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
      if (res.canceled || !res.assets[0] || !userId) return;
      setBusy(true);
      const url = await uploadImage("avatars", userId, res.assets[0].uri, res.assets[0].mimeType);
      await saveProfile({ avatar_url: url });
      setMsg("");
    } catch {
      setMsg(t("errPhoto"));
    } finally {
      setBusy(false);
    }
  };

  // ตัวเลขจากประวัติ
  const days = new Set(logs.map((e) => e.day));
  const totalMin = logs.reduce((s, e) => s + e.min, 0);
  const goalN = profile.workout_days_per_week ?? 3;
  const weekN = weekDone(days, today).filter(Boolean).length;
  const recent = logs.slice(0, 7);
  const avg = recent.length ? Math.round(recent.reduce((s, e) => s + e.battery, 0) / recent.length) : null;
  const dateLabel = (k: string) => {
    const diff = daysBetween(today, k);
    if (diff === 0) return t("today");
    if (diff === 1) return t("yesterday");
    const d = toDate(k);
    return d.getDate() + "/" + (d.getMonth() + 1);
  };
  // ครั้งที่เท่าไหร่ของคลิปนั้น (นับจากเก่าไปใหม่)
  const nth: Record<string, number> = {};
  const seen: Record<string, number> = {};
  [...logs].reverse().forEach((e) => {
    if (!e.clipId) return;
    seen[e.clipId] = (seen[e.clipId] ?? 0) + 1;
    nth[e.id] = seen[e.clipId];
  });
  const top = Object.entries(stats)
    .map(([id, st]) => ({ id, ...st, entry: logs.find((e) => e.clipId === id) }))
    .sort((x, y) => y.count - x.count || x.last - y.last)
    .slice(0, 5);
  const list = (arr: string[]) => (arr.length ? arr.map((k) => t(k)).join(", ") : "—");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={ui.screen} keyboardShouldPersistTaps="handled">
        {/* หัวโปรไฟล์ */}
        <View style={[ui.card, { alignItems: "center" }]}>
          <Pressable onPress={() => (editing ? save() : setEditing(true))} style={[ui.pill, s.editBtn]}>
            <Text style={ui.link}>{editing ? t("doneEdit") : t("edit")}</Text>
          </Pressable>
          <View style={{ marginBottom: 10 }}>
            <Avatar name={profile.username} uri={profile.avatar_url} seed={profile.id} size={84} onPress={pickPhoto} />
            <Pressable onPress={pickPhoto} style={s.camBadge}>
              <Icon name="camera" size={15} />
            </Pressable>
          </View>
          <Text style={[ui.rowHint, { marginBottom: 6 }]}>{t("changePhoto")}</Text>
          {editing ? (
            <View style={{ width: "100%" }}>
              <Field label={t("nick")} value={a.nick} onChangeText={set("nick")} autoCapitalize="words" />
              <Field
                label={t("bio")}
                value={a.bio}
                onChangeText={(v) => set("bio")(v.slice(0, 150))}
                placeholder={t("bioPh")}
                autoCapitalize="sentences"
              />
              {!!profile.avatar_url && (
                <Pressable onPress={() => saveProfile({ avatar_url: null })} style={{ alignSelf: "center", marginBottom: 8 }}>
                  <Text style={ui.link}>{t("removePhoto")}</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <>
              <Text style={s.name}>{profile.username}</Text>
              {!!profile.bio && <Text style={s.bio}>{profile.bio}</Text>}
            </>
          )}
          <Text style={ui.meta}>{email}</Text>
          {!!profile.activity_level && (
            <View style={s.levelChip}>
              <Text style={s.levelChipText}>{t(profile.activity_level)}</Text>
            </View>
          )}
          <View style={s.followRow}>
            <Stat n={counts.posts} l={t("postsCount")} />
            <Stat n={counts.followers} l={t("followers")} onPress={() => userId && router.push({ pathname: "/people/[id]", params: { id: userId, which: "followers" } })} />
            <Stat n={counts.following} l={t("followingCount")} onPress={() => userId && router.push({ pathname: "/people/[id]", params: { id: userId, which: "following" } })} />
          </View>
          <Pressable onPress={() => router.push({ pathname: "/community", params: { feed: "mine" } })} style={[s.myPosts]}>
            <Text style={s.myPostsText}>{t("myPostsBtn", { n: counts.posts })}</Text>
          </Pressable>
          {!!msg && <Text style={ui.err}>{msg}</Text>}
        </View>

        {/* สถิติ */}
        <Text style={[ui.sec, ui.secGap]}>{t("myStats")}</Text>
        <View style={s.statGrid}>
          {[
            ["flame", t("nDays", { n: calcStreak(days, today) }), t("stCur")],
            ["trophy", t("nDays", { n: longestStreak(days) }), t("stBest")],
            ["done", t("nTimes", { n: logs.length }), t("stTotal")],
            ["timer", t("nMin", { n: totalMin }), t("stMin")],
          ].map(([icon, v, l]) => (
            <View key={l} style={s.statBox}>
              <Icon name={icon as IconName} size={20} color={COLORS.rose} />
              <Text style={ui.statNum}>{v}</Text>
              <Text style={ui.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* เป้าหมายสัปดาห์ */}
        <Text style={[ui.sec, ui.secGap]}>{t("weekGoal")}</Text>
        <View style={ui.card}>
          <Text style={s.cardTitle}>{t("weekOf", { a: weekN, b: goalN })}</Text>
          <View style={s.goalTrack}>
            <View style={[s.goalFill, { width: `${Math.min(weekN / goalN, 1) * 100}%` }]} />
          </View>
          <Text style={[ui.p2, { marginTop: 8 }]}>{weekN >= goalN ? t("weekHit") : t("weekLeft", { n: goalN - weekN })}</Text>
        </View>

        {/* พลังงานช่วงนี้ */}
        <Text style={[ui.sec, ui.secGap]}>{t("energyTrend")}</Text>
        <View style={ui.card}>
          {avg == null ? (
            <Text style={ui.p2}>{t("noData")}</Text>
          ) : (
            <>
              <Text style={ui.statLabel}>{t("avgBattery")}</Text>
              <Text style={ui.statNum}>
                {avg}% · {t("tier_" + tierOf(avg))}
              </Text>
              <View style={s.barRow}>
                {[...recent].reverse().map((e) => (
                  <View key={e.id} style={{ flex: 1, alignItems: "center" }}>
                    <View style={[s.bar, { height: 4 + (e.battery / 100) * 56 }, tierOf(e.battery) === tierOf(avg) && { backgroundColor: COLORS.sage }]} />
                    <Text style={s.barLabel}>{dateLabel(e.day)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* คลิปที่เล่นบ่อย */}
        {top.length > 0 && (
          <>
            <Text style={[ui.sec, ui.secGap]}>{t("topClips")}</Text>
            <View style={ui.card}>
              {top.map((x, i) => (
                <View key={x.id} style={[s.histRow, i === top.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={s.rank}>{i + 1}</Text>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={s.histTitle} numberOfLines={1}>
                      {x.entry?.title ?? "—"}
                    </Text>
                    <Text style={ui.meta}>{t("lastPlayed", { d: x.entry ? dateLabel(x.entry.day) : "—" })}</Text>
                  </View>
                  <View style={s.countPill}>
                    <Text style={s.countText}>{t("timesN", { n: x.count })}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ประวัติ */}
        <Text style={[ui.sec, ui.secGap]}>{t("history")}</Text>
        <View style={ui.card}>
          {logs.length === 0 ? (
            <Text style={ui.p2}>{t("noHistory")}</Text>
          ) : (
            logs.slice(0, 15).map((e) => (
              <View key={e.id} style={s.histRow}>
                <Text style={s.histDate}>{dateLabel(e.day)}</Text>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={s.histTitle} numberOfLines={1}>
                    {e.title}
                  </Text>
                  {!!e.clipId && !!nth[e.id] && (
                    <Text style={s.plays}>
                      {t("nthTime", { n: nth[e.id] })} · {t("playedN", { n: stats[e.clipId]?.count ?? 1 })}
                    </Text>
                  )}
                </View>
                <Text style={ui.meta}>
                  {t("attachBattery", { n: e.battery })} · {t("min", { n: e.min })}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ความชอบ */}
        <Text style={[ui.sec, ui.secGap]}>{t("prefs")}</Text>
        <View style={ui.card}>
          {editing ? (
            <>
              <Text style={ui.label}>{t("actQ")}</Text>
              <Chips options={["act_new", "act_some", "act_reg"]} value={a.act} onChange={(v) => set("act")(v as string)} />
              <Text style={ui.label}>{t("modePrefQ")}</Text>
              <Chips options={MODE_CHIPS} value={modeChip(a.mode)} onChange={(v) => set("mode")(chipMode(v as string))} />
              <Text style={ui.label}>{t("lenQ")}</Text>
              <Chips options={["d5", "d10", "d15", "d20"]} value={a.durs} onChange={(v) => set("durs")(v as string[])} />
              <Text style={ui.label}>{t("goalQ")}</Text>
              <Chips options={["g2", "g3", "g5", "g7"]} value={a.goal} onChange={(v) => set("goal")(v as string)} />
              <Pressable onPress={save} disabled={busy} style={[s.myPosts, { alignSelf: "flex-start" }]}>
                <Text style={s.myPostsText}>{t("save")}</Text>
              </Pressable>
            </>
          ) : (
            [
              [t("actQ"), t(a.act)],
              [t("sumMode"), t(modeChip(a.mode))],
              [t("sumSessions"), list(a.durs)],
              [t("sumGoal"), t("perWeek", { x: t(a.goal) })],
            ].map(([k, v]) => (
              <View key={k} style={ui.sumRow}>
                <Text style={ui.sumK}>{k}</Text>
                <Text style={ui.sumV}>{v}</Text>
              </View>
            ))
          )}
        </View>

        {/* ตั้งค่า */}
        <Text style={[ui.sec, ui.secGap]}>{t("settings")}</Text>
        <View style={ui.card}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={ui.name}>{t("selfieT")}</Text>
              <Text style={ui.p2}>{t("selfieS")}</Text>
            </View>
            <Switch
              value={profile.selfie_enabled}
              onValueChange={(v) => saveProfile({ selfie_enabled: v }).catch(() => setMsg(t("saveFail")))}
              trackColor={{ true: COLORS.sage, false: COLORS.line }}
            />
          </View>
          <View style={[ui.sumRow, { marginTop: 8 }]}>
            <Text style={ui.name}>{t("selfieGallery")}</Text>
            <Text style={ui.sumK}>{t("comingSoon")}</Text>
          </View>
          <View style={[ui.sumRow, { borderBottomWidth: 0, alignItems: "center" }]}>
            <Text style={ui.name}>{t("language")}</Text>
            <LangToggle />
          </View>
          <Pressable
            onPress={() => saveProfile({ onboarding_completed: false }).catch(() => setMsg(t("saveFail")))}
            style={[ui.sumRow, { borderBottomWidth: 0 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={ui.name}>{t("redoSetup")}</Text>
              <Text style={ui.p2}>{t("redoSetupS")}</Text>
            </View>
          </Pressable>
          <Pressable onPress={signOut} style={[s.myPosts, { alignSelf: "stretch", marginTop: 12 }]}>
            <Text style={[s.myPostsText, { textAlign: "center" }]}>{t("logout")}</Text>
          </Pressable>
        </View>
        <Text style={ui.foot}>{t("madeWith")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  editBtn: { position: "absolute", top: 14, right: 14, zIndex: 2 },
  camBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: FONTS.head, fontSize: 22, color: COLORS.text },
  bio: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, textAlign: "center", marginTop: 6, lineHeight: 20, paddingHorizontal: 10 },
  levelChip: { marginTop: 10, backgroundColor: COLORS.greenSoft, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  levelChipText: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 12 },
  followRow: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  myPosts: { backgroundColor: COLORS.sage, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 18, marginTop: 14 },
  myPostsText: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 13 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statBox: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cardTitle: { fontFamily: FONTS.head, fontSize: 16, color: COLORS.text },
  goalTrack: { height: 10, borderRadius: 5, backgroundColor: COLORS.pink, marginTop: 10, overflow: "hidden" },
  goalFill: { height: 10, borderRadius: 5, backgroundColor: COLORS.sage },
  barRow: { flexDirection: "row", alignItems: "flex-end", height: 84, marginTop: 12 },
  bar: { width: 14, borderRadius: 7, backgroundColor: COLORS.pinkDeep },
  barLabel: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.sub, marginTop: 4 },
  histRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.pink },
  histDate: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.sageDark, width: 64 },
  histTitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.text },
  plays: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.rose, marginTop: 3 },
  rank: { fontFamily: FONTS.head, fontSize: 16, color: COLORS.sage, width: 28 },
  countPill: { backgroundColor: COLORS.roseBg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  countText: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.rose },
});
