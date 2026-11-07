import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/* ---------- ข้อความ 2 ภาษา (ไทย / อังกฤษ) ---------- */
const en = {
  appTag: "EXERCISE THAT FITS YOUR BATTERY",
  lockSub: "Just 5 minutes of stretching on your bed still counts as a win.",
  madeWith: "Made with care",
  back: "‹ Back", cont: "Continue", skip: "Skip", save: "Save", cancel: "Cancel",
  loading: "Loading…", loadFail: "Could not load data.", retry: "Try again", saveFail: "Could not save. Please try again.", dupDone: "You already logged this clip today — try another one!",
  language: "Language",

  signup: "Sign up", login: "Log in", yourName: "Your name", namePh: "Your name",
  email: "Email", emailPh: "you@example.com", password: "Password",
  create: "Create account", lockIn: "Lock in", orWith: "or", google: "Continue with Google", errGoogle: "Google sign-in failed. Please try again.",
  errSignup: "Please add your name, a valid email and a password (6+ characters).",
  errLogin: "Email or password does not match. Tap “Show” to check what you typed — if you signed up with Google, use “Continue with Google”.",
  showPw: "Show", hidePw: "Hide", errEmail: "Please enter a valid email (it needs an @).", errPw: "Please enter your password.",
  errName: "Please enter your name.", errPwShort: "Password must be at least 6 characters.",
  errUnconfirmed: "This email is not confirmed yet — open the link we sent to your inbox first.",
  errRate: "Too many attempts. Please wait a minute and try again.", errNet: "Cannot reach the server. Check your internet and try again.",
  errExists: "This email already has an account — try Log in.",
  checkEmail: "Almost there! Open the link we sent to your email, then log in.",

  step: "Step {a} of {b}", startFirst: "Start my first workout",
  batteryWhy: "Your home screen starts at this level each day — slide it to match how you feel.", lenWhy: "We put clips of this length first.", goalWhy: "Shown as your weekly goal on your profile.",
  s0h: "Nice to meet you", s0p: "Three quick steps and you're in.",
  nick: "What should we call you?", dobQ: "Year of birth", dobY: "YYYY (e.g. 2005)", dobErr: "Please enter a valid year of birth.",
  actQ: "How active are you right now?", act_new: "Just starting", act_some: "Sometimes", act_reg: "Regularly",
  s1h: "Your daily routine", s1p: "Busy days drain energy — knowing yours helps us pick realistic workouts.",
  dayQ: "My days are mostly…", outQ: "Hours away from home per day", freeQ: "I usually have free time in the",
  day_work: "Work or study", day_home: "At home", day_mix: "A mix", day_shift: "Shift work",
  out_4: "< 4 h", out_8: "4–8 h", out_12: "8–12 h", out_12p: "12 h +",
  fr_morning: "Morning", fr_afternoon: "Afternoon", fr_evening: "Evening", fr_night: "Night",
  s2h: "Your energy battery", s2p: "Your energy changes every day — that's totally normal.",
  drainedQ: "When do you feel most drained? (pick any)", batteryQ: "My typical battery level", sleepQ: "Average sleep",
  dr_morning: "Morning", dr_midday: "Midday", dr_after: "After work / study", dr_evening: "Evening", dr_busy: "Busy weeks",
  sl_u5: "< 5 h", sl_56: "5–6 h", sl_67: "6–7 h", sl_78: "7–8 h", sl_8p: "8 h +",
  s3h: "Move your way", s3p: "We only show clips that match what you enjoy.",
  typesQ: "Favourite types", lenQ: "Session length", whereQ: "Where do you work out?", limitQ: "Anything to be gentle with?",
  c_stretch: "Stretch", c_yoga: "Yoga", c_dance: "Dance", c_cardio: "Cardio", c_strength: "Strength",
  d5: "5 min", d10: "10 min", d15: "15 min", d20: "20 min",
  w_bed: "In bed", w_room: "Bedroom", w_living: "Living room", w_out: "Outdoors",
  l_none: "None", l_knee: "Knees", l_back: "Back", l_wrist: "Wrists", l_neck: "Neck",
  s4h: "Gentle goals", s4p: "Discipline over intensity — pick a pace you can keep.",
  goalQ: "Days per week I'd like to move", remindQ: "Remind me at", whyQ: "Why am I doing this?",
  g2: "2 days", g3: "3 days", g5: "5 days", g7: "Every day",
  r5: "5 pm", r7: "7 pm", r9: "9 pm", r0: "No reminder",
  y_feel: "Feel better", y_sleep: "Sleep better", y_cons: "Stay consistent", y_stress: "Less stress",
  selfieT: "Post-workout selfie", selfieS: "Snap a selfie after each session to save in your log.",
  modePrefQ: "What do you enjoy more?", modePrefWhy: "Home opens in this mode — you can switch any day.",
  sumName: "Nickname", sumYob: "Year of birth", sumAct: "Activity", sumMode: "Prefers",
  redoSetup: "Redo setup questions", redoSetupS: "Answer the sign-up questions again",
  s5h: "You're all set, {name}!", s5p: "Here's your starter profile. You can change any of this later.",
  sumRoutine: "Routine", sumFree: "Free time", sumBattery: "Usual battery", sumLikes: "Likes", sumSessions: "Sessions",
  sumGoal: "Goal", sumRemind: "Reminder", perWeek: "{x} / week",

  tabHome: "Home", tabCommunity: "Community", tabProfile: "Profile",
  hi: "Hi, {name}", welcomeBack: "Welcome back — you locked in!",
  streak: "On a {n}-day roll", doneToday: "Today is done — proud of you!", moveToday: "Move today to keep it going",
  batteryToday: "HOW'S YOUR BATTERY TODAY?", modeQ: "HOW DO YOU WANT TO MOVE TODAY?",
  modeWorkout: "Workout", modeDance: "Dance",
  picked: "PICKED FOR YOU", sameLevel: "ALSO AT YOUR LEVEL", easier: "A LITTLE EASIER", harder: "A LITTLE HARDER",
  best: "BEST MATCH FOR TODAY", watch: "Watch on YouTube", watchShort: "Watch", did: "I did it", doneChip: "Done today",
  otherClip: "Another clip", swipe: "swipe →", clipsCount: "{n} clips", playedN: "Played {n}×", views: "{n} views",
  doneSum: "Today: {n} clip(s) · {m} min", doneMore: "Still have energy? Pick another clip below", undo: "Undo",
  shareBtn: "Share", shareText: "Finished “{title}” today!", shareMany: "Did {n} clips today — {m} minutes in total!",
  foot: "Short and gentle still counts.", min: "{n} min", noClipsLevel: "No clips for this level yet.",
  lv_empty: "Running on empty", lv_low: "Low battery", lv_medium: "Doing okay", lv_good: "Feeling good", lv_high: "Fully charged",
  hint_empty: "Just breathe and stretch in bed — 5 minutes is a win.", hint_low: "Slow yoga or stretching. No jumping needed.",
  hint_medium: "Light pilates — a little sweat, nothing crazy.", hint_good: "Low-impact moves or a walk to get going.",
  hint_high: "Go for it — HIIT or a core burner.",
  dhint_empty: "Just one song — dance it out in 3–4 minutes.", dhint_low: "Low-impact dance, no jumping.",
  dhint_medium: "Dance party — fun and a little sweaty.", dhint_good: "Dance cardio to get your heart pumping.",
  dhint_high: "Sweaty dance — go all out!",
  tier_empty: "Empty", tier_low: "Low", tier_medium: "Medium", tier_good: "Good", tier_high: "High",

  myClips: "MY OWN CLIPS", addClip: "＋ Add my own clip", clipTitle: "Clip name", clipTitlePh: "e.g. Night stretch",
  clipMin: "Length (minutes)", clipLink: "YouTube link", clipEnergy: "Energy level of this clip", saveClip: "Save clip",
  errClip: "Please add a name, minutes (1–120) and a YouTube link.", errLink: "Please use a YouTube link, e.g. https://youtu.be/...",
  removeClip: "Remove", noClips: "No clips yet. Add one you love and choose the energy you had when you picked it.",
  matchNow: "MATCHES YOUR BATTERY NOW", myTag: "Added by you", myChannel: "My clip",

  logout: "Log out", edit: "Edit", doneEdit: "Done", bio: "About me", bioPh: "e.g. Dorm life, pilates before bed",
  changePhoto: "Tap the photo to change it", photoOpt: "Add a profile photo (optional)", uploading: "Uploading…", removePhoto: "Remove photo",
  errPhotoPerm: "Please allow photo access to choose a picture.", errPhoto: "Could not use that photo. Please try again.",
  errCamPerm: "Please allow camera access to take a picture.", takePhoto: "Take a photo", fromGallery: "Choose from gallery",
  myStats: "MY STATS", stCur: "Current streak", stBest: "Longest streak", stTotal: "Workouts done", stMin: "Total time",
  nDays: "{n} days", nTimes: "{n} times", nMin: "{n} min",
  weekGoal: "THIS WEEK'S GOAL", weekOf: "{a} of {b} days this week", weekHit: "Goal reached — amazing!",
  weekLeft: "{n} more day(s) to go — you got this",
  energyTrend: "MY ENERGY LATELY", avgBattery: "Average battery on workout days", noData: "No workouts yet — your energy trend will show here.",
  topClips: "MOST PLAYED", timesN: "{n}×", lastPlayed: "last: {d}", nthTime: "time #{n}",
  history: "WORKOUT HISTORY", noHistory: "Your workouts will show up here.", today: "Today", yesterday: "Yesterday",
  prefs: "MY PREFERENCES", settings: "SETTINGS", selfieGallery: "Selfie gallery", comingSoon: "Coming soon",
  myPostsBtn: "My posts ({n})",
  selfieAsk: "Keep a selfie of this session?", selfieAskS: "Saved privately — only you can see it.", selfieAdd: "Selfie",
  selfiePrivate: "Your selfies are private — only you can see them.", selfieEmpty: "No selfies yet. Finish a workout and snap one!",
  selfieDelete: "Delete this photo", selfieCount: "{n} photo(s)", close: "Close",
  delAcc: "Delete my account", delAccS: "Permanently deletes your profile, workouts, posts and comments.",
  delAccAsk: "Delete your account? This cannot be undone.", delAccYes: "Yes, delete everything", delAccFail: "Could not delete the account. Please try again.",

  comTitle: "Community", comSub: "Share your day and cheer each other on",
  composePh: "What did you move today? Even 5 minutes counts",
  attachBattery: "Battery {n}%", attachClip: "Today's clip", attachPhoto: "Gallery", attachCamera: "Camera", post: "Post",
  feedAll: "Everyone", feedFollowing: "Following", feedMine: "Mine", suggest: "PEOPLE TO FOLLOW", searchPh: "Search people by name", noPeople: "No one found with that name",
  follow: "+ Follow", followingBtn: "Following", cheer: "Cheer", comments: "Comments", commentPh: "Say something nice…", send: "Send",
  reply: "Reply", replyingTo: "Replying to {name}", replyPh: "Write a reply…",
  deletePost: "Delete", justNow: "just now", mAgo: "{n}m ago", hAgo: "{n}h ago", dAgo: "{n}d ago",
  emptyFollowing: "Not following anyone yet — follow friends to see their posts here.",
  emptyFeed: "No posts yet — be the first to share!", emptyMine: "You have not posted yet — share something above!",
  followers: "Followers", followingCount: "Following", postsCount: "Posts", noPostsYet: "No posts yet.", peopleNone: "No one here yet.",
  streakShort: "{n}-day roll", youTag: "You", theirPosts: "POSTS",

  notifTitle: "Notifications", markAll: "Mark all read", noNotifs: "No notifications yet.",
  nFollow: "started following you", nCheer: "cheered your post", nComment: "commented on your post:", nReply: "replied to your comment:",
  nNudge: "You have not moved yet today — 5 minutes keeps your streak going",
  nWelcome: "Welcome to Fit-Tam-Feel! Share your first post in Community",
};

export type TKey = keyof typeof en;

const th: Record<TKey, string> = {
  appTag: "ออกกำลังกายให้พอดีกับแบตของคุณ",
  lockSub: "แค่ยืดเหยียด 5 นาทีบนเตียง ก็นับว่าสำเร็จแล้วนะ",
  madeWith: "ทำด้วยความใส่ใจ",
  back: "‹ ย้อนกลับ", cont: "ต่อไป", skip: "ข้าม", save: "บันทึก", cancel: "ยกเลิก",
  loading: "กำลังโหลด…", loadFail: "โหลดข้อมูลไม่สำเร็จ", retry: "ลองใหม่", saveFail: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะ", dupDone: "วันนี้บันทึกคลิปนี้ไปแล้ว ลองคลิปอื่นดูนะ",
  language: "ภาษา",

  signup: "สมัครสมาชิก", login: "เข้าสู่ระบบ", yourName: "ชื่อของคุณ", namePh: "ชื่อของคุณ",
  email: "อีเมล", emailPh: "you@example.com", password: "รหัสผ่าน",
  create: "สร้างบัญชี", lockIn: "Lock in", orWith: "หรือ", google: "เข้าสู่ระบบด้วย Google", errGoogle: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง",
  errSignup: "กรุณากรอกชื่อ อีเมลที่ถูกต้อง และรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)",
  errLogin: "อีเมลหรือรหัสผ่านไม่ตรงกับที่สมัครไว้ ลองกด “แสดง” เพื่อเช็กสิ่งที่พิมพ์ · ถ้าเคยสมัครด้วย Google ให้กด “เข้าสู่ระบบด้วย Google”",
  showPw: "แสดง", hidePw: "ซ่อน", errEmail: "กรุณากรอกอีเมลให้ถูกต้อง (ต้องมี @)", errPw: "กรุณากรอกรหัสผ่าน",
  errName: "กรุณากรอกชื่อของคุณ", errPwShort: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
  errUnconfirmed: "อีเมลนี้ยังไม่ได้ยืนยัน เปิดลิงก์ที่ส่งไปในอีเมลก่อนนะ",
  errRate: "ลองหลายครั้งเกินไป รอสักครู่แล้วลองใหม่นะ", errNet: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ เช็กอินเทอร์เน็ตแล้วลองใหม่นะ",
  errExists: "อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบดูนะ",
  checkEmail: "อีกนิดเดียว! กดลิงก์ยืนยันในอีเมลก่อน แล้วค่อยเข้าสู่ระบบนะ",

  step: "ขั้นที่ {a} จาก {b}", startFirst: "เริ่มออกกำลังกายครั้งแรก",
  batteryWhy: "หน้าหลักจะเริ่มที่ระดับนี้ทุกวัน แล้วเลื่อนปรับตามความรู้สึกวันนั้นได้", lenWhy: "คลิปที่ยาวประมาณนี้จะขึ้นมาก่อน", goalWhy: "ใช้เป็นเป้าหมายรายสัปดาห์ในหน้าโปรไฟล์",
  s0h: "ยินดีที่ได้รู้จัก", s0p: "ตั้งค่า 3 ขั้นสั้น ๆ แล้วเริ่มใช้ได้เลย",
  nick: "ให้เรียกคุณว่าอะไรดี?", dobQ: "ปีเกิด", dobY: "ปี ค.ศ./พ.ศ. (เช่น 2548)", dobErr: "กรุณากรอกปีเกิดให้ถูกต้อง",
  actQ: "ตอนนี้คุณออกกำลังกายบ่อยแค่ไหน?", act_new: "เพิ่งเริ่ม", act_some: "นานๆ ครั้ง", act_reg: "สม่ำเสมอ",
  s1h: "กิจวัตรประจำวัน", s1p: "วันที่ยุ่งทำให้เหนื่อยง่าย รู้ไว้จะได้เลือกคลิปที่พอดีกับคุณ",
  dayQ: "วันส่วนใหญ่ของฉันคือ…", outQ: "อยู่นอกบ้านต่อวันกี่ชั่วโมง", freeQ: "ปกติฉันว่างช่วง",
  day_work: "ทำงานหรือเรียน", day_home: "อยู่บ้าน", day_mix: "ผสมกัน", day_shift: "ทำงานเป็นกะ",
  out_4: "น้อยกว่า 4 ชม.", out_8: "4–8 ชม.", out_12: "8–12 ชม.", out_12p: "12 ชม. ขึ้นไป",
  fr_morning: "เช้า", fr_afternoon: "บ่าย", fr_evening: "เย็น", fr_night: "ดึก",
  s2h: "แบตเตอรี่พลังงาน", s2p: "พลังงานเปลี่ยนไปทุกวัน เป็นเรื่องปกติเลย",
  drainedQ: "ช่วงไหนที่เหนื่อยที่สุด? (เลือกได้หลายข้อ)", batteryQ: "ระดับแบตปกติของฉัน", sleepQ: "นอนเฉลี่ยต่อคืน",
  dr_morning: "เช้า", dr_midday: "กลางวัน", dr_after: "หลังเลิกงาน/เรียน", dr_evening: "เย็น", dr_busy: "ช่วงที่งานยุ่ง",
  sl_u5: "น้อยกว่า 5 ชม.", sl_56: "5–6 ชม.", sl_67: "6–7 ชม.", sl_78: "7–8 ชม.", sl_8p: "8 ชม. ขึ้นไป",
  s3h: "ขยับในแบบของคุณ", s3p: "เราจะแสดงเฉพาะคลิปที่ตรงกับสิ่งที่คุณชอบ",
  typesQ: "ประเภทที่ชอบ", lenQ: "ความยาวคลิป", whereQ: "ปกติออกกำลังกายที่ไหน?", limitQ: "มีส่วนไหนที่ต้องระวังเป็นพิเศษไหม?",
  c_stretch: "ยืดเหยียด", c_yoga: "โยคะ", c_dance: "เต้น", c_cardio: "คาร์ดิโอ", c_strength: "สร้างกล้ามเนื้อ",
  d5: "5 นาที", d10: "10 นาที", d15: "15 นาที", d20: "20 นาที",
  w_bed: "บนเตียง", w_room: "ห้องนอน", w_living: "ห้องนั่งเล่น", w_out: "กลางแจ้ง",
  l_none: "ไม่มี", l_knee: "เข่า", l_back: "หลัง", l_wrist: "ข้อมือ", l_neck: "คอ",
  s4h: "เป้าหมายแบบนุ่มนวล", s4p: "วินัยสำคัญกว่าความหนัก เลือกจังหวะที่ทำต่อได้",
  goalQ: "อยากขยับสัปดาห์ละกี่วัน", remindQ: "เตือนฉันตอน", whyQ: "ทำไมถึงอยากออกกำลังกาย?",
  g2: "2 วัน", g3: "3 วัน", g5: "5 วัน", g7: "ทุกวัน",
  r5: "17:00", r7: "19:00", r9: "21:00", r0: "ไม่ต้องเตือน",
  y_feel: "รู้สึกดีขึ้น", y_sleep: "นอนหลับดีขึ้น", y_cons: "มีวินัยสม่ำเสมอ", y_stress: "เครียดน้อยลง",
  selfieT: "เซลฟี่หลังออกกำลังกาย", selfieS: "ถ่ายเซลฟี่หลังเสร็จทุกครั้งเพื่อเก็บไว้ในบันทึก",
  modePrefQ: "ชอบขยับแบบไหนมากกว่า?", modePrefWhy: "หน้าหลักจะเปิดมาที่โหมดนี้ เปลี่ยนได้ทุกวัน",
  sumName: "ชื่อเล่น", sumYob: "ปีเกิด", sumAct: "ความถี่", sumMode: "ชอบแบบ",
  redoSetup: "ตั้งค่าเริ่มต้นใหม่", redoSetupS: "ทำแบบสอบถามตอนสมัครอีกครั้ง",
  s5h: "พร้อมแล้ว {name}!", s5p: "นี่คือโปรไฟล์เริ่มต้นของคุณ แก้ไขได้ทุกเมื่อ",
  sumRoutine: "กิจวัตร", sumFree: "เวลาว่าง", sumBattery: "แบตปกติ", sumLikes: "ที่ชอบ", sumSessions: "ความยาว",
  sumGoal: "เป้าหมาย", sumRemind: "เตือน", perWeek: "{x} / สัปดาห์",

  tabHome: "หน้าหลัก", tabCommunity: "ชุมชน", tabProfile: "โปรไฟล์",
  hi: "สวัสดี {name}", welcomeBack: "ยินดีต้อนรับกลับมา Lock in สำเร็จแล้ว!",
  streak: "ต่อเนื่อง {n} วัน", doneToday: "วันนี้ทำแล้ว ภูมิใจในตัวคุณนะ!", moveToday: "ขยับวันนี้เพื่อรักษาความต่อเนื่องไว้",
  batteryToday: "วันนี้แบตเหลือเท่าไหร่?", modeQ: "วันนี้อยากขยับแบบไหน?",
  modeWorkout: "ออกกำลังกาย", modeDance: "เต้น",
  picked: "คัดมาให้คุณ", sameLevel: "ระดับเดียวกัน", easier: "เบาลงอีกนิด", harder: "หนักขึ้นอีกนิด",
  best: "เหมาะกับวันนี้ที่สุด", watch: "ดูบน YouTube", watchShort: "ดูคลิป", did: "ทำแล้ว", doneChip: "ทำแล้ววันนี้",
  otherClip: "คลิปอื่น", swipe: "เลื่อนดู →", clipsCount: "{n} คลิป", playedN: "เล่นแล้ว {n} ครั้ง", views: "ยอดวิว {n}",
  doneSum: "วันนี้ทำไป {n} คลิป · รวม {m} นาที", doneMore: "ยังไหวอยู่ไหม? เลือกคลิปต่อไปข้างล่างได้เลย", undo: "ยกเลิก",
  shareBtn: "แชร์เลย", shareText: "วันนี้ทำ “{title}” เสร็จแล้ว!", shareMany: "วันนี้ทำไป {n} คลิป รวม {m} นาที!",
  foot: "สั้นๆ เบาๆ ก็นับนะ", min: "{n} นาที", noClipsLevel: "ยังไม่มีคลิปในระดับนี้",
  lv_empty: "แบตเกือบหมด", lv_low: "แบตต่ำ", lv_medium: "พอไหว", lv_good: "ค่อนข้างดี", lv_high: "แบตเต็ม",
  hint_empty: "หายใจลึกๆ ยืดเบาๆ บนเตียง 5 นาทีก็นับว่าสำเร็จ", hint_low: "โยคะหรือยืดเหยียดช้าๆ ไม่ต้องลุกกระโดด",
  hint_medium: "พิลาทิสเบาๆ ได้เหงื่อนิดหน่อย ไม่หนักเกินไป", hint_good: "เดินหรือท่ายืนแบบไม่กระแทก ให้ตัวได้ขยับ",
  hint_high: "จัดเต็มได้เลย HIIT หรือเวทหน้าท้อง",
  dhint_empty: "แค่ 1 เพลง เต้น 3–4 นาทีก็นับว่าสำเร็จ", dhint_low: "เต้นแบบไม่กระแทก ไม่ต้องกระโดด",
  dhint_medium: "เต้นปาร์ตี้ สนุกๆ เหงื่อซึมนิดหน่อย", dhint_good: "เต้นคาร์ดิโอ ให้หัวใจได้ทำงาน",
  dhint_high: "เต้นจัดเต็ม เหงื่อท่วม!",
  tier_empty: "หมดแรง", tier_low: "ต่ำ", tier_medium: "ปานกลาง", tier_good: "ค่อนข้างดี", tier_high: "เต็มที่",

  myClips: "คลิปของฉัน", addClip: "＋ เพิ่มคลิปของฉัน", clipTitle: "ชื่อคลิป", clipTitlePh: "เช่น ยืดเหยียดก่อนนอน",
  clipMin: "ความยาว (นาที)", clipLink: "ลิงก์ YouTube", clipEnergy: "ระดับพลังงานของคลิปนี้", saveClip: "บันทึกคลิป",
  errClip: "กรุณากรอกชื่อ ความยาว (1–120 นาที) และลิงก์ YouTube", errLink: "กรุณาใช้ลิงก์ YouTube เช่น https://youtu.be/...",
  removeClip: "ลบ", noClips: "ยังไม่มีคลิป เพิ่มคลิปที่ชอบ แล้วเลือกพลังงานที่มีตอนเลือกคลิปนั้นได้เลย",
  matchNow: "ตรงกับแบตตอนนี้", myTag: "คุณเพิ่มเอง", myChannel: "คลิปของฉัน",

  logout: "ออกจากระบบ", edit: "แก้ไข", doneEdit: "เสร็จ", bio: "แนะนำตัว", bioPh: "เช่น เด็กหอ ชอบพิลาทิสก่อนนอน",
  changePhoto: "แตะที่รูปเพื่อเปลี่ยนรูปโปรไฟล์", photoOpt: "เพิ่มรูปโปรไฟล์ (ไม่บังคับ)", uploading: "กำลังอัปโหลด…", removePhoto: "ลบรูปโปรไฟล์",
  errPhotoPerm: "กรุณาอนุญาตให้แอปเข้าถึงรูปภาพก่อนนะ", errPhoto: "ใช้รูปนี้ไม่สำเร็จ ลองใหม่อีกครั้ง",
  errCamPerm: "กรุณาอนุญาตให้แอปใช้กล้องก่อนนะ", takePhoto: "ถ่ายรูป", fromGallery: "เลือกจากคลังภาพ",
  myStats: "สถิติของฉัน", stCur: "ต่อเนื่องตอนนี้", stBest: "ต่อเนื่องนานสุด", stTotal: "ออกกำลังกายไปแล้ว", stMin: "เวลารวม",
  nDays: "{n} วัน", nTimes: "{n} ครั้ง", nMin: "{n} นาที",
  weekGoal: "เป้าหมายสัปดาห์นี้", weekOf: "สัปดาห์นี้ทำไป {a} จาก {b} วัน", weekHit: "ถึงเป้าแล้ว เก่งมาก!",
  weekLeft: "อีก {n} วันจะถึงเป้า สู้ๆ นะ",
  energyTrend: "พลังงานช่วงนี้", avgBattery: "แบตเฉลี่ยในวันที่ออกกำลังกาย", noData: "ยังไม่มีข้อมูล ออกกำลังกายแล้วกราฟจะขึ้นที่นี่",
  topClips: "คลิปที่เล่นบ่อย", timesN: "{n} ครั้ง", lastPlayed: "ล่าสุด {d}", nthTime: "ครั้งที่ {n}",
  history: "ประวัติการออกกำลังกาย", noHistory: "เมื่อออกกำลังกายแล้ว ประวัติจะแสดงที่นี่", today: "วันนี้", yesterday: "เมื่อวาน",
  prefs: "ความชอบของฉัน", settings: "ตั้งค่า", selfieGallery: "แกลเลอรีเซลฟี่", comingSoon: "เร็วๆ นี้",
  myPostsBtn: "โพสต์ของฉัน ({n})",
  selfieAsk: "เก็บเซลฟี่ของการออกกำลังกายครั้งนี้ไหม?", selfieAskS: "เก็บเป็นส่วนตัว มีแค่คุณที่เห็น", selfieAdd: "เซลฟี่",
  selfiePrivate: "รูปเซลฟี่เป็นส่วนตัว มีแค่คุณที่เห็น", selfieEmpty: "ยังไม่มีรูป ออกกำลังกายเสร็จแล้วลองถ่ายเซลฟี่เก็บไว้ดูนะ",
  selfieDelete: "ลบรูปนี้", selfieCount: "{n} รูป", close: "ปิด",
  delAcc: "ลบบัญชีของฉัน", delAccS: "ลบโปรไฟล์ ประวัติการออกกำลังกาย โพสต์ และคอมเมนต์ทั้งหมดถาวร",
  delAccAsk: "ลบบัญชีนี้ใช่ไหม? กู้คืนไม่ได้นะ", delAccYes: "ใช่ ลบทั้งหมด", delAccFail: "ลบบัญชีไม่สำเร็จ ลองใหม่อีกครั้งนะ",

  comTitle: "ชุมชน", comSub: "แชร์วันนี้ของคุณ แล้วให้กำลังใจกัน",
  composePh: "วันนี้ขยับอะไรไปบ้าง? แค่ 5 นาทีก็แชร์ได้นะ",
  attachBattery: "แบต {n}%", attachClip: "คลิปที่ทำวันนี้", attachPhoto: "คลังภาพ", attachCamera: "ถ่ายรูป", post: "โพสต์",
  feedAll: "ทั้งหมด", feedFollowing: "ติดตาม", feedMine: "ของฉัน", suggest: "เพื่อนที่น่าติดตาม", searchPh: "ค้นหาเพื่อนจากชื่อ", noPeople: "ไม่พบคนที่ใช้ชื่อนี้",
  follow: "+ ติดตาม", followingBtn: "ติดตามแล้ว", cheer: "เป็นกำลังใจ", comments: "คอมเมนต์", commentPh: "เขียนให้กำลังใจ…", send: "ส่ง",
  reply: "ตอบกลับ", replyingTo: "กำลังตอบกลับ {name}", replyPh: "เขียนข้อความตอบกลับ…",
  deletePost: "ลบ", justNow: "เมื่อสักครู่", mAgo: "{n} นาทีที่แล้ว", hAgo: "{n} ชม.ที่แล้ว", dAgo: "{n} วันที่แล้ว",
  emptyFollowing: "ยังไม่ได้ติดตามใคร ลองติดตามเพื่อน แล้วโพสต์ของเพื่อนจะขึ้นที่นี่",
  emptyFeed: "ยังไม่มีโพสต์ มาเป็นคนแรกที่แชร์กัน", emptyMine: "ยังไม่มีโพสต์ของคุณ ลองแชร์อะไรสักอย่างด้านบนเลย",
  followers: "ผู้ติดตาม", followingCount: "กำลังติดตาม", postsCount: "โพสต์", noPostsYet: "ยังไม่มีโพสต์", peopleNone: "ยังไม่มีใคร",
  streakShort: "ต่อเนื่อง {n} วัน", youTag: "คุณ", theirPosts: "โพสต์",

  notifTitle: "การแจ้งเตือน", markAll: "อ่านทั้งหมดแล้ว", noNotifs: "ยังไม่มีการแจ้งเตือน",
  nFollow: "เริ่มติดตามคุณ", nCheer: "เป็นกำลังใจโพสต์ของคุณ", nComment: "คอมเมนต์โพสต์ของคุณ:", nReply: "ตอบกลับคอมเมนต์ของคุณ:",
  nNudge: "วันนี้ยังไม่ได้ขยับเลย ทำ 5 นาทีเพื่อรักษาความต่อเนื่องไว้นะ",
  nWelcome: "ยินดีต้อนรับสู่ Fit-Tam-Feel! ลองแชร์โพสต์แรกในชุมชนดูนะ",
};

const STRINGS = { en, th };
export const DAYS = { en: ["M", "T", "W", "T", "F", "S", "S"], th: ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"] };

export type Lang = "th" | "en";

/** แทน {ชื่อ} ในข้อความด้วยค่าจริง เช่น fmt("สวัสดี {name}", { name: "Mint" }) */
export const fmt = (str: string, vars?: Record<string, string | number>) =>
  str.replace(/\{(\w+)\}/g, (_, k: string) => (vars && vars[k] != null ? String(vars[k]) : ""));

type LangValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey | string, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<LangValue | null>(null);
const LANG_KEY = "ftf.lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("th");

  // จำภาษาที่เลือกไว้ในเครื่อง
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then((v) => {
        if (v === "en" || v === "th") setLangState(v);
      })
      .catch(() => {});
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  };

  const t = (k: TKey | string, vars?: Record<string, string | number>) => {
    const table = STRINGS[lang] as Record<string, string>;
    const s = table[k] ?? (en as Record<string, string>)[k] ?? k;
    return fmt(s, vars);
  };

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT ต้องอยู่ภายใน <LangProvider>");
  return ctx;
}
