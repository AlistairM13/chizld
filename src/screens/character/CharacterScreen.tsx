import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { BodyCanvas } from '../../components/character/BodyCanvas';
import { HudBarTop, HudBarBottom } from '../../components/character/HudBar';
import { useZoneStats } from '../../hooks/useZoneStats';

export function CharacterScreen() {
  const { warmCount } = useZoneStats();

  return (
    <View style={styles.container}>
      <BodyCanvas />

      {/* Zone cards will be added in plan 02-02 */}

      {/* HUD bars - absolute positioned overlay */}
      <HudBarTop />
      <HudBarBottom activeZoneCount={warmCount} totalZones={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
