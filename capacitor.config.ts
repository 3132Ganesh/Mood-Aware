import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.moodaware.android",
  appName: "MoodAware",
  webDir: "dist/public",
  // Backend server URL — change to your Render URL for production builds
  // For Android emulator dev: use http://10.0.2.2:5000
  server: {
    // Leave url undefined so the bundled assets are used in production.
    // Uncomment below during development with a live reload server:
    // url: "http://10.0.2.2:5000",
    androidScheme: "https",
    cleartext: false, // enforce HTTPS in production
    allowNavigation: [],
  },
  android: {
    buildOptions: {
      keystorePath: "release-keystore.jks",
      keystoreAlias: "moodaware",
    },
    // Allow mixed content during development
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true for dev debugging
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#7C3AED",
      sound: "beep.wav",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0F0A1E",
      androidSplashResourceName: "splash",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0F0A1E",
    },
  },
};

export default config;
