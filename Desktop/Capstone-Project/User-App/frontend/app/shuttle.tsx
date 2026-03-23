import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../src/context/AuthContext';
import { createShuttle, getActiveShuttle, cancelShuttle, subscribeToShuttle } from '../src/services/firestore';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import Button from '../src/components/Button';
import Card from '../src/components/Card';

type ShuttleState = 'form' | 'waiting' | 'assigned';

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

export default function ShuttleScreen() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const [state, setState] = useState<ShuttleState>('form');
  const [loading, setLoading] = useState(false);
  const [shuttleId, setShuttleId] = useState('');

  // Form state
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupName, setPickupName] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notes, setNotes] = useState('');
  const searchTimeout = useRef<any>(null);

  // Waiting/Assigned state
  const [driver, setDriver] = useState<any>(null);
  const [eta, setEta] = useState(15);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    getLocation();
    checkActiveRequest();
    return () => {
      unsubscribeRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (state === 'waiting' && shuttleId) {
      unsubscribeRef.current?.();
      unsubscribeRef.current = subscribeToShuttle(shuttleId, (data) => {
        if (data.status === 'in_progress') {
          setDriver({ name: data.assignedToName || 'Driver' });
          setEta(data.estimatedWait || 10);
          setState('assigned');
        }
      });
    } else if (state !== 'waiting') {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    }
  }, [state, shuttleId]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setPickupLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        // Reverse geocode to get a friendly name
        const [addr] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (addr) {
          const name = [addr.name, addr.street].filter(Boolean).join(', ') || 'Current Location';
          setPickupName(name);
        }
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const checkActiveRequest = async () => {
    if (!firebaseUser) return;
    try {
      const shuttle = await getActiveShuttle(firebaseUser.uid);
      if (shuttle) {
        setShuttleId(shuttle.id);
        if (shuttle.status === 'in_progress') {
          setDriver({ name: shuttle.assignedToName || 'Driver' });
          setEta(shuttle.estimatedWait || 10);
          setState('assigned');
        } else {
          setState('waiting');
        }
      }
    } catch (error) {
      console.log('Error checking active request:', error);
    }
  };

  const searchAddress = async (text: string) => {
    setDestinationText(text);
    setDestinationCoords(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=ca`,
          { headers: { 'User-Agent': 'AcadiaSafe/1.0 (campus safety app)' } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.log('Address search error:', error);
      }
    }, 500);
  };

  const selectSuggestion = (item: NominatimResult) => {
    setDestinationText(item.display_name);
    setDestinationCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!destinationText.trim()) {
      Alert.alert('Required', 'Please enter your destination');
      return;
    }
    if (!firebaseUser) return;

    setLoading(true);
    try {
      const docId = await createShuttle(firebaseUser.uid, user, {
        pickup: pickupName || 'Acadia University Campus',
        pickupLatitude: pickupLocation?.lat || 45.0875,
        pickupLongitude: pickupLocation?.lng || -64.3665,
        destination: destinationText,
        destinationLatitude: destinationCoords?.lat,
        destinationLongitude: destinationCoords?.lng,
        notes: notes || undefined,
      });
      setShuttleId(docId);
      setState('waiting');
    } catch (error) {
      Alert.alert('Error', 'Failed to book shuttle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Shuttle',
      'Are you sure you want to cancel this shuttle request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelShuttle(shuttleId);
              unsubscribeRef.current?.();
              unsubscribeRef.current = null;
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel request');
            }
          },
        },
      ]
    );
  };

  // Waiting Screen
  if (state === 'waiting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shuttle Booking</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.waitingContent}>
          <View style={styles.waitingAnimation}>
            <Ionicons name="bus" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.waitingTitle}>Booking Confirmed!</Text>
          <Text style={styles.waitingSubtitle}>Looking for an available driver...</Text>
          <Card style={styles.etaCard}>
            <Text style={styles.etaLabel}>Estimated Wait</Text>
            <Text style={styles.etaValue}>~{eta} minutes</Text>
          </Card>
          <Button title="Cancel Request" variant="outline" onPress={handleCancel} fullWidth style={styles.cancelButton} />
        </View>
      </SafeAreaView>
    );
  }

  // Assigned Screen
  if (state === 'assigned') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shuttle Booking</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.assignedContent}>
          <View style={styles.driverAvatar}>
            <Ionicons name="bus" size={48} color={COLORS.white} />
          </View>
          <Text style={styles.driverName}>{driver?.name || 'Driver'} is on the way</Text>
          <Text style={styles.assignedSubtitle}>Your shuttle is heading to your pickup location</Text>
          <Card style={styles.etaCard}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={styles.etaLabel}>Arriving in</Text>
            <Text style={styles.etaValue}>~{eta} minutes</Text>
          </Card>
          <Button title="Cancel Request" variant="outline" onPress={handleCancel} fullWidth style={styles.cancelButton} />
        </View>
      </SafeAreaView>
    );
  }

  // Form Screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book a Shuttle</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.description}>
            Book a shuttle from Acadia University to any destination. A driver will pick you up from your current location.
          </Text>

          {/* Pickup */}
          <View style={styles.field}>
            <Text style={styles.label}>Pickup Location</Text>
            <TouchableOpacity style={styles.locationButton}>
              <Ionicons name="location" size={20} color={COLORS.secondary} />
              <Text style={styles.locationButtonText}>
                {pickupName || (pickupLocation ? 'Current Location' : 'Getting location...')}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>

          {/* Destination with autocomplete */}
          <View style={styles.field}>
            <Text style={styles.label}>Destination *</Text>
            <TextInput
              style={styles.input}
              placeholder="Type address or place name..."
              value={destinationText}
              onChangeText={searchAddress}
              placeholderTextColor={COLORS.gray[400]}
              autoCorrect={false}
            />
            {destinationCoords && (
              <View style={styles.addressConfirmed}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                <Text style={styles.addressConfirmedText}>Address confirmed</Text>
              </View>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(item)}
                  >
                    <Ionicons name="location-outline" size={16} color={COLORS.gray[500]} />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Additional Notes (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g., I have luggage, wheelchair needed, etc."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={COLORS.gray[400]}
            />
          </View>

          <Card style={styles.infoCard}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Estimated Wait Time</Text>
              <Text style={styles.infoValue}>~15 minutes</Text>
            </View>
          </Card>

          <Card style={styles.noteCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.info} />
            <Text style={styles.noteText}>
              Shuttle service operates 7am–10pm daily. For late-night travel, please use the Safety Escort service.
            </Text>
          </Card>

          <Button title="Book Shuttle" onPress={handleSubmit} loading={loading} fullWidth style={styles.submitButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
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
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  description: { fontSize: FONT_SIZE.md, color: COLORS.gray[600], marginBottom: SPACING.lg, lineHeight: 22 },
  field: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray[700], marginBottom: SPACING.xs },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
  },
  locationButtonText: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.secondary, marginLeft: SPACING.sm, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[800],
    minHeight: 48,
  },
  addressConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  addressConfirmedText: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, marginLeft: 4 },
  suggestionsContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
    ...SHADOWS.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  suggestionText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[700],
    marginLeft: SPACING.sm,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[800],
    minHeight: 80,
  },
  infoCard: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  infoTextContainer: { marginLeft: SPACING.md },
  infoTitle: { fontSize: FONT_SIZE.sm, color: COLORS.gray[500] },
  infoValue: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.primary },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', marginTop: SPACING.sm, backgroundColor: '#ebf8ff' },
  noteText: { flex: 1, fontSize: FONT_SIZE.xs, color: COLORS.gray[600], marginLeft: SPACING.sm, lineHeight: 18 },
  submitButton: { marginTop: SPACING.xl },
  waitingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  waitingAnimation: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  waitingTitle: { fontSize: FONT_SIZE.xxl, fontWeight: 'bold', color: COLORS.gray[800] },
  waitingSubtitle: { fontSize: FONT_SIZE.md, color: COLORS.gray[600], marginTop: SPACING.xs },
  etaCard: { alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.lg },
  etaLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray[500], marginTop: SPACING.sm },
  etaValue: { fontSize: FONT_SIZE.xxl, fontWeight: 'bold', color: COLORS.primary, marginTop: SPACING.xs },
  cancelButton: { marginTop: SPACING.md },
  assignedContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  driverAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  driverName: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.gray[800], textAlign: 'center' },
  assignedSubtitle: { fontSize: FONT_SIZE.md, color: COLORS.gray[600], marginTop: SPACING.xs, textAlign: 'center' },
});
