import fs from 'node:fs';
import path from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from './index.js';

let firebaseAuth;

export const getFirebaseAuth = () => {
  if (firebaseAuth) return firebaseAuth;
  if (!config.firebaseServiceAccountPath) {
    const error = new Error('Firebase Admin is not configured');
    error.statusCode = 503;
    error.code = 'FIREBASE_NOT_CONFIGURED';
    throw error;
  }

  const serviceAccountPath = path.resolve(config.firebaseServiceAccountPath);
  if (!fs.existsSync(serviceAccountPath)) {
    const error = new Error('Firebase Admin service account file was not found');
    error.statusCode = 503;
    error.code = 'FIREBASE_NOT_CONFIGURED';
    throw error;
  }

  const app = getApps()[0] || initializeApp({
    credential: cert(serviceAccountPath),
  });
  firebaseAuth = getAuth(app);
  return firebaseAuth;
};
