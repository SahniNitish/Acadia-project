import React from 'react';
import { StyleSheet, View, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CAMPUS_LOCATIONS } from '../constants/theme';

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color?: string;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const ACADIA_REGION: Region = {
  latitude: CAMPUS_LOCATIONS.center.latitude,
  longitude: CAMPUS_LOCATIONS.center.longitude,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

interface CampusMapProps {
  locations?: MapLocation[];
  showUserLocation?: boolean;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
  selectedLocation?: MapLocation | null;
  userTrackingLocation?: { latitude: number; longitude: number } | null;
  style?: any;
  initialRegion?: Region;
}

// Web fallback — react-native-maps doesn't support web
function WebFallback({ locations = [], style }: CampusMapProps) {
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
            `https://www.google.com/maps/@${ACADIA_REGION.latitude},${ACADIA_REGION.longitude},17z`
          )
        }
      >
        <Ionicons name="open-outline" size={16} color={COLORS.white} />
        <Text style={styles.webButtonText}>Open in Google Maps</Text>
      </TouchableOpacity>
    </View>
  );
}

// Native map — lazy-loaded so the import never runs on web
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

export default function CampusMap(props: CampusMapProps) {
  if (Platform.OS === 'web' || !MapView) {
    return <WebFallback {...props} />;
  }

  const {
    locations = [],
    showUserLocation = true,
    onMapPress,
    selectedLocation,
    userTrackingLocation,
    style,
    initialRegion,
  } = props;

  const region = userTrackingLocation
    ? { ...ACADIA_REGION, latitude: userTrackingLocation.latitude, longitude: userTrackingLocation.longitude }
    : initialRegion || ACADIA_REGION;

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton
        onPress={(e: any) => onMapPress?.(e.nativeEvent.coordinate)}
      >
        {locations.map((loc: MapLocation) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.lat, longitude: loc.lng }}
            title={loc.name}
            pinColor={
              selectedLocation?.id === loc.id
                ? COLORS.accent
                : loc.color || COLORS.primary
            }
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
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
