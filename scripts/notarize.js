import { existsSync } from "node:fs";
import path from "node:path";
import { notarize } from "@electron/notarize";

function appleCredentials() {
  const { APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID } = process.env;
  if (!APPLE_ID || !APPLE_APP_SPECIFIC_PASSWORD || !APPLE_TEAM_ID) return null;
  return {
    appleId: APPLE_ID,
    appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
    teamId: APPLE_TEAM_ID
  };
}

export default async function notarizeMacApp(context) {
  if (process.platform !== "darwin" || context.electronPlatformName !== "darwin") return;

  if (process.env.SKIP_NOTARIZE === "1") {
    console.warn("Skipping macOS app notarization: SKIP_NOTARIZE=1.");
    return;
  }

  const credentials = appleCredentials();
  if (!credentials) {
    console.warn("Skipping macOS notarization: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID is missing.");
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  if (!existsSync(appPath)) {
    throw new Error(`Cannot notarize missing app bundle: ${appPath}`);
  }

  await notarize({
    appBundleId: context.packager.appInfo.appId,
    appPath,
    ...credentials
  });
}
