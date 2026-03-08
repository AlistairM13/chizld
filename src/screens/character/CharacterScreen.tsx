import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

export function CharacterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>// CHARACTER MODULE</Text>
      <Text style={styles.status}>[ LOADING ]</Text>
      <Text style={styles.subtext}>INITIALIZING...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
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
