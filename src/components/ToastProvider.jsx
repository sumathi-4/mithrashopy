/**
 * ToastProvider.jsx — Backward-compatible re-export
 *
 * All existing components import { useToast } from './ToastProvider'.
 * This file now delegates to the shared ui/Toast implementation so
 * there is a single React Context across the whole app.
 *
 * DO NOT change this file's path — existing imports depend on it.
 */
export { ToastProvider, useToast } from './ui/Toast';
