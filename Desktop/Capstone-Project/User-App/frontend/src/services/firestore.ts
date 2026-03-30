import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

// ─── Photo Upload ─────────────────────────────────────────────────────────────

export const uploadIncidentPhoto = async (
  uid: string,
  fileUri: string,
  index: number,
): Promise<string> => {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const storageRef = ref(storage, `incidents/${uid}/${Date.now()}_${index}.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
};

export const uploadProfilePhoto = async (
  uid: string,
  fileUri: string,
): Promise<string> => {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profiles/${uid}/profile.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
};

// ─── User Profile ────────────────────────────────────────────────────────────

export const getUserProfile = async (uid: string): Promise<any | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const createUserProfile = async (uid: string, data: object): Promise<void> => {
  await setDoc(doc(db, 'users', uid), data);
};

export const updateUserProfile = async (uid: string, data: object): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data);
};

// ─── Contacts (subcollection users/{uid}/contacts) ───────────────────────────

export const getContacts = async (uid: string): Promise<any[]> => {
  const snap = await getDocs(collection(db, 'users', uid, 'contacts'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addContact = async (uid: string, data: { name: string; phone: string; relationship?: string }): Promise<string> => {
  const ref = await addDoc(collection(db, 'users', uid, 'contacts'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

export const deleteContact = async (uid: string, contactId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', uid, 'contacts', contactId));
};

// ─── SOS / Alerts ────────────────────────────────────────────────────────────

export const createSOS = async (
  uid: string,
  userProfile: any,
  lat: number,
  lng: number,
  alertType?: string,
): Promise<string> => {
  const ref = await addDoc(collection(db, 'alerts'), {
    studentName: userProfile?.fullName || '',
    studentEmail: userProfile?.email || '',
    studentPhone: userProfile?.phone || '',
    latitude: lat,
    longitude: lng,
    location: `${lat}, ${lng}`,
    alertType: alertType || 'general',
    status: 'new',
    createdAt: new Date().toISOString(),
    userId: uid,
  });
  return ref.id;
};

export const cancelSOS = async (sosDocId: string): Promise<void> => {
  await updateDoc(doc(db, 'alerts', sosDocId), { status: 'resolved' });
};

export const getActiveSOS = async (uid: string): Promise<any | null> => {
  const q = query(collection(db, 'alerts'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() as any }))
    .find(d => d.status === 'new') || null;
};

// ─── Incidents ────────────────────────────────────────────────────────────────

export const createIncident = async (
  uid: string | null,
  userProfile: any | null,
  data: {
    type: string;
    locationName?: string;
    latitude: number;
    longitude: number;
    description: string;
    anonymous: boolean;
    wantsContact: boolean;
    contactPhone?: string;
    photoUris?: string[];
  },
): Promise<string> => {
  // Upload photos to Firebase Storage first
  let photoUrls: string[] = [];
  if (data.photoUris && data.photoUris.length > 0 && uid) {
    try {
      photoUrls = await Promise.all(
        data.photoUris.map((uri, i) => uploadIncidentPhoto(uid, uri, i))
      );
    } catch (uploadErr: any) {
      const code = uploadErr?.code || '';
      const msg = uploadErr?.message || uploadErr?.toString() || '';
      console.error('[Storage upload error]', { code, msg, uploadErr });
      if (code === 'storage/unauthorized') {
        throw new Error('Photo upload blocked by Storage rules. Go to Firebase Console → Storage → Rules and allow authenticated writes.');
      }
      throw new Error(`Photo upload failed (${code || msg}).`);
    }
  }

  const docRef = await addDoc(collection(db, 'incidents'), {
    type: data.type,
    location: data.locationName || `${data.latitude}, ${data.longitude}`,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    reporterName: data.anonymous ? null : (userProfile?.fullName || null),
    reporterEmail: data.anonymous ? null : (userProfile?.email || null),
    anonymous: data.anonymous,
    wantsContact: data.wantsContact,
    contactPhone: data.contactPhone || null,
    photos: photoUrls,
    priority: 'medium',
    status: 'new',
    createdAt: new Date().toISOString(),
    userId: data.anonymous ? null : uid,
  });
  return docRef.id;
};

export const getMyIncidents = async (uid: string): Promise<any[]> => {
  const q = query(collection(db, 'incidents'), where('userId', '==', uid));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ─── Escorts ─────────────────────────────────────────────────────────────────

export const createEscort = async (
  uid: string,
  userProfile: any,
  data: {
    pickup: string;
    pickupLatitude: number;
    pickupLongitude: number;
    destination: string;
    destinationLatitude: number;
    destinationLongitude: number;
    notes?: string;
  },
): Promise<string> => {
  const ref = await addDoc(collection(db, 'escorts'), {
    studentName: userProfile?.fullName || '',
    studentPhone: userProfile?.phone || '',
    studentEmail: userProfile?.email || '',
    pickup: data.pickup,
    pickupLatitude: data.pickupLatitude,
    pickupLongitude: data.pickupLongitude,
    destination: data.destination,
    destinationLatitude: data.destinationLatitude,
    destinationLongitude: data.destinationLongitude,
    notes: data.notes || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    userId: uid,
    estimatedWait: 10,
    assignedTo: null,
    assignedToName: null,
  });
  return ref.id;
};

export const getActiveEscort = async (uid: string): Promise<any | null> => {
  const q = query(collection(db, 'escorts'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() as any }))
    .find(d => ['pending', 'in_progress'].includes(d.status)) || null;
};

export const cancelEscort = async (escortDocId: string): Promise<void> => {
  await updateDoc(doc(db, 'escorts', escortDocId), { status: 'cancelled' });
};

export const subscribeToEscort = (
  escortDocId: string,
  callback: (data: any) => void,
): (() => void) => {
  return onSnapshot(doc(db, 'escorts', escortDocId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
};

// ─── Friend Walk ─────────────────────────────────────────────────────────────

export const startFriendWalk = async (
  uid: string,
  data: {
    contactIds: string[];
    durationMinutes: number;
    currentLatitude: number;
    currentLongitude: number;
  },
): Promise<string> => {
  const now = new Date();
  const endTime = data.durationMinutes > 0
    ? new Date(now.getTime() + data.durationMinutes * 60 * 1000).toISOString()
    : null;
  const ref = await addDoc(collection(db, 'friendWalks'), {
    userId: uid,
    contactIds: data.contactIds,
    startTime: now.toISOString(),
    durationMinutes: data.durationMinutes,
    endTime,
    currentLatitude: data.currentLatitude,
    currentLongitude: data.currentLongitude,
    status: 'active',
    createdAt: now.toISOString(),
  });
  return ref.id;
};

export const getActiveFriendWalk = async (uid: string): Promise<any | null> => {
  const q = query(collection(db, 'friendWalks'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() as any }))
    .find(d => d.status === 'active') || null;
};

export const updateWalkLocation = async (walkDocId: string, lat: number, lng: number): Promise<void> => {
  await updateDoc(doc(db, 'friendWalks', walkDocId), {
    currentLatitude: lat,
    currentLongitude: lng,
  });
};

export const extendWalk = async (walkDocId: string, minutes: number, currentEndTime: number): Promise<void> => {
  const newEndTime = new Date(currentEndTime + minutes * 60 * 1000).toISOString();
  await updateDoc(doc(db, 'friendWalks', walkDocId), { endTime: newEndTime });
};

export const completeWalk = async (walkDocId: string): Promise<void> => {
  await updateDoc(doc(db, 'friendWalks', walkDocId), { status: 'completed' });
};

// ─── Shuttles ─────────────────────────────────────────────────────────────────

export const createShuttle = async (
  uid: string,
  userProfile: any,
  data: {
    pickup: string;
    pickupLatitude: number;
    pickupLongitude: number;
    destination: string;
    destinationLatitude?: number;
    destinationLongitude?: number;
    notes?: string;
  },
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'shuttles'), {
    studentName: userProfile?.fullName || '',
    studentPhone: userProfile?.phone || '',
    studentEmail: userProfile?.email || '',
    pickup: data.pickup,
    pickupLatitude: data.pickupLatitude,
    pickupLongitude: data.pickupLongitude,
    destination: data.destination,
    destinationLatitude: data.destinationLatitude || null,
    destinationLongitude: data.destinationLongitude || null,
    notes: data.notes || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    userId: uid,
    estimatedWait: 15,
    assignedTo: null,
    assignedToName: null,
  });
  return docRef.id;
};

export const getActiveShuttle = async (uid: string): Promise<any | null> => {
  const q = query(collection(db, 'shuttles'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() as any }))
    .find(d => ['pending', 'in_progress'].includes(d.status)) || null;
};

export const cancelShuttle = async (shuttleDocId: string): Promise<void> => {
  await updateDoc(doc(db, 'shuttles', shuttleDocId), { status: 'cancelled' });
};

export const subscribeToShuttle = (
  shuttleDocId: string,
  callback: (data: any) => void,
): (() => void) => {
  return onSnapshot(doc(db, 'shuttles', shuttleDocId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
};

// ─── Broadcasts (campus alerts) ──────────────────────────────────────────────

export const getBroadcasts = async (): Promise<any[]> => {
  const snap = await getDocs(collection(db, 'broadcasts'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
