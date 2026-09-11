import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Network } from '@capacitor/network';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * ShilpSetu (KALAtech) Native Bridge Service
 * Handles platform detection, native hardware access, secure storage,
 * and dynamic production API routing between web and native mobile.
 */

// 1. Platform Detection
export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();
export const getPlatform = (): 'android' | 'ios' | 'web' => {
  const p = Capacitor.getPlatform();
  if (p === 'android') return 'android';
  if (p === 'ios') return 'ios';
  return 'web';
};

// 2. Dynamic API URL Resolution
// Physical mobile devices cannot connect to "http://localhost:3000".
// On native Android/iOS, this routes API traffic to the live production server.
const PRODUCTION_API_URL = 'https://artsians-sih-1.onrender.com';

export const getApiBaseUrl = (): string => {
  if (isNativePlatform()) {
    const customUrl = import.meta.env.VITE_API_URL;
    return (customUrl && typeof customUrl === 'string' && customUrl.trim()) ? customUrl.trim() : PRODUCTION_API_URL;
  }
  // On web, relative path uses Vite / Express direct route
  return '';
};

export const resolveApiUrl = (path: string): string => {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!base) return cleanPath;
  return `${base.replace(/\/$/, '')}${cleanPath}`;
};

// 3. Native Secure Storage (Preferences / Keystore / Keychain)
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isNativePlatform()) {
        const res = await Preferences.get({ key });
        if (res.value) return res.value;
      }
      return localStorage.getItem(key);
    } catch {
      return localStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
      if (isNativePlatform()) {
        await Preferences.set({ key, value });
      }
    } catch (err) {
      console.warn('Storage set error:', err);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
      if (isNativePlatform()) {
        await Preferences.remove({ key });
      }
    } catch (err) {
      console.warn('Storage remove error:', err);
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
      if (isNativePlatform()) {
        await Preferences.clear();
      }
    } catch (err) {
      console.warn('Storage clear error:', err);
    }
  },
};

// 4. Native Camera & Gallery
export const takeNativePhoto = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      promptLabelHeader: 'Capture Craft Photo',
      promptLabelPhoto: 'From Gallery',
      promptLabelPicture: 'Take Photo',
    });
    return photo.dataUrl || null;
  } catch (err: any) {
    if (err?.message !== 'User cancelled photos app') {
      console.warn('Native camera capture fallback:', err);
    }
    return null;
  }
};

export const pickNativeGalleryPhoto = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    return photo.dataUrl || null;
  } catch (err: any) {
    if (err?.message !== 'User cancelled photos app') {
      console.warn('Native gallery pick fallback:', err);
    }
    return null;
  }
};

// 5. Native Haptic Feedback
export const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): Promise<void> => {
  if (!isNativePlatform()) return;
  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch {}
};

// 6. Native Share Sheet
export const shareCraftProduct = async (options: {
  title: string;
  text: string;
  url?: string;
  dialogTitle?: string;
}): Promise<boolean> => {
  try {
    if (isNativePlatform()) {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url || window.location.href,
        dialogTitle: options.dialogTitle || 'Share Authentic Craft',
      });
      return true;
    } else if (navigator.share) {
      await navigator.share(options);
      return true;
    }
    // Web fallback to clipboard
    const shareText = `${options.title}\n${options.text}\n${options.url || window.location.href}`;
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch {
    return false;
  }
};

// 7. Network Status Listener
export const initNetworkListener = (
  onStatusChange: (connected: boolean, connectionType: string) => void
): (() => void) => {
  let removeListener: (() => void) | null = null;

  if (isNativePlatform()) {
    Network.addListener('networkStatusChange', (status) => {
      onStatusChange(status.connected, status.connectionType);
    }).then((handle) => {
      removeListener = () => handle.remove();
    });
  } else {
    const handleOnline = () => onStatusChange(true, 'wifi');
    const handleOffline = () => onStatusChange(false, 'none');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    removeListener = () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  return () => {
    if (removeListener) removeListener();
  };
};

// 8. Hardware Back Button Listener (Android)
export const setupHardwareBackButton = (handler: () => boolean | void): (() => void) => {
  if (!isNativePlatform() || getPlatform() !== 'android') return () => {};

  let removeListener: (() => void) | null = null;
  CapApp.addListener('backButton', (data) => {
    const handled = handler();
    if (handled === false && data.canGoBack) {
      window.history.back();
    } else if (handled === false && !data.canGoBack) {
      CapApp.exitApp();
    }
  }).then((handle) => {
    removeListener = () => handle.remove();
  });

  return () => {
    if (removeListener) removeListener();
  };
};

// 9. Native Push Notifications
export const initPushNotifications = async (
  onToken?: (token: string) => void,
  onNotification?: (notification: any) => void
): Promise<boolean> => {
  if (!isNativePlatform()) return false;

  try {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === 'granted') {
      await PushNotifications.register();

      if (onToken) {
        PushNotifications.addListener('registration', (token) => {
          onToken(token.value);
        });
      }

      if (onNotification) {
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          onNotification(notification);
        });
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Push notification initialization error:', err);
    return false;
  }
};

// 10. Native System Chrome Configuration (Status Bar & Splash Screen)
export const initNativeAppChrome = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FAF7F2' });
  } catch {}

  try {
    // Hide Splash Screen after React has mounted
    setTimeout(async () => {
      await SplashScreen.hide({ fadeOutDuration: 400 });
    }, 800);
  } catch {}
};
