import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const config = JSON.parse(await readFile('firebase-applet-config.json', 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);
  
  try {
    const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
    const qs = await getDocs(q);
    console.log("Total messages:", qs.size);
    qs.forEach(doc => {
      console.log(doc.id, doc.data());
    });
    process.exit(0);
  } catch (e) {
    console.error("Read Error:", e);
    process.exit(1);
  }
}
run();
