import { readFileSync } from "node:fs";
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

export default async function notarizeMacArtifacts(context) {
  if (process.platform !== "darwin") return [];

  if (process.env.SKIP_NOTARIZE === "1") {
    console.warn("Skipping macOS artifact notarization: SKIP_NOTARIZE=1.");
    return [];
  }

  const credentials = appleCredentials();
  if (!credentials) {
    console.warn("Skipping macOS artifact notarization: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID is missing.");
    return [];
  }

  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const appBundleId = packageJson.build.appId;
  const dmgPaths = context.artifactPaths.filter((artifactPath) => artifactPath.endsWith(".dmg"));
  for (const appPath of dmgPaths) {
    await notarize({
      appBundleId,
      appPath,
      ...credentials
    });
  }

  return [];
}
