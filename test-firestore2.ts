import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import config from './firebase-applet-config.json';
initializeApp({ credential: applicationDefault(), projectId: config.projectId });
const db = getFirestore(config.firestoreDatabaseId);
async function run() {
  console.log("Getting users...");
  try {
    const snap = await db.collection('users').get();
    console.log("Users:", snap.size);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
