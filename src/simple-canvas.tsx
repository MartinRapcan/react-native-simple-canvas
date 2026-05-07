import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Image,
  type GestureResponderEvent,
  PanResponder,
  type StyleProp,
  View,
  type ViewStyle,
  type DimensionValue,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { captureRef } from "react-native-view-shot";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export type StrokeData = {
  /** SVG path string */
  path: string;
  /** Stroke color */
  color: string;
  /** Stroke width */
  strokeWidth: number;
};

export type SimpleCanvasRef = {
  /** Capture canvas as image – returns a file URI (jpg/png) */
  capture: (options?: CaptureOptions) => Promise<string>;
  /** Undo the last stroke */
  undo: () => void;
  /** Redo a previously undone stroke */
  redo: () => void;
  /** Clear all strokes */
  clear: () => void;
  /** Get all recorded strokes */
  getStrokes: () => StrokeData[];
  /** Load strokes programmatically (e.g. to restore a previous drawing) */
  setStrokes: (strokes: StrokeData[]) => void;
};

export type CaptureOptions = {
  format?: "jpg" | "png";
  quality?: number;
};

export type SimpleCanvasProps = {
  /** Canvas height (default: 300) */
  height?: number;
  /** Canvas width – defaults to 100% of parent */
  width?: DimensionValue;

  // ── Stroke settings ──────────────────────
  /** Active stroke color (default: "#000000") */
  strokeColor?: string;
  /** Active stroke width (default: 3) */
  strokeWidth?: number;
  /** Stroke line cap (default: "round") */
  strokeLineCap?: "butt" | "round" | "square";
  /** Stroke line join (default: "round") */
  strokeLineJoin?: "bevel" | "miter" | "round";

  // ── Background ───────────────────────────
  /** Canvas background color (default: "#FFFFFF") */
  backgroundColor?: string;

  // ── Capture settings ─────────────────────
  /** Default capture format (default: "jpg") */
  captureFormat?: "jpg" | "png";
  /** Default capture quality 0‑1 (default: 0.8) */
  captureQuality?: number;

  // ── Auto‑save ────────────────────────────
  /** When true, `onCapture` fires after every stroke (default: false) */
  autoCapture?: boolean;
  /** Debounce ms for auto‑capture (default: 400) */
  autoCaptureDelay?: number;

  // ── Callbacks ────────────────────────────
  /** Called after auto‑capture with the file URI */
  onCapture?: (uri: string) => void;
  /** Called when a stroke starts */
  onStrokeStart?: () => void;
  /** Called when a stroke ends */
  onStrokeEnd?: (stroke: StrokeData) => void;
  /** Called whenever strokes change (draw / undo / redo / clear) */
  onStrokesChange?: (strokes: StrokeData[]) => void;

  // ── Restore ───────────────────────────────
  /** Image URI displayed when canvas has no strokes (e.g. previously saved drawing).
   *  Hidden once user draws anything or calls clear(). */
  initialImage?: string;

  /** When true, touch input is ignored (e.g. during capture) */
  disabled?: boolean;

  // ── Style ────────────────────────────────
  /** Style applied to the outer wrapper */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the inner drawing surface */
  canvasStyle?: StyleProp<ViewStyle>;
};

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────

export const SimpleCanvas = React.forwardRef<SimpleCanvasRef, SimpleCanvasProps>(
  (
    {
      height = 300,
      width = "100%",
      strokeColor = "#000000",
      strokeWidth = 3,
      strokeLineCap = "round",
      strokeLineJoin = "round",
      backgroundColor = "#FFFFFF",
      captureFormat = "jpg",
      captureQuality = 0.8,
      autoCapture = false,
      autoCaptureDelay = 400,
      onCapture,
      onStrokeStart,
      onStrokeEnd,
      onStrokesChange,
      initialImage,
      disabled = false,
      style,
      canvasStyle,
    },
    ref,
  ) => {
    // ── Refs ──────────────────────────────
    const viewRef = useRef<View | null>(null);
    const canvasOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isMountedRef = useRef(true);
    const isFirstRenderRef = useRef(true);
    const autoCaptureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentPathRef = useRef("");
    const isDrawingRef = useRef(false);

    // Keep latest props in refs so PanResponder always reads fresh values
    const strokeColorRef = useRef(strokeColor);
    const strokeWidthRef = useRef(strokeWidth);
    const disabledRef = useRef(disabled);
    strokeColorRef.current = strokeColor;
    strokeWidthRef.current = strokeWidth;
    disabledRef.current = disabled;

    // ── State ─────────────────────────────
    const [paths, setPaths] = useState<StrokeData[]>([]);
    const [, setRedoStack] = useState<StrokeData[]>([]);
    const [currentPath, setCurrentPath] = useState("");
    const [showInitialImage, setShowInitialImage] = useState(!!initialImage);

    // Notify parent on strokes change
    const pathsRef = useRef(paths);
    pathsRef.current = paths;

    useEffect(() => {
      if (isFirstRenderRef.current) {
        isFirstRenderRef.current = false;
        return;
      }

      onStrokesChange?.(paths);
      scheduleAutoCapture();
    }, [paths]);

    // Cleanup
    useEffect(() => {
      return () => {
        isMountedRef.current = false;
        if (autoCaptureTimer.current) clearTimeout(autoCaptureTimer.current);
      };
    }, []);

    // ── Capture helper ────────────────────
    const captureCanvas = useCallback(
      async (options?: CaptureOptions): Promise<string> => {
        if (!viewRef.current) throw new Error("Canvas view ref is not available");

        const uri = await captureRef(viewRef, {
          format: options?.format ?? captureFormat,
          quality: options?.quality ?? captureQuality,
        });

        return uri;
      },
      [captureFormat, captureQuality],
    );

    const scheduleAutoCapture = useCallback(() => {
      if (!autoCapture || !onCapture) return;

      if (autoCaptureTimer.current) clearTimeout(autoCaptureTimer.current);

      autoCaptureTimer.current = setTimeout(async () => {
        if (!isMountedRef.current) return;
        try {
          const uri = await captureCanvas();
          if (isMountedRef.current) onCapture(uri);
        } catch (e) {
          console.warn("[SimpleCanvas] auto-capture failed", e);
        }
      }, autoCaptureDelay);
    }, [autoCapture, autoCaptureDelay, onCapture, captureCanvas]);

    // ── Imperative API ────────────────────
    useImperativeHandle(
      ref,
      () => ({
        capture: captureCanvas,
        undo: () => {
          setPaths((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1]!;
            setRedoStack((r) => [...r, last]);
            return prev.slice(0, -1);
          });
        },
        redo: () => {
          setRedoStack((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1]!;
            setPaths((p) => [...p, last]);
            return prev.slice(0, -1);
          });
        },
        clear: () => {
          setPaths([]);
          setRedoStack([]);
          setCurrentPath("");
          currentPathRef.current = "";
          setShowInitialImage(false);
        },
        getStrokes: () => pathsRef.current,
        setStrokes: (strokes: StrokeData[]) => {
          setPaths(strokes);
          setRedoStack([]);
        },
      }),
      [captureCanvas],
    );

    // ── Path validation ─────────────────
    const isValidPath = (d: string) => {
      const trimmed = d.trimStart();
      return trimmed.length > 0 && trimmed[0] === "M";
    };

    // ── Coordinate helper ─────────────────
    const getLocalPoint = (evt: GestureResponderEvent) => {
      const { pageX, pageY } = evt.nativeEvent;
      return {
        x: pageX - canvasOffsetRef.current.x,
        y: pageY - canvasOffsetRef.current.y,
      };
    };

    const measureCanvas = useCallback(() => {
      (viewRef.current as any)?.measure(
        (_x: number, _y: number, _w: number, _h: number, pageX: number, pageY: number) => {
          if (!isMountedRef.current) return;
          canvasOffsetRef.current = { x: pageX, y: pageY };
        },
      );
    }, []);

    // ── PanResponder ──────────────────────
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabledRef.current,
        onStartShouldSetPanResponderCapture: () => !disabledRef.current,
        onMoveShouldSetPanResponder: () => !disabledRef.current,
        onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: (evt) => {
          isDrawingRef.current = true;
          onStrokeStart?.();

          const point = getLocalPoint(evt);
          const d = `M${point.x},${point.y}`;
          currentPathRef.current = d;
          setCurrentPath(d);

          measureCanvas();
        },

        onPanResponderMove: (evt) => {
          if (!isDrawingRef.current) return;
          if (!currentPathRef.current) return;
          const point = getLocalPoint(evt);

          const d = `${currentPathRef.current} L${point.x},${point.y}`;
          if (!isValidPath(d)) return;
          currentPathRef.current = d;
          setCurrentPath(d);
        },

        onPanResponderRelease: () => {
          isDrawingRef.current = false;

          const hasMovement = currentPathRef.current.includes(" L");
          if (currentPathRef.current && hasMovement && isValidPath(currentPathRef.current)) {
            const stroke: StrokeData = {
              path: currentPathRef.current,
              color: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current,
            };

            setPaths((prev) => [...prev, stroke]);
            setRedoStack([]);
            setShowInitialImage(false);

            onStrokeEnd?.(stroke);
          }

          currentPathRef.current = "";
          setCurrentPath("");
        },

        onPanResponderTerminate: () => {
          isDrawingRef.current = false;
          currentPathRef.current = "";
          setCurrentPath("");
        },
      }),
    ).current;

    // ── Render ────────────────────────────
    return (
      <View
        style={[
          {
            height,
            width,
            overflow: "hidden",
          },
          style,
        ]}
      >
        <View
          ref={viewRef as any}
          collapsable={false}
          onLayout={measureCanvas}
          style={[
            {
              flex: 1,
              backgroundColor,
            },
            canvasStyle,
          ]}
          {...panResponder.panHandlers}
        >
          {showInitialImage && (
            <Image
              source={{ uri: initialImage }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              resizeMode="contain"
            />
          )}
          <Svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {paths.map((p, i) =>
              isValidPath(p.path) ? (
                <Path
                  key={`${i}-${p.path.length}`}
                  d={p.path}
                  stroke={p.color}
                  strokeWidth={p.strokeWidth}
                  fill="none"
                  strokeLinecap={strokeLineCap}
                  strokeLinejoin={strokeLineJoin}
                />
              ) : null,
            )}
            {currentPath !== "" && isValidPath(currentPath) && (
              <Path
                d={currentPath}
                stroke={strokeColorRef.current}
                strokeWidth={strokeWidthRef.current}
                fill="none"
                strokeLinecap={strokeLineCap}
                strokeLinejoin={strokeLineJoin}
              />
            )}
          </Svg>
        </View>
      </View>
    );
  },
);

SimpleCanvas.displayName = "SimpleCanvas";