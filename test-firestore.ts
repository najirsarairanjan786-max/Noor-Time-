import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import config from './firebase-applet-config.json';
initializeApp({ credential: applicationDefault(), projectId: config.projectId });
const db = getFirestore(config.firestoreDatabaseId);
console.log("Firestore created!");
