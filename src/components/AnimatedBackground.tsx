// พื้นหลังวงกลมพาสเทลลอยไปมา + จุดประกายกะพริบ
import { useEffect, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, View, type DimensionValue } from "react-native";

import { COLORS } from "../lib/theme";

type Blob = {
  size: number;
  color: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  dx: number;
  dy: number;
  dur: number;
};

const BLOBS: Blob[] = [
  { size: 340, color: "#FBCFDB", top: -110, left: -120, dx: 110, dy: 80, dur: 6000 },
  { size: 150, color: "#E7D5F2", top: 70, right: 30, dx: -70, dy: 90, dur: 4500 },
  { size: 280, color: "#FFDCCF", top: 210, right: -130, dx: -100, dy: 110, dur: 7000 },
  { size: 240, color: "#DCEBDC", top: 480, left: -100, dx: 120, dy: -90, dur: 6500 },
  { size: 320, color: "#F9D2DE", bottom: -140, right: -100, dx: -110, dy: -80, dur: 5500 },
];
const SPARKLES: { top: DimensionValue; left: DimensionValue; dur: number }[] = [
  { top: "12%", left: "18%", dur: 1800 },
  { top: "22%", left: "78%", dur: 2300 },
  { top: "41%", left: "9%", dur: 2000 },
  { top: "58%", left: "86%", dur: 2600 },
  { top: "73%", left: "30%", dur: 2100 },
  { top: "88%", left: "64%", dur: 2400 },
];
const softBlur = Platform.OS === "web" ? ({ filter: "blur(26px)" } as object) : null;

/** ค่า 0 → 1 → 0 วนไปเรื่อย ๆ แบบนุ่มนวล */
function useLoop(duration: number) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: ease, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: ease, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v;
}

function BlobView({ b }: { b: Blob }) {
  const v = useLoop(b.dur);
  const move = {
    transform: [
      { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, b.dx] }) },
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, b.dy] }) },
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.18] }) },
    ],
  };
  const pos = { position: "absolute" as const, width: b.size, height: b.size, top: b.top, left: b.left, right: b.right, bottom: b.bottom };
  return (
    <Animated.View style={[pos, move, softBlur]}>
      {/* วงกลมซ้อน 3 ชั้น = ขอบฟุ้งนุ่ม ๆ ทุกแพลตฟอร์ม */}
      {[1, 0.78, 0.56].map((k, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: b.size * k,
            height: b.size * k,
            borderRadius: (b.size * k) / 2,
            left: (b.size * (1 - k)) / 2,
            top: (b.size * (1 - k)) / 2,
            backgroundColor: b.color,
            opacity: 0.26 + i * 0.12,
          }}
        />
      ))}
    </Animated.View>
  );
}

function Sparkle({ top, left, dur }: { top: DimensionValue; left: DimensionValue; dur: number }) {
  const v = useLoop(dur);
  return (
    <Animated.View
      style={[
        s.sparkle,
        {
          top,
          left,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.85] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }) }],
        },
      ]}
    />
  );
}

export default function AnimatedBackground() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, s.wrap]}>
      {BLOBS.map((b, i) => (
        <BlobView key={i} b={b} />
      ))}
      {SPARKLES.map((p, i) => (
        <Sparkle key={i} {...p} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { overflow: "hidden", backgroundColor: COLORS.bg },
  sparkle: { position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },
});
