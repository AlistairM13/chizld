import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '../../constants/colors';
import { BodyCanvas } from '../../components/character/BodyCanvas';
import { ZoneCard } from '../../components/character/ZoneCard';
import { HudBarTop, HudBarBottom } from '../../components/character/HudBar';
import { useZoneStats } from '../../hooks/useZoneStats';
import { ZONE_CARD_POSITIONS } from '../../constants/layout';

export function CharacterScreen() {
  const { stats, warmCount } = useZoneStats();
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* Base canvas: hex grid, character, glows, connecting lines */}
      <BodyCanvas zones={stats} />

      {/* Zone cards overlaid on canvas (RN Views for text rendering) */}
      {stats.map((zone) => (
        <ZoneCard
          key={zone.zoneId}
          zone={zone}
          position={ZONE_CARD_POSITIONS[zone.zoneId]}
          screenWidth={width}
          screenHeight={height}
        />
      ))}

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
