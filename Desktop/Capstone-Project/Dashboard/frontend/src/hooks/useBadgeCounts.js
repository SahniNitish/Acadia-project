import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Subscribes to Firestore in real-time and returns pending/new counts
 * for each section that needs a sidebar badge.
 */
export function useBadgeCounts() {
  const [counts, setCounts] = useState({
    alerts: 0,
    incidents: 0,
    escorts: 0,
    shuttles: 0,
  });

  useEffect(() => {
    const unsubs = [
      onSnapshot(
        query(collection(db, 'alerts'), where('status', '==', 'new')),
        (snap) => setCounts((prev) => ({ ...prev, alerts: snap.size })),
        (err) => console.error('badge alerts error:', err)
      ),
      onSnapshot(
        query(collection(db, 'incidents'), where('status', '==', 'new')),
        (snap) => setCounts((prev) => ({ ...prev, incidents: snap.size })),
        (err) => console.error('badge incidents error:', err)
      ),
      onSnapshot(
        query(collection(db, 'escorts'), where('status', '==', 'pending')),
        (snap) => setCounts((prev) => ({ ...prev, escorts: snap.size })),
        (err) => console.error('badge escorts error:', err)
      ),
      onSnapshot(
        query(collection(db, 'shuttles'), where('status', '==', 'pending')),
        (snap) => setCounts((prev) => ({ ...prev, shuttles: snap.size })),
        (err) => console.error('badge shuttles error:', err)
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, []);

  return counts;
}
