/**
 * Internal UI Component Types
 *
 * Types used internally by components, not exposed as props
 */

import type { Component } from "vue";

export interface ToastInternalProps {
  id?: string;
  type?: "success" | "error" | "warning" | "info";
  message?: string;
  icon?: Component;
  dismissible?: boolean;
  duration?: number;
  persistent?: boolean;
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  icon?: Component;
  dismissible?: boolean;
  duration?: number;
  persistent?: boolean;
}
