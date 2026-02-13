# @martinrapcan/react-native-simple-canvas

A simple, lightweight drawing canvas for React Native with SVG-based rendering. Supports freehand drawing, undo/redo, manual and auto-capture to image, customizable stroke styles, and initial image display.

## Installation

```sh
bun add @martinrapcan/react-native-simple-canvas
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
import { SimpleCanvas, type SimpleCanvasRef } from '@martinrapcan/react-native-simple-canvas';

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
| `clear()` | Clear all strokes |
| `getStrokes()` | Get all recorded strokes |
| `setStrokes(strokes)` | Load strokes programmatically |

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
