import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { getMyIncidents } from '../src/services/firestore';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import Card from '../src/components/Card';
import LoadingSpinner from '../src/components/LoadingSpinner';

export default function MyReportsScreen() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!firebaseUser) return;
      try {
        const data = await getMyIncidents(firebaseUser.uid);
        setReports(data);
      } catch (err) {
        console.log('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [firebaseUser]);

  if (loading) return <LoadingSpinner fullScreen message="Loading reports..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      {reports.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.gray[300]} />
          <Text style={styles.emptyText}>No incident reports yet</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Text style={styles.reportType}>{item.type || 'Incident'}</Text>
              <Text style={styles.reportDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.meta}>
                <Text style={styles.metaText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'resolved' ? COLORS.secondary : COLORS.warning }]}>
                  <Text style={styles.statusText}>{item.status || 'submitted'}</Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.gray[500], marginTop: SPACING.md },
  list: { padding: SPACING.md },
  card: { marginBottom: SPACING.sm },
  reportType: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.gray[800] },
  reportDesc: { fontSize: FONT_SIZE.sm, color: COLORS.gray[600], marginTop: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  metaText: { fontSize: FONT_SIZE.xs, color: COLORS.gray[500] },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: FONT_SIZE.xs, color: COLORS.white, fontWeight: '600' },
});
