import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { focusOnlyLayout } from "../../components/FocusOnly";
import Icon, { type IconName } from "../../components/Icon";
import { useT } from "../../lib/i18n";
import { COLORS, FONTS } from "../../lib/theme";

export default function TabLayout() {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const icon = (name: IconName) =>
    function TabIcon({ color }: { color: ColorValue }) {
      return <Icon name={name} size={22} color={color} />;
    };
  return (
    <Tabs
      screenLayout={focusOnlyLayout}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" }, // ให้เห็นพื้นหลังเคลื่อนไหว
        tabBarActiveTintColor: COLORS.sageDark,
        tabBarInactiveTintColor: COLORS.sub,
        tabBarLabelStyle: { fontFamily: FONTS.bodyBold, fontSize: 11, lineHeight: 16 }, // กำหนด lineHeight ไม่ให้ฟอนต์ไทยโดนตัด
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.92)",
          borderTopColor: COLORS.line,
          // กล่องแท็บสูงพอสำหรับไอคอน + ข้อความ และเว้นระยะล่างตาม safe-area ของ iPhone
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: 8 + insets.bottom,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tabHome"), tabBarIcon: icon("home") }} />
      <Tabs.Screen name="community" options={{ title: t("tabCommunity"), tabBarIcon: icon("community") }} />
      <Tabs.Screen name="profile" options={{ title: t("tabProfile"), tabBarIcon: icon("profile") }} />
    </Tabs>
  );
}
