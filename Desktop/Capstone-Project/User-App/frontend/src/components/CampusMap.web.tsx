import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CAMPUS_LOCATIONS } from '../constants/theme';

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color?: string;
}

interface CampusMapProps {
  locations?: MapLocation[];
  showUserLocation?: boolean;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
  selectedLocation?: MapLocation | null;
  userTrackingLocation?: { latitude: number; longitude: number } | null;
  style?: any;
  initialRegion?: any;
}

export default function CampusMap({ locations = [], style }: CampusMapProps) {
  return (
    <View style={[styles.container, style, styles.webFallback]}>
      <Ionicons name="map" size={48} color={COLORS.primary} />
      <Text style={styles.webTitle}>Campus Map</Text>
      <Text style={styles.webSubtitle}>
        {locations.length} location{locations.length !== 1 ? 's' : ''}
      </Text>
      <TouchableOpacity
        style={styles.webButton}
        onPress={() =>
          Linking.openURL(
            `https://www.google.com/maps/@${CAMPUS_LOCATIONS.center.latitude},${CAMPUS_LOCATIONS.center.longitude},17z`
          )
        }
      >
        <Ionicons name="open-outline" size={16} color={COLORS.white} />
        <Text style={styles.webButtonText}>Open in Google Maps</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  webFallback: {
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 8,
  },
  webSubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  webButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  webButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },
});
