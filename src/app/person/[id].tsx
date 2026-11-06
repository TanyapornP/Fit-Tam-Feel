// โปรไฟล์สาธารณะของสมาชิก (จาก public_profile) + โพสต์ของคนนั้น
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../../components/Avatar";
import { FollowBtn, PostCard } from "../../components/community";
import { EmptyText, ErrorBox, LoadingView } from "../../components/ui";
import { useData } from "../../lib/DataContext";
import { useT } from "../../lib/i18n";
import { ui } from "../../lib/styles";
import { COLORS, FONTS } from "../../lib/theme";
import type { Clip } from "../../lib/types";
import { useCommunity } from "../../lib/useCommunity";

function Stat({ n, l, onPress }: { n: number; l: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ alignItems: "center", marginHorizontal: 14 }}>
      <Text style={ui.statNum}>{n}</Text>
      <Text style={ui.statLabel}>{l}</Text>
    </Pressable>
  );
}

export default function Person() {
  const { t } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clips } = useData();
  const com = useCommunity();

  if (com.loading) return <LoadingView />;

  const p = com.card(id);
  const posts = com.posts.filter((x) => x.userId === id);
  const clipsById: Record<string, Clip> = {};
  clips.forEach((c) => {
    clipsById[c.id] = c;
  });
  const people = (which: "followers" | "following") => router.push({ pathname: "/people/[id]", params: { id, which } });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={ui.screen} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={ui.back}>{t("back")}</Text>
        </Pressable>
        {com.error && <ErrorBox message={com.error} onRetry={com.reload} />}
        <View style={[ui.card, { alignItems: "center" }]}>
          <Avatar name={p.username} uri={p.avatar_url} seed={id} size={84} />
          <Text style={s.name}>
            {p.username ?? "—"}
            {id === com.me ? " · " + t("youTag") : ""}
          </Text>
          {!!p.bio && <Text style={s.bio}>{p.bio}</Text>}
          <View style={s.chip}>
            <Text style={s.chipText}>{t("streakShort", { n: p.current_streak })}</Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: 14 }}>
            <Stat n={posts.length} l={t("postsCount")} />
            <Stat n={com.followersOf(id).length} l={t("followers")} onPress={() => people("followers")} />
            <Stat n={com.followingOf(id).size} l={t("followingCount")} onPress={() => people("following")} />
          </View>
          {id !== com.me && (
            <View style={{ marginTop: 14 }}>
              <FollowBtn on={com.followingOf(com.me).has(id)} onPress={() => com.toggleFollow(id)} />
            </View>
          )}
        </View>
        <Text style={[ui.sec, ui.secGap]}>{t("theirPosts")}</Text>
        {posts.length === 0 ? (
          <EmptyText text={t("noPostsYet")} />
        ) : (
          posts.map((x) => <PostCard key={x.id} post={x} com={com} clipsById={clipsById} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  name: { fontFamily: FONTS.head, fontSize: 22, color: COLORS.text, marginTop: 10 },
  bio: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, textAlign: "center", marginTop: 6, lineHeight: 20 },
  chip: { marginTop: 10, backgroundColor: COLORS.greenSoft, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 12 },
});
