import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { zones } from '@/constants/zones';
import { type RootStackParamList } from '@/navigation/types';
import { useSplits } from '@/hooks/useSplits';
import { type Exercise } from '@/hooks/useExercises';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { ZoneFilterBar } from '@/components/workout/ZoneFilterBar';
import { SplitExerciseRow } from '@/components/workout/SplitExerciseRow';

type Props = NativeStackScreenProps<RootStackParamList, 'SplitCreate'>;

interface ExerciseConfig {
  sets: number;
  reps: number;
  tempoEccentric: number;
  tempoPauseBottom: number;
  tempoConcentric: number;
  tempoPauseTop: number;
}

interface ExerciseRow {
  id: string;
  name: string;
  primary_zone: string;
  equipment: string | null;
}

/**
 * Screen for creating a new workout split.
 * Allows naming the split, selecting exercises across zones, and configuring sets/reps.
 */
export function SplitCreateScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const { createSplit } = useSplits();

  const [splitName, setSplitName] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Map<string, ExerciseConfig>>(
    new Map()
  );
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all exercises from database
  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      const rows = await db.getAllAsync<ExerciseRow>(
        `SELECT id, name, primary_zone, equipment
         FROM exercises
         ORDER BY primary_zone, name`
      );
      const processed: Exercise[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        primaryZone: row.primary_zone,
        equipment: row.equipment,
      }));
      setAllExercises(processed);
      setIsLoading(false);
    };
    fetchExercises();
  }, [db]);

  // Filter exercises by selected zone
  const filteredExercises = useMemo(() => {
    if (selectedZone === null) {
      return allExercises;
    }
    return allExercises.filter((ex) => ex.primaryZone === selectedZone);
  }, [allExercises, selectedZone]);

  // Get selected exercise details for the config section
  const selectedExerciseDetails = useMemo(() => {
    return Array.from(selectedExercises.entries()).map(([id, config]) => {
      const exercise = allExercises.find((ex) => ex.id === id);
      return {
        id,
        name: exercise?.name ?? 'Unknown',
        zoneName: exercise?.primaryZone ?? '',
        ...config,
      };
    });
  }, [selectedExercises, allExercises]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  // Toggle exercise selection
  const handleToggle = useCallback((exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercises((prev) => {
      const next = new Map(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.set(exerciseId, {
          sets: 3,
          reps: 10,
          tempoEccentric: 2,
          tempoPauseBottom: 0,
          tempoConcentric: 1,
          tempoPauseTop: 0,
        });
      }
      return next;
    });
  }, []);

  // Update sets for an exercise
  const handleSetsChange = useCallback((exerciseId: string, sets: number) => {
    setSelectedExercises((prev) => {
      const next = new Map(prev);
      const current = next.get(exerciseId);
      if (current) {
        next.set(exerciseId, { ...current, sets });
      }
      return next;
    });
  }, []);

  // Update reps for an exercise
  const handleRepsChange = useCallback((exerciseId: string, reps: number) => {
    setSelectedExercises((prev) => {
      const next = new Map(prev);
      const current = next.get(exerciseId);
      if (current) {
        next.set(exerciseId, { ...current, reps });
      }
      return next;
    });
  }, []);

  // Update tempo for an exercise
  const handleTempoChange = useCallback(
    (
      exerciseId: string,
      tempo: {
        eccentric: number;
        pauseBottom: number;
        concentric: number;
        pauseTop: number;
      }
    ) => {
      setSelectedExercises((prev) => {
        const next = new Map(prev);
        const current = next.get(exerciseId);
        if (current) {
          next.set(exerciseId, {
            ...current,
            tempoEccentric: tempo.eccentric,
            tempoPauseBottom: tempo.pauseBottom,
            tempoConcentric: tempo.concentric,
            tempoPauseTop: tempo.pauseTop,
          });
        }
        return next;
      });
    },
    []
  );

  // Remove exercise from selection
  const handleRemove = useCallback((exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercises((prev) => {
      const next = new Map(prev);
      next.delete(exerciseId);
      return next;
    });
  }, []);

  // Save the split
  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const exercises = Array.from(selectedExercises.entries()).map(([id, config]) => ({
        exerciseId: id,
        sets: config.sets,
        reps: config.reps,
        tempoEccentric: config.tempoEccentric,
        tempoPauseBottom: config.tempoPauseBottom,
        tempoConcentric: config.tempoConcentric,
        tempoPauseTop: config.tempoPauseTop,
      }));

      await createSplit(splitName, exercises);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create split:', error);
      setIsSaving(false);
    }
  }, [splitName, selectedExercises, createSplit, navigation, isSaving]);

  // Check if save is enabled
  const canSave = splitName.trim().length > 0 && selectedExercises.size > 0 && !isSaving;

  // Render exercise item
  const renderExerciseItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseCard
        exercise={item}
        isSelected={selectedExercises.has(item.id)}
        onToggle={() => handleToggle(item.id)}
      />
    ),
    [selectedExercises, handleToggle]
  );

  const keyExtractor = useCallback((item: Exercise) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>NEW SPLIT</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Split Name Input */}
      <View style={styles.nameSection}>
        <Text style={styles.nameLabel}>SPLIT NAME</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="e.g., Push Day, Pull Day..."
          placeholderTextColor={colors.text.muted}
          value={splitName}
          onChangeText={setSplitName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>

      {/* Zone Filter */}
      <ZoneFilterBar selectedZone={selectedZone} onSelect={setSelectedZone} />

      {/* Main content area - split into two sections */}
      <View style={styles.mainContent}>
        {/* Exercise List */}
        <View style={styles.exerciseListSection}>
          <Text style={styles.sectionLabel}>
            {selectedZone
              ? zones.find((z) => z.id === selectedZone)?.name ?? 'EXERCISES'
              : 'ALL EXERCISES'}
          </Text>
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={keyExtractor}
            style={styles.exerciseList}
            contentContainerStyle={styles.exerciseListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              isLoading ? null : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>NO EXERCISES</Text>
                </View>
              )
            }
          />
        </View>

        {/* Selected Exercises Section */}
        {selectedExercises.size > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionLabel}>
              SELECTED ({selectedExercises.size})
            </Text>
            <ScrollView
              style={styles.selectedList}
              contentContainerStyle={styles.selectedListContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedExerciseDetails.map((item) => (
                <SplitExerciseRow
                  key={item.id}
                  exerciseName={item.name}
                  zoneName={item.zoneName}
                  sets={item.sets}
                  reps={item.reps}
                  tempo={{
                    eccentric: item.tempoEccentric,
                    pauseBottom: item.tempoPauseBottom,
                    concentric: item.tempoConcentric,
                    pauseTop: item.tempoPauseTop,
                  }}
                  onSetsChange={(value) => handleSetsChange(item.id, value)}
                  onRepsChange={(value) => handleRepsChange(item.id, value)}
                  onTempoChange={(tempo) => handleTempoChange(item.id, tempo)}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom Save Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={[styles.saveButtonText, !canSave && styles.saveButtonTextDisabled]}>
            {isSaving ? 'SAVING...' : 'SAVE SPLIT'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
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
  nameSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  nameLabel: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  nameInput: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.primary,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  exerciseListSection: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.zone.cold,
  },
  sectionLabel: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  selectedSection: {
    flex: 1,
  },
  selectedList: {
    flex: 1,
  },
  selectedListContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bottomBar: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.zone.cold,
    backgroundColor: colors.bg.primary,
  },
  saveButton: {
    backgroundColor: colors.ember[500],
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
  },
  saveButtonText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.bg.primary,
    letterSpacing: 2,
  },
  saveButtonTextDisabled: {
    color: colors.text.muted,
  },
});
