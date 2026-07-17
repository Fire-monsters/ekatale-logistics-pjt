/* eslint-disable react-native/no-inline-styles */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronDown, Search, X, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FarmerStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout, getCropEmoji } from '@styles/global';
import { useAppDispatch } from '../../store/hooks';
import { startDraft, updateDraft } from '../../store/slices/listingSlice';
import { SafeScreen } from '../../components';
import { DISTRICTS_MVP } from '../../constants';
import type { ProduceUnit, ProduceGrade } from '../../types';

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
  { id: 'fruits',       label: 'Fruits',       category: 'Fruits'     },
];

const UNITS: { value: ProduceUnit; label: string; hint: string }[] = [
  { value: 'kg',    label: 'Kilograms', hint: 'kg'  },
  { value: 'tonne', label: 'Tonnes',    hint: 'ton' },
  { value: 'sack',  label: 'Sacks',     hint: 'sks' },
  { value: 'crate', label: 'Crates',    hint: 'crt' },
];

const GRADES: { value: ProduceGrade; stars: string; label: string; desc: string }[] = [
  { value: 'A', stars: '⭐⭐⭐', label: 'Grade A', desc: 'Excellent quality' },
  { value: 'B', stars: '⭐⭐',   label: 'Grade B', desc: 'Good quality'      },
  { value: 'C', stars: '⭐',     label: 'Grade C', desc: 'Fair quality'      },
];

// ─── Searchable Crop Dropdown ───────────────────────────────────────────────

interface CropDropdownProps {
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
}

function CropDropdown({ selectedId, onSelect, error }: CropDropdownProps) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState('');

  const selected = CROPS.find(c => c.id === selectedId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CROPS;
    return CROPS.filter(
      c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setQuery('');
    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <TouchableOpacity
        style={[s.dropdownTrigger, !!error && s.dropdownTriggerError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Select crop type"
      >
        {selected ? (
          <View style={s.dropdownSelected}>
            <Text style={s.dropdownEmoji}>{getCropEmoji(selected.id)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.dropdownSelectedLabel}>{selected.label}</Text>
              <Text style={s.dropdownSelectedCategory}>{selected.category}</Text>
            </View>
          </View>
        ) : (
          <Text style={s.dropdownPlaceholder}>Choose your crop type…</Text>
        )}
        <ChevronDown size={20} color={Colors.textMuted} strokeWidth={2.2} />
      </TouchableOpacity>

      {/* Modal picker */}
      <Modal visible={open} animationType="slide" transparent statusBarTranslucent>
        <View style={s.modalBackdrop}>
          <View style={s.modalSheet}>
            {/* Sheet header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Crop</Text>
              <TouchableOpacity
                onPress={() => { setOpen(false); setQuery(''); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={s.modalCloseBtn}
              >
                <X size={22} color={Colors.textMuted} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={s.searchRow}>
              <Search size={18} color={Colors.textMuted} strokeWidth={2.2} />
              <TextInput
                style={s.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search or type a crop name…"
                placeholderTextColor={Colors.textDisabled}
                autoFocus
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color={Colors.textMuted} strokeWidth={2.2} />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const isActive = item.id === selectedId;
                return (
                  <TouchableOpacity
                    style={[s.cropRow, isActive && s.cropRowActive]}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.cropRowEmoji}>{getCropEmoji(item.id)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.cropRowLabel, isActive && s.cropRowLabelActive]}>
                        {item.label}
                      </Text>
                      <Text style={s.cropRowCategory}>{item.category}</Text>
                    </View>
                    {isActive && (
                      <Check size={18} color={Colors.green} strokeWidth={2.4} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Text style={{ fontSize: Font.size.body, color: Colors.textMuted }}>
                    No crops match "{query}"
                  </Text>
                  <Text style={{ fontSize: Font.size.caption, color: Colors.textDisabled, marginTop: 4 }}>
                    Try a different spelling
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ListProduce() {
  const navigation = useNavigation<Nav>();
  const dispatch   = useAppDispatch();

  // Form state
  const [selectedCrop,        setSelectedCrop]        = useState('');
  const [quantity,            setQuantity]            = useState(100);
  const [unit,                setUnit]                = useState<ProduceUnit>('kg');
  const [askingPrice,         setAskingPrice]         = useState('');
  const [availabilityDate,    setAvailabilityDate]    = useState('');
  const [district,            setDistrict]            = useState('');
  const [grade,               setGrade]               = useState<ProduceGrade>('A');
  const [errors,              setErrors]              = useState<Record<string, string>>({});

  const adjustQty = (delta: number) => setQuantity(prev => Math.max(1, prev + delta));

  // Format typed date input: auto-inserts dashes as user types YYYY-MM-DD
  const handleDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 6) formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    setAvailabilityDate(formatted);
    setErrors(e => ({ ...e, availabilityDate: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedCrop) e.crop = 'Please select your crop type';
    if (quantity < 1)  e.qty  = 'Enter a valid quantity';
    if (askingPrice && isNaN(parseFloat(askingPrice))) {
      e.askingPrice = 'Enter a valid price (numbers only)';
    }
    if (availabilityDate && !/^\d{4}-\d{2}-\d{2}$/.test(availabilityDate)) {
      e.availabilityDate = 'Use format YYYY-MM-DD  e.g. 2026-07-15';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    dispatch(startDraft());
    dispatch(updateDraft({
      commodityId:        selectedCrop,
      commodityName:      CROPS.find(c => c.id === selectedCrop)?.label ?? selectedCrop,
      quantity,
      unit,
      grade,
      askingPricePerUnit: askingPrice ? parseFloat(askingPrice) : undefined,
      availabilityDate:   availabilityDate || undefined,
      district:           district || undefined,
    }));
    navigation.navigate('ListProducePhotos', { listingDraftId: 'new' });
  };

  const selectedCropInfo = CROPS.find(c => c.id === selectedCrop);

  return (
    <SafeScreen padded={false} backgroundColor={Colors.surface}>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.surface }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Back button with icon ── */}
        <TouchableOpacity style={GS.back} onPress={() => navigation.goBack()}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={20} color={Colors.green} strokeWidth={2.4} />
            <Text style={GS.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <Text style={GS.screenTitle}>List New Produce</Text>
        <ProgressBar step={1} />

        {/* ── 1. Crop type (searchable dropdown) ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            What are you selling? <Text style={GS.required}>*</Text>
          </Text>
          <Text style={s.sectionHint}>
            Choose from the list or search by name
          </Text>
          <CropDropdown
            selectedId={selectedCrop}
            onSelect={id => { setSelectedCrop(id); setErrors(e => ({ ...e, crop: '' })); }}
            error={errors.crop}
          />
          {errors.crop ? (
            <Text style={GS.fieldError}>⚠ {errors.crop}</Text>
          ) : null}
        </View>

        {/* ── 2. Quantity ── */}
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

        {/* ── 3. Asking Price ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Asking Price per {unit}</Text>
          <Text style={s.sectionHint}>Optional — warehouse confirms final price on arrival</Text>
          <View style={[s.priceWrap, !!errors.askingPrice && s.priceWrapError]}>
            <View style={s.priceCurrencyBadge}>
              <Text style={s.priceCurrencyText}>UGX</Text>
            </View>
            <TextInput
              style={s.priceInput}
              value={askingPrice}
              onChangeText={v => {
                setAskingPrice(v.replace(/[^0-9.]/g, ''));
                setErrors(e => ({ ...e, askingPrice: '' }));
              }}
              placeholder="e.g. 1500"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
            {askingPrice.length > 0 && (
              <Text style={s.priceUnitSuffix}>/{unit}</Text>
            )}
          </View>
          {errors.askingPrice ? (
            <Text style={GS.fieldError}>⚠ {errors.askingPrice}</Text>
          ) : askingPrice ? (
            <Text style={s.priceHintGreen}>
              UGX {parseFloat(askingPrice).toLocaleString('en-UG')}/{unit}
            </Text>
          ) : null}
        </View>

        {/* ── 4. Grade ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Quality Grade</Text>
          <Text style={s.sectionHint}>Warehouse confirms grade on arrival — choose your best estimate</Text>
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

        {/* ── 5. Availability Date ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Availability Date</Text>
          <Text style={s.sectionHint}>When will your produce be ready for collection?</Text>
          <View style={[s.dateWrap, !!errors.availabilityDate && s.priceWrapError]}>
            <Text style={s.dateIcon}>📅</Text>
            <TextInput
              style={s.dateInput}
              value={availabilityDate}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD  e.g. 2026-07-15"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="done"
            />
          </View>
          {errors.availabilityDate ? (
            <Text style={GS.fieldError}>⚠ {errors.availabilityDate}</Text>
          ) : null}
        </View>

        {/* ── 6. District (optional) ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            Collection District <Text style={s.optional}>(optional)</Text>
          </Text>
          <Text style={s.sectionHint}>Helps us match you with nearby buyers faster</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipScrollRow}>
              {(DISTRICTS_MVP as readonly string[]).map(d => (
                <TouchableOpacity
                  key={d}
                  style={[s.districtChip, district === d && s.districtChipActive]}
                  onPress={() => setDistrict(prev => prev === d ? '' : d)}
                >
                  <Text style={[s.districtChipText, district === d && s.districtChipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Summary card ── */}
        {selectedCrop && quantity > 0 && (
          <View style={s.summary}>
            <Text style={s.summaryTitle}>Your listing</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryEmoji}>{getCropEmoji(selectedCrop)}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.summaryText}>
                  {quantity} {unit} of {selectedCropInfo?.label} · Grade {grade}
                </Text>
                {askingPrice ? (
                  <Text style={s.summaryMeta}>
                    UGX {parseFloat(askingPrice).toLocaleString('en-UG')}/{unit}
                  </Text>
                ) : null}
                {availabilityDate ? (
                  <Text style={s.summaryMeta}>Ready: {availabilityDate}</Text>
                ) : null}
                {district ? (
                  <Text style={s.summaryMeta}>📍 {district}</Text>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {/* ── CTA ── */}
        <TouchableOpacity
          style={[s.nextBtn, !selectedCrop && s.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selectedCrop}
        >
          <Text style={s.nextBtnText}>Next → Add Photos &amp; AI Check</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeScreen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    padding: Layout.safePadding,
    paddingTop: Space.sm,
    gap: Space.lg,
    backgroundColor: Colors.surface,
  },

  // ── Section ──
  section: { gap: 10 },
  sectionLabel: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    marginTop: -6,
  },
  optional: {
    fontSize: Font.size.caption,
    fontWeight: Font.weight.regular,
    color: Colors.textMuted,
  },

  // ── Crop Dropdown trigger ──
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg,
    minHeight: Layout.touch.comfortable,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  dropdownTriggerError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  dropdownSelected: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownEmoji: { fontSize: 24 },
  dropdownSelectedLabel: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.semiBold,
    color: Colors.textPrimary,
  },
  dropdownSelectedCategory: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: Font.size.body,
    color: Colors.textDisabled,
  },

  // ── Crop Dropdown modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.md,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: Space.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.greenBorder,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg,
  },
  searchInput: {
    flex: 1,
    fontSize: Font.size.body,
    color: Colors.textPrimary,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  cropRowActive: { backgroundColor: Colors.greenLight },
  cropRowEmoji: { fontSize: 28 },
  cropRowLabel: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.medium,
    color: Colors.textPrimary,
  },
  cropRowLabelActive: { color: Colors.green, fontWeight: Font.weight.bold },
  cropRowCategory: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // ── Units row ──
  unitRow: { flexDirection: 'row', gap: 8 },

  // ── Quantity stepper ──
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.bg,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: Font.weight.medium,
    lineHeight: 34,
  },
  qtyInputWrap: {
    flex: 1,
    borderWidth: 2.5,
    borderColor: Colors.green,
    borderRadius: Layout.radius.md,
    height: 56,
    backgroundColor: '#FAFFFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  qtyInput: {
    fontSize: 26,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
    minWidth: 80,
  },
  qtyUnit: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: Font.weight.medium,
  },
  quickQtyRow: { flexDirection: 'row', gap: 8 },
  quickQty: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickQtyActive: { backgroundColor: Colors.greenLight, borderColor: Colors.greenBorder },
  quickQtyText: {
    fontSize: 15,
    fontWeight: Font.weight.semiBold,
    color: Colors.textMuted,
  },
  quickQtyTextActive: { color: Colors.green },

  // ── Asking price ──
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg,
    minHeight: Layout.touch.comfortable,
    overflow: 'hidden',
  },
  priceWrapError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },
  priceCurrencyBadge: {
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: Colors.greenBorder,
    minHeight: Layout.touch.comfortable,
    justifyContent: 'center',
  },
  priceCurrencyText: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.green,
  },
  priceInput: {
    flex: 1,
    fontSize: Font.size.title,
    fontWeight: Font.weight.medium,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  priceUnitSuffix: {
    fontSize: Font.size.body,
    color: Colors.textMuted,
    paddingRight: 14,
    fontWeight: Font.weight.medium,
  },
  priceHintGreen: {
    fontSize: Font.size.label,
    color: Colors.green,
    fontWeight: Font.weight.semiBold,
  },

  // ── Grade ──
  gradeRow: { flexDirection: 'row', gap: 10 },
  gradeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    gap: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg,
    minHeight: 90,
  },
  gradeCardActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  gradeStars: { fontSize: 18 },
  gradeLabel: {
    fontSize: 13,
    fontWeight: Font.weight.bold,
    color: Colors.textSecondary,
  },
  gradeLabelActive: { color: Colors.green },
  gradeDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },

  // ── Date ──
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg,
    minHeight: Layout.touch.comfortable,
    paddingHorizontal: 14,
    gap: 10,
  },
  dateIcon: { fontSize: 20 },
  dateInput: {
    flex: 1,
    fontSize: Font.size.body,
    color: Colors.textPrimary,
    paddingVertical: 14,
    letterSpacing: 0.5,
  },

  // ── District chips ──
  chipScrollRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  districtChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.radius.pill,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.bg,
    minHeight: Layout.touch.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  districtChipActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  districtChipText: {
    fontSize: 14,
    fontWeight: Font.weight.medium,
    color: Colors.textMuted,
  },
  districtChipTextActive: { color: Colors.green, fontWeight: Font.weight.semiBold },

  // ── Summary ──
  summary: {
    backgroundColor: Colors.greenLight,
    borderRadius: Layout.radius.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.greenBorder,
    gap: 8,
  },
  summaryTitle: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.green,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  summaryEmoji: { fontSize: 24, marginTop: 2 },
  summaryText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.semiBold,
    color: Colors.green,
  },
  summaryMeta: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },

  // ── CTA ──
  nextBtn: {
    backgroundColor: Colors.green,
    borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
});