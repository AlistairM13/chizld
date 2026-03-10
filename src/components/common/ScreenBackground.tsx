import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { HexGrid } from '@/components/character/HexGrid';
import { colors } from '@/constants/colors';

interface ScreenBackgroundProps {
  children: React.ReactNode;
}

/**
 * Screen wrapper that provides the hex grid background pattern.
 * Use this to wrap screen content for consistent cyberpunk aesthetic.
 */
export function ScreenBackground({ children }: ScreenBackgroundProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <HexGrid width={width} height={height} />
      </Canvas>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
