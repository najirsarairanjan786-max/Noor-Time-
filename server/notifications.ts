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
    
    // 1. Fetch all tokens from users mapping to user UIDs and document IDs
    const usersSnapshot = await db.collection('users').get();
    const userTokens: { userId: string; token: string; docId: string }[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const tokensSnapshot = await userDoc.ref.collection('fcmTokens').get();
      tokensSnapshot.forEach(tokenDoc => {
        const tokenData = tokenDoc.data();
        if (tokenData && tokenData.token) {
          userTokens.push({
            userId: userDoc.id,
            token: tokenData.token,
            docId: tokenDoc.id
          });
        }
      });
    }

    // Filter to get unique tokens (so we don't send duplicate notifications to the same device token)
    const uniqueUserTokens = Array.from(
      new Map(userTokens.map(ut => [ut.token, ut])).values()
    );

    if (uniqueUserTokens.length === 0) {
      await notificationRef.update({ 
        status: 'sent', 
        note: "No registered devices found, saved to history" 
      });
      return res.status(200).json({ 
        success: true,
        message: "No registered devices found. Notification saved to history." 
      });
    }

    const tokens = uniqueUserTokens.map(ut => ut.token);

    // 2. Send messages via FCM with background and terminated support configurations
    const payload = {
      notification: {
        title: title || "New Notification",
        body: message || "",
      },
      data: {
        category: category || "general",
        title: title || "",
        body: message || "",
      },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
          visibility: 'public',
          defaultSound: true,
          defaultVibrateTimings: true,
          defaultLightSettings: true,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        }
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'default',
          }
        }
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          body: message || "",
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          requireInteraction: true,
        }
      },
      tokens: tokens
    };

    const response = await getMessaging().sendEachForMulticast(payload);

    // 3. Clean up invalid/failed tokens from Firestore
    if (response.failureCount > 0) {
      console.log(`${response.failureCount} tokens failed to deliver.`);
      const tokensToDelete: { userId: string; docId: string }[] = [];
      
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = uniqueUserTokens[idx];
          const errorCode = resp.error?.code;
          console.warn(`Token failed with error [${errorCode}]: ${failedToken.token}`);
          
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/invalid-argument'
          ) {
            tokensToDelete.push({
              userId: failedToken.userId,
              docId: failedToken.docId
            });
          }
        }
      });
      
      if (tokensToDelete.length > 0) {
        console.log(`Cleaning up ${tokensToDelete.length} stale FCM tokens from Firestore...`);
        const batch = db.batch();
        tokensToDelete.forEach(t => {
          const tokenDocRef = db.collection('users').doc(t.userId).collection('fcmTokens').doc(t.docId);
          batch.delete(tokenDocRef);
        });
        await batch.commit();
        console.log(`FCM tokens cleanup complete.`);
      }
    }

    // Update status
    await notificationRef.update({
      status: 'sent',
      successCount: response.successCount,
      failureCount: response.failureCount
    });

    res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${response.successCount} devices!`,
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error: any) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
