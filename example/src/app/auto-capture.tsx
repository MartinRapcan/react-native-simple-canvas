import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SimpleCanvas, type SimpleCanvasRef } from "../../../src";

export default function AutoCaptureScreen() {
  const canvasRef = useRef<SimpleCanvasRef>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const canUndo = canvasRef.current?.canUndo() ?? false;
  const canRedo = canvasRef.current?.canRedo() ?? false;

  return (
    <>
      <Stack.Screen options={{ title: "Auto Capture" }} />
      <View style={styles.container}>
        <View style={styles.canvasBox}>
          <SimpleCanvas
            ref={canvasRef}
            backgroundColor="#FFFFFF"
            strokeColor="#1E88E5"
            strokeWidth={3}
            autoCapture
            autoCaptureDelay={300}
            onCapture={(uri) => {
              setCapturedUri(uri);
            }}
            onStrokesChange={() => setTick((t) => t + 1)}
            style={styles.flex}
          />
        </View>

        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLabel}>Preview</Text>
          </View>
          <View style={styles.previewBox}>
            {capturedUri ? (
              <Image source={{ uri: capturedUri }} style={styles.flex} resizeMode="contain" />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Draw something above</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.btn, !canUndo && styles.btnDisabled]}
            disabled={!canUndo}
            onPress={() => canvasRef.current?.undo()}
          >
            <Text style={[styles.btnText, !canUndo && styles.btnDisabledText]}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, !canRedo && styles.btnDisabled]}
            disabled={!canRedo}
            onPress={() => canvasRef.current?.redo()}
          >
            <Text style={[styles.btnText, !canRedo && styles.btnDisabledText]}>Redo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={() => { canvasRef.current?.clear(); setCapturedUri(null); }}
          >
            <Text style={[styles.btnText, styles.btnDangerText]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 8 },
  flex: { flex: 1 },
  canvasBox: {
    flex: 1, marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: "hidden",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  previewSection: { marginHorizontal: 16 },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  previewLabel: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  captureCount: { fontSize: 13, color: "#888" },
  previewBox: {
    height: 180, borderRadius: 12, overflow: "hidden", backgroundColor: "#FFF",
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2,
  },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderText: { fontSize: 14, color: "#BBB" },
  toolbar: { flexDirection: "row", justifyContent: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: "#E8E8E8" },
  btnText: { fontSize: 15, fontWeight: "600", color: "#333" },
  btnDisabled: { backgroundColor: "#F0F0F0" },
  btnDisabledText: { color: "#BBB" },
  btnDanger: { backgroundColor: "#FFEBEE" },
  btnDangerText: { color: "#C62828" },
});
