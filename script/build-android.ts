/**
 * script/build-android.ts
 * Android APK build pipeline:
 *   1. Loads .env.android
 *   2. Runs Vite build with Android env
 *   3. Runs: npx cap sync android
 *
 * Usage: npx tsx script/build-android.ts
 * Then open Android Studio: npx cap open android
 */
import { execSync } from "child_process";
import { copyFileSync, existsSync } from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");

function run(cmd: string, label: string) {
  console.log(`\n▶ ${label}...`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
  console.log(`✅ ${label} done.`);
}

async function buildAndroid() {
  console.log("🤖 MoodAware-Android Build Pipeline\n");

  // 1. Copy .env.android over .env temporarily for this build
  const envAndroid = path.join(ROOT, ".env.android");
  const envFile = path.join(ROOT, ".env");
  const envBackup = path.join(ROOT, ".env.backup");

  if (!existsSync(envAndroid)) {
    console.error("❌ Missing .env.android — fill in your production URL first.");
    process.exit(1);
  }

  // Backup current .env
  if (existsSync(envFile)) {
    copyFileSync(envFile, envBackup);
  }
  copyFileSync(envAndroid, envFile);

  try {
    // 2. Vite build (outputs to dist/public)
    run("npx vite build", "Vite web build");

    // 3. Sync to Android project
    run("npx cap sync android", "Capacitor sync to Android");

    console.log("\n🎉 Android sync complete!");
    console.log("👉 Next steps:");
    console.log("   1. Run:  npx cap open android");
    console.log("   2. In Android Studio: Build → Generate Signed APK/AAB");
    console.log("   3. Select your keystore (release-keystore.jks)");
    console.log("   4. Output: MoodAware-Android.apk\n");
  } finally {
    // Restore original .env
    if (existsSync(envBackup)) {
      copyFileSync(envBackup, envFile);
    }
  }
}

buildAndroid().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
