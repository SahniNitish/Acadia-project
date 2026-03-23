import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../src/constants/theme';
import CampusMap from '../../src/components/CampusMap';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOCATION_TYPES = [
  { id: 'all',              label: 'All',      icon: 'apps',     color: COLORS.primary,   bg: '#ebf8ff' },
  { id: 'emergency_phone',  label: 'Phones',   icon: 'call',     color: COLORS.info,      bg: '#e6fffa' },
  { id: 'aed',              label: 'AEDs',     icon: 'heart',    color: '#e53e3e',        bg: '#fff5f5' },
  { id: 'safe_building',    label: 'Safe',     icon: 'business', color: COLORS.secondary, bg: '#f0fff4' },
  { id: 'security_office',  label: 'Security', icon: 'shield',   color: COLORS.primary,   bg: '#ebf8ff' },
  { id: 'parking',          label: 'Parking',  icon: 'car',      color: '#718096',        bg: '#f7fafc' },
];

const MOCK_LOCATIONS = [
  { id: '1',  name: 'Acadia Security Office',  description: 'Main campus security headquarters. Open 24/7.',              location_type: 'security_office', lat: 45.0875, lng: -64.3665 },
  { id: '2',  name: 'BAC Emergency Phone',     description: 'Emergency phone outside Beveridge Arts Centre',              location_type: 'emergency_phone', lat: 45.088,  lng: -64.367  },
  { id: '3',  name: 'Library Emergency Phone', description: 'Emergency phone at main library entrance',                   location_type: 'emergency_phone', lat: 45.087,  lng: -64.366  },
  { id: '4',  name: 'SUB Emergency Phone',     description: 'Emergency phone at Student Union Building',                  location_type: 'emergency_phone', lat: 45.0885, lng: -64.3675 },
  { id: '5',  name: 'Patterson Hall AED',      description: 'AED located in main lobby of Patterson Hall',                location_type: 'aed',             lat: 45.0865, lng: -64.3655 },
  { id: '6',  name: 'Library AED',             description: 'AED located at library front desk',                          location_type: 'aed',             lat: 45.0871, lng: -64.3661 },
  { id: '7',  name: 'Athletic Centre AED',     description: 'AED located at athletic centre entrance',                    location_type: 'aed',             lat: 45.086,  lng: -64.368  },
  { id: '8',  name: 'Library',                 description: 'Vaughan Memorial Library — 24/7 access during exams',        location_type: 'safe_building',   lat: 45.087,  lng: -64.366  },
  { id: '9',  name: 'Student Union Building',  description: 'SUB — Open until midnight daily',                            location_type: 'safe_building',   lat: 45.0885, lng: -64.3675 },
  { id: '10', name: 'KC Irving Centre',        description: 'Environmental Science Centre — Card access after hours',     location_type: 'safe_building',   lat: 45.0878, lng: -64.3668 },
  { id: '11', name: 'Main Parking Lot',        description: 'Main campus parking — Well lit, security patrols',          location_type: 'parking',         lat: 45.0882, lng: -64.3658 },
  { id: '12', name: 'Residence Parking',       description: 'Residence parking lot — Permit required',                   location_type: 'parking',         lat: 45.0868, lng: -64.3672 },
];

export default function MapScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    } catch {
      // Location unavailable — silently skip
    }
  };

  const filteredLocations = selectedFilter === 'all'
    ? MOCK_LOCATIONS
    : MOCK_LOCATIONS.filter(loc => loc.location_type === selectedFilter);

  const getTypeConfig = (type: string) =>
    LOCATION_TYPES.find(t => t.id === type) ?? LOCATION_TYPES[0];

  const calculateDistance = (lat: number, lng: number) => {
    if (!userLocation) return null;
    const R = 6371000;
    const dLat = (lat - userLocation.latitude) * Math.PI / 180;
    const dLon = (lng - userLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(userLocation.latitude * Math.PI / 180) *
      Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)} km`;
  };

  const openInMaps = (location: any) => {
    const url = Platform.select({
      ios:     `maps://app?daddr=${location.lat},${location.lng}`,
      android: `google.navigation:q=${location.lat},${location.lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <LinearGradient colors={['#0d1b2a', '#1b263b']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Campus Map</Text>
              <Text style={styles.headerSub}>Acadia University safety resources</Text>
            </View>
            {userLocation && (
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={12} color={COLORS.secondary} />
                <Text style={styles.locationBadgeText}>Live</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Filter chips ── */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {LOCATION_TYPES.map((type) => {
            const active = selectedFilter === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.chip, active && { backgroundColor: type.color, borderColor: type.color }]}
                onPress={() => { setSelectedFilter(type.id); setSelectedLocation(null); }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={type.icon as any}
                  size={14}
                  color={active ? COLORS.white : type.color}
                />
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {type.label}
                </Text>
                {type.id !== 'all' && (
                  <View style={[styles.chipCount, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : type.bg }]}>
                    <Text style={[styles.chipCountText, { color: active ? COLORS.white : type.color }]}>
                      {MOCK_LOCATIONS.filter(l => l.location_type === type.id).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <CampusMap
          style={{ height: Math.round(SCREEN_HEIGHT * 0.32) }}
          locations={filteredLocations.map(loc => ({
            id:    loc.id,
            lat:   loc.lat,
            lng:   loc.lng,
            name:  loc.name,
            color: getTypeConfig(loc.location_type).color,
          }))}
          selectedLocation={
            selectedLocation
              ? { id: selectedLocation.id, lat: selectedLocation.lat, lng: selectedLocation.lng, name: selectedLocation.name }
              : null
          }
          showUserLocation
        />
        {/* map overlay: count badge */}
        <View style={styles.mapBadge}>
          <Ionicons name="location" size={12} color={COLORS.white} />
          <Text style={styles.mapBadgeText}>{filteredLocations.length} shown</Text>
        </View>
      </View>

      {/* ── Location list ── */}
      <View style={styles.listWrapper}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {selectedFilter === 'all'
              ? 'All Locations'
              : `${LOCATION_TYPES.find(t => t.id === selectedFilter)?.label ?? ''} (${filteredLocations.length})`}
          </Text>
          {selectedLocation && (
            <TouchableOpacity onPress={() => setSelectedLocation(null)}>
              <Text style={styles.clearText}>Clear selection</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredLocations.map((location) => {
            const config  = getTypeConfig(location.location_type);
            const active  = selectedLocation?.id === location.id;
            const dist    = calculateDistance(location.lat, location.lng);

            return (
              <TouchableOpacity
                key={location.id}
                onPress={() => setSelectedLocation(active ? null : location)}
                activeOpacity={0.75}
              >
                <View style={[styles.card, active && styles.cardActive]}>
                  {/* left colour bar */}
                  <View style={[styles.cardBar, { backgroundColor: config.color }]} />

                  {/* icon */}
                  <View style={[styles.cardIcon, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon as any} size={18} color={config.color} />
                  </View>

                  {/* text */}
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardName} numberOfLines={1}>{location.name}</Text>
                      {dist && (
                        <View style={styles.distBadge}>
                          <Text style={styles.distText}>{dist}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={active ? undefined : 1}>
                      {location.description}
                    </Text>

                    {active && (
                      <TouchableOpacity
                        style={[styles.directionsBtn, { backgroundColor: config.color }]}
                        onPress={() => openInMaps(location)}
                      >
                        <Ionicons name="navigate" size={14} color={COLORS.white} />
                        <Text style={styles.directionsBtnText}>Get Directions</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* expand chevron */}
                  <Ionicons
                    name={active ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={COLORS.gray[400]}
                    style={styles.chevron}
                  />
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredLocations.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={40} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>No locations in this category</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },

  /* Header */
  header: {
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  headerSub: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56,161,105,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  locationBadgeText: {
    fontSize: FONT_SIZE.tiny,
    color: COLORS.secondary,
    fontWeight: FONT_WEIGHT.semibold,
  },

  /* Filter chips */
  filtersWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: COLORS.white,
    gap: 5,
    ...SHADOWS.sm,
  },
  chipLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[600],
    fontWeight: FONT_WEIGHT.medium,
  },
  chipLabelActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  chipCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    alignItems: 'center',
  },
  chipCountText: {
    fontSize: FONT_SIZE.tiny,
    fontWeight: FONT_WEIGHT.bold,
  },

  /* Map */
  mapContainer: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  mapBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,27,42,0.75)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  mapBadgeText: {
    fontSize: FONT_SIZE.tiny,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.medium,
  },

  /* List */
  listWrapper: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  listTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[700],
  },
  clearText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  /* Cards */
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  cardBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.md,
    marginRight: 0,
  },
  cardBody: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cardName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[800],
    marginRight: SPACING.sm,
  },
  distBadge: {
    backgroundColor: '#ebf8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  distText: {
    fontSize: FONT_SIZE.tiny,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  cardDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[500],
    lineHeight: 18,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
    gap: 5,
  },
  directionsBtnText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  chevron: {
    padding: SPACING.md,
    paddingLeft: 0,
    alignSelf: 'center',
  },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[400],
  },
});
