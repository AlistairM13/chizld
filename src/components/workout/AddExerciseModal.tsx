import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface AddExerciseModalProps {
  visible: boolean;
  zoneName: string;
  onClose: () => void;
  onAdd: (name: string, equipment?: string) => void;
}

export function AddExerciseModal({
  visible,
  zoneName,
  onClose,
  onAdd,
}: AddExerciseModalProps) {
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('');

  const handleAdd = () => {
    if (name.trim().length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAdd(name.trim(), equipment.trim() || undefined);
    setName('');
    setEquipment('');
    onClose();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setName('');
    setEquipment('');
    onClose();
  };

  const isValid = name.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <Pressable style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>NEW EXERCISE</Text>
            <Text style={styles.subtitle}>{zoneName}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Exercise name..."
              placeholderTextColor={colors.text.muted}
              autoCapitalize="words"
              autoFocus
            />

            <Text style={styles.label}>EQUIPMENT (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              value={equipment}
              onChangeText={setEquipment}
              placeholder="e.g. Barbell, Dumbbell, Cable..."
              placeholderTextColor={colors.text.muted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </Pressable>
            <Pressable
              style={[styles.addButton, !isValid && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={!isValid}
            >
              <Text style={[styles.addText, !isValid && styles.addTextDisabled]}>
                ADD
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    width: 320,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.ember[500],
    borderRadius: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.zone.cold,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ember[500],
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  form: {
    padding: 16,
  },
  label: {
    fontFamily: fonts.monoLight,
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bg.primary,
    borderWidth: 1,
    borderColor: colors.zone.cold,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.zone.cold,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.zone.cold,
  },
  cancelText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1,
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 140, 26, 0.1)',
  },
  addButtonDisabled: {
    backgroundColor: 'transparent',
  },
  addText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ember[500],
    letterSpacing: 1,
  },
  addTextDisabled: {
    color: colors.text.muted,
  },
});
