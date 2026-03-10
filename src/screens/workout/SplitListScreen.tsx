import React, { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useSplits } from '@/hooks/useSplits';
import { SplitCard } from '@/components/workout/SplitCard';
import type { RootStackParamList } from '@/navigation/types';
import type { WorkoutSplit } from '@/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Split list screen - entry point to workout splits feature.
 * Shows saved splits with navigation to create and detail screens.
 */
export function SplitListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { splits, isLoading, refetch } = useSplits();

  // Refresh splits when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCreatePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SplitCreate');
  }, [navigation]);

  const handleSplitPress = useCallback(
    (splitId: string) => {
      navigation.navigate('SplitDetail', { splitId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: WorkoutSplit }) => (
      <SplitCard split={item} onPress={() => handleSplitPress(item.id)} />
    ),
    [handleSplitPress]
  );

  const keyExtractor = useCallback((item: WorkoutSplit) => item.id, []);

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>NO SPLITS YET</Text>
        <Text style={styles.emptySubtext}>Create your first workout split</Text>
        <Pressable style={styles.emptyButton} onPress={handleCreatePress}>
          <Text style={styles.emptyButtonText}>CREATE SPLIT</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScreenBackground>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SPLITS</Text>
        <View style={styles.headerSpacer} />
        <Pressable onPress={handleCreatePress} style={styles.newButton}>
          <Text style={styles.newButtonText}>+ NEW</Text>
        </Pressable>
      </View>

      {/* Split List */}
      <FlatList
        data={splits}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  headerSpacer: {
    flex: 1,
  },
  newButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
  },
  newButtonText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ember[500],
    letterSpacing: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
  },
  emptySubtext: {
    fontFamily: fonts.monoLight,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
  },
  emptyButtonText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ember[500],
    letterSpacing: 1,
  },
});
