import { LanguageCode, ArtisanLocation, LocationLanguageRecommendation } from '../types';
import {
  normalizeStateName,
  getLanguagesForState,
  getPrimaryLanguageForState,
  STATE_LANGUAGE_MAP
} from '../config/stateLanguageMap';

export type LocationDetectionStatus =
  | 'idle'
  | 'detecting'
  | 'success'
  | 'permissionDenied'
  | 'unavailable'
  | 'timeout'
  | 'networkError'
  | 'manual';

export interface DetectionResult {
  status: LocationDetectionStatus;
  location?: ArtisanLocation;
  recommendation?: LocationLanguageRecommendation;
  errorMessage?: string;
  source?: string;
}

// Storage keys as required by specs
const STORAGE_KEY_LOCATION = 'kalatech_location';
const STORAGE_KEY_LANGUAGE = 'kalatech_language';
// Backward-compatibility keys
const LEGACY_STORAGE_KEY_STATE = 'ShilpSetu_state';
const LEGACY_STORAGE_KEY_LANG = 'ShilpSetu_language';

/**
 * Retrieves the user's previously saved location from localStorage.
 */
export function getSavedLocation(): ArtisanLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCATION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.state === 'string') {
        return parsed as ArtisanLocation;
      }
    }

    // Check legacy storage
    const legacyState = localStorage.getItem(LEGACY_STORAGE_KEY_STATE);
    if (legacyState) {
      return {
        state: legacyState,
        district: 'Not available',
        place: 'Not available'
      };
    }
  } catch (e) {
    console.warn('[LocationService] Failed to read saved location:', e);
  }
  return null;
}

/**
 * Persists artisan location to localStorage (privacy: coordinates are never saved).
 */
export function saveLocation(loc: ArtisanLocation): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
    if (loc.state) {
      localStorage.setItem(LEGACY_STORAGE_KEY_STATE, loc.state);
    }
  } catch (e) {
    console.warn('[LocationService] Failed to persist location:', e);
  }
}

/**
 * Clears saved location from storage.
 */
export function clearSavedLocation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LOCATION);
    localStorage.removeItem(LEGACY_STORAGE_KEY_STATE);
  } catch (e) {
    console.warn('[LocationService] Failed to clear location:', e);
  }
}

/**
 * Retrieves previously saved language preference.
 */
export function getSavedLanguage(): LanguageCode | null {
  try {
    const lang = localStorage.getItem(STORAGE_KEY_LANGUAGE) || localStorage.getItem(LEGACY_STORAGE_KEY_LANG);
    if (lang) {
      return lang as LanguageCode;
    }
  } catch (e) {
    console.warn('[LocationService] Failed to read saved language:', e);
  }
  return null;
}

/**
 * Persists preferred language to localStorage.
 */
export function saveLanguage(lang: LanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    localStorage.setItem(LEGACY_STORAGE_KEY_LANG, lang);
  } catch (e) {
    console.warn('[LocationService] Failed to persist language:', e);
  }
}

/**
 * Obtains temporary browser coordinates via HTML5 Geolocation API.
 * Coordinates are kept strictly in memory for reverse-geocoding.
 */
export function getCurrentCoordinates(timeoutMs = 8000): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err = new Error('Geolocation is not supported by your browser');
      (err as any).code = 2; // POSITION_UNAVAILABLE
      return reject(err);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 600000 // Cache position for up to 10 minutes
      }
    );
  });
}

/**
 * Reverse geocodes coordinates via the backend endpoint /api/location/reverse-geocode.
 * Never stores or returns raw latitude/longitude.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ location: ArtisanLocation; source: string }> {
  const response = await fetch('/api/location/reverse-geocode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ latitude, longitude })
  });

  if (!response.ok) {
    throw new Error(`Reverse geocode failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.location) {
    throw new Error(data.error || 'Invalid reverse geocode response');
  }

  const normalizedState = normalizeStateName(data.location.state) || data.location.state || 'Telangana';

  return {
    location: {
      state: normalizedState,
      district: data.location.district || 'Not available',
      place: data.location.place || 'Not available'
    },
    source: data.source || 'osm_nominatim'
  };
}

/**
 * Builds a language recommendation structure for a given location.
 * The recommendation is NEVER forced; user selection always takes priority.
 */
export function buildRecommendation(location: ArtisanLocation): LocationLanguageRecommendation {
  const normalized = normalizeStateName(location.state) || 'Telangana';
  const primaryLanguage = getPrimaryLanguageForState(normalized);
  const recommendedLanguages = getLanguagesForState(normalized);

  return {
    location: {
      ...location,
      state: normalized,
      preferredLanguage: primaryLanguage
    },
    primaryLanguage,
    recommendedLanguages
  };
}

/**
 * End-to-end detection routine:
 * 1. Checks GPS permission & obtains coordinates in memory.
 * 2. Calls backend reverse geocoding proxy.
 * 3. Builds regional language recommendation.
 * Gracefully handles permission denied, timeout, offline/unavailable, and network errors.
 */
export async function detectLocationAndLanguage(timeoutMs = 8000): Promise<DetectionResult> {
  try {
    const coords = await getCurrentCoordinates(timeoutMs);
    const { location, source } = await reverseGeocode(coords.latitude, coords.longitude);
    const recommendation = buildRecommendation(location);

    return {
      status: 'success',
      location: recommendation.location,
      recommendation,
      source
    };
  } catch (err: any) {
    let status: LocationDetectionStatus = 'unavailable';
    let errorMessage = 'Unable to detect your location.';

    if (err && typeof err.code === 'number') {
      switch (err.code) {
        case 1: // PERMISSION_DENIED
          status = 'permissionDenied';
          errorMessage = 'Location permission was denied. You can select your state and language manually.';
          break;
        case 2: // POSITION_UNAVAILABLE
          status = 'unavailable';
          errorMessage = 'Location information is currently unavailable.';
          break;
        case 3: // TIMEOUT
          status = 'timeout';
          errorMessage = 'Location detection timed out.';
          break;
        default:
          status = 'unavailable';
          errorMessage = err.message || 'Location could not be determined.';
      }
    } else if (err?.message?.includes('fetch') || err?.message?.includes('NetworkError') || err?.message?.includes('Failed to fetch')) {
      status = 'networkError';
      errorMessage = 'Network connection issue while reverse geocoding.';
    }

    return {
      status,
      errorMessage
    };
  }
}

/**
 * Automatically detects location for product creation via Browser Geolocation + Reverse Geocoding.
 * Returns formatted string: "City/Town/Village, District, State, Country"
 * If permission denied or unavailable: returns { success: false, error: 'Location unavailable' }
 * Never invents an address. Never silently forces a location.
 */
export async function getArtisanFormattedLocation(timeoutMs = 8000): Promise<{
  success: boolean;
  formattedLocation: string;
  error?: string;
  permissionDenied?: boolean;
}> {
  try {
    const coords = await getCurrentCoordinates(timeoutMs);
    const { location } = await reverseGeocode(coords.latitude, coords.longitude);

    const parts: string[] = [];
    if (location.place && location.place !== 'Not available') {
      parts.push(location.place);
    }
    if (location.district && location.district !== 'Not available' && location.district !== location.place) {
      parts.push(location.district);
    }
    if (location.state && location.state !== 'Not available') {
      parts.push(location.state);
    }
    parts.push('India');

    const formattedLocation = parts.join(', ');
    return {
      success: true,
      formattedLocation: formattedLocation || 'India',
    };
  } catch (err: any) {
    const isDenied = err && (err.code === 1 || err.message?.includes('denied'));
    return {
      success: false,
      formattedLocation: '',
      error: 'Location unavailable',
      permissionDenied: Boolean(isDenied),
    };
  }
}
