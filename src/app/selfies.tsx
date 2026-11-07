// แกลเลอรีเซลฟี่: รูปที่ถ่ายหลังออกกำลังกาย (เก็บในบัคเก็ตส่วนตัว เห็นได้เฉพาะเจ้าของ)
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Icon from "../components/Icon";
import { EmptyText, ErrorBox, LoadingView } from "../components/ui";
import { signedSelfieUrls } from "../lib/api";
import { useData } from "../lib/DataContext";
import { useT } from "../lib/i18n";
import { toDate } from "../lib/logic";
import { ui } from "../lib/styles";
import { COLORS, FONTS } from "../lib/theme";
import type { LogEntry } from "../lib/types";

export default function Selfies() {
  const { t } = useT();
  const d = useData();
  const shots = d.logs.filter((e): e is LogEntry & { selfie: string } => !!e.selfie); // logs เรียงใหม่ → เก่า
  const key = shots.map((e) => e.selfie).join("|");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(key === ""); // ลิงก์ของชุดรูปนี้พร้อมหรือยัง
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [open, setOpen] = useState<LogEntry | null>(null);
  const [busy, setBusy] = useState(false);

  // ขอลิงก์ชั่วคราวสำหรับรูปในบัคเก็ตส่วนตัว (เมื่อชุดรูปเปลี่ยน หรือกด "ลองใหม่")
  useEffect(() => {
    if (!key) return;
    let alive = true;
    signedSelfieUrls(key.split("|"))
      .then((u) => {
        if (!alive) return;
        setUrls(u);
        setError(null);
        setLoaded(true);
      })
      .catch((e: Error) => {
        if (!alive) return;
        setError(e.message);
        setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [key, tries]);

  const dateLabel = (e: LogEntry) => {
    const x = toDate(e.day);
    return x.getDate() + "/" + (x.getMonth() + 1) + "/" + x.getFullYear();
  };

  const remove = async () => {
    if (!open || busy) return;
    setBusy(true);
    try {
      await d.deleteSelfie(open.id);
      setOpen(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={ui.screen}>
        <View style={[ui.topRow, { alignItems: "center" }]}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
            <Text style={ui.back}>{t("back")}</Text>
          </Pressable>
        </View>
        <Text style={ui.hi}>{t("selfieGallery")}</Text>
        <Text style={[ui.p2, { marginBottom: 14 }]}>{t("selfiePrivate")}</Text>

        {error && <ErrorBox message={error} onRetry={() => setTries((n) => n + 1)} />}
        {d.loading || !loaded ? (
          <LoadingView />
        ) : shots.length === 0 ? (
          <EmptyText text={t("selfieEmpty")} />
        ) : (
          <>
            <Text style={[ui.meta, { marginBottom: 8 }]}>{t("selfieCount", { n: shots.length })}</Text>
            <View style={s.grid}>
              {shots.map((e) => (
                <Pressable key={e.id} style={s.cell} onPress={() => setOpen(e)} accessibilityRole="imagebutton">
                  {urls[e.selfie] ? (
                    <Image source={{ uri: urls[e.selfie] }} style={s.img} resizeMode="cover" />
                  ) : (
                    <View style={[s.img, s.missing]} />
                  )}
                  <View style={s.tag}>
                    <Text style={s.tagText}>{dateLabel(e)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <View style={s.viewer}>
          {!!open && !!open.selfie && !!urls[open.selfie] && <Image source={{ uri: urls[open.selfie] }} style={s.big} resizeMode="contain" />}
          {!!open && (
            <Text style={s.caption} numberOfLines={2}>
              {dateLabel(open)} · {open.title}
            </Text>
          )}
          <View style={s.actions}>
            <Pressable onPress={remove} disabled={busy} style={[s.delBtn, busy && { opacity: 0.5 }]}>
              <Text style={s.delText}>{t("selfieDelete")}</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => setOpen(null)} style={s.close} accessibilityLabel={t("close")}>
            <Icon name="close" size={22} color={COLORS.white} />
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { width: "31.5%", aspectRatio: 1, borderRadius: 14, overflow: "hidden", backgroundColor: COLORS.pink },
  img: { width: "100%", height: "100%" },
  missing: { backgroundColor: COLORS.pinkDeep },
  tag: { position: "absolute", left: 6, bottom: 6, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 },
  tagText: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.white },
  viewer: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: 16 },
  big: { width: "100%", height: "70%" },
  caption: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.white, marginTop: 12, textAlign: "center" },
  actions: { marginTop: 16 },
  delBtn: { backgroundColor: COLORS.rose, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 24 },
  delText: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.white },
  close: { position: "absolute", top: 24, right: 20, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, padding: 10 },
});
