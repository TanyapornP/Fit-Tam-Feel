// รายชื่อผู้ติดตาม / กำลังติดตาม
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../../components/Avatar";
import { FollowBtn, openPerson } from "../../components/community";
import { EmptyText, ErrorBox, LoadingView } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { ui } from "../../lib/styles";
import { COLORS } from "../../lib/theme";
import { useCommunity } from "../../lib/useCommunity";

export default function People() {
  const { t } = useT();
  const { id, which } = useLocalSearchParams<{ id: string; which?: string }>();
  const com = useCommunity();

  if (com.loading) return <LoadingView />;

  const owner = com.card(id);
  const ids = which === "following" ? [...com.followingOf(id)] : com.followersOf(id);
  const mine = com.followingOf(com.me);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={ui.screen}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={ui.back}>{t("back")}</Text>
        </Pressable>
        <Text style={ui.h1}>
          {owner.username ?? "—"} · {which === "following" ? t("followingCount") : t("followers")}
        </Text>
        {com.error && <ErrorBox message={com.error} onRetry={com.reload} />}
        <View style={[ui.card, { marginTop: 12 }]}>
          {ids.length === 0 ? (
            <EmptyText text={t("peopleNone")} />
          ) : (
            ids.map((uid) => {
              const p = com.card(uid);
              return (
                <View key={uid} style={s.row}>
                  <Avatar name={p.username} uri={p.avatar_url} seed={uid} size={40} onPress={() => openPerson(uid)} />
                  <Pressable style={{ flex: 1, marginLeft: 10, paddingRight: 8 }} onPress={() => openPerson(uid)}>
                    <Text style={ui.name}>
                      {p.username ?? "—"}
                      {uid === com.me ? " · " + t("youTag") : ""}
                    </Text>
                    {!!p.bio && (
                      <Text style={ui.meta} numberOfLines={1}>
                        {p.bio}
                      </Text>
                    )}
                  </Pressable>
                  {uid !== com.me && <FollowBtn on={mine.has(uid)} onPress={() => com.toggleFollow(uid)} small />}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.pink },
});
