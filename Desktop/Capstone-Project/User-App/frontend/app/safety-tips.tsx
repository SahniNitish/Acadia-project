import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import Card from '../src/components/Card';

const TIPS = [
  { icon: 'moon', title: 'Walk with a Buddy', body: 'Avoid walking alone at night. Use the Friend Walk feature to share your location with trusted contacts.' },
  { icon: 'call', title: 'Save Emergency Numbers', body: 'Keep Acadia Security (902-585-1103) and 911 saved. Add your emergency contacts in the app.' },
  { icon: 'flashlight', title: 'Stay in Well-Lit Areas', body: 'Stick to well-lit paths and avoid shortcuts through dark or isolated areas on campus.' },
  { icon: 'phone-portrait', title: 'Keep Your Phone Charged', body: 'Make sure your phone is charged before heading out so you can call for help if needed.' },
  { icon: 'shield', title: 'Use Safety Escorts', body: 'Acadia Security offers free safety escorts across campus. Request one through this app anytime.' },
  { icon: 'alert-circle', title: 'Report Suspicious Activity', body: 'If you see something, say something. Use the Incident Report feature to alert campus security.' },
  { icon: 'location', title: 'Share Your Location', body: 'Let friends and family know where you are, especially when going out at night.' },
  { icon: 'lock-closed', title: 'Lock Doors & Windows', body: 'Always lock your residence room and car. Don\'t prop open exterior doors.' },
];

export default function SafetyTipsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Tips</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {TIPS.map((tip, index) => (
          <Card key={index} style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name={tip.icon as any} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipBody}>{tip.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray[800] },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  card: { marginBottom: SPACING.md, alignItems: 'center' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  tipTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.gray[800], textAlign: 'center' },
  tipBody: { fontSize: FONT_SIZE.sm, color: COLORS.gray[600], textAlign: 'center', marginTop: 4, lineHeight: 20 },
});
