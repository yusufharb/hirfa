import axios from 'axios';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

// Usually you'd put a service account JSON path here for HTTP v1
// For this example, we mock the access token part or use generic axios call
const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY || '';

export const sendPushNotification = async (fcmToken: string, title: string, body: string, data: any = {}) => {
  try {
    // This is using legacy FCM API for simplicity, 
    // HTTP v1 requires Google auth library and service account key
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: fcmToken,
        notification: { title, body },
        data
      },
      {
        headers: {
          'Authorization': \`key=\${FIREBASE_SERVER_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Push notification failed', error);
  }
};

export const sendMultiplePushNotifications = async (tokens: string[], title: string, body: string, data: any = {}) => {
  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        registration_ids: tokens,
        notification: { title, body },
        data
      },
      {
        headers: {
          'Authorization': \`key=\${FIREBASE_SERVER_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Multiple push notifications failed', error);
  }
};
