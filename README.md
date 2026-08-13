# @darthrapid/react-native-simple-canvas

A simple, lightweight drawing canvas for React Native with SVG-based rendering. Supports freehand drawing, undo/redo (with `canUndo` / `canRedo` gating), manual and auto-capture to image, customizable stroke styles, initial image display with runtime swapping, programmatic strokes, and full-state `snapshot` / `restore` for per-image history.

## Installation

```sh
bun add @darthrapid/react-native-simple-canvas
```

### Peer dependencies

This library requires the following peer dependencies:

```sh
bun add react-native-svg react-native-view-shot
```

## Usage

```tsx
import { useRef } from 'react';
import { View, Button } from 'react-native';
import { SimpleCanvas, type SimpleCanvasRef } from '@darthrapid/react-native-simple-canvas';

export default function App() {
  const canvasRef = useRef<SimpleCanvasRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <SimpleCanvas
        ref={canvasRef}
        height={400}
        strokeColor="#000000"
        strokeWidth={3}
      />
      <Button title="Undo" onPress={() => canvasRef.current?.undo()} />
      <Button title="Redo" onPress={() => canvasRef.current?.redo()} />
      <Button title="Clear" onPress={() => canvasRef.current?.clear()} />
    </View>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | `300` | Canvas height |
| `width` | `DimensionValue` | `"100%"` | Canvas width |
| `strokeColor` | `string` | `"#000000"` | Active stroke color |
| `strokeWidth` | `number` | `3` | Active stroke width |
| `strokeLineCap` | `"butt" \| "round" \| "square"` | `"round"` | Stroke line cap |
| `strokeLineJoin` | `"bevel" \| "miter" \| "round"` | `"round"` | Stroke line join |
| `backgroundColor` | `string` | `"#FFFFFF"` | Canvas background color |
| `captureFormat` | `"jpg" \| "png"` | `"jpg"` | Default capture format |
| `captureQuality` | `number` | `0.8` | Default capture quality (0-1) |
| `autoCapture` | `boolean` | `false` | Auto-capture after every stroke |
| `autoCaptureDelay` | `number` | `400` | Debounce ms for auto-capture |
| `onCapture` | `(uri: string) => void` | - | Called after auto-capture |
| `onStrokeStart` | `() => void` | - | Called when a stroke starts |
| `onStrokeEnd` | `(stroke: StrokeData) => void` | - | Called when a stroke ends |
| `onStrokesChange` | `(strokes: StrokeData[]) => void` | - | Called on any strokes change |
| `initialImage` | `string` | - | Image URI displayed when canvas has no strokes |
| `disabled` | `boolean` | `false` | Disable touch input |
| `style` | `StyleProp<ViewStyle>` | - | Outer wrapper style |
| `canvasStyle` | `StyleProp<ViewStyle>` | - | Inner drawing surface style |

## Ref methods

| Method | Description |
|--------|-------------|
| `capture(options?)` | Capture canvas as image. Returns a file URI. |
| `undo()` | Undo the last stroke |
| `redo()` | Redo a previously undone stroke |
| `clear()` | Clear all strokes and redo stack |
| `getStrokes()` | Get all recorded strokes |
| `setStrokes(strokes)` | Load strokes programmatically. Clears the redo stack and hides the initial image when strokes are non-empty. |
| `canUndo()` | `true` if there is at least one stroke that can be undone |
| `canRedo()` | `true` if there is at least one previously undone stroke that can be redone |
| `snapshot()` | Return the full canvas state (`{ paths, redoStack }`) for later restoration |
| `restore(snapshot)` | Replace the canvas state with a previously taken snapshot (both paths and redo stack) |

## Recipes

### Disable Undo/Redo when the stack is empty

`canUndo()` / `canRedo()` are the fastest way to gate toolbar buttons.
Trigger a re-render on stroke change so the values stay fresh:

```tsx
const canvasRef = useRef<SimpleCanvasRef>(null);
const [, setTick] = useState(0);

const canUndo = canvasRef.current?.canUndo() ?? false;
const canRedo = canvasRef.current?.canRedo() ?? false;

<SimpleCanvas
  ref={canvasRef}
  onStrokesChange={() => setTick((t) => t + 1)}
/>
<Button title="Undo" disabled={!canUndo} onPress={() => canvasRef.current?.undo()} />
<Button title="Redo" disabled={!canRedo} onPress={() => canvasRef.current?.redo()} />
```

### Per-image undo/redo history

Use `snapshot()` and `restore()` to keep an independent undo/redo stack per
background image. Swap `initialImage` and swap the canvas state in the same
tick:

```tsx
import {
  SimpleCanvas,
  type SimpleCanvasRef,
  type SimpleCanvasSnapshot,
} from '@darthrapid/react-native-simple-canvas';

const EMPTY: SimpleCanvasSnapshot = { paths: [], redoStack: [] };

const canvasRef = useRef<SimpleCanvasRef>(null);
const snapshotsRef = useRef<Record<string, SimpleCanvasSnapshot>>({});
const [activeId, setActiveId] = useState('a');

const switchImage = (nextId: string) => {
  const current = canvasRef.current?.snapshot();
  if (current) snapshotsRef.current[activeId] = current;
  setActiveId(nextId);
  canvasRef.current?.restore(snapshotsRef.current[nextId] ?? EMPTY);
};
```

## Types

All named exports are TypeScript-first:

```ts
import type {
  SimpleCanvasProps,
  SimpleCanvasRef,
  SimpleCanvasSnapshot,
  StrokeData,
  CaptureOptions,
} from '@darthrapid/react-native-simple-canvas';
```

| Type | Shape | Purpose |
|------|-------|---------|
| `SimpleCanvasProps` | Props of `<SimpleCanvas />` | Component prop typing |
| `SimpleCanvasRef` | Imperative API (`capture`, `undo`, `snapshot`, …) | Type for the ref you pass to the component |
| `SimpleCanvasSnapshot` | `{ paths: StrokeData[]; redoStack: StrokeData[] }` | Full canvas state used by `snapshot()` / `restore()` |
| `StrokeData` | `{ path: string; color: string; strokeWidth: number }` | A single recorded stroke |
| `CaptureOptions` | `{ format?: "jpg" \| "png"; quality?: number }` | Optional args for `capture()` |

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
