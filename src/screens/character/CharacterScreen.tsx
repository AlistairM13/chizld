import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { BodyCanvas } from '../../components/character/BodyCanvas';

export function CharacterScreen() {
  return (
    <View style={styles.container}>
      <BodyCanvas />
      {/* Zone cards and HUD bars will be added in plans 02-02 and 02-03 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
