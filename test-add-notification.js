import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const config = JSON.parse(await readFile('firebase-applet-config.json', 'utf8'));
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app, config.firestoreDatabaseId);
  
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      title: "Test Delete",
      message: "Test msg",
      category: "general",
      scheduledFor: Timestamp.now(),
      status: "sent",
      createdAt: Timestamp.now(),
    });
    console.log("Created doc:", docRef.id);
    
    await deleteDoc(doc(db, 'notifications', docRef.id));
    console.log("Deleted doc:", docRef.id);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
run();
