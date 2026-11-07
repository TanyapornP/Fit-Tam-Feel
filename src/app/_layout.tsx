import { IBMPlexSansThai_400Regular, IBMPlexSansThai_600SemiBold } from "@expo-google-fonts/ibm-plex-sans-thai";
import { Prompt_600SemiBold, Prompt_700Bold } from "@expo-google-fonts/prompt";
import { useFonts } from "expo-font";
import { DefaultTheme, Stack, ThemeProvider, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import AnimatedBackground from "../components/AnimatedBackground";
import { focusOnlyLayout } from "../components/FocusOnly";
import { LoadingView } from "../components/ui";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { DataProvider } from "../lib/DataContext";
import { LangProvider } from "../lib/i18n";

// บนเว็บ แต่ละหน้าใช้สีพื้นจากธีม (เทาอ่อน) ทับพื้นหลังเคลื่อนไหว → ตั้งให้โปร่งใส
const CLEAR_THEME = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "transparent" } };

/** พาไปหน้าที่ถูกต้อง: ยังไม่ล็อกอิน → login · ยังไม่ตั้งค่า → onboarding · พร้อมแล้ว → แท็บ */
function AuthGate() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const first = segments[0] as string | undefined;

  useEffect(() => {
    if (loading) return;
    if (!session) {
      if (first !== "login") router.replace("/login");
    } else if (profile && !profile.onboarding_completed) {
      if (first !== "onboarding") router.replace("/onboarding");
    } else if (profile && (first === "login" || first === "onboarding")) {
      router.replace("/");
    }
  }, [session, profile, loading, first]);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground />
      {loading ? (
        <LoadingView />
      ) : (
        // บนจอกว้าง (คอม/แท็บเล็ต) จำกัดความกว้างเป็นคอลัมน์กลางแบบมือถือ ไม่ให้ยืดเต็มจอ
        <View style={{ flex: 1, width: "100%", maxWidth: 640, alignSelf: "center" }}>
        <ThemeProvider value={CLEAR_THEME}>
          <Stack screenLayout={focusOnlyLayout} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="person/[id]" />
            <Stack.Screen name="people/[id]" />
          </Stack>
        </ThemeProvider>
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Prompt_600SemiBold,
    Prompt_700Bold,
    IBMPlexSansThai_400Regular,
    IBMPlexSansThai_600SemiBold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: "#FFF4F6" }} />;

  return (
    <LangProvider>
      <AuthProvider>
        <DataProvider>
          <AuthGate />
        </DataProvider>
      </AuthProvider>
    </LangProvider>
  );
}
