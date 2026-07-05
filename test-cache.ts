import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import config from './firebase-applet-config.json';
initializeApp({ credential: applicationDefault(), projectId: config.projectId });
const db1 = getFirestore(config.firestoreDatabaseId);
const db2 = getFirestore(config.firestoreDatabaseId);
console.log(db1 === db2);
