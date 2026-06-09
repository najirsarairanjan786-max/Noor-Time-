import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useSettings } from './useSettings';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';

export function useDataSync() {
  const { user } = useAuth();
  const { settings, setSettings } = useSettings();

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
          createdAt: serverTimestamp(),
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
        setSettings((prev) => ({
          ...prev,
          ...remoteSettings,
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/settings/default`);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync settings back to server when they change (debounced)
  useEffect(() => {
    if (!user) return;
    
    const timeout = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'default');
        
        // Remove undefined values to please firestore
        const cleanSettings = JSON.parse(JSON.stringify(settings));
        cleanSettings.updatedAt = serverTimestamp();
        
        await setDoc(docRef, cleanSettings, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/settings/default`);
      }
    }, 2000); // Debounce to avoid spamming writes

    return () => clearTimeout(timeout);
  }, [settings, user]);
}
