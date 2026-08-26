/**
 * capacitor-plugins.ts
 * Safe Capacitor native plugin initializer.
 * 100% web-safe: avoids Vite module resolution errors when running on web browser.
 */

function isNativePlatform(): boolean {
  try {
    return !!(window as any)?.Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

async function safeImportPlugin(name: string) {
  if (!isNativePlatform()) return null;
  try {
    const globalPlugins = (window as any)?.Capacitor?.Plugins;
    if (globalPlugins && globalPlugins[name]) {
      return globalPlugins[name];
    }
    const pkgMap: Record<string, string> = {
      "status-bar": "@capacitor/status-bar",
      "splash-screen": "@capacitor/splash-screen",
      "local-notifications": "@capacitor/local-notifications",
      "push-notifications": "@capacitor/push-notifications",
    };
    const pkg = pkgMap[name];
    if (!pkg) return null;
    // Use dynamic Function import to bypass Vite AST scanner completely in web dev mode
    const importFn = new Function("mod", "return import(mod)");
    return await importFn(pkg);
  } catch {
    return null;
  }
}

export async function initCapacitor(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    const sb = await safeImportPlugin("status-bar");
    if (sb?.StatusBar && sb?.Style) {
      await sb.StatusBar.setStyle({ style: sb.Style.Dark });
      await sb.StatusBar.setBackgroundColor({ color: "#0F0A1E" });
    }

    const notif = await safeImportPlugin("local-notifications");
    if (notif?.LocalNotifications) {
      const { display } = await notif.LocalNotifications.checkPermissions();
      if (display !== "granted") {
        await notif.LocalNotifications.requestPermissions();
      }
    }
  } catch (_) {}
}

export function isAndroid(): boolean {
  return isNativePlatform() && (window as any)?.Capacitor?.getPlatform?.() === "android";
}

export function isNative(): boolean {
  return isNativePlatform();
}
