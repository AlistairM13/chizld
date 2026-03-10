import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

export function SleepDashboardScreen() {
  return (
    <ScreenBackground>
      <View style={styles.content}>
        <Text style={styles.label}>// SLEEP MODULE</Text>
        <Text style={styles.status}>[ LOCKED ]</Text>
        <Text style={styles.subtext}>COMING SOON</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  status: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ember[500],
    letterSpacing: 4,
  },
  subtext: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.secondary,
    letterSpacing: 3,
  },
});
