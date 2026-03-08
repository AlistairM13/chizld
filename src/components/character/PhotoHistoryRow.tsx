import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

interface PhotoHistoryRowProps {
  photos?: string[]; // Array of photo URIs (empty for now, placeholders)
  maxSlots?: number; // Default 5
}

/**
 * Row of 5 photo thumbnail placeholders for progress photos.
 * Shows "+" for empty slots, actual photos when provided.
 */
export function PhotoHistoryRow({
  photos = [],
  maxSlots = 5,
}: PhotoHistoryRowProps) {
  // Create array of slots, filled with photo URIs or null
  const slots = Array(maxSlots)
    .fill(null)
    .map((_, i) => photos[i] || null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PROGRESS PHOTOS</Text>
      <View style={styles.row}>
        {slots.map((photoUri, index) => (
          <View key={index} style={styles.slot}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.thumbnail} />
            ) : (
              <Text style={styles.plusIcon}>+</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slot: {
    width: 48,
    height: 48,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.text.muted,
    borderStyle: 'dashed',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  plusIcon: {
    fontFamily: fonts.monoLight,
    fontSize: 16,
    color: colors.text.muted,
  },
});
