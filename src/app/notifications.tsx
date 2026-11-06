// การแจ้งเตือน: ติดตาม / เป็นกำลังใจ / คอมเมนต์ (ฐานข้อมูลสร้างให้ด้วย trigger) + เตือนรายวัน
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../components/Avatar";
import { openPerson, useTimeAgo } from "../components/community";
import Icon from "../components/Icon";
import { EmptyText, ErrorBox, LoadingView } from "../components/ui";
import { useData } from "../lib/DataContext";
import { useT } from "../lib/i18n";
import { ui } from "../lib/styles";
import { COLORS, FONTS } from "../lib/theme";
import type { Notif } from "../lib/types";
import { useCommunity } from "../lib/useCommunity";

const TEXT_KEY = { follow: "nFollow", cheer: "nCheer", comment: "nComment", nudge: "nNudge", welcome: "nWelcome" } as const;

export default function Notifications() {
  const { t } = useT();
  const ago = useTimeAgo();
  const { notifs, markRead, reloadNotifs } = useData();
  const com = useCommunity(); // ใช้ชื่อ/รูปของคนที่ทำ + ข้อความโพสต์

  useFocusEffect(useCallback(() => reloadNotifs(), [])); // eslint-disable-line react-hooks/exhaustive-deps

  if (com.loading) return <LoadingView />;

  const open = (n: Notif) => {
    markRead([n.id]).catch(() => {});
    if (n.type === "follow" && n.actorId) openPerson(n.actorId);
    else if (n.type === "cheer" || n.type === "comment")
      router.navigate({ pathname: "/community", params: { feed: "mine", open: n.postId ?? "" } });
    else if (n.type === "welcome") router.navigate("/community");
    else router.navigate("/");
  };

  const snippet = (n: Notif) => {
    if (n.type === "comment") return "“" + (n.text ?? "") + "”";
    if (n.type === "cheer") {
      const p = com.posts.find((x) => x.id === n.postId);
      return p?.content ? "“" + p.content.slice(0, 50) + (p.content.length > 50 ? "…" : "") + "”" : "";
    }
    return "";
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={ui.screen}>
        <View style={[ui.topRow, { alignItems: "center" }]}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
            <Text style={ui.back}>{t("back")}</Text>
          </Pressable>
          {notifs.some((n) => !n.read) && (
            <Pressable onPress={() => markRead(notifs.map((n) => n.id)).catch(() => {})} style={ui.pill}>
              <Text style={ui.link}>{t("markAll")}</Text>
            </Pressable>
          )}
        </View>
        <Text style={[ui.hi, { marginBottom: 14 }]}>{t("notifTitle")}</Text>
        {com.error && <ErrorBox message={com.error} onRetry={com.reload} />}
        <View style={[ui.card, { paddingVertical: 6, paddingHorizontal: 0 }]}>
          {notifs.length === 0 ? (
            <EmptyText text={t("noNotifs")} />
          ) : (
            notifs.map((n, i) => {
              const who = n.actorId ? com.card(n.actorId) : null;
              const sn = snippet(n);
              return (
                <Pressable
                  key={n.id}
                  onPress={() => open(n)}
                  style={[s.row, !n.read && s.unread, i === notifs.length - 1 && { borderBottomWidth: 0 }]}
                >
                  {who ? (
                    <Avatar name={who.username} uri={who.avatar_url} seed={who.id} size={42} />
                  ) : (
                    <View style={s.icon}>
                      <Icon name={n.type === "nudge" ? "flame" : "bell"} size={20} color={n.type === "nudge" ? COLORS.rose : COLORS.sageDark} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.text}>
                      {who ? <Text style={ui.name}>{(who.username ?? "—") + " "}</Text> : null}
                      {t(TEXT_KEY[n.type])}
                    </Text>
                    {!!sn && (
                      <Text style={s.snip} numberOfLines={2}>
                        {sn}
                      </Text>
                    )}
                    <Text style={ui.meta}>{ago(n.at)}</Text>
                  </View>
                  {!n.read && <View style={s.dot} />}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.pink },
  unread: { backgroundColor: "rgba(253,236,240,0.7)" },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.greenSoft, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  snip: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.sub, marginTop: 2, lineHeight: 18 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.rose, marginLeft: 8 },
});
