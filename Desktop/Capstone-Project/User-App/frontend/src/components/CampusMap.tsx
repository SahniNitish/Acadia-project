import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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

export default function CampusMap(props: CampusMapProps) {
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
});
