/* eslint-disable @typescript-eslint/no-explicit-any, no-console, no-undef */
import { ref, computed, onMounted, readonly } from "vue";

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const isInstallable = ref(false);
  const isInstalled = ref(false);
  const isOnline = ref(navigator.onLine);
  const installPrompt = ref<PWAInstallPrompt | null>(null);
  const updateAvailable = ref(false);
  const swRegistration = ref<ServiceWorkerRegistration | null>(null);

  // Check if PWA is installed
  const checkIfInstalled = () => {
    // Check if running in standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    isInstalled.value = isStandalone || isInWebAppiOS;
  };

  // Install PWA
  const install = async (): Promise<boolean> => {
    if (!installPrompt.value) {
      return false;
    }

    try {
      await installPrompt.value.prompt();
      const choiceResult = await installPrompt.value.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("PWA installed successfully");
        isInstallable.value = false;
        installPrompt.value = null;
        return true;
      } else {
        console.log("PWA installation dismissed");
        return false;
      }
    } catch (error) {
      console.error("PWA installation failed:", error);
      return false;
    }
  };

  // Update PWA
  const update = async (): Promise<void> => {
    if (!swRegistration.value || !swRegistration.value.waiting) {
      return;
    }

    // Send message to waiting service worker to skip waiting
    swRegistration.value.waiting.postMessage({ type: "SKIP_WAITING" });

    // Reload the page to get the updated version
    window.location.reload();
  };

  // Register service worker
  const registerServiceWorker = async (): Promise<void> => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        swRegistration.value = registration;
        console.log("Service Worker registered successfully:", registration);

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                updateAvailable.value = true;
                console.log("New version available");
              }
            });
          }
        });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  };

  // Handle install prompt
  const handleInstallPrompt = (e: Event) => {
    e.preventDefault();
    installPrompt.value = e as any;
    isInstallable.value = true;
  };

  // Check online/offline status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };

  // Share content
  const share = async (data: ShareData): Promise<boolean> => {
    if ("share" in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error("Sharing failed:", error);
        return false;
      }
    }
    return false;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Copy to clipboard failed:", error);
      return false;
    }
  };

  // Get device info
  const getDeviceInfo = () => {
    const { userAgent, platform } = navigator;

    return {
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isMobile: /Mobi|Android/i.test(userAgent),
      isDesktop: !/Mobi|Android/i.test(userAgent),
      platform,
      userAgent,
    };
  };

  // Request notification permission
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return "denied";
  };

  // Show notification
  const showNotification = (title: string, options?: NotificationOptions): boolean => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    }
    return false;
  };

  // Get app manifest
  const getManifest = async (): Promise<WebAppManifest | null> => {
    try {
      const response = await fetch("/manifest.json");
      const manifest = await response.json();
      return manifest;
    } catch (error) {
      console.error("Failed to fetch manifest:", error);
      return null;
    }
  };

  // Check if feature is supported
  const isFeatureSupported = (feature: string): boolean => {
    const features: Record<string, () => boolean> = {
      serviceWorker: () => "serviceWorker" in navigator,
      pushNotifications: () => "PushManager" in window,
      backgroundSync: () =>
        "serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype,
      webShare: () => "share" in navigator,
      clipboard: () => "clipboard" in navigator,
      geolocation: () => "geolocation" in navigator,
      camera: () => "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices,
      offlineStorage: () => "indexedDB" in window,
      webAppManifest: () => "onbeforeinstallprompt" in window,
    };

    return features[feature]?.() || false;
  };

  // Get supported features
  const getSupportedFeatures = (): string[] => {
    const features = [
      "serviceWorker",
      "pushNotifications",
      "backgroundSync",
      "webShare",
      "clipboard",
      "geolocation",
      "camera",
      "offlineStorage",
      "webAppManifest",
    ];

    return features.filter((feature) => isFeatureSupported(feature));
  };

  // Computed properties
  const canInstall = computed(() => isInstallable.value && !isInstalled.value);
  const canUpdate = computed(() => updateAvailable.value);
  const isOffline = computed(() => !isOnline.value);

  // Initialize PWA
  const initialize = async (): Promise<void> => {
    checkIfInstalled();

    // Register service worker
    await registerServiceWorker();

    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      isInstalled.value = true;
      isInstallable.value = false;
      console.log("PWA was installed");
    });
  };

  // Cleanup
  const cleanup = (): void => {
    window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    window.removeEventListener("online", updateOnlineStatus);
    window.removeEventListener("offline", updateOnlineStatus);
  };

  // Initialize on mount
  onMounted(() => {
    initialize();
  });

  return {
    // State
    isInstallable: readonly(isInstallable),
    isInstalled: readonly(isInstalled),
    isOnline: readonly(isOnline),
    updateAvailable: readonly(updateAvailable),
    swRegistration: readonly(swRegistration),

    // Computed
    canInstall,
    canUpdate,
    isOffline,

    // Methods
    install,
    update,
    share,
    copyToClipboard,
    getDeviceInfo,
    requestNotificationPermission,
    showNotification,
    getManifest,
    isFeatureSupported,
    getSupportedFeatures,
    initialize,
    cleanup,
  };
}
