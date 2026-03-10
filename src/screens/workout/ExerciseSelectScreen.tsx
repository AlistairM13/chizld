import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { zones } from '@/constants/zones';
import { type RootStackParamList } from '@/navigation/types';
import { useExercises, type Exercise } from '@/hooks/useExercises';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { ExerciseBottomBar } from '@/components/workout/ExerciseBottomBar';
import { AddExerciseModal } from '@/components/workout/AddExerciseModal';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseSelect'>;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function ExerciseSelectScreen({ route, navigation }: Props) {
  const { zoneId } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Get zone name for header
  const zoneName = useMemo(() => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone?.name ?? zoneId.toUpperCase();
  }, [zoneId]);

  // Fetch exercises for this zone
  const { exercises, isLoading, createExercise } = useExercises(zoneId, searchQuery);

  // Open add modal
  const handleOpenAddModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddModal(true);
  }, []);

  // Add new exercise
  const handleAddExercise = useCallback(
    async (name: string, equipment?: string) => {
      const newExercise = await createExercise(name, equipment);
      // Auto-select the newly created exercise
      setSelectedExercises((prev) => new Set(prev).add(newExercise.id));
    },
    [createExercise]
  );

  // Toggle exercise selection
  const handleToggle = useCallback((exerciseId: string) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  }, []);

  // Start workout
  const handleStart = useCallback(() => {
    const sessionId = generateId();
    navigation.navigate('WorkoutSession', {
      sessionId,
      exercises: Array.from(selectedExercises),
      zoneId: route.params.zoneId,
    });
  }, [navigation, selectedExercises, route.params.zoneId]);

  // Go back
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render exercise item
  const renderItem = useCallback(
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
        <Text style={styles.headerTitle}>{zoneName}</Text>
        <View style={styles.headerSpacer} />
        <Pressable onPress={handleOpenAddModal} style={styles.addButton}>
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isSearchFocused && styles.searchInputFocused]}
          placeholder="SEARCH EXERCISES..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Exercise List */}
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>NO EXERCISES FOUND</Text>
            </View>
          )
        }
      />

      {/* Bottom Bar */}
      <ExerciseBottomBar
        count={selectedExercises.size}
        onStart={handleStart}
        disabled={selectedExercises.size === 0}
      />

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddModal}
        zoneName={zoneName}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddExercise}
      />
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
  addButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
  },
  addIcon: {
    fontFamily: fonts.mono,
    fontSize: 20,
    color: colors.ember[500],
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.monoLight,
    fontSize: 14,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  searchInputFocused: {
    borderColor: colors.ember[500],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
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
