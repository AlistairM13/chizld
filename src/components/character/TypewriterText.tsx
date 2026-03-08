import React, { useState, useEffect } from 'react';
import { Text, type TextStyle, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface TypewriterTextProps {
  text: string;
  delayMs?: number;
  style?: TextStyle;
  onComplete?: () => void;
}

/**
 * Animated text component that reveals characters one-by-one.
 * Creates a terminal boot / typewriter aesthetic for cyberpunk HUD.
 *
 * @param text - Full text to display
 * @param delayMs - Milliseconds between each character reveal (default: 40)
 * @param style - Text style to apply (font, color, size, etc.)
 * @param onComplete - Callback fired when animation finishes
 */
export function TypewriterText({
  text,
  delayMs = 40,
  style,
  onComplete,
}: TypewriterTextProps) {
  const [displayedChars, setDisplayedChars] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedChars(0);

    const interval = setInterval(() => {
      setDisplayedChars((prev) => {
        if (prev >= text.length) {
          clearInterval(interval);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, delayMs);

    return () => clearInterval(interval);
  }, [text, delayMs, onComplete]);

  const isAnimating = displayedChars < text.length;

  return (
    <Text style={style}>
      {text.slice(0, displayedChars)}
      {isAnimating && <Text style={styles.cursor}>_</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  cursor: {
    color: colors.ember[500],
    opacity: 0.8,
  },
});
