import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const config = JSON.parse(await readFile('firebase-applet-config.json', 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app);
  
  try {
    const docRef = doc(db, 'notifications', 'some-id');
    await deleteDoc(docRef);
    console.log("Success");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
run();
