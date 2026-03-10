import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { type RootStackParamList } from '@/navigation/types';
import { useSplits } from '@/hooks/useSplits';
import { type WorkoutSplit, type SplitExercise } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SplitDetail'>;

/**
 * Screen displaying split details and exercise list.
 * Allows starting a workout with the split's exercises.
 */
export function SplitDetailScreen({ route, navigation }: Props) {
  const { splitId } = route.params;
  const { splits, getSplitExercises, deleteSplit } = useSplits();

  const [split, setSplit] = useState<WorkoutSplit | null>(null);
  const [exercises, setExercises] = useState<SplitExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load split data on mount
  useEffect(() => {
    const loadSplitData = async () => {
      setIsLoading(true);

      // Find split from list
      const foundSplit = splits.find((s) => s.id === splitId) ?? null;
      setSplit(foundSplit);

      // Load exercises
      if (foundSplit) {
        const exerciseData = await getSplitExercises(splitId);
        setExercises(exerciseData);
      }

      setIsLoading(false);
    };

    loadSplitData();
  }, [splitId, splits, getSplitExercises]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  // Handle delete split
  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete Split',
      `Are you sure you want to delete "${split?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSplit(splitId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [split, splitId, deleteSplit, navigation]);

  // Handle start workout
  const handleStartWorkout = useCallback(() => {
    if (exercises.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Determine primary zone (most common in split)
    const zoneCounts = exercises.reduce(
      (acc, ex) => {
        acc[ex.primaryZone] = (acc[ex.primaryZone] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const primaryZone = Object.entries(zoneCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    // Generate session ID
    const sessionId =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    // Build tempo defaults for each exercise
    const tempoDefaults = exercises.map((e) => ({
      exerciseId: e.exerciseId,
      tempoEccentric: e.defaultTempoEccentric,
      tempoPauseBottom: e.defaultTempoPauseBottom,
      tempoConcentric: e.defaultTempoConcentric,
      tempoPauseTop: e.defaultTempoPauseTop,
    }));

    // Build defaultSets map from split exercise config
    const defaultSetsMap: Record<string, number> = {};
    exercises.forEach((e) => {
      defaultSetsMap[e.exerciseId] = e.defaultSets;
    });

    navigation.navigate('WorkoutSession', {
      sessionId,
      exercises: exercises.map((e) => e.exerciseId),
      zoneId: primaryZone,
      splitId,
      tempoDefaults,
      defaultSets: defaultSetsMap,
    });
  }, [exercises, splitId, navigation]);

  // Get unique zones
  const uniqueZones = [...new Set(exercises.map((ex) => ex.primaryZone))];

  // Render exercise item
  const renderExerciseItem = useCallback(
    ({ item }: { item: SplitExercise }) => (
      <View style={styles.exerciseRow}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.exerciseName}</Text>
          <Text style={styles.exerciseZone}>{item.primaryZone.toUpperCase()}</Text>
        </View>
        <View style={styles.exerciseConfig}>
          <Text style={styles.exerciseSetsReps}>
            {item.defaultSets}x{item.defaultReps}
          </Text>
          <Text style={styles.exerciseTempo}>
            {item.defaultTempoEccentric}-{item.defaultTempoPauseBottom}-
            {item.defaultTempoConcentric}-{item.defaultTempoPauseTop}
          </Text>
        </View>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: SplitExercise) => item.id, []);

  // Loading state
  if (isLoading) {
    return (
      <ScreenBackground>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>LOADING...</Text>
        </View>
      </ScreenBackground>
    );
  }

  // Not found state
  if (!split) {
    return (
      <ScreenBackground>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>SPLIT NOT FOUND</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{split.name.toUpperCase()}</Text>
        <View style={styles.headerSpacer} />
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>DELETE</Text>
        </Pressable>
        <Pressable
          style={[
            styles.startButton,
            exercises.length === 0 && styles.startButtonDisabled,
          ]}
          onPress={handleStartWorkout}
          disabled={exercises.length === 0}
        >
          <Text
            style={[
              styles.startButtonText,
              exercises.length === 0 && styles.startButtonTextDisabled,
            ]}
          >
            START
          </Text>
        </Pressable>
      </View>

      {/* Stats summary */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{exercises.length}</Text>
          <Text style={styles.statLabel}>EXERCISES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{uniqueZones.length}</Text>
          <Text style={styles.statLabel}>ZONES</Text>
        </View>
      </View>

      {/* Exercise list */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>EXERCISES</Text>
      </View>

      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={keyExtractor}
        style={styles.exerciseList}
        contentContainerStyle={styles.exerciseListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>NO EXERCISES IN SPLIT</Text>
          </View>
        }
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
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontFamily: fonts.mono,
    fontSize: 20,
    color: colors.ember[500],
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: 2,
    marginLeft: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
  },
  deleteText: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  startButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
    backgroundColor: colors.ember[500],
  },
  startButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: colors.zone.cold,
  },
  startButtonText: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  startButtonTextDisabled: {
    color: colors.text.muted,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ember[500],
  },
  statLabel: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.zone.cold,
  },
  listHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  listHeaderText: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.primary,
  },
  exerciseZone: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  exerciseConfig: {
    alignItems: 'flex-end',
  },
  exerciseSetsReps: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.ember[500],
    letterSpacing: 1,
  },
  exerciseTempo: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.monoLight,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 2,
  },
});
