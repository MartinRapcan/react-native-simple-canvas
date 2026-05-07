import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFF" },
        headerTintColor: "#1565C0",
        headerTitleStyle: { fontWeight: "600", color: "#1A1A1A" },
        headerShadowVisible: false,
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: "#FFF" },
      }}
    />
  );
}
