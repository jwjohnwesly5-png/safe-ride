const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You will need to download the serviceAccountKey.json from Firebase Console
// and place it in the same directory, or provide it via environment variables.
try {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized.');
} catch (error) {
  console.warn('Warning: serviceAccountKey.json not found. Firebase Admin is not initialized properly.', error.message);
}

/**
 * Sends a push notification using Firebase Cloud Messaging
 * @param {string} token - The FCM device token of the parent
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} dataPayload - Additional data payload (e.g., student_id, event_type)
 */
async function sendNotification(token, title, body, dataPayload = {}) {
  if (!token) {
    console.error('No FCM token provided.');
    return false;
  }

  const message = {
    notification: {
      title,
      body
    },
    data: dataPayload,
    token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`Successfully sent FCM message: ${response}`);
    return true;
  } catch (error) {
    console.error(`Error sending FCM message: ${error}`);
    return false;
  }
}

module.exports = { sendNotification };
