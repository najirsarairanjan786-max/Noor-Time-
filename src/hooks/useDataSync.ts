import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useSettings } from './useSettings';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';

// Helper for deep equality to prevent infinite loops
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

export function useDataSync() {
  const { user } = useAuth();
  const { settings, setSettings } = useSettings();
  const isInitialMount = useRef(true);
  const lastIncomingData = useRef<any>(null);

  // Sync settings when user logs in
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'settings', 'default');
    
    // Create user doc if not exists
    const createUserRecord = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    };
    createUserRecord();

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteSettings = snapshot.data();
        delete remoteSettings.updatedAt; // Strip timestamp to avoid infinite loop
        
        setSettings((prev) => {
          const newMerged = { ...prev, ...remoteSettings };
          if (!deepEqual(prev, newMerged)) {
             lastIncomingData.current = newMerged;
             return newMerged;
          }
          return prev;
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/settings/default`);
    });

    return () => unsubscribe();
  }, [user, setSettings]);

  // Sync settings back to server when they change (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!user) return;
    
    // Do not sync if the change came from the server
    if (deepEqual(settings, lastIncomingData.current)) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'default');
        
        // Remove undefined values to please firestore
        const cleanSettings = JSON.parse(JSON.stringify(settings));
        cleanSettings.updatedAt = serverTimestamp();
        
        await setDoc(docRef, cleanSettings, { merge: true });
        
        // Update the last incoming to prevent re-triggering the snapshot listener if it bounces back
        const updatedLocal = { ...cleanSettings };
        delete updatedLocal.updatedAt;
        lastIncomingData.current = updatedLocal;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/settings/default`);
      }
    }, 2000); // Debounce to avoid spamming writes

    return () => clearTimeout(timeout);
  }, [settings, user]);
}
