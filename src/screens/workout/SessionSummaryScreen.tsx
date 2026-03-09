import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { type RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

export function SessionSummaryScreen({ route }: Props) {
  const { sessionId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>// SESSION SUMMARY</Text>
      <Text style={styles.status}>[ COMPLETE ]</Text>
      <Text style={styles.subtext}>SESSION: {sessionId.slice(0, 8)}</Text>
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
