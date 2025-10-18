/**
 * Framework Icon Utility
 *
 * Centralized mapping of frameworks to their professional SVG icons.
 * Replaces emojis with actual brand logos for a professional appearance.
 */

// Import framework SVG icons
import reactIcon from "@/assets/icons/react-js-icon.svg";
import vueIcon from "@/assets/icons/vue.svg";
import angularIcon from "@/assets/icons/angular-icon.svg";
import nextjsIcon from "@/assets/icons/nextjs-icon.svg";
import reduxIcon from "@/assets/icons/redux-icon.svg";
import svelteIcon from "@/assets/icons/svelte.svg";
import typescriptIcon from "@/assets/icons/typescript.svg";
import randomIcon from "@/assets/icons/random-icon.svg";

/**
 * Framework to Icon mapping
 */
export const FRAMEWORK_ICONS: Record<string, string> = {
  react: reactIcon,
  vue: vueIcon,
  angular: angularIcon,
  nextjs: nextjsIcon,
  redux: reduxIcon,
  svelte: svelteIcon,
  typescript: typescriptIcon,
  random: randomIcon,
};

/**
 * Get icon path for a framework
 * @param framework - Framework identifier
 * @returns SVG icon path or undefined if not found
 */
export function getFrameworkIcon(framework: string): string | undefined {
  return FRAMEWORK_ICONS[framework.toLowerCase()];
}

/**
 * Check if framework has a professional icon
 * @param framework - Framework identifier
 * @returns boolean
 */
export function hasFrameworkIcon(framework: string): boolean {
  return framework.toLowerCase() in FRAMEWORK_ICONS;
}
