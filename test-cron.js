import { getFirestore } from "firebase-admin/firestore";
async function test() {
  try {
    const db = getFirestore("ai-studio-something");
    await db.collection("users").get();
    console.log("Success");
  } catch (err) {
    console.error("Caught:", err);
  }
}
test();
