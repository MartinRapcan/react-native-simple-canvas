import { useRef } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import {
  SimpleCanvas,
  type SimpleCanvasRef,
} from '@martinrapcan/react-native-simple-canvas';

export default function App() {
  const canvasRef = useRef<SimpleCanvasRef>(null);

  return (
    <View style={styles.container}>
      <SimpleCanvas
        ref={canvasRef}
        height={400}
        strokeColor="#000000"
        strokeWidth={3}
      />
      <View style={styles.buttons}>
        <Button title="Undo" onPress={() => canvasRef.current?.undo()} />
        <Button title="Redo" onPress={() => canvasRef.current?.redo()} />
        <Button title="Clear" onPress={() => canvasRef.current?.clear()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
});
