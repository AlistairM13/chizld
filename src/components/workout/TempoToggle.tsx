import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface TempoToggleProps {
  enabled: boolean;
  onToggle: () => void;
  isPlaying: boolean;
}

/**
 * Toggle switch for enabling/disabling voice tempo during workout.
 * Custom switch-like UI matching cyberpunk aesthetic.
 */
export function TempoToggle({ enabled, onToggle, isPlaying }: TempoToggleProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onToggle();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>VOICE TEMPO</Text>
      <Pressable
        style={[
          styles.toggle,
          enabled ? styles.toggleEnabled : styles.toggleDisabled,
          isPlaying && styles.togglePlaying,
        ]}
        onPress={handlePress}
      >
        <View
          style={[
            styles.knob,
            enabled ? styles.knobEnabled : styles.knobDisabled,
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleDisabled: {
    backgroundColor: colors.zone.cold,
  },
  toggleEnabled: {
    backgroundColor: colors.ember[500],
  },
  togglePlaying: {
    shadowColor: colors.ember[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.primary,
  },
  knobDisabled: {
    alignSelf: 'flex-start',
  },
  knobEnabled: {
    alignSelf: 'flex-end',
  },
});
