// lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getMessaging, Messaging, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app: FirebaseApp | undefined
let messaging: Messaging | null = null
let messagingInitialized = false

// Initialize app immediately if in browser
if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
}

// Function to get messaging instance (lazy initialization)
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === "undefined") {
    return null
  }

  // Return cached instance if already initialized
  if (messagingInitialized) {
    return messaging
  }

  try {
    // Check if messaging is supported
    const supported = await isSupported()
    
    if (supported && app) {
      messaging = getMessaging(app)
      messagingInitialized = true
      return messaging
    }
    
    messagingInitialized = true
    return null
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error)
    messagingInitialized = true
    return null
  }
}

export { app, messaging }
export const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
