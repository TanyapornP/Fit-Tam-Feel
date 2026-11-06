// ไอคอนของแอป (แทนอิโมจิ) — iOS ใช้ SF Symbols, Android/เว็บ ใช้ Material Symbols ผ่าน expo-symbols
import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

import { COLORS } from "../lib/theme";

const ICONS = {
  home: ["house.fill", "home"],
  community: ["person.2.fill", "groups"],
  profile: ["person.fill", "person"],
  bell: ["bell.fill", "notifications"],
  flame: ["flame.fill", "local_fire_department"],
  trophy: ["trophy.fill", "emoji_events"],
  done: ["checkmark.circle.fill", "check_circle"],
  timer: ["timer", "timer"],
  check: ["checkmark", "check"],
  camera: ["camera.fill", "photo_camera"],
  close: ["xmark", "close"],
  heart: ["heart.fill", "favorite"],
  heartOutline: ["heart", "favorite_border"],
  comment: ["bubble.left.fill", "chat_bubble"],
  star: ["star.fill", "star"],
  play: ["play.fill", "play_arrow"],
} as const satisfies Record<string, readonly [SFSymbol, AndroidSymbol]>;

export type IconName = keyof typeof ICONS;

export default function Icon({
  name,
  size = 20,
  color = COLORS.sageDark,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  const [ios, material] = ICONS[name];
  return <SymbolView name={{ ios, android: material, web: material }} size={size} tintColor={color} style={style} />;
}
