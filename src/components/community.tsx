// ชิ้นส่วนหน้าชุมชน: ปุ่มติดตาม, ช่องโพสต์, การ์ดโพสต์
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useData } from "../lib/DataContext";
import { useT } from "../lib/i18n";
import { tierOf } from "../lib/logic";
import { ui } from "../lib/styles";
import { COLORS, FONTS } from "../lib/theme";
import type { Community } from "../lib/useCommunity";
import type { Clip, Post } from "../lib/types";
import Avatar from "./Avatar";
import Icon from "./Icon";

/** เวลาที่ผ่านไป เช่น "25 นาทีที่แล้ว" */
export function useTimeAgo() {
  const { t } = useT();
  return (at: number) => {
    const m = Math.floor((Date.now() - at) / 60000);
    if (m < 1) return t("justNow");
    if (m < 60) return t("mAgo", { n: m });
    const h = Math.floor(m / 60);
    return h < 24 ? t("hAgo", { n: h }) : t("dAgo", { n: Math.floor(h / 24) });
  };
}

export const openPerson = (id: string) => router.push({ pathname: "/person/[id]", params: { id } });

export function FollowBtn({ on, onPress, small }: { on: boolean; onPress: () => void; small?: boolean }) {
  const { t } = useT();
  return (
    <Pressable onPress={onPress} style={[s.followBtn, on && s.followOn, small && { paddingVertical: 5, paddingHorizontal: 11 }]}>
      <Text style={[s.followText, on && { color: COLORS.sageDark }]}>{on ? t("followingBtn") : t("follow")}</Text>
    </Pressable>
  );
}

/** ช่องเขียนโพสต์: แนบแบตวันนี้ / คลิปล่าสุดที่ทำวันนี้ / รูปจากเครื่อง */
export function Composer({ com }: { com: Community }) {
  const { t } = useT();
  const { logs, today, battery, draft, setDraft, clips } = useData();
  const card = com.card(com.me);
  const todayLogs = logs.filter((e) => e.day === today);
  const latest = todayLogs[0] ?? null; // logs เรียงจากใหม่ไปเก่า
  const shareBattery = latest ? latest.battery : battery;
  const [text, setText] = useState(draft ?? "");
  const [withBat, setWithBat] = useState(!!draft);
  const [withClip, setWithClip] = useState(!!draft && !!latest?.clipId);
  const [img, setImg] = useState<{ uri: string; mime: string | null } | null>(null);
  const [err, setErr] = useState("");
  const latestClip: Clip | undefined = clips.find((c) => c.id === latest?.clipId);

  const pick = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return setErr(t("errPhotoPerm"));
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.6 });
      if (!res.canceled && res.assets[0]) {
        setErr("");
        setImg({ uri: res.assets[0].uri, mime: res.assets[0].mimeType ?? null });
      }
    } catch {
      setErr(t("errPhoto"));
    }
  };

  const canPost = (text.trim().length > 0 || !!img) && !com.busy;
  const submit = async () => {
    if (!canPost) return;
    await com.createPost({
      content: text.trim(),
      imageUri: img?.uri ?? null,
      imageMime: img?.mime ?? null,
      clipId: withClip && latest ? latest.clipId : null,
      battery: withBat ? shareBattery : null,
    });
    setText("");
    setImg(null);
    setWithBat(false);
    setWithClip(false);
    setDraft(null);
  };

  return (
    <View style={ui.card}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <Avatar name={card.username} uri={card.avatar_url} seed={com.me} size={40} />
        <TextInput
          multiline
          value={text}
          onChangeText={(v) => setText(v.slice(0, 300))}
          placeholder={t("composePh")}
          placeholderTextColor="#C9B3BA"
          style={s.composeInput}
        />
      </View>
      {!!img && (
        <View>
          <Image source={{ uri: img.uri }} style={s.postImg} resizeMode="cover" />
          <Pressable onPress={() => setImg(null)} style={s.imgX}>
            <Icon name="close" size={14} color={COLORS.white} />
          </Pressable>
        </View>
      )}
      <View style={s.attachRow}>
        <Chip on={withBat} onPress={() => setWithBat(!withBat)} label={t("attachBattery", { n: shareBattery })} />
        {!!latestClip && <Chip on={withClip} onPress={() => setWithClip(!withClip)} label={t("attachClip")} />}
        <Chip on={!!img} onPress={pick} label={t("attachPhoto")} />
      </View>
      {!!err && <Text style={ui.err}>{err}</Text>}
      <View style={s.composeFoot}>
        <Text style={ui.rowHint}>{text.length}/300</Text>
        <Pressable onPress={submit} disabled={!canPost} style={[s.postBtn, !canPost && { opacity: 0.45 }]}>
          <Text style={s.postBtnText}>{t("post")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Chip({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={[s.attach, on && s.attachOn]}>
      <Text style={[s.attachText, on && { color: COLORS.white }]}>{label}</Text>
    </Pressable>
  );
}

/** โพสต์ 1 อัน: เป็นกำลังใจ / คอมเมนต์ / ติดตาม / ลบโพสต์ของตัวเอง */
export function PostCard({ post, com, clipsById, initialOpen }: { post: Post; com: Community; clipsById: Record<string, Clip>; initialOpen?: boolean }) {
  const { t } = useT();
  const ago = useTimeAgo();
  const [open, setOpen] = useState(!!initialOpen);
  const [text, setText] = useState("");
  const author = com.card(post.userId);
  const mine = post.userId === com.me;
  const cheered = post.likes.includes(com.me);
  const clip = post.clipId ? clipsById[post.clipId] : undefined;
  const following = com.followingOf(com.me).has(post.userId);

  const send = async () => {
    const v = text.trim();
    if (!v) return;
    setText("");
    await com.comment(post, v.slice(0, 300));
  };

  return (
    <View style={s.post}>
      <View style={s.postHead}>
        <Avatar name={author.username} uri={author.avatar_url} seed={post.userId} size={40} onPress={() => openPerson(post.userId)} />
        <Pressable style={{ flex: 1, marginLeft: 10 }} onPress={() => openPerson(post.userId)}>
          <Text style={ui.name}>
            {author.username ?? "—"}
            {mine ? " · " + t("youTag") : ""}
          </Text>
          <Text style={ui.meta}>
            {ago(post.at)} · {t("streakShort", { n: author.current_streak })}
          </Text>
        </Pressable>
        {mine ? (
          <Pressable onPress={() => com.remove(post)} style={s.actBtn}>
            <Text style={s.actText}>{t("deletePost")}</Text>
          </Pressable>
        ) : (
          <FollowBtn on={following} onPress={() => com.toggleFollow(post.userId)} small />
        )}
      </View>
      {!!post.content && <Text style={s.postText}>{post.content}</Text>}
      {!!post.imageUrl && <Image source={{ uri: post.imageUrl }} style={s.postImg} resizeMode="cover" />}
      {!!clip && (
        <Pressable style={s.postClip} onPress={() => Linking.openURL(clip.url)}>
          <Image source={{ uri: `https://img.youtube.com/vi/${clip.vid}/mqdefault.jpg` }} style={s.postClipImg} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.postClipTitle} numberOfLines={2}>
              {clip.title}
            </Text>
            <Text style={ui.meta}>
              {clip.channel} · {t("min", { n: clip.min })}
            </Text>
          </View>
          <Icon name="play" size={20} style={{ marginHorizontal: 8 }} />
        </Pressable>
      )}
      {post.battery != null && (
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={s.tagChip}>
            <Text style={s.tagChipText}>
              {t("attachBattery", { n: post.battery })} · {t("tier_" + tierOf(post.battery))}
            </Text>
          </View>
        </View>
      )}
      <View style={s.postActions}>
        <Pressable onPress={() => com.toggleCheer(post)} style={[s.actBtn, cheered && s.actOn]}>
          <Icon name={cheered ? "heart" : "heartOutline"} size={16} color={cheered ? COLORS.rose : COLORS.sub} />
          <Text style={[s.actText, cheered && { color: COLORS.rose }]}>
            {t("cheer")}
            {post.likes.length ? " " + post.likes.length : ""}
          </Text>
        </Pressable>
        <Pressable onPress={() => setOpen(!open)} style={[s.actBtn, open && s.actOn]}>
          <Icon name="comment" size={15} color={COLORS.sub} />
          <Text style={s.actText}>
            {t("comments")}
            {post.comments.length ? " " + post.comments.length : ""}
          </Text>
        </Pressable>
      </View>
      {open && (
        <View style={{ marginTop: 10 }}>
          {post.comments.map((c) => {
            const a = com.card(c.userId);
            return (
              <View key={c.id} style={s.cmtRow}>
                <Avatar name={a.username} uri={a.avatar_url} seed={c.userId} size={28} onPress={() => openPerson(c.userId)} />
                <View style={s.cmtBubble}>
                  <Text style={s.cmtName}>
                    {a.username ?? "—"}
                    <Text style={ui.meta}>  {ago(c.at)}</Text>
                  </Text>
                  <Text style={s.cmtText}>{c.content}</Text>
                </View>
              </View>
            );
          })}
          <View style={s.cmtInputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t("commentPh")}
              placeholderTextColor="#C9B3BA"
              style={s.cmtInput}
              maxLength={300}
              onSubmitEditing={send}
            />
            <Pressable onPress={send} disabled={!text.trim()} style={[s.sendBtn, !text.trim() && { opacity: 0.4 }]}>
              <Text style={s.sendText}>{t("send")}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  followBtn: { backgroundColor: COLORS.sage, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.sage },
  followOn: { backgroundColor: COLORS.white },
  followText: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 12 },
  composeInput: {
    flex: 1,
    marginLeft: 10,
    minHeight: 64,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.body,
    textAlignVertical: "top",
    paddingTop: 8,
    lineHeight: 21,
  },
  attachRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  attach: {
    backgroundColor: COLORS.pink,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.pinkDeep,
  },
  attachOn: { backgroundColor: COLORS.sage, borderColor: COLORS.sage },
  attachText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.sageDark },
  composeFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  postBtn: { backgroundColor: COLORS.sage, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 24 },
  postBtnText: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 14 },
  imgX: {
    position: "absolute",
    top: 18,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  post: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  postHead: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  postText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 22 },
  postImg: { width: "100%", height: 220, borderRadius: 16, marginTop: 10, backgroundColor: COLORS.pink },
  postClip: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.greenSoft, borderRadius: 16, padding: 8, marginTop: 10 },
  postClipImg: { width: 88, height: 50, borderRadius: 10, backgroundColor: COLORS.pink },
  postClipTitle: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.text },
  tagChip: { backgroundColor: COLORS.pink, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  tagChipText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.sageDark },
  postActions: { flexDirection: "row", marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.pink, paddingTop: 10 },
  actBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: COLORS.bg,
  },
  actOn: { backgroundColor: COLORS.roseBg },
  actText: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.sageDark },
  cmtRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  cmtBubble: { flex: 1, marginLeft: 8, backgroundColor: COLORS.bg, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  cmtName: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text },
  cmtText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, marginTop: 2, lineHeight: 19 },
  cmtInputRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cmtInput: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
    fontFamily: FONTS.body,
  },
  sendBtn: { marginLeft: 8, backgroundColor: COLORS.sage, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  sendText: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 12 },
});
