import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { zones } from '@/constants/zones';

interface ZoneFilterBarProps {
  selectedZone: string | null; // null = ALL
  onSelect: (zoneId: string | null) => void;
}

interface FilterOption {
  id: string | null;
  name: string;
}

/**
 * Horizontal scrollable zone filter pills with ALL option.
 * Selection state styled with ember highlight.
 */
export function ZoneFilterBar({ selectedZone, onSelect }: ZoneFilterBarProps) {
  // Build options array with ALL first, then all zones
  const options: FilterOption[] = [
    { id: null, name: 'ALL' },
    ...zones.map((z) => ({ id: z.id, name: z.name })),
  ];

  const handlePress = (zoneId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(zoneId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => {
          const isSelected = selectedZone === option.id;
          return (
            <Pressable
              key={option.id ?? 'all'}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}
              onPress={() => handlePress(option.id)}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                ]}
              >
                {option.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  pillSelected: {
    backgroundColor: 'rgba(255,140,26,0.1)',
    borderColor: colors.ember[500],
  },
  pillUnselected: {
    backgroundColor: colors.bg.card,
    borderColor: colors.zone.cold,
  },
  pillText: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pillTextSelected: {
    color: colors.ember[500],
  },
  pillTextUnselected: {
    color: colors.text.muted,
  },
});
