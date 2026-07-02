import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

interface InstallPromptApi {
  isInstallable: boolean;
  // iOS has no install prompt API; installation goes through the browser's share menu.
  isManualInstall: boolean;
  promptInstall: () => void;
}

const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  || (navigator as { standalone?: unknown }).standalone === true;
const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;
let version = 0;
const listeners = new Set<() => void>();

function notify(): void {
  version++;
  listeners.forEach((listener) => {
    listener();
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
  notify();
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  isInstalled = true;
  notify();
});

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return version;
}

export function useInstallPrompt(): InstallPromptApi {
  useSyncExternalStore(subscribe, getSnapshot);

  return {
    isInstallable: !isStandalone && !isInstalled && (deferredPrompt !== null || isIos),
    isManualInstall: deferredPrompt === null,
    promptInstall: () => {
      deferredPrompt?.prompt().catch(() => undefined);
    },
  };
}
