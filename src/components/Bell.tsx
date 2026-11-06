// กระดิ่งมุมขวาบน + ตัวเลขที่ยังไม่อ่าน
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useData } from "../lib/DataContext";
import { COLORS } from "../lib/theme";
import Icon from "./Icon";

export default function Bell() {
  const { unread } = useData();
  return (
    <Pressable onPress={() => router.push("/notifications")} style={s.bell} accessibilityLabel="notifications">
      <Icon name="bell" size={22} />
      {unread > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.rose,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
});
