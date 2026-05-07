import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEMOS = [
  {
    href: "/drawing-pad",
    title: "Drawing Pad",
    description:
      "Full canvas with color picker, stroke width, undo/redo, save & preview",
  },
  {
    href: "/auto-capture",
    title: "Auto Capture",
    description: "Canvas with live auto-capture preview below",
  },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Simple Canvas</Text>
          <Text style={styles.subtitle}>Examples</Text>
        </View>
        <View style={styles.cardList}>
          {DEMOS.map((demo) => (
            <TouchableOpacity
              key={demo.href}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(demo.href)}
            >
              <Text style={styles.cardTitle}>{demo.title}</Text>
              <Text style={styles.cardDescription}>{demo.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    marginTop: 4,
  },
  cardList: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
