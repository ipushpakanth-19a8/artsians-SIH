# 📱 ShilpSetu (KALAtech) — Mobile Production Deployment Guide (Android & iOS)

This guide provides end-to-end instructions for running, testing, building, and deploying the **ShilpSetu (KALAtech)** mobile applications for both **Google Play Store (Android)** and **Apple App Store (iOS)**.

---

## 📑 Table of Contents
1. [Mobile Architecture Overview](#1-mobile-architecture-overview)
2. [Native Capabilities & Hardware Features](#2-native-capabilities--hardware-features)
3. [Android Local Development & Running](#3-android-local-development--running)
4. [Android Production Release Build (AAB & APK)](#4-android-production-release-build-aab--apk)
5. [Google Play Store Submission Checklist](#5-google-play-store-submission-checklist)
6. [iOS Local Development & Running](#6-ios-local-development--running)
7. [iOS Production Distribution (TestFlight & App Store)](#7-ios-production-distribution-testflight--app-store)
8. [Apple App Store Submission Checklist](#8-apple-app-store-submission-checklist)
9. [Physical Device API Network Architecture](#9-physical-device-api-network-architecture)
10. [React Native / Expo Parallel Architecture Blueprint](#10-react-native--expo-parallel-architecture-blueprint)

---

## 1. Mobile Architecture Overview

The mobile app is powered by **Capacitor 8**, wrapping the full-featured, responsive React 19 application in native Android and iOS runtime containers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ShilpSetu Native Mobile Application                  │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────┐  │
│  │    Artisan Studio    │  │   Artisan Journey    │  │ Buyer Market  │  │
│  │ (Dashboard, Add, AI) │  │  (9 Gamified Levels) │  │(Browse, Orders│  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └───────┬───────┘  │
│             │                         │                      │          │
│  ┌──────────▼─────────────────────────▼──────────────────────▼───────┐  │
│  │                src/lib/nativeBridge.ts (Unified Bridge)           │  │
│  └──────────┬──────────────┬──────────────┬──────────────┬───────────┘  │
└─────────────┼──────────────┼──────────────┼──────────────┼──────────────┘
              │              │              │              │
     ┌────────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
     │Native Camera │ │Push Alerts  │ │   Haptics  │ │Secure Keys │
     │& Photo Picker│ │ & Orders    │ │ & Rewards  │ │ & Sessions │
     └──────────────┘ └─────────────┘ └────────────┘ └────────────┘
              │                                            │
     ┌────────▼────────────────────────────────────────────▼──────────┐
     │           Native Platform Targets (Android & iOS)              │
     │  Android: android/ (Gradle SDK 36, compileSdk 36, Java 21)     │
     │  iOS: ios/App/ (Xcode 16, Swift Package Manager, iOS 14+)       │
     └────────────────────────────────────────────────────────────────┘
```

### Key Identifiers & Specs

| Property | Android Target | iOS Target |
|---|---|---|
| **App Name** | `ShilpSetu KALAtech` | `ShilpSetu KALAtech` |
| **Package / Bundle ID** | `com.kalatech.shilpsetu` | `com.kalatech.shilpsetu` |
| **Minimum OS Version** | Android 7.0 (API Level 24) | iOS 14.0+ |
| **Target SDK / Version**| Android 15 / 16 (API 36) | iOS 18+ (Xcode 16) |
| **Version Code / Number** | `1` / `1.1.0` | `1` / `1.1.0` |

---

## 2. Native Capabilities & Hardware Features

The mobile app integrates direct device hardware capabilities through `src/lib/nativeBridge.ts`:

- 📸 **Native Camera & Gallery (`@capacitor/camera`)**: High-resolution hardware camera capture and system photo picker for handicraft photography.
- 📳 **Haptic Feedback (`@capacitor/haptics`)**: Tactile vibration feedback when artisans complete onboarding missions and click primary action buttons.
- 🔐 **Secure Storage (`@capacitor/preferences`)**: Cryptographic session and token persistence across app reboots via Android Keystore and iOS Keychain.
- 📡 **Offline Network Listener (`@capacitor/network`)**: Detects network disconnections and displays non-intrusive offline alerts while keeping drafts saved locally.
- 📢 **Native Push Notifications (`@capacitor/push-notifications`)**: Alert artisans when a buyer places an order or sends an inquiry.
- 📲 **Native Share Sheet (`@capacitor/share`)**: Direct integration with WhatsApp, SMS, and Instagram to share handicraft catalog links.
- 🔙 **Hardware Back Button (`@capacitor/app`)**: Clean back-stack navigation on Android devices to close modals, drawers, and navigate screens naturally.

---

## 3. Android Local Development & Running

### Prerequisites
1. **Node.js**: v18.0.0+
2. **Android Studio**: Install [Android Studio Ladybug or newer](https://developer.android.com/studio).
3. **Android SDK**: Open Android Studio ➔ SDK Manager ➔ Install **Android SDK Platform 34 or 35** and **Android SDK Build-Tools**.
4. Set environment variables (or add to your profile):
   ```powershell
   $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin"
   ```

### Running on Android Device or Emulator

1. Build web assets and sync native files:
   ```powershell
   npm run mobile:sync
   ```
2. Open the project in Android Studio:
   ```powershell
   npm run mobile:open:android
   ```
   *(Or launch Android Studio and open the folder `c:\Users\pushp\OneDrive\Desktop\artsians-SIH\android`)*
3. Connect an Android phone via USB with **USB Debugging** enabled (or start an Android Virtual Device from AVD Manager).
4. Click the green **Run (▶)** button in Android Studio.

---

## 4. Android Production Release Build (AAB & APK)

Google Play Store requires an **Android App Bundle (`.aab`)** for new app submissions.

### Step 1: Create a Production Release Keystore
Run this command in PowerShell to generate your private signing key:
```powershell
keytool -genkey -v -keystore android/app/release-keystore.jks -alias kalatech-release -keyalg RSA -keysize 2048 -validity 10000
```
*(Store this keystore in a secure place. Do NOT commit it to public git repositories).*

### Step 2: Set Keystore Environment Variables
```powershell
$env:ANDROID_KEYSTORE_FILE = "release-keystore.jks"
$env:ANDROID_KEYSTORE_PASSWORD = "YourKeystorePassword"
$env:ANDROID_KEY_ALIAS = "kalatech-release"
$env:ANDROID_KEY_PASSWORD = "YourKeyPassword"
```

### Step 3: Generate the Release Android App Bundle (`.aab`)
```powershell
# 1. Compile web assets and sync plugins
npm run mobile:sync

# 2. Build the production AAB using Gradle
cd android
.\gradlew.bat bundleRelease
```
The output file will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 4: Generate a Standalone Release APK (For Direct Sideloading / Testing)
```powershell
cd android
.\gradlew.bat assembleRelease
```
The installable APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 5. Google Play Store Submission Checklist

When uploading to the **Google Play Console** (`https://play.google.com/console`):

1. **Create New App**:
   - App Name: `ShilpSetu: Artisan Market Linkage`
   - Default Language: `English (India)`
   - App Type: `App` (Free)
2. **App Content & Declarations**:
   - **Privacy Policy**: Provide URL pointing to your deployed site: `https://artsians-sih-1.onrender.com/` (or dedicated policy page).
   - **Target Audience**: Age 18 and older.
   - **Data Safety Form**: Declare that the app collects Name, Phone, and Craft Photos for listing products. Declare that data is encrypted in transit (HTTPS).
   - **Permissions Declaration**: Declare Camera (`android.permission.CAMERA`) and Microphone (`android.permission.RECORD_AUDIO`) for product capture and vernacular voice descriptions.
3. **Store Listing Assets**:
   - **App Icon**: 512×512 px PNG (32-bit color, no transparency).
   - **Feature Graphic**: 1024×500 px JPG or 24-bit PNG.
   - **Screenshots**: At least 4 phone screenshots (minimum 1080×1920 px or 16:9 ratio) showing:
     1. Artisan Journey Onboarding with Artisan Saathi.
     2. Camera capture & Sharp 1080p photo enhancement.
     3. Multimodal Gemini storytelling & cost-plus pricing.
     4. Buyer marketplace with GI-verified craft provenance.

---

## 6. iOS Local Development & Running

### Prerequisites
1. A computer running **macOS** (Sonoma or Sequoia).
2. **Xcode 15 or 16** installed from the Mac App Store.
3. **CocoaPods** or Swift Package Manager (Capacitor 8 uses native SPM by default).

### Running in iOS Simulator or Physical iPhone
1. On your Mac, navigate to the cloned project directory:
   ```bash
   npm run mobile:sync
   ```
2. Open the Xcode workspace:
   ```bash
   npm run mobile:open:ios
   # Or directly open: open ios/App/App.xcworkspace
   ```
3. In Xcode:
   - Select **App** in the project navigator.
   - Under **Signing & Capabilities**, select your **Apple Developer Team**.
   - Ensure the Bundle Identifier is `com.kalatech.shilpsetu`.
   - Choose a target Simulator (e.g. `iPhone 16 Pro`) or connected iPhone.
   - Press **Cmd + R** to run.

---

## 7. iOS Production Distribution (TestFlight & App Store)

1. In Xcode, set the active build target to **Any iOS Device (arm64)**.
2. Ensure `Info.plist` contains the configured privacy descriptions (already added):
   - `NSCameraUsageDescription`
   - `NSMicrophoneUsageDescription`
   - `NSPhotoLibraryUsageDescription`
   - `NSPhotoLibraryAddUsageDescription`
3. In Xcode top menu, select **Product ➔ Archive**.
4. Once the archive succeeds, the Xcode Organizer window will appear.
5. Click **Distribute App**:
   - Select **App Store Connect**.
   - Choose **Upload** (or Export for direct ad-hoc signing).
   - Follow the prompts to automatically manage signing certificates and provisioning profiles.
6. Once uploaded, the build will process in **TestFlight** within 10–15 minutes.

---

## 8. Apple App Store Submission Checklist

When configuring the app in **App Store Connect** (`https://appstoreconnect.apple.com`):

1. **Primary Category**: `Shopping` or `Business`.
2. **Secondary Category**: `Lifestyle`.
3. **Pricing**: Free.
4. **App Review Information**:
   - Provide demo credentials (or indicate that the app supports guest browsing and 1-click demo accounts).
5. **App Privacy Questionnaire**:
   - Contact Info (Name, Email, Phone) linked to user identity for buyer/seller accounts.
   - User Content (Photos & Audio) for craft catalog creation.

---

## 9. Physical Device API Network Architecture

When running as an installed native app on a physical phone:
- Mobile operating systems block or fail requests to `http://localhost:3000` because `localhost` refers to the mobile phone itself.
- In `src/lib/nativeBridge.ts`, the application automatically detects native execution:
  - If running on mobile (`isNativePlatform() === true`), all API requests automatically route to the cloud production backend:
    ```
    https://artsians-sih-1.onrender.com
    ```
  - You can override this to point to a custom domain or local Wi-Fi IP (for local testing) by setting:
    ```
    VITE_API_URL=https://your-custom-backend.com
    ```
  - When running in local desktop web browsers, requests continue using standard `/api` proxy with zero disruption.

---

## 10. React Native / Expo Parallel Architecture Blueprint

If you or your team ever wish to build a parallel **React Native / Expo** application alongside this web application, follow this monorepo layout:

```
artsians-SIH/
├── package.json
├── packages/
│   ├── web/                     # Current React 19 + Vite web application
│   ├── mobile/                  # Expo / React Native project
│   │   ├── app/                 # Expo Router file-based navigation
│   │   │   ├── (tabs)/          # Bottom tabs: index, browse, orders, saathi
│   │   │   └── product/[id].tsx # Detail screens
│   │   └── app.json             # Expo configuration
│   └── shared/                  # Shared TypeScript interfaces & services
│       ├── types.ts             # Product, Order, Artisan interfaces
│       ├── i18n/                # Hindi, Telugu, English dictionaries
│       └── api.ts               # Shared fetch API clients
```

### Key Shared Packages for React Native:
- **Navigation**: `expo-router` or `@react-navigation/bottom-tabs` + `@react-navigation/native-stack`
- **Camera**: `expo-camera` or `react-native-vision-camera`
- **Audio**: `expo-av` (recording craft stories)
- **Haptics**: `expo-haptics`
- **Secure Storage**: `expo-secure-store`
- **Speech**: `expo-speech` (regional TTS voice synthesis)
