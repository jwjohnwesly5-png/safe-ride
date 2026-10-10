const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let isFirebaseInitialized = false;

// Initialize Firebase Admin SDK if serviceAccountKey.json exists or env var is set
try {
  const keyPath = path.join(__dirname, '../serviceAccountKey.json');
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized with serviceAccountKey.json.');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized via environment variables.');
  } else {
    console.log('ℹ️  No serviceAccountKey.json found. Operating in FCM Simulation Mode (mock tokens supported).');
  }
} catch (error) {
  console.warn('⚠️ Firebase Admin SDK initialization warning:', error.message);
}

/**
 * Sends a push notification using Firebase Cloud Messaging (or simulates delivery if key is unconfigured)
 * @param {string} token - The FCM device token of the parent
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} dataPayload - Additional data payload (e.g., student_id, event_type)
 */
async function sendNotification(token, title, body, dataPayload = {}) {
  if (!token) {
    console.error('❌ No FCM token provided for notification.');
    return false;
  }

  const message = {
    notification: { title, body },
    data: dataPayload,
    token
  };

  if (isFirebaseInitialized) {
    try {
      const response = await admin.messaging().send(message);
      console.log(`🚀 FCM Live Push Delivered! Message ID: ${response}`);
      return true;
    } catch (error) {
      console.error(`❌ Error sending live FCM message: ${error.message}`);
      return false;
    }
  } else {
    console.log(`📱 [FCM Push Simulation Mode] Alert Delivered to token (${token}):`);
    console.log(`   Title: "${title}" | Body: "${body}"`);
    return true;
  }
}

module.exports = { sendNotification };

