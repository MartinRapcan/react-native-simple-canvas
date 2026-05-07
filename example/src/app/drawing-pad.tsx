import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SimpleCanvas, type SimpleCanvasRef } from "../../../src";

const COLORS = ["#000000", "#E53935", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA"];
const WIDTHS = [2, 4, 8, 14];

export default function DrawingPadScreen() {
  const canvasRef = useRef<SimpleCanvasRef>(null);
  const [savedUri, setSavedUri] = useState<string | null>(null);
  const [color, setColor] = useState(COLORS[0]!);
  const [width, setWidth] = useState(WIDTHS[1]!);

  const handleSave = async () => {
    try {
      const uri = await canvasRef.current?.capture({ format: "png", quality: 1 });
      if (uri) setSavedUri(uri);
    } catch (e) {
      console.warn("Capture failed:", e);
    }
  };

  if (savedUri) {
    return (
      <>
        <Stack.Screen options={{ title: "Saved Drawing" }} />
        <View style={styles.container}>
          <View style={styles.previewBox}>
            <Image source={{ uri: savedUri }} style={styles.flex} resizeMode="contain" />
          </View>
          <View style={styles.toolbar}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => setSavedUri(null)}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Back to Canvas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Drawing Pad" }} />
      <View style={styles.container}>
        <View style={styles.canvasBox}>
          <SimpleCanvas
            ref={canvasRef}
            strokeColor={color}
            strokeWidth={width}
            backgroundColor="#FFFFFF"
            style={styles.flex}
          />
        </View>

        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
            />
          ))}
        </View>

        <View style={styles.widthRow}>
          {WIDTHS.map((w) => (
            <TouchableOpacity
              key={w}
              onPress={() => setWidth(w)}
              style={[styles.widthBtn, width === w && styles.widthBtnActive]}
            >
              <View style={{ width: w + 6, height: w + 6, borderRadius: (w + 6) / 2, backgroundColor: color }} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.btn} onPress={() => canvasRef.current?.undo()}>
            <Text style={styles.btnText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => canvasRef.current?.redo()}>
            <Text style={styles.btnText}>Redo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => canvasRef.current?.clear()}>
            <Text style={[styles.btnText, styles.btnDangerText]}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
            <Text style={[styles.btnText, styles.btnPrimaryText]}>Save</Text>
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
    flex: 1, margin: 16, borderRadius: 16, overflow: "hidden",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  colorRow: { flexDirection: "row", justifyContent: "center", gap: 12, paddingVertical: 8 },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "transparent" },
  colorDotActive: { borderColor: "#333", borderWidth: 3 },
  widthRow: { flexDirection: "row", justifyContent: "center", gap: 10, paddingBottom: 8 },
  widthBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E8E8E8", alignItems: "center", justifyContent: "center" },
  widthBtnActive: { backgroundColor: "#D0D0D0", borderWidth: 2, borderColor: "#333" },
  toolbar: { flexDirection: "row", justifyContent: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 20 },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: "#E8E8E8" },
  btnText: { fontSize: 15, fontWeight: "600", color: "#333" },
  btnDanger: { backgroundColor: "#FFEBEE" },
  btnDangerText: { color: "#C62828" },
  btnPrimary: { backgroundColor: "#E3F2FD" },
  btnPrimaryText: { color: "#1565C0" },
  previewBox: {
    flex: 1, margin: 16, borderRadius: 16, overflow: "hidden", backgroundColor: "#FFF",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
});
