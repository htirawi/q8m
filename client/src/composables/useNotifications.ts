import { ref, onMounted } from "vue";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import type {
  NotificationPermissionState,
  ForegroundNotification,
} from "@shared/types/composables";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messaging: Messaging | null = null;
let firebaseApp: ReturnType<typeof initializeApp> | null = null;

// Initialize Firebase (singleton)
function initializeFirebase() {
  if (!firebaseApp) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
      messaging = getMessaging(firebaseApp);
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }
  }
  return messaging;
}

export function useNotifications() {
  const isSupported = ref(false);
  const permissionGranted = ref(false);
  const permissionDenied = ref(false);
  const fcmToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Check if notifications are supported
  const checkSupport = () => {
    isSupported.value = "Notification" in window && "serviceWorker" in navigator;
    return isSupported.value;
  };

  // Get current permission state
  const getPermissionState = (): NotificationPermissionState => {
    if (!checkSupport()) {
      return {
        granted: false,
        denied: false,
        default: false,
        supported: false,
      };
    }

    const { permission } = Notification;

    return {
      granted: permission === "granted",
      denied: permission === "denied",
      default: permission === "default",
      supported: true,
    };
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!checkSupport()) {
      error.value = "Notifications are not supported in your browser";
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const permission = await Notification.requestPermission();
      permissionGranted.value = permission === "granted";
      permissionDenied.value = permission === "denied";

      if (permissionGranted.value) {
        // If permission granted, get FCM token
        await getMessagingToken();
      }

      return permissionGranted.value;
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      error.value = "Failed to request notification permission";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Get FCM messaging token
  const getMessagingToken = async (): Promise<string | null> => {
    if (!checkSupport() || !permissionGranted.value) {
      return null;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Register service worker
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.error("Service Worker registered:", registration);

      // Initialize Firebase Messaging
      const messagingInstance = initializeFirebase();
      if (!messagingInstance) {
        throw new Error("Failed to initialize Firebase Messaging");
      }

      // Get FCM token
      const token = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        fcmToken.value = token;
        console.error("FCM Token obtained:", token);

        // Send token to backend
        await registerTokenWithBackend(token);

        return token;
      }
      console.warn("No FCM token available");
      return null;
    } catch (err) {
      console.error("Error getting FCM token:", err);
      error.value = "Failed to get messaging token";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Register FCM token with backend
  const registerTokenWithBackend = async (token: string): Promise<void> => {
    try {
      const response = await fetch("/api/v1/notifications/register-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          platform: "web",
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register token with backend");
      }

      console.error("FCM token registered with backend");
    } catch (err) {
      console.error("Error registering token with backend:", err);
      // Don't throw - token is still valid locally
    }
  };

  // Unregister FCM token (e.g., on logout)
  const unregisterToken = async (): Promise<void> => {
    if (!fcmToken.value) return;

    try {
      await fetch("/api/v1/notifications/unregister-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token: fcmToken.value,
        }),
      });

      fcmToken.value = null;
      console.error("FCM token unregistered");
    } catch (err) {
      console.error("Error unregistering token:", err);
    }
  };

  // Listen for foreground messages
  const onForegroundMessage = (callback: (notification: ForegroundNotification) => void) => {
    const messagingInstance = initializeFirebase();
    if (!messagingInstance) return;

    onMessage(messagingInstance, (payload) => {
      console.error("Foreground message received:", payload);

      const notification: ForegroundNotification = {
        title: payload.notification?.title || "New Notification",
        body: payload.notification?.body || "",
        icon: payload.notification?.icon,
        data: payload.data,
      };

      callback(notification);

      // Show browser notification if permission granted
      if (permissionGranted.value) {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || "/logo.png",
          badge: "/badge-icon.png",
          data: notification.data,
          tag: notification.data?.tag || "default",
        });
      }
    });
  };

  // Show a local test notification
  const showTestNotification = () => {
    if (!permissionGranted.value) {
      console.warn("Notification permission not granted");
      return;
    }

    new Notification("Test Notification", {
      body: "This is a test notification from Q8M",
      icon: "/logo.png",
      badge: "/badge-icon.png",
      vibrate: [200, 100, 200],
    });
  };

  // Initialize on mount
  onMounted(() => {
    checkSupport();

    const state = getPermissionState();
    permissionGranted.value = state.granted;
    permissionDenied.value = state.denied;

    // If already granted, get token
    if (state.granted) {
      getMessagingToken();
    }
  });

  return {
    // State
    isSupported,
    permissionGranted,
    permissionDenied,
    fcmToken,
    isLoading,
    error,

    // Methods
    checkSupport,
    getPermissionState,
    requestPermission,
    getMessagingToken,
    unregisterToken,
    onForegroundMessage,
    showTestNotification,
  };
}
