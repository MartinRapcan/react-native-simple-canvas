import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  SimpleCanvas,
  type SimpleCanvasRef,
  type SimpleCanvasSnapshot,
  type StrokeData,
} from "../../../src";

// Two placeholder background images swapped at runtime to demonstrate
// per-image state via snapshot() / restore().
const IMAGE_A = "https://placehold.co/600x400/ffcdd2/c62828?text=IMAGE+A";
const IMAGE_B = "https://placehold.co/600x400/bbdefb/1565c0?text=IMAGE+B";

const SAMPLE_STROKES: StrokeData[] = [
  { path: "M40,40 L260,220", color: "#1E88E5", strokeWidth: 4 },
  { path: "M260,40 L40,220", color: "#E53935", strokeWidth: 4 },
  { path: "M40,130 L260,130", color: "#43A047", strokeWidth: 4 },
];

const EMPTY_SNAPSHOT: SimpleCanvasSnapshot = { paths: [], redoStack: [] };

export default function AdvancedScreen() {
  const canvasRef = useRef<SimpleCanvasRef>(null);

  const [starts, setStarts] = useState(0);
  const [ends, setEnds] = useState(0);
  const [lastStrokeColor, setLastStrokeColor] = useState<string | null>(null);

  // Re-render tick so `canUndo()` / `canRedo()` reads reflect current state.
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  const [imageA, setImageA] = useState(true);
  const [showImage, setShowImage] = useState(true);

  // Per-image canvas state (paths + redo stack). Swapping the image saves
  // the current snapshot and restores the target's snapshot, so undo/redo
  // history is preserved independently for A and B.
  const snapshotsRef = useRef<{ A: SimpleCanvasSnapshot; B: SimpleCanvasSnapshot }>({
    A: EMPTY_SNAPSHOT,
    B: EMPTY_SNAPSHOT,
  });

  const canUndo = canvasRef.current?.canUndo() ?? false;
  const canRedo = canvasRef.current?.canRedo() ?? false;

  const handleSwapImage = () => {
    const current: "A" | "B" = imageA ? "A" : "B";
    const target: "A" | "B" = imageA ? "B" : "A";

    const currentSnap = canvasRef.current?.snapshot();
    if (currentSnap) snapshotsRef.current[current] = currentSnap;

    setImageA((v) => !v);
    setShowImage(true);
    canvasRef.current?.restore(snapshotsRef.current[target]);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Advanced Features" }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.header}>What this demo shows</Text>
        <Text style={styles.hint}>
          • Live stroke callbacks — `onStrokeStart` / `onStrokeEnd` fire on every stroke.{"\n"}
          • Per-image undo/redo history — swap the background image and each side keeps its own strokes and undo stack via `snapshot()` / `restore()`.{"\n"}
          • Programmatic strokes — `setStrokes()` loads paths and automatically hides the initial image.{"\n"}
          • `canUndo()` / `canRedo()` — drive disabled state on toolbar buttons.{"\n"}
          • Off-canvas drawing — strokes extend past the edge and get clipped by the wrapper.
        </Text>

        <View style={styles.canvasBox}>
          <SimpleCanvas
            ref={canvasRef}
            strokeColor="#000000"
            strokeWidth={3}
            backgroundColor="#FFFFFF"
            initialImage={showImage ? (imageA ? IMAGE_A : IMAGE_B) : undefined}
            onStrokeStart={() => {
              setStarts((n) => n + 1);
            }}
            onStrokeEnd={(stroke) => {
              setEnds((n) => n + 1);
              setLastStrokeColor(stroke.color);
            }}
            onStrokesChange={() => {
              rerender();
            }}
            style={styles.flex}
          />
        </View>

        <View style={styles.statusCard}>
          <StatusRow label="onStrokeStart calls" value={String(starts)} />
          <StatusRow label="onStrokeEnd calls" value={String(ends)} />
          <StatusRow label="Last stroke color" value={lastStrokeColor ?? "—"} />
          <StatusRow label="canUndo()" value={canUndo ? "true" : "false"} />
          <StatusRow label="canRedo()" value={canRedo ? "true" : "false"} />
          <StatusRow label="Active initial image" value={showImage ? (imageA ? "A" : "B") : "none"} />
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.btn} onPress={handleSwapImage}>
            <Text style={styles.btnText}>Swap image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => {
              canvasRef.current?.setStrokes(SAMPLE_STROKES);
            }}
          >
            <Text style={[styles.btnText, styles.btnPrimaryText]}>Load strokes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.btn, !canUndo && styles.btnDisabled]}
            disabled={!canUndo}
            onPress={() => {
              canvasRef.current?.undo();
            }}
          >
            <Text style={[styles.btnText, !canUndo && styles.btnDisabledText]}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, !canRedo && styles.btnDisabled]}
            disabled={!canRedo}
            onPress={() => {
              canvasRef.current?.redo();
            }}
          >
            <Text style={[styles.btnText, !canRedo && styles.btnDisabledText]}>Redo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={() => {
              canvasRef.current?.clear();
              snapshotsRef.current = { A: EMPTY_SNAPSHOT, B: EMPTY_SNAPSHOT };
              setStarts(0);
              setEnds(0);
              setLastStrokeColor(null);
            }}
          >
            <Text style={[styles.btnText, styles.btnDangerText]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  flex: { flex: 1 },
  header: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  hint: { fontSize: 13, lineHeight: 20, color: "#555" },
  canvasBox: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  statusRow: { flexDirection: "row", justifyContent: "space-between" },
  statusLabel: { fontSize: 13, color: "#666" },
  statusValue: { fontSize: 13, fontWeight: "600", color: "#1A1A1A" },
  toolbar: { flexDirection: "row", justifyContent: "center", gap: 10 },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
  },
  btnText: { fontSize: 15, fontWeight: "600", color: "#333" },
  btnDisabled: { backgroundColor: "#F0F0F0" },
  btnDisabledText: { color: "#BBB" },
  btnPrimary: { backgroundColor: "#E3F2FD" },
  btnPrimaryText: { color: "#1565C0" },
  btnDanger: { backgroundColor: "#FFEBEE" },
  btnDangerText: { color: "#C62828" },
});
