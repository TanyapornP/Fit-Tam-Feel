// แถบเลื่อนพลังงาน 0–100% (Must story ข้อ 1)
import { useState } from "react";
import { StyleSheet, View, type GestureResponderEvent } from "react-native";

import { COLORS } from "../lib/theme";

type Props = {
  value: number;
  onChange: (v: number) => void;
  onRelease?: () => void; // ปล่อยนิ้วแล้ว (ใช้หมุนเวียนคลิปเมื่อกลับมาระดับเดิม)
};

export default function BatterySlider({ value, onChange, onRelease }: Props) {
  const [width, setWidth] = useState(1);
  // แปลงตำแหน่งนิ้ว (x) เป็นเปอร์เซ็นต์
  const fromTouch = (e: GestureResponderEvent) =>
    onChange(Math.max(0, Math.min(100, Math.round((e.nativeEvent.locationX / width) * 100))));

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 100, now: value }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width || 1)}
      style={s.track}
      // ระบบจับนิ้วของ View: แตะ / ลาก / ปล่อย
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={fromTouch}
      onResponderMove={fromTouch}
      onResponderRelease={() => onRelease?.()}
    >
      <View pointerEvents="none" style={[s.fill, { width: `${value}%` }]} />
      <View pointerEvents="none" style={[s.thumb, { left: `${value}%` }]} />
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.pink,
    borderWidth: 1,
    borderColor: COLORS.line,
    justifyContent: "center",
    marginTop: 6,
  },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 20, backgroundColor: COLORS.pinkDeep },
  thumb: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.sage,
    borderWidth: 3,
    borderColor: COLORS.white,
    marginLeft: -14,
    top: 5,
  },
});
