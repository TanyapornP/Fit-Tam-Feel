// การ์ดคลิป YouTube (Must story ข้อ 2) + แถวคลิปที่เลื่อนไปทางขวาได้
import { useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useT } from "../lib/i18n";
import { fmtViews } from "../lib/logic";
import { ui } from "../lib/styles";
import { COLORS, FONTS } from "../lib/theme";
import type { Clip } from "../lib/types";

/** รูปปก: ใช้ HD ก่อน ถ้าไม่มี (YouTube ส่งรูปเทาเล็ก ๆ มา) ใช้ขนาดรอง */
function Cover({ clip, height }: { clip: Clip; height: number }) {
  const urls = [
    `https://img.youtube.com/vi/${clip.vid}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${clip.vid}/hqdefault.jpg`,
  ];
  const [i, setI] = useState(0);
  if (!clip.vid || i >= urls.length) {
    return (
      <View style={[s.cover, { height }]}>
        <Text style={{ fontSize: 44 }}>{clip.emoji}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: urls[i] }}
      style={[s.cover, { height }]}
      resizeMode="cover"
      onLoad={(e) => {
        const w = e.nativeEvent.source?.width;
        if (w && w <= 120) setI(i + 1);
      }}
      onError={() => setI(i + 1)}
    />
  );
}

type CardProps = {
  clip: Clip;
  best?: boolean;
  small?: boolean;
  doneToday?: boolean;
  onDone?: () => void;
  plays?: number;
};

export function ClipCard({ clip, best, small, doneToday, onDone, plays = 0 }: CardProps) {
  const { t, lang } = useT();
  const open = () => Linking.openURL(clip.url);
  const cat = lang === "th" ? clip.catTh || clip.catEn : clip.catEn;
  const tag = clip.mine ? t("myTag") : clip.views ? t("views", { n: fmtViews(clip.views) }) : "";
  return (
    <View style={[s.clip, best && s.clipBest]}>
      <Pressable onPress={open}>
        <Cover clip={clip} height={best ? 190 : small ? 130 : 150} />
        <View style={s.playBadge} pointerEvents="none">
          <Text style={s.playBadgeText}>▶</Text>
        </View>
        <View style={s.energyPill} pointerEvents="none">
          <Text style={s.energyPillText}>
            {t("tier_" + clip.energy)}
            {clip.pct != null ? " · " + clip.pct + "%" : ""}
          </Text>
        </View>
        <View style={s.minPill} pointerEvents="none">
          <Text style={s.minPillText}>{t("min", { n: clip.min })}</Text>
        </View>
      </Pressable>
      <View style={{ padding: small ? 12 : 14 }}>
        {best && <Text style={s.bestTag}>{t("best")}</Text>}
        <Text style={[s.title, small && { fontSize: 14 }]} numberOfLines={small ? 2 : undefined}>
          {clip.title}
        </Text>
        <Text style={s.meta} numberOfLines={1}>
          {clip.mine ? t("myChannel") : clip.channel}
          {cat ? " · " + cat : ""}
        </Text>
        {!!tag && <Text style={s.meta}>{tag}</Text>}
        {plays > 0 && <Text style={s.plays}>{t("playedN", { n: plays })}</Text>}
        <View style={{ flexDirection: "row", marginTop: 12 }}>
          <Pressable style={s.play} onPress={open}>
            <Text style={s.playText}>{small ? t("watchShort") : t("watch")}</Text>
          </Pressable>
          {doneToday ? (
            <View style={s.doneChip}>
              <Text style={s.doneChipText}>{t("doneChip")}</Text>
            </View>
          ) : (
            onDone && (
              <Pressable style={s.doneBtn} onPress={onDone}>
                <Text style={s.doneText}>{t("did")}</Text>
              </Pressable>
            )
          )}
        </View>
      </View>
    </View>
  );
}

type RowProps = {
  title?: string;
  items: Clip[];
  todayIds: string[];
  onDone: (c: Clip) => void;
  plays: (c: Clip) => number;
  onRemove?: (c: Clip) => void;
  matchKey?: string;
};

/** แถวคลิปแนวนอน — เลื่อนไปทางขวาเพื่อดูคลิปเพิ่ม */
export function ClipRow({ title, items, todayIds, onDone, plays, onRemove, matchKey }: RowProps) {
  const { t } = useT();
  if (!items.length) return null;
  return (
    <View style={{ marginTop: 16 }}>
      {!!title && (
        <View style={ui.rowHead}>
          <Text style={ui.sec}>{title}</Text>
          <Text style={ui.rowHint}>
            {t("clipsCount", { n: items.length })}
            {items.length > 1 ? " · " + t("swipe") : ""}
          </Text>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20, alignItems: "flex-start" }}
      >
        {items.map((c) => (
          <View key={c.id} style={{ width: 240, marginRight: 12 }}>
            {matchKey && c.energy === matchKey && <Text style={s.bestTag}>{t("matchNow")}</Text>}
            <ClipCard
              clip={c}
              small
              plays={plays(c)}
              doneToday={todayIds.includes(c.id)}
              onDone={() => onDone(c)}
            />
            {onRemove && (
              <Pressable onPress={() => onRemove(c)} style={{ alignSelf: "flex-end", marginTop: -6 }}>
                <Text style={ui.link}>{t("removeClip")}</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  cover: { width: "100%", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.pink },
  clip: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  clipBest: { borderColor: COLORS.sage, borderWidth: 2 },
  playBadge: {
    position: "absolute",
    alignSelf: "center",
    top: "38%",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  playBadgeText: { color: COLORS.sageDark, fontSize: 20, marginLeft: 3 },
  energyPill: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  energyPillText: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.sageDark },
  minPill: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(51,51,51,0.75)",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  minPillText: { color: COLORS.white, fontSize: 11, fontWeight: "700" },
  bestTag: { fontFamily: FONTS.bodyBold, fontSize: 11, letterSpacing: 1, color: COLORS.sageDark, marginBottom: 6 },
  title: { fontFamily: FONTS.head, fontSize: 16, color: COLORS.text },
  meta: { fontFamily: FONTS.body, color: COLORS.sub, fontSize: 12, marginTop: 4 },
  plays: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.rose, marginTop: 4 },
  play: { backgroundColor: COLORS.sage, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16, marginRight: 8 },
  playText: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 12 },
  doneBtn: { backgroundColor: COLORS.pink, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
  doneText: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 12 },
  doneChip: {
    backgroundColor: COLORS.greenSoft,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.sage,
  },
  doneChipText: { fontFamily: FONTS.bodyBold, color: COLORS.sageDark, fontSize: 12 },
});
