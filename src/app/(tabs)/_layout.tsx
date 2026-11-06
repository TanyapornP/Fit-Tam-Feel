import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";

import { focusOnlyLayout } from "../../components/FocusOnly";
import Icon, { type IconName } from "../../components/Icon";
import { useT } from "../../lib/i18n";
import { COLORS, FONTS } from "../../lib/theme";

export default function TabLayout() {
  const { t } = useT();
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
        tabBarLabelStyle: { fontFamily: FONTS.bodyBold, fontSize: 11 },
        tabBarStyle: { backgroundColor: "rgba(255,255,255,0.92)", borderTopColor: COLORS.line },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tabHome"), tabBarIcon: icon("home") }} />
      <Tabs.Screen name="community" options={{ title: t("tabCommunity"), tabBarIcon: icon("community") }} />
      <Tabs.Screen name="profile" options={{ title: t("tabProfile"), tabBarIcon: icon("profile") }} />
    </Tabs>
  );
}
