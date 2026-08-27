import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function run() {
  try {
    const config = JSON.parse(await readFile('firebase-applet-config.json', 'utf8'));
    const app = initializeApp({
      projectId: config.projectId,
    });
    
    // In admin SDK, we pass the database ID when getting firestore
    const db = getFirestore(app, config.firestoreDatabaseId);
    
    // We want to add the user to the admins collection.
    // The client uses user.email if uid doc doesn't exist.
    // Let's create a doc with ID = naziralquran786@gmail.com
    await db.collection('admins').doc('naziralquran786@gmail.com').set({
      email: 'naziralquran786@gmail.com',
      role: 'admin',
      createdAt: Date.now(),
      updatedBy: 'system'
    });
    
    console.log("Successfully added admin to database!");
    process.exit(0);
  } catch (err) {
    console.error("Error in admin script:", err);
    process.exit(1);
  }
}
run();
