// รูปโปรไฟล์: มีรูปใช้รูป ไม่มีรูปใช้ตัวอักษรแรกของชื่อ
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

const PALETTE = ["#81A684", "#E7A6BA", "#F4B183", "#B9A3D9", "#8FB8D9", "#A7C7A0"];
/** สีประจำคน (คนเดิมได้สีเดิมเสมอ) */
const colorFor = (seed: string) => PALETTE[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

type Props = { name: string | null; uri?: string | null; size: number; seed?: string; onPress?: () => void };

export default function Avatar({ name, uri, size, seed, onPress }: Props) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  const inner = uri ? (
    <Image source={{ uri }} style={[box, { backgroundColor: COLORS.pink }]} />
  ) : (
    <View style={[s.fallback, box, { backgroundColor: colorFor(seed ?? name ?? "?") }]}>
      <Text style={[s.letter, { fontSize: size * 0.42 }]}>{(name || "?").charAt(0).toUpperCase()}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
}

const s = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  letter: { fontFamily: FONTS.head, color: COLORS.white },
});
