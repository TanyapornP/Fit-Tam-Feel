// บนเว็บ หน้าที่ไม่ได้เปิดอยู่จะยังวางซ้อนอยู่ข้างหลัง และเพราะพื้นหลังของแต่ละหน้าโปร่งใส (ให้เห็นพื้นหลังเคลื่อนไหว)
// จึงมองทะลุเห็นหลายหน้าซ้อนกัน → ซ่อนหน้าที่ไม่ได้เปิดอยู่ (มือถือจัดการให้เองอยู่แล้ว)
import { useIsFocused } from "expo-router";
import type { ReactNode } from "react";
import { Platform, View } from "react-native";

function FocusOnly({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  const hide = Platform.OS === "web" && !focused;
  return <View style={{ flex: 1, display: hide ? "none" : "flex" }}>{children}</View>;
}

/** ใช้กับ prop `screenLayout` ของ <Stack> / <Tabs> */
export function focusOnlyLayout({ children }: { children: ReactNode }) {
  return <FocusOnly>{children}</FocusOnly>;
}
