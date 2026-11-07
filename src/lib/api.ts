// ทุกคำสั่งที่คุยกับ Supabase อยู่ไฟล์นี้ — หน้าจอเรียกฟังก์ชันพวกนี้ ไม่เรียก supabase ตรง ๆ
// สิทธิ์การอ่าน/เขียนถูกบังคับด้วย RLS ในฐานข้อมูล (แต่ละคนเขียนได้เฉพาะข้อมูลของตัวเอง)
import { dayKey, ytId } from "./logic";
import { supabase } from "./supabase";
import type { Clip, Follow, LevelKey, LogEntry, Mode, Notif, NotifType, Post, Profile, PublicCard } from "./types";

type DbResult<T> = { data: T | null; error: { message: string } | null };
/** ถ้า Supabase ตอบ error ให้โยนออกไป หน้าจอจะได้แสดงข้อความ + ปุ่มลองใหม่ */
function must<T>(res: DbResult<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}
const ms = (iso: string) => new Date(iso).getTime();

/* ---------- ระดับพลังงาน (energy_table) ---------- */
export type LevelIds = Record<LevelKey, number>;
export async function fetchLevels(): Promise<LevelIds> {
  const rows = must(await supabase.from("energy_table").select("id, name")) as { id: number; name: LevelKey }[];
  const out = {} as LevelIds;
  rows.forEach((r) => {
    out[r.name] = r.id;
  });
  return out;
}

/* ---------- คลิป (workout_clip) ---------- */
type ClipRow = {
  id: string;
  code: string | null;
  mode: Mode;
  title: string;
  channel: string | null;
  duration_minutes: number;
  view_count: number | null;
  youtube_url: string;
  workout_type: string | null;
  workout_type_th: string | null;
  created_by: string | null;
  user_energy_percent: number | null;
  energy_table: { name: LevelKey } | null;
};

const toClip = (r: ClipRow): Clip => ({
  id: r.id,
  code: r.code,
  mode: r.mode,
  energy: r.energy_table?.name ?? "medium",
  title: r.title,
  channel: r.channel ?? "",
  min: r.duration_minutes,
  views: r.view_count,
  vid: ytId(r.youtube_url) ?? "",
  url: r.youtube_url,
  catEn: r.workout_type ?? "",
  catTh: r.workout_type_th ?? "",
  mine: r.created_by != null,
  pct: r.user_energy_percent,
});

const CLIP_COLS =
  "id, code, mode, title, channel, duration_minutes, view_count, youtube_url, workout_type, workout_type_th, created_by, user_energy_percent, energy_table(name)";

/** คลิปกลาง + คลิปที่ฉันเพิ่มเอง (RLS กรองให้แล้ว) */
export async function fetchClips(): Promise<Clip[]> {
  const rows = must(await supabase.from("workout_clip").select(CLIP_COLS)) as unknown as ClipRow[];
  return rows.map(toClip);
}

export async function addOwnClip(
  uid: string,
  input: { title: string; min: number; vid: string; pct: number; level: LevelKey; mode: Mode },
  levels: LevelIds,
): Promise<Clip> {
  const row = must(
    await supabase
      .from("workout_clip")
      .insert({
        title: input.title,
        duration_minutes: input.min,
        youtube_url: "https://youtu.be/" + input.vid,
        thumbnail_url: `https://img.youtube.com/vi/${input.vid}/hqdefault.jpg`,
        video_url: "https://www.youtube.com/embed/" + input.vid,
        category_id: levels[input.level],
        mode: input.mode,
        created_by: uid,
        user_energy_percent: input.pct,
      })
      .select(CLIP_COLS)
      .single(),
  ) as unknown as ClipRow;
  return toClip(row);
}

export async function deleteOwnClip(id: string) {
  must(await supabase.from("workout_clip").delete().eq("id", id));
}

/* ---------- ประวัติการออกกำลังกาย (user_did_it) ---------- */
type LogRow = {
  id: string;
  clip_id: string | null;
  battery_level: number;
  duration_minutes: number | null;
  completed_date: string;
  completed_at: string;
  workout_clip: { title: string; energy_table: { name: LevelKey } | null } | null;
};

const toLog = (r: LogRow): LogEntry => ({
  id: r.id,
  clipId: r.clip_id,
  title: r.workout_clip?.title ?? "—",
  min: r.duration_minutes ?? 0,
  energy: r.workout_clip?.energy_table?.name ?? null,
  battery: r.battery_level,
  day: r.completed_date,
  at: ms(r.completed_at),
});

const LOG_COLS = "id, clip_id, battery_level, duration_minutes, completed_date, completed_at, workout_clip(title, energy_table(name))";

export async function fetchLogs(): Promise<LogEntry[]> {
  const rows = must(
    await supabase.from("user_did_it").select(LOG_COLS).order("completed_at", { ascending: false }).limit(500),
  ) as unknown as LogRow[];
  return rows.map(toLog);
}

export async function addLog(clip: Clip, battery: number): Promise<LogEntry> {
  const row = must(
    await supabase
      .from("user_did_it")
      .insert({ clip_id: clip.id, battery_level: battery, duration_minutes: clip.min, completed_date: dayKey() })
      .select(LOG_COLS)
      .single(),
  ) as unknown as LogRow;
  return toLog(row);
}

export async function deleteLog(id: string) {
  must(await supabase.from("user_did_it").delete().eq("id", id));
}

/* ---------- โปรไฟล์ (profile — อ่านได้แค่เจ้าของ) ---------- */
export async function fetchProfile(uid: string): Promise<Profile> {
  return must(await supabase.from("profile").select("*").eq("id", uid).single()) as Profile;
}

export async function updateProfile(uid: string, patch: Partial<Profile>): Promise<Profile> {
  return must(
    await supabase
      .from("profile")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", uid)
      .select("*")
      .single(),
  ) as Profile;
}

/** อัปโหลดรูปจากเครื่องไปที่ Storage (โฟลเดอร์ของตัวเอง) แล้วคืนลิงก์รูป */
export async function uploadImage(bucket: "avatars" | "post-images", uid: string, uri: string, mime?: string | null) {
  const type = mime && mime.startsWith("image/") ? mime : "image/jpeg";
  const ext = type.split("/")[1] === "png" ? "png" : type.split("/")[1] === "webp" ? "webp" : "jpg";
  const body = await fetch(uri).then((r) => r.arrayBuffer());
  const path = `${uid}/${Date.now()}.${ext}`;
  must(await supabase.storage.from(bucket).upload(path, body, { contentType: type }));
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/* ---------- ชุมชน (posts / follows / post_likes / post_comments / public_profile) ---------- */
type PostRow = {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  clip_id: string | null;
  battery_level: number | null;
  created_at: string;
  post_likes: { user_id: string }[];
  post_comments: { id: string; user_id: string; content: string; created_at: string }[];
};

export type CommunityData = { posts: Post[]; cards: Record<string, PublicCard>; follows: Follow[] };

export async function fetchCommunity(): Promise<CommunityData> {
  const [postRes, cardRes, followRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id, user_id, content, image_url, clip_id, battery_level, created_at, post_likes(user_id), post_comments(id, user_id, content, created_at)")
      .order("created_at", { ascending: false })
      .limit(60),
    supabase.from("public_profile").select("id, username, avatar_url, bio, current_streak").limit(300),
    supabase.from("follows").select("follower_id, following_id"),
  ]);
  const postRows = must(postRes) as unknown as PostRow[];
  const cardRows = must(cardRes) as PublicCard[];
  const followRows = must(followRes) as { follower_id: string; following_id: string }[];

  const cards: Record<string, PublicCard> = {};
  cardRows.forEach((c) => {
    cards[c.id] = c;
  });
  return {
    cards,
    follows: followRows.map((f) => ({ follower: f.follower_id, following: f.following_id })),
    posts: postRows.map((p) => ({
      id: p.id,
      userId: p.user_id,
      content: p.content ?? "",
      imageUrl: p.image_url,
      clipId: p.clip_id,
      battery: p.battery_level,
      at: ms(p.created_at),
      likes: p.post_likes.map((l) => l.user_id),
      comments: p.post_comments
        .map((c) => ({ id: c.id, userId: c.user_id, content: c.content, at: ms(c.created_at) }))
        .sort((a, b) => a.at - b.at),
    })),
  };
}

export async function createPost(
  uid: string,
  input: { content: string; imageUri: string | null; imageMime: string | null; clipId: string | null; battery: number | null },
) {
  const imageUrl = input.imageUri ? await uploadImage("post-images", uid, input.imageUri, input.imageMime) : null;
  must(
    await supabase.from("posts").insert({
      content: input.content || null,
      image_url: imageUrl,
      clip_id: input.clipId,
      battery_level: input.battery,
    }),
  );
}

export async function deletePost(id: string) {
  must(await supabase.from("posts").delete().eq("id", id));
}

export async function setCheer(postId: string, uid: string, on: boolean) {
  if (on) must(await supabase.from("post_likes").insert({ post_id: postId }));
  else must(await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", uid));
}

export async function addComment(postId: string, content: string) {
  must(await supabase.from("post_comments").insert({ post_id: postId, content }));
}

export async function setFollow(uid: string, target: string, on: boolean) {
  if (on) must(await supabase.from("follows").insert({ following_id: target }));
  else must(await supabase.from("follows").delete().eq("follower_id", uid).eq("following_id", target));
}

/* ---------- การแจ้งเตือน (notifications — trigger ในฐานข้อมูลเป็นคนสร้าง) ---------- */
type NotifRow = {
  id: string;
  type: NotifType;
  actor_id: string | null;
  post_id: string | null;
  comment_text: string | null;
  is_read: boolean;
  created_at: string;
};

export async function fetchNotifs(): Promise<Notif[]> {
  const rows = must(
    await supabase
      .from("notifications")
      .select("id, type, actor_id, post_id, comment_text, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ) as NotifRow[];
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    actorId: r.actor_id,
    postId: r.post_id,
    text: r.comment_text,
    read: r.is_read,
    at: ms(r.created_at),
  }));
}

export async function markNotifsRead(ids: string[]) {
  if (!ids.length) return;
  must(await supabase.from("notifications").update({ is_read: true }).in("id", ids));
}
