/**
 * PWA Composable Types
 */

export interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface WebAppManifest {
  name: string;
  short_name: string;
  description?: string;
  icons: Array<{ src: string; sizes: string; type: string }>;
  theme_color?: string;
  background_color?: string;
  display?: string;
  start_url?: string;
}
