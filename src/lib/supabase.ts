import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";

// ค่ามาจากไฟล์ .env.local (ชื่อขึ้นต้น EXPO_PUBLIC_ = แอปอ่านได้) — ดูตัวอย่างใน .env.example
const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage, // จำการเข้าสู่ระบบไว้ในเครื่อง เปิดแอปใหม่ไม่ต้องล็อกอินซ้ำ
    autoRefreshToken: true,
    persistSession: true,
    // เว็บ: กลับจากหน้า Google แล้วอ่าน ?code= ใน URL ให้เอง · มือถือ: แลก code เองใน login.tsx
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
  },
});

// บนมือถือ: ต่ออายุ session เฉพาะตอนแอปเปิดอยู่ (ตามคู่มือ Supabase สำหรับ React Native)
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
