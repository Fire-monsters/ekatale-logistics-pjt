// FarmerProfile.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";

import {
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  Phone,
} from "lucide-react-native";

const CROPS = [
  "Maize",
  "Beans",
  "Cassava",
  "Matooke",
  "Vegetables",
  "Fruits",
  "Sweet Potato",
];

const FarmerProfile = () => {
  const [farmSize, setFarmSize] = useState(3);

  const [selectedCrops, setSelectedCrops] = useState<string[]>([
    "Maize",
    "Beans",
  ]);

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter((item) => item !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Farmer Profile</Text>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, styles.progressActive]} />
              <View style={[styles.progressDot, styles.progressActive]} />
              <View style={styles.progressDot} />
            </View>

            <Text style={styles.stepText}>Step 2 of 3</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>

              <TextInput
                defaultValue="Amina Nakato"
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* NIN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>National ID (NIN)</Text>

              <TextInput
                defaultValue="CM92010050CXKJ"
                style={styles.input}
                placeholder="Enter NIN"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* District */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>District / Region</Text>

              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>Mukono District</Text>

                <ChevronDown size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* GPS */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Farm Location</Text>

              <TouchableOpacity style={styles.gpsButton}>
                <MapPin size={16} color="#2E7D32" />

                <Text style={styles.gpsText}>Use GPS Location</Text>

                <View style={styles.detectedBadge}>
                  <Text style={styles.detectedText}>Detected</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Farm Size */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Farm Size</Text>

              <View style={styles.farmRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setFarmSize((prev) => Math.max(1, prev - 1))
                  }
                >
                  <Minus size={18} color="#111827" />
                </TouchableOpacity>

                <View style={styles.counterValue}>
                  <Text style={styles.counterText}>{farmSize}</Text>
                </View>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setFarmSize((prev) => prev + 1)}
                >
                  <Plus size={18} color="#111827" />
                </TouchableOpacity>

                <Text style={styles.acresText}>acres</Text>
              </View>
            </View>

            {/* Crops */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Crops Grown (select all that apply)
              </Text>

              <View style={styles.chipsContainer}>
                {CROPS.map((crop) => {
                  const selected = selectedCrops.includes(crop);

                  return (
                    <TouchableOpacity
                      key={crop}
                      onPress={() => toggleCrop(crop)}
                      style={[
                        styles.chip,
                        selected && styles.selectedChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.selectedChipText,
                        ]}
                      >
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>

            {/* Help Card */}
            <View style={styles.helpCard}>
              <View style={styles.helpIcon}>
                <Phone size={14} color="#6A1B9A" />
              </View>

              <View>
                <Text style={styles.helpTitle}>Need help?</Text>

                <Text style={styles.helpText}>
                  Call field agent: 0800-100-200
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FarmerProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  progressDot: {
    width: 40,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
  },

  progressActive: {
    backgroundColor: "#2E7D32",
  },

  stepText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },

  body: {
    padding: 20,
    gap: 20,
  },

  inputGroup: {
    gap: 8,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: 14,
    color: "#111827",
  },

  gpsButton: {
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  gpsText: {
    marginLeft: 8,
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },

  detectedBadge: {
    marginLeft: "auto",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  detectedText: {
    color: "#2E7D32",
    fontSize: 10,
    fontWeight: "700",
  },

  farmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  counterValue: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  counterText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  acresText: {
    fontSize: 12,
    color: "#6B7280",
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    backgroundColor: "#FFFFFF",
  },

  selectedChip: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  chipText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "600",
  },

  selectedChipText: {
    color: "#FFFFFF",
  },

  nextButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  helpCard: {
    backgroundColor: "#F3E5F5",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9D5FF",
    justifyContent: "center",
    alignItems: "center",
  },

  helpTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6A1B9A",
  },

  helpText: {
    marginTop: 2,
    fontSize: 12,
    color: "#7E22CE",
  },
});