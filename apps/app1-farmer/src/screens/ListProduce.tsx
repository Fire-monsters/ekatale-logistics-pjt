/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FarmerStackParams } from '../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout, getCropEmoji } from '@styles/global';
import { useAppDispatch } from '../store/hooks';
import { startDraft, updateDraft } from '../store/slices/listingSlice';
import type { ProduceUnit, ProduceGrade } from '../types';

type Nav = NativeStackNavigationProp<FarmerStackParams>;

const CROPS = [
  { id: 'maize',        label: 'Maize',        category: 'Grains'     },
  { id: 'beans',        label: 'Beans',        category: 'Legumes'    },
  { id: 'cassava',      label: 'Cassava',      category: 'Roots'      },
  { id: 'matooke',      label: 'Matooke',      category: 'Fruits'     },
  { id: 'sweet_potato', label: 'Sweet Potato', category: 'Roots'      },
  { id: 'groundnuts',   label: 'Groundnuts',   category: 'Legumes'    },
  { id: 'sorghum',      label: 'Sorghum',      category: 'Grains'     },
  { id: 'vegetables',   label: 'Vegetables',   category: 'Vegetables' },
  { id: 'tomatoes',     label: 'Tomatoes',     category: 'Vegetables' },
  { id: 'coffee',       label: 'Coffee',       category: 'Cash Crops' },
];

const UNITS: { value: ProduceUnit; label: string; hint: string }[] = [
  { value: 'kg',    label: 'Kilograms', hint: 'kg'   },
  { value: 'tonne', label: 'Tonnes',    hint: 'ton'  },
  { value: 'sack',  label: 'Sacks',     hint: 'sks'  },
  { value: 'crate', label: 'Crates',    hint: 'crt'  },
];

const GRADES: { value: ProduceGrade; stars: string; label: string; desc: string }[] = [
  { value: 'A', stars: '⭐⭐⭐', label: 'Grade A', desc: 'Excellent quality' },
  { value: 'B', stars: '⭐⭐',   label: 'Grade B', desc: 'Good quality'      },
  { value: 'C', stars: '⭐',     label: 'Grade C', desc: 'Fair quality'      },
];

function ProgressBar({ step }: { step: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {[1, 2, 3].map(n => (
        <View key={n} style={[GS.progressDot, step >= n && GS.progressDotActive]} />
      ))}
      <Text style={GS.progressText}>Step 1 of 3</Text>
    </View>
  );
}

export default function ListProduce() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();

  const [selectedCrop, setSelectedCrop] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState<ProduceUnit>('kg');
  const [grade, setGrade] = useState<ProduceGrade>('A');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const adjustQty = (delta: number) =>
    setQuantity(prev => Math.max(1, prev + delta));

  const handleNext = () => {
    const e: Record<string, string> = {};
    if (!selectedCrop) e.crop = 'Please select your crop type';
    if (quantity < 1) e.qty = 'Enter a valid quantity';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    dispatch(startDraft());
    dispatch(updateDraft({
      commodityId: selectedCrop,
      commodityName: CROPS.find(c => c.id === selectedCrop)?.label ?? selectedCrop,
      quantity,
      unit,
      grade,
      availabilityDate: new Date().toISOString().split('T')[0],
    }));
    navigation.navigate('ListProducePhotos', { listingDraftId: 'new' });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <TouchableOpacity style={GS.back} onPress={() => navigation.goBack()}>
        <Text style={GS.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={GS.screenTitle}>List New Produce</Text>
      <ProgressBar step={1} />

      {/* 1. Crop type */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>
          What are you selling? <Text style={GS.required}>*</Text>
        </Text>
        <View style={s.cropsGrid}>
          {CROPS.map(c => {
            const active = selectedCrop === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[s.cropTile, active && s.cropTileActive]}
                onPress={() => { setSelectedCrop(c.id); setErrors(e => ({...e, crop: ''})); }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={s.cropEmoji}>{getCropEmoji(c.id)}</Text>
                <Text style={[s.cropLabel, active && s.cropLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.crop ? <Text style={GS.fieldError}>⚠ {errors.crop}</Text> : null}
      </View>

      {/* 2. Quantity */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>
          How much do you have? <Text style={GS.required}>*</Text>
        </Text>

        {/* Unit selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.unitRow}>
            {UNITS.map(u => (
              <TouchableOpacity
                key={u.value}
                style={[GS.chipSquare, unit === u.value && GS.chipSquareActive]}
                onPress={() => setUnit(u.value)}
              >
                <Text style={[GS.chipSquareText, unit === u.value && GS.chipSquareTextActive]}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Quantity stepper */}
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => adjustQty(-50)}>
            <Text style={s.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <View style={s.qtyInputWrap}>
            <TextInput
              style={s.qtyInput}
              value={String(quantity)}
              onChangeText={v => setQuantity(parseInt(v.replace(/\D/g, ''), 10) || 0)}
              keyboardType="number-pad"
              textAlign="center"
            />
            <Text style={s.qtyUnit}>{unit}</Text>
          </View>
          <TouchableOpacity style={s.qtyBtn} onPress={() => adjustQty(50)}>
            <Text style={s.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Quick amounts */}
        <View style={s.quickQtyRow}>
          {[50, 100, 200, 500].map(q => (
            <TouchableOpacity
              key={q}
              style={[s.quickQty, quantity === q && s.quickQtyActive]}
              onPress={() => setQuantity(q)}
            >
              <Text style={[s.quickQtyText, quantity === q && s.quickQtyTextActive]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.qty ? <Text style={GS.fieldError}>⚠ {errors.qty}</Text> : null}
      </View>

      {/* 3. Grade */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>Quality Grade</Text>
        <Text style={GS.fieldHint}>Warehouse will confirm grade on arrival — choose your best guess</Text>
        <View style={s.gradeRow}>
          {GRADES.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[s.gradeCard, grade === g.value && s.gradeCardActive]}
              onPress={() => setGrade(g.value)}
            >
              <Text style={s.gradeStars}>{g.stars}</Text>
              <Text style={[s.gradeLabel, grade === g.value && s.gradeLabelActive]}>
                {g.label}
              </Text>
              <Text style={s.gradeDesc}>{g.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary */}
      {selectedCrop && quantity > 0 && (
        <View style={s.summary}>
          <Text style={s.summaryTitle}>Your listing</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryEmoji}>{getCropEmoji(selectedCrop)}</Text>
            <Text style={s.summaryText}>
              {quantity}{unit} of {CROPS.find(c => c.id === selectedCrop)?.label} · Grade {grade}
            </Text>
          </View>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity
        style={[s.nextBtn, !selectedCrop && s.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!selectedCrop}
      >
        <Text style={s.nextBtnText}>Next → Add Photos & AI Check</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    padding: Layout.safePadding,
    paddingTop: Space.sm,
    gap: Space.lg,
    backgroundColor: Colors.surface,
  },
  section: { gap: 12 },
  sectionLabel: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  // Crops grid
  cropsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cropTile: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: Layout.radius.pill, borderWidth: 2, borderColor: Colors.greenBorder,
    backgroundColor: Colors.bg, minHeight: Layout.touch.minimum,
  },
  cropTileActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  cropEmoji: { fontSize: 22 },
  cropLabel: { fontSize: 14, fontWeight: Font.weight.semiBold, color: Colors.textSecondary },
  cropLabelActive: { color: Colors.textInverse },

  // Units row (horizontal scroll container)
  unitRow: { flexDirection: 'row', gap: 8 },

  // Quantity stepper
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: Colors.bg, borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 28, color: Colors.textPrimary, fontWeight: Font.weight.medium, lineHeight: 34 },
  qtyInputWrap: {
    flex: 1, borderWidth: 2.5, borderColor: Colors.green, borderRadius: Layout.radius.md,
    height: 56, backgroundColor: '#FAFFFE',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  qtyInput: { fontSize: 26, fontWeight: Font.weight.bold, color: Colors.textPrimary, minWidth: 80 },
  qtyUnit: { fontSize: 16, color: Colors.textMuted, fontWeight: Font.weight.medium },

  quickQtyRow: { flexDirection: 'row', gap: 8 },
  quickQty: {
    flex: 1, paddingVertical: 10, borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickQtyActive: { backgroundColor: Colors.greenLight, borderColor: Colors.greenBorder },
  quickQtyText: { fontSize: 15, fontWeight: Font.weight.semiBold, color: Colors.textMuted },
  quickQtyTextActive: { color: Colors.green },

  // Grade
  gradeRow: { flexDirection: 'row', gap: 10 },
  gradeCard: {
    flex: 1, alignItems: 'center', padding: 14, gap: 4,
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg, minHeight: 90,
  },
  gradeCardActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  gradeStars: { fontSize: 18 },
  gradeLabel: { fontSize: 13, fontWeight: Font.weight.bold, color: Colors.textSecondary },
  gradeLabelActive: { color: Colors.green },
  gradeDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },

  // Summary
  summary: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 14, borderWidth: 0.5, borderColor: Colors.greenBorder, gap: 8,
  },
  summaryTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.green },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryEmoji: { fontSize: 24 },
  summaryText: { fontSize: Font.size.body, fontWeight: Font.weight.medium, color: Colors.green },

  nextBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
});
