import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../src/constants/theme';
import Card from '../src/components/Card';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>Acadia Safe</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>About the App</Text>
          <Text style={styles.cardBody}>
            Acadia Safe is a campus safety application designed for Acadia University students, faculty, and staff. It provides quick access to emergency services, incident reporting, safety escorts, and real-time campus alerts.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          <View style={styles.featureRow}>
            <Ionicons name="alert-circle" size={20} color={COLORS.accent} />
            <Text style={styles.featureText}>SOS Emergency Alert</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="document-text" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Incident Reporting</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="walk" size={20} color={COLORS.secondary} />
            <Text style={styles.featureText}>Safety Escorts</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="people" size={20} color={COLORS.info} />
            <Text style={styles.featureText}>Friend Walk Location Sharing</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="map" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Campus Safety Map</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          <TouchableOpacity style={styles.featureRow} onPress={() => Linking.openURL('tel:9025851103')}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Acadia Security: 902-585-1103</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.footer}>Built for Acadia University{'\n'}Capstone Project 2025-2026</Text>
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
  logoSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: FONT_SIZE.xxl, fontWeight: 'bold', color: COLORS.gray[800], marginTop: SPACING.md },
  version: { fontSize: FONT_SIZE.sm, color: COLORS.gray[500], marginTop: 4 },
  card: { marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.gray[800], marginBottom: SPACING.sm },
  cardBody: { fontSize: FONT_SIZE.sm, color: COLORS.gray[600], lineHeight: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  featureText: { fontSize: FONT_SIZE.sm, color: COLORS.gray[700], marginLeft: SPACING.sm },
  footer: { textAlign: 'center', fontSize: FONT_SIZE.xs, color: COLORS.gray[400], marginTop: SPACING.lg, lineHeight: 18 },
});
