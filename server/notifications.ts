import express from 'express';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import config from '../firebase-applet-config.json';

// Initialize Firebase Admin
// Important: You must provide a valid service account key. 
// Set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable to the JSON string of your service account key.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let adminInitialized = false;

if (serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: config.projectId
      });
    }
    adminInitialized = true;
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found. Push notifications will not work.");
}

const router = express.Router();

router.post('/api/send-notification', async (req, res) => {
  if (!adminInitialized) {
    return res.status(500).json({ error: "Firebase Admin is not initialized. Please provide FIREBASE_SERVICE_ACCOUNT_KEY." });
  }

  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required." });
    }

    const db = getFirestore(config.firestoreDatabaseId);
    const notificationRef = db.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({ error: "Notification not found." });
    }

    const { title, message, category } = notificationDoc.data() || {};
    
    // 1. Fetch all tokens from users
    const usersSnapshot = await db.collection('users').get();
    const tokens: string[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const tokensSnapshot = await userDoc.ref.collection('fcmTokens').get();
      tokensSnapshot.forEach(tokenDoc => {
        if (tokenDoc.data().token) {
          tokens.push(tokenDoc.data().token);
        }
      });
    }

    if (tokens.length === 0) {
      await notificationRef.update({ status: 'sent', note: "No registered devices found, saved to history" });
      return res.status(200).json({ message: "No registered devices found, saved to history." });
    }

    // 2. Send messages via FCM
    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        category: category || "general"
      },
      tokens: [...new Set(tokens)] // Remove duplicates
    };

    const response = await getMessaging().sendEachForMulticast(payload);

    // 3. Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      console.log('Failed tokens:', failedTokens);
    }

    // Update status
    await notificationRef.update({
      status: 'sent',
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error: any) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
