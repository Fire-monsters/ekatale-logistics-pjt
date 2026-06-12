/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import type { FarmerStackParams } from '../navigation/RootNavigator';
import { Colors, Font, Space, Layout, getCropEmoji } from '../../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectActiveDraft, updateDraft, submitListing, clearDraft } from '../store/slices/listingSlice';
import { requestCameraPermission, requestGalleryPermission } from '../utils/permissions';

type Nav = NativeStackNavigationProp<FarmerStackParams>;
type Route = RouteProp<FarmerStackParams, 'ListProducePhotos'>;

interface AIResult {
  score: number;
  diseaseFlag: boolean;
  label: string;
  colour: string;
  tip: string;
}

function gradeResult(score: number, diseaseFlag: boolean): AIResult {
  if (diseaseFlag) {
    return {
      score,
      diseaseFlag,
      label: 'Disease Detected',
      colour: Colors.error,
      tip: 'Visible signs of disease detected. Consider consulting an agronomist before listing.',
    };
  }
  if (score >= 85) {
    return { score, diseaseFlag, label: 'Excellent Quality', colour: Colors.green, tip: 'Great condition! This produce qualifies for Grade A pricing.' };
  }
  if (score >= 65) {
    return { score, diseaseFlag, label: 'Good Quality', colour: Colors.greenMid, tip: 'Good condition. Qualifies for Grade B. Remove any damaged pieces to improve grade.' };
  }
  return { score, diseaseFlag, label: 'Fair Quality', colour: Colors.warning, tip: 'Some blemishes detected. Will be graded on arrival at warehouse.' };
}

export default function ListProducePhotos() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectActiveDraft);

  const [photos, setPhotos] = useState<string[]>([]);
  const [analysing, setAnalysing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addPhoto = async (source: 'camera' | 'gallery') => {
    const perm = source === 'camera'
      ? await requestCameraPermission()
      : await requestGalleryPermission();
    if (perm !== 'granted') return;

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.75, allowsEditing: true, aspect: [4, 3] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.75, allowsEditing: true, aspect: [4, 3], allowsMultipleSelection: false });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotos(p => [...p, uri]);
      setAiResult(null); // reset AI result when new photo added
    }
  };

  const runAI = async () => {
    if (photos.length === 0) return;
    setAnalysing(true);
    // Simulate AI analysis (replace with real API call: listingApi.runAIDiagnosis)
    await new Promise<void>(r => setTimeout(r, 1800));
    const mockScore = Math.floor(Math.random() * 35) + 65; // 65–100
    const mockDisease = mockScore < 68;
    setAiResult(gradeResult(mockScore, mockDisease));
    setAnalysing(false);
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert('Add Photos', 'Please add at least one photo of your produce.');
      return;
    }
    setSubmitting(true);
    try {
      dispatch(updateDraft({ photos }));
      const result = await dispatch(
        submitListing({
          ...(draft as any),
          photos,
          farmerId: '',
          status: 'PENDING_REVIEW',
          createdAt: new Date().toISOString(),
        }),
      ).unwrap();
      dispatch(clearDraft());
      Alert.alert(
        '✅ Listing Submitted!',
        'Your produce has been listed. You\'ll be notified when a buyer responds.',
        [{ text: 'View My Listings', onPress: () => navigation.navigate('MyListings') }],
      );
    } catch (e: any) {
      Alert.alert('Submission Failed', e.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cropEmoji = draft?.commodityId ? getCropEmoji(draft.commodityId) : '🌾';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.title}>Add Photos & AI Check</Text>

      {/* Progress bar */}
      <View style={s.progress}>
        {[1, 2, 3].map(n => (
          <View key={n} style={[s.progressDot, n <= 2 && s.progressDotActive]} />
        ))}
        <Text style={s.progressText}>Step 2 of 3</Text>
      </View>

      {/* Draft summary strip */}
      {draft && (
        <View style={s.draftStrip}>
          <Text style={{ fontSize: 20 }}>{cropEmoji}</Text>
          <Text style={s.draftText}>
            {draft.quantity}{draft.unit} {draft.commodityName} · Grade {draft.grade}
          </Text>
        </View>
      )}

      {/* Photos grid */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>
          Crop Photos <Text style={{ color: Colors.error }}>*</Text>
        </Text>
        <Text style={s.sectionHint}>Clear photos improve AI grading accuracy</Text>

        <View style={s.photosGrid}>
          {photos.map((uri, i) => (
            <View key={i} style={s.photoWrap}>
              <Image source={{ uri }} style={s.photo} resizeMode="cover" />
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => setPhotos(p => p.filter((_, j) => j !== i))}
              >
                <Text style={s.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {photos.length < 4 && (
            <View style={s.addPhotoWrap}>
              <TouchableOpacity style={s.addPhotoBtn} onPress={() => addPhoto('camera')}>
                <Text style={s.addPhotoIcon}>📷</Text>
                <Text style={s.addPhotoText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.addPhotoBtn} onPress={() => addPhoto('gallery')}>
                <Text style={s.addPhotoIcon}>🖼️</Text>
                <Text style={s.addPhotoText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* AI Analysis */}
      {photos.length > 0 && !aiResult && (
        <TouchableOpacity
          style={[s.aiBtn, analysing && { opacity: 0.6 }]}
          onPress={runAI}
          disabled={analysing}
        >
          {analysing ? (
            <View style={s.aiAnalysing}>
              <ActivityIndicator color={Colors.textInverse} size="small" />
              <Text style={s.aiBtnText}>Analysing your produce...</Text>
            </View>
          ) : (
            <Text style={s.aiBtnText}>🤖 Run AI Quality Check</Text>
          )}
        </TouchableOpacity>
      )}

      {/* AI Result */}
      {aiResult && (
        <View style={[s.aiResultCard, { borderColor: aiResult.colour }]}>
          <View style={s.aiResultHeader}>
            <Text style={{ fontSize: 28 }}>
              {aiResult.diseaseFlag ? '⚠️' : aiResult.score >= 85 ? '🌟' : '✅'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.aiResultLabel, { color: aiResult.colour }]}>
                {aiResult.label}
              </Text>
              <Text style={s.aiResultScore}>AI Score: {aiResult.score}/100</Text>
            </View>
            {/* Score bar */}
            <View style={s.scoreBar}>
              <View style={[s.scoreBarFill, { width: `${aiResult.score}%`, backgroundColor: aiResult.colour }]} />
            </View>
          </View>
          <Text style={s.aiResultTip}>{aiResult.tip}</Text>
          <TouchableOpacity onPress={() => setAiResult(null)} style={s.retakeBtn}>
            <Text style={s.retakeBtnText}>Re-analyse with new photo →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tips */}
      <View style={s.tipsCard}>
        <Text style={s.tipsTitle}>📸 Photo Tips</Text>
        {[
          'Place produce in natural daylight',
          'Include the whole batch in frame',
          'Show any blemishes honestly',
        ].map(tip => (
          <Text key={tip} style={s.tip}>• {tip}</Text>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[s.nextBtn, (photos.length === 0 || submitting) && s.nextBtnDisabled]}
        onPress={handleSubmit}
        disabled={photos.length === 0 || submitting}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={s.nextBtnText}>✅ Submit Listing</Text>
        )}
      </TouchableOpacity>

      <Text style={s.skipNote}>
        Warehouse will verify grade and confirm final price on arrival.
      </Text>
    </ScrollView>
  );
}

const PHOTO_SIZE = 90;

const s = StyleSheet.create({
  scroll: {
    padding: Layout.safePadding,
    paddingTop: Space.sm,
    gap: Space.lg,
    backgroundColor: Colors.surface,
  },
  back: { alignSelf: 'flex-start', paddingVertical: Space.sm },
  backText: { fontSize: Font.size.body, color: Colors.green, fontWeight: Font.weight.medium },
  title: { fontSize: Font.size.heading, fontWeight: Font.weight.bold, color: Colors.textPrimary },

  progress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressDot: { width: 32, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB' },
  progressDotActive: { backgroundColor: Colors.green },
  progressText: { fontSize: Font.size.caption, color: Colors.textMuted, marginLeft: 4 },

  draftStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 12, borderWidth: 0.5, borderColor: Colors.greenBorder,
  },
  draftText: { fontSize: Font.size.body, fontWeight: Font.weight.semiBold, color: Colors.green },

  section: { gap: 10 },
  sectionLabel: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  sectionHint: { fontSize: Font.size.caption, color: Colors.textMuted, marginTop: -4 },

  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoWrap: {
    width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: Layout.radius.md,
    overflow: 'hidden', position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { fontSize: 10, color: '#fff', fontWeight: Font.weight.bold },
  addPhotoWrap: { flexDirection: 'row', gap: 10 },
  addPhotoBtn: {
    width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: Layout.radius.md,
    borderWidth: 2, borderColor: Colors.greenBorder, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.greenLight,
  },
  addPhotoIcon: { fontSize: 24 },
  addPhotoText: { fontSize: 11, color: Colors.green, fontWeight: Font.weight.medium },

  aiBtn: {
    backgroundColor: '#6A1B9A', borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
  },
  aiBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
  aiAnalysing: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  aiResultCard: {
    borderRadius: Layout.radius.md, borderWidth: 2,
    padding: 14, gap: 10, backgroundColor: Colors.surface,
  },
  aiResultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiResultLabel: { fontSize: Font.size.body, fontWeight: Font.weight.bold },
  aiResultScore: { fontSize: Font.size.caption, color: Colors.textMuted, marginTop: 2 },
  scoreBar: {
    width: 60, height: 6, backgroundColor: '#E5E7EB',
    borderRadius: 3, overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  aiResultTip: { fontSize: Font.size.label, color: Colors.textSecondary, lineHeight: 20 },
  retakeBtn: { alignSelf: 'flex-start' },
  retakeBtnText: { fontSize: Font.size.caption, color: Colors.info, textDecorationLine: 'underline' },

  tipsCard: {
    backgroundColor: '#FFF9C4', borderRadius: Layout.radius.md,
    padding: 14, gap: 6, borderWidth: 0.5, borderColor: '#F9A825',
  },
  tipsTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: '#795548' },
  tip: { fontSize: Font.size.caption, color: '#5D4037', lineHeight: 20 },

  nextBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },

  skipNote: { fontSize: Font.size.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});