// หน้าชุมชน: โพสต์ · ฟีด ทั้งหมด / ติดตาม / ของฉัน · เพื่อนที่น่าติดตาม
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../../components/Avatar";
import Bell from "../../components/Bell";
import Icon from "../../components/Icon";
import { Composer, FollowBtn, PostCard, openPerson } from "../../components/community";
import { EmptyText, ErrorBox, LoadingView } from "../../components/ui";
import { useData } from "../../lib/DataContext";
import { useT } from "../../lib/i18n";
import { ui } from "../../lib/styles";
import { COLORS, FONTS } from "../../lib/theme";
import type { Clip } from "../../lib/types";
import { useCommunity } from "../../lib/useCommunity";

type Feed = "all" | "following" | "mine";

export default function CommunityScreen() {
  const { t } = useT();
  const params = useLocalSearchParams<{ feed?: string; open?: string }>();
  const { clips, draft } = useData();
  const com = useCommunity();
  const [feed, setFeed] = useState<Feed>(params.feed === "mine" ? "mine" : "all");
  const [query, setQuery] = useState("");
  // เปิดมาจากการแจ้งเตือน / ปุ่ม "โพสต์ของฉัน" ขณะที่แท็บนี้เปิดค้างอยู่ → สลับไปฟีดของฉัน
  const paramKey = `${params.feed ?? ""}:${params.open ?? ""}`;
  const [seenParam, setSeenParam] = useState(paramKey);
  if (paramKey !== seenParam) {
    setSeenParam(paramKey);
    if (params.feed === "mine") setFeed("mine");
    else if (params.feed === "all") setFeed("all");
  }

  if (com.loading) return <LoadingView />;

  const following = com.followingOf(com.me);
  const clipsById: Record<string, Clip> = {};
  clips.forEach((c) => {
    clipsById[c.id] = c;
  });
  const posts = com.posts.filter((p) =>
    feed === "all" ? true : feed === "mine" ? p.userId === com.me : following.has(p.userId) || p.userId === com.me,
  );
  const suggestions = Object.values(com.cards).filter((c) => c.id !== com.me && !following.has(c.id));
  // ค้นหาคนจากชื่อ (รวมคนที่ติดตามแล้ว) — ไม่สนตัวพิมพ์เล็ก/ใหญ่
  const q = query.trim().toLowerCase();
  const found = q
    ? Object.values(com.cards).filter((c) => c.id !== com.me && (c.username ?? "").toLowerCase().includes(q))
    : [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={ui.screen} keyboardShouldPersistTaps="handled">
        <View style={ui.topRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={ui.hi}>{t("comTitle")}</Text>
            <Text style={ui.p2}>{t("comSub")}</Text>
          </View>
          <Bell />
        </View>

        {/* key เปลี่ยนเมื่อมีข้อความแชร์มาจากหน้าหลัก → ช่องโพสต์เติมข้อความให้ */}
        <Composer key={draft ?? "blank"} com={com} />
        {com.error && <ErrorBox message={com.error} onRetry={com.reload} />}

        <View style={s.feedWrap}>
          {(
            [
              ["all", t("feedAll")],
              ["following", t("feedFollowing") + " " + following.size],
              ["mine", t("feedMine")],
            ] as [Feed, string][]
          ).map(([k, label]) => (
            <Pressable key={k} onPress={() => setFeed(k)} style={[s.feedBtn, feed === k && s.feedOn]}>
              <Text style={[s.feedText, feed === k && { color: COLORS.white }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {feed !== "mine" && (
          <View style={s.searchBox}>
            <Icon name="search" size={16} color={COLORS.sageDark} />
            <TextInput
              value={query}
              onChangeText={(v) => setQuery(v.slice(0, 40))}
              placeholder={t("searchPh")}
              placeholderTextColor="#C9B3BA"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={s.searchInput}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={10}>
                <Icon name="close" size={14} color={COLORS.sageDark} />
              </Pressable>
            )}
          </View>
        )}

        {feed !== "mine" && q.length > 0 && (
          <View style={{ marginTop: 12 }}>
            {found.length === 0 ? (
              <EmptyText text={t("noPeople")} />
            ) : (
              found.map((c) => (
                <View key={c.id} style={s.resultRow}>
                  <Avatar name={c.username} uri={c.avatar_url} seed={c.id} size={44} onPress={() => openPerson(c.id)} />
                  <Pressable style={{ flex: 1, marginHorizontal: 12 }} onPress={() => openPerson(c.id)}>
                    <Text style={s.personNameLeft} numberOfLines={1}>
                      {c.username ?? "—"}
                    </Text>
                    <Text style={ui.meta} numberOfLines={1}>
                      {t("streakShort", { n: c.current_streak })}
                      {c.bio ? "  ·  " + c.bio : ""}
                    </Text>
                  </Pressable>
                  <FollowBtn on={following.has(c.id)} onPress={() => com.toggleFollow(c.id)} small />
                </View>
              ))
            )}
          </View>
        )}

        {suggestions.length > 0 && feed !== "mine" && q.length === 0 && (
          <View style={{ marginTop: 18 }}>
            <View style={ui.rowHead}>
              <Text style={ui.sec}>{t("suggest")}</Text>
              <Text style={ui.rowHint}>{suggestions.length > 2 ? t("swipe") : ""}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {suggestions.map((c) => (
                <View key={c.id} style={s.personCard}>
                  <Avatar name={c.username} uri={c.avatar_url} seed={c.id} size={52} onPress={() => openPerson(c.id)} />
                  <Text style={s.personName} numberOfLines={1}>
                    {c.username ?? "—"}
                  </Text>
                  <Text style={[ui.meta, { marginBottom: 10 }]}>{t("streakShort", { n: c.current_streak })}</Text>
                  <FollowBtn on={false} onPress={() => com.toggleFollow(c.id)} small />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          {posts.length === 0 ? (
            <EmptyText text={t(feed === "following" ? "emptyFollowing" : feed === "mine" ? "emptyMine" : "emptyFeed")} />
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} com={com} clipsById={clipsById} initialOpen={params.open === p.id} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  feedWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 999,
    padding: 4,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  feedBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  feedOn: { backgroundColor: COLORS.sage },
  feedText: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 13 },
  personCard: {
    width: 136,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    padding: 14,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  personName: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text, marginTop: 8 },
  personNameLeft: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, paddingVertical: 10, marginLeft: 8 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
});
