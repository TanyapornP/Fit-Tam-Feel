import { Tabs } from "expo-router";
import { Text } from "react-native";

import { focusOnlyLayout } from "../../components/FocusOnly";
import { useT } from "../../lib/i18n";
import { COLORS, FONTS } from "../../lib/theme";

export default function TabLayout() {
  const { t } = useT();
  const icon = (emoji: string) =>
    function TabIcon({ focused }: { focused: boolean }) {
      return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
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
      <Tabs.Screen name="index" options={{ title: t("tabHome"), tabBarIcon: icon("🏠") }} />
      <Tabs.Screen name="community" options={{ title: t("tabCommunity"), tabBarIcon: icon("🌸") }} />
      <Tabs.Screen name="profile" options={{ title: t("tabProfile"), tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
