import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);

async function test() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Success");
  } catch(e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
test();
