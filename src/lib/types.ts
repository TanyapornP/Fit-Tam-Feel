// ชนิดข้อมูลที่ใช้ทั้งแอป — ตรงกับตารางใน Supabase
export type LevelKey = "empty" | "low" | "medium" | "good" | "high";
export type Mode = "workout" | "dance";

/** คลิป 1 อัน (ตาราง workout_clip) */
export type Clip = {
  id: string;
  code: string | null;
  mode: Mode;
  energy: LevelKey;
  title: string;
  channel: string;
  min: number;
  views: number | null;
  vid: string; // YouTube video id
  url: string;
  catEn: string;
  catTh: string;
  mine: boolean; // ผู้ใช้เพิ่มเอง
  pct: number | null; // พลังงานตอนที่ผู้ใช้เพิ่มคลิปนี้
};

/** การออกกำลังกาย 1 ครั้ง (ตาราง user_did_it) */
export type LogEntry = {
  id: string;
  clipId: string | null;
  title: string;
  min: number;
  energy: LevelKey | null;
  battery: number;
  day: string; // yyyy-mm-dd
  at: number; // เวลาที่บันทึก (ms)
};

/** ข้อมูลส่วนตัว (ตาราง profile — อ่านได้แค่เจ้าของ) */
export type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean;
  birth_year: number | null;
  activity_level: string | null;
  energy_score: number | null;
  preferred_workouts: string[] | null;
  preferred_durations: number[] | null;
  workout_days_per_week: number | null;
  selfie_enabled: boolean;
  current_streak: number;
  longest_streak: number;
};

/** การ์ดสาธารณะที่สมาชิกคนอื่นเห็น (ตาราง public_profile) */
export type PublicCard = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_streak: number;
};

export type Comment = { id: string; userId: string; content: string; at: number };

export type Post = {
  id: string;
  userId: string;
  content: string;
  imageUrl: string | null;
  clipId: string | null;
  battery: number | null;
  at: number;
  likes: string[]; // user id ที่กดเป็นกำลังใจ
  comments: Comment[];
};

export type Follow = { follower: string; following: string };

export type NotifType = "follow" | "cheer" | "comment" | "nudge" | "welcome";
export type Notif = {
  id: string;
  type: NotifType;
  actorId: string | null;
  postId: string | null;
  text: string | null;
  read: boolean;
  at: number;
};
